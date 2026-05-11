import { Room, Client, CloseCode } from "colyseus";
import { MyRoomState } from "./schema/MyRoomState.js";
import { Board } from '@common/Board.mjs'
import { Deck } from "../lib/Deck.js";
import { Hand } from "@common/Hand.mjs";
import { pieceUtils } from "@common/pieceRegistery.mjs";
import { GameRules } from "@common/GameRules.mjs";

export class MyRoom extends Room {
  maxClients = 4;
  state = new MyRoomState();
  board = new Board(false);
  gameStarted: boolean = false;
  gameRules: GameRules

  constructor() {
    super()
    this.deck = new Deck()
    this.gameRules = new GameRules(this.board)
  }

  messages = {
    "spawn": (client: Client, message: any[]) => {
      let [pieceTypeKey, x, y] = message;
      // this.state.turnHistory.push(`spawn ${pieceTypeKey} at (${x}, ${y})`)
      let pieceType = pieceUtils.classFromKey(pieceTypeKey)
      // server must check player ownership in case of hijacked calls
      let playerNumber = this.getPlayerAssignment(client.sessionId)

      let hand = this.hands[playerNumber].hand

      if (this.board.canSpawnPiece(pieceType, x, y, hand, playerNumber)) {
        this.board.spawnPiece(pieceType, undefined, x, y, playerNumber)
        this.broadcast("otherSpawn", [pieceTypeKey, x, y], {
          except: client,
        })

        let oldCard = pieceType.key
        this.deck.returnCard(oldCard)
        let newCard = this.deck.drawCard()
        this.hands[playerNumber].replace(oldCard, newCard)

        this.clients[playerNumber].send('drawCard', newCard)
      } else {
        console.log("hijacked spawn call")
      }

    },
    "move": (client: Client, message: any[]) => {
      let [startX, startY, endX, endY] = message;
      let playerNumber = this.getPlayerAssignment(client.sessionId)
      if (this.board.canMovePiece(startX, startY, endX, endY, playerNumber)) {
        this.board.movePiece(startX, startY, endX, endY, playerNumber)
        this.broadcast('otherMove', message, {
          except: client
        })
      } else {
        console.log("hijacked move call")
      }
    },
    "attack": (client: Client, message: any[]) => {
      let [attackerX, attackerY, defenderX, defenderY] = message;
      let attackingPiece = this.board.getPiece(attackerX, attackerY)
      let defendingPiece = this.board.getPiece(defenderX, defenderY)
      if (!attackingPiece || !defendingPiece)
        throw new Error("Attack is not between two valid pieces")

      // this.board.printBoardState()

      let playerNumber = this.getPlayerAssignment(client.sessionId)

      if (this.board.canAttackPiece(attackerX, attackerY, defenderX, defenderY, playerNumber)) {
        this.board.attackPiece(attackerX, attackerY, defenderX, defenderY)
        this.broadcast('otherAttack', message, {
          except: client
        })
      } else {
        console.log("hijacked attack call")
      }
    },
    "endTurn": (client: Client, message: any[]) => {
      let playerNumber = this.getPlayerAssignment(client.sessionId)

      if (this.board.canEndTurn(playerNumber)) {
        this.broadcast("otherEndTurn", undefined, {
          except: client
        })
        this.board.endTurn()
      } else {
        console.log("illegal end turn")
      }
    }
  }

  onCreate(options: any) {
    /**
     * Called when a new room is created.
     */
  }

  deck: Deck
  hands: Hand[] = []

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "joined!");

    const playerNumber = this.tryAddPlayer(client)
    client.send('playerAssignment', playerNumber)

    if (playerNumber == 1) {
      this.startGame()
    }
  }

  startGame() {
    this.gameStarted = true;
    this.deck.shuffle()
    this.hands = [
      new Hand(this.deck),
      new Hand(this.deck)
    ]
    for (let p = 0; p <= 1; p++) {
      this.clients[p].send('startingHand', this.hands[p].hand)
    }
    this.gameRules.startGame(undefined)
  }

  onLeave(client: Client, code: CloseCode) {
    console.log(client.sessionId, "left!", code);
  }

  onDispose() {
    /**
     * Called when the room is disposed.
     */
    console.log("room", this.roomId, "disposing...");
  }

  tryAddPlayer(client: Client): number {
    if (this.clients[0].sessionId == client.sessionId) {
      return 0;
      // this.sendGameState(socket)
    } else if (this.clients[1].sessionId == client.sessionId) {
      return 1;
      // this.sendGameState(socket)
    } else {
      return -1;
    }
  }

  getPlayerAssignment(id: string) {
    if (id == this.clients[0].sessionId)
      return 0;
    else if (id == this.clients[1]?.sessionId)
      return 1;
    else
      return -1;
  }
}
