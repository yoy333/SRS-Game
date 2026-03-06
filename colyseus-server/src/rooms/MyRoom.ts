import { Room, Client, CloseCode, ClientArray } from "colyseus";
import { MyRoomState } from "./schema/MyRoomState.js";
import {Board} from '@common/Board.mjs'
import {Piece} from '@common/Piece.mjs'
import { Deck } from "src/lib/Deck.js";
import { Hand } from "src/lib/Hand.js";

export class MyRoom extends Room {
  maxClients = 4;
  state = new MyRoomState();
  board = new Board(false);
  gameStarted:boolean = false;

  constructor(){
    super()
    this.deck = new Deck()
  }

  messages = {
    "spawn": (client: Client, message: any[]) => {
      let [pieceTypeKey, x, y] = message;
      // this.state.turnHistory.push(`spawn ${pieceTypeKey} at (${x}, ${y})`)
      let pieceType = Piece.classFromKey(pieceTypeKey)
      // server must check player ownership in case of hijacked calls
      let playerNumber = this.getPlayerAssignment(client.sessionId)

      if(this.board.canSpawnPiece(pieceType, x, y, playerNumber)){
          this.board.spawnPiece(pieceType, undefined, x, y, playerNumber)
          this.broadcast("otherSpawn", [pieceTypeKey, x, y], {
            except:client,
          })
      }else{
          console.log("hijacked spawn call")
      }

    },
    "move": (client: Client, message:any[])=>{
      let [startX, startY, endX, endY] = message;
        let playerNumber = this.getPlayerAssignment(client.sessionId)
        if(this.board.canMovePiece(startX, startY, endX, endY, playerNumber)){
            this.board.movePiece(startX, startY, endX, endY)
            this.broadcast('otherMove', message, {
              except:client
            })
        }else{
            console.log("hijacked move call")
        }
    },
    "attack": (client: Client, message:any[])=>{
      let [attackerX, attackerY, defenderX, defenderY] = message;
        let attackingPiece = this.board.getPiece(attackerX, attackerY)
        let defendingPiece = this.board.getPiece(defenderX, defenderY)
        if(!attackingPiece || !defendingPiece)
            return false;

        let playerNumber = this.getPlayerAssignment(client.sessionId)

        if(this.board.canAttackPiece(attackerX, attackerY, defenderX, defenderY, playerNumber)){
            this.board.movePiece(attackerX, attackerY, defenderX, defenderY)
            this.broadcast('otherAttack', message, {
              except:client
            })
        }else{
            console.log("hijacked attack call")
        }
    },
    "endTurn": (client: Client, message: any[])=>{
      let playerNumber = this.getPlayerAssignment(client.sessionId)

      if(this.board.canEndTurn(playerNumber)){
          this.broadcast("otherEndTurn",  undefined, {
            except: client
          })
          this.board.endTurn()
      }
    }
  }

  onCreate (options: any) {
    /**
     * Called when a new room is created.
     */
  }

  deck:Deck
  hands:Hand[] = []

  onJoin (client: Client, options: any) {
    console.log(client.sessionId, "joined!");

    const playerNumber = this.tryAddPlayer(client)
    client.send('playerAssignment', playerNumber)

    if(playerNumber==2){
      this.startGame()
    }
  }

  startGame(){
    this.gameStarted = true;
    this.deck.shuffle()
    this.hands = [
      new Hand(this.deck),
      new Hand(this.deck)
    ]
    for(let p=0; p<=1; p++){
      console.log(this.hands[p].hand)
      this.clients[p].send('startingHand',this.hands[p].hand)
    }
  }

  onLeave (client: Client, code: CloseCode) {
    console.log(client.sessionId, "left!", code);
  }

  onDispose() {
    /**
     * Called when the room is disposed.
     */
    console.log("room", this.roomId, "disposing...");
  }

  tryAddPlayer(client:Client):number{
      if(this.clients[0].sessionId == client.sessionId){
          return 1;
          // this.sendGameState(socket)
      }else if(this.clients[1].sessionId == client.sessionId){
          return 2;
          // this.sendGameState(socket)
      }else{
          return 0;
      }
  }

  getPlayerAssignment(id:string){
      if(id == this.clients[0].sessionId)
          return 1;
      else if(id == this.clients[1]?.sessionId)
          return 2;
      else
          return 0;
  }
}
