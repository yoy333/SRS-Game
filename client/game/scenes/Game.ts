import { Scene } from 'phaser';
import { InputManager } from '../lib/InputManager'
import { PieceKey, PieceType } from '@common/Piece.mjs';
import { Board } from '@common/Board.mjs';
import { IchorDisplay } from '../lib/IchorDisplay';
import { Client, Callbacks } from '@colyseus/sdk'
import { pieceUtils } from '@common/pieceRegistery.mjs';
import { GameRules } from '@common/GameRules.mjs';
// import {GameRules} from '@common/GameRules.mjs'

export class Game extends Scene {

    // socket?: Socket;
    inputManager: InputManager

    constructor() {
        super('Game');
        this.inputManager = new InputManager()
        this.board = new Board(true)
        this.ichorDisplay = new IchorDisplay()
        this.gameRules = new GameRules(this.board)
    }

    preload() {

    }

    board: Board
    gameRules: GameRules
    ichorDisplay: IchorDisplay
    hand: PieceKey[] = []

    async create() {
        this.board.initReps(this.make, 300, 0)

        this.inputManager.initReps(this.add)

        this.ichorDisplay.initReps(this.add, 250, 675)
        this.ichorDisplay.updateIchor(Board.maxIchorPerTurn)

        this.input.on('pointerdown', () => {
            // if(!this.board.tilemap)
            //     console.warn("clicked but no tilemap")
            let tileClicked = this.board?.tilemap?.getTileAtWorldXY(this.input.x, this.input.y)
            if (tileClicked) {
                this.inputManager.proccessClick(this.add, this.board, tileClicked.x, tileClicked.y)
            } else {
                //console.log("no tile clicked")
            }
        })

        const client = new Client('http://localhost:2567');

        const room = await client.joinOrCreate('my_room', {
            /* custom join options */
        });
        const callbacks = Callbacks.get(room);

        room.onMessage("playerAssignment", (playerNumber: number) => {
            console.log(`recieved player assignment, ${playerNumber}, from Colyseus`)
            this.board.playerNumber = playerNumber;
        })

        room.onMessage("startingHand", (hand: PieceKey[]) => {
            this.hand = hand;
            this.inputManager.updateHand(this.add, this.hand)
            this.gameRules.startGame(this.add)
        })

        room.onMessage("drawCard", (card: PieceKey) => {
            let index = this.hand.indexOf("")
            if (index == -1)
                throw new Error("not sure where to replace card")

            this.hand[index] = card
            this.inputManager.updateHand(this.add, this.hand)
        })

        room.onMessage('otherSpawn', (message: any[]) => {
            let [pieceTypeKey, x, y] = message;
            let pieceType = pieceUtils.classFromKey(pieceTypeKey)
            this.board.spawnPiece(pieceType, this.add, x, y, this.board.otherPlayerNumber)
        })

        room.onMessage('otherMove', (message: any[]) => {
            let [startX, startY, endX, endY] = message;
            this.board.movePiece(startX, startY, endX, endY, this.board.otherPlayerNumber)
        })

        room.onMessage('otherAttack', (message: any[]) => {
            let [attackerX, attackerY, defenderX, defenderY] = message;
            this.board.attackPiece(attackerX, attackerY, defenderX, defenderY)
        })

        room.onMessage('otherEndTurn', () => {
            this.board.endTurn()
        })

        this.inputManager.onMove = (startX: number, startY: number, endX: number, endY: number) => {
            let moveCoords = [startX, startY, endX, endY] as const
            let piece = this.board.getPiece(startX, startY)
            if (!piece)
                return;
            if (this.board.canMovePiece(...moveCoords)) {
                this.board.movePiece(...moveCoords)
                this.ichorDisplay.updateIchor(this.board.myIchor)
                room.send('move', moveCoords)
            } else {
                console.log("illegal move")
            }
        }

        this.inputManager.onSpawn = (pieceType: PieceType, x: number, y: number, playerOwner?: number) => {
            if (this.board.canSpawnPiece(pieceType, x, y, this.hand, playerOwner)) {
                this.board.spawnPiece(pieceType, this.add, x, y)
                this.ichorDisplay.updateIchor(this.board.myIchor)
                // this.socket.emit('spawn', [DefaultPiece.key, x, y])
                room.send('spawn', [pieceType.key, x, y])

                // freeze interaction until we can draw a new card
                let index = this.hand.indexOf(pieceType.key)

                this.hand[index] = ""

                this.inputManager.iconButtons[index].stopInteraction()
            } else {
                console.log("illegal spawn")
            }
        }

        this.inputManager.onAttack = (attackerX, attackerY, defenderX, defenderY) => {
            if (this.board.canAttackPiece(attackerX, attackerY, defenderX, defenderY)) {
                this.board.attackPiece(attackerX, attackerY, defenderX, defenderY)
                this.ichorDisplay.updateIchor(this.board.myIchor)
                room.send('attack', [attackerX, attackerY, defenderX, defenderY])
            } else {
                console.log("illegal attack")
            }
        }

        this.inputManager.onEndTurn = () => {
            if (this.board.canEndTurn()) {
                this.board.endTurn()
                this.ichorDisplay.updateIchor(this.board.myIchor)
                room.send('endTurn')
            }
        }
    }

    update() {

    }
}
