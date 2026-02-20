import { Scene } from 'phaser';
import io, {type Socket} from 'socket.io-client'
import {InputManager} from '../lib/InputManager'
import { DefaultPiece, Piece, PieceType } from '@common/Piece.mjs';
import { Board } from '@common/Board.mjs';
import { IchorDisplay } from '../lib/IchorDisplay';
import {Client, Callbacks} from '@colyseus/sdk'

export class Game extends Scene{

    // socket?: Socket;
    inputManager: InputManager

    constructor ()
    {
        super('Game');
        this.inputManager = new InputManager()
        this.board = new Board(true)
        this.ichorDisplay = new IchorDisplay()
    }

    preload(){
        
    }

    board: Board
    ichorDisplay: IchorDisplay

    async create ()
    {
        // this.socket = io("http://localhost:8080/");

        // this.socket.on('playerAssignment', (playerNumber:number)=>{
        //     this.board.playerNumber = playerNumber
        //     console.log("I am Player "+playerNumber)
        // })

        this.board.createReps(this.make, 0, 0)

        this.inputManager.createReps(this.add)

        this.ichorDisplay.createReps(this.add, 50, 650)
        this.ichorDisplay.updateIchor(Board.maxIchorPerTurn)

        this.input.on('pointerdown', ()=>{
            let tileClicked = this.board?.reps[0]?.getTileAtWorldXY(this.input.x, this.input.y)
            if(tileClicked){
                this.inputManager.proccessClick(this.add, this.board, tileClicked.x, tileClicked.y)
            }else{
                //console.log("no tile clicked")
            }
        })

        const client = new Client('http://localhost:2567');

        const room = await client.joinOrCreate('my_room', {
            /* custom join options */
        });
        const callbacks = Callbacks.get(room);

        room.onMessage("playerAssignment", (playerNumber:number)=>{
            console.log(`recieved player assignment, ${playerNumber}, from Colyseus`)
            this.board.playerNumber = playerNumber;
        })

        room.onMessage('otherSpawn', (message: any[])=>{
            let [pieceTypeKey, x, y] = message;
            let pieceType = Piece.classFromKey(pieceTypeKey)
            this.board.spawnPiece(pieceType, this.add, x, y, this.board.otherPlayerNumber)
        })

        room.onMessage('otherMove', (message: any[])=>{
            let [startX, startY, endX, endY] = message;
            this.board.movePiece(startX, startY, endX, endY)
        })

        room.onMessage('otherAttack', (message:any[])=>{
            console.log(message)
            let [attackerX, attackerY, defenderX, defenderY] = message;
            this.board.attackPiece(attackerX, attackerY, defenderX, defenderY)
        })

        room.onMessage('otherEndTurn', ()=>{
            console.log("other player requested a turn end")
            this.board.endTurn()
        })

        // callbacks.onAdd("turnHistory", (s, sessionId) => {
        //     console.log(s);
        // });

        this.inputManager.onMove = (startX:number, startY:number, endX:number, endY:number)=>{
            let moveCoords = [startX, startY, endX, endY] as const
            if(this.board.canMovePiece(...moveCoords)){
                this.board.movePiece(...moveCoords)
                room.send('move', moveCoords)
            }else{
                console.log("illegal move")
            }
        }

        this.inputManager.onSpawn = (pieceType: PieceType, x:number, y:number, playerOwner?:number) => {
            if(this.board.canSpawnPiece(pieceType, x, y, playerOwner)){
                this.board.spawnPiece(pieceType, this.add, x, y)
                this.ichorDisplay.updateIchor(this.board.myIchor)
                // this.socket.emit('spawn', [DefaultPiece.key, x, y])
                room.send('spawn', [DefaultPiece.key, x, y])
            }else{
                console.log("illegal spawn")
            }
        }

        this.inputManager.onAttack = (attackerX, attackerY, defenderX, defenderY) => {
            if(this.board.canAttackPiece(attackerX, attackerY, defenderX, defenderY)){
                this.board.attackPiece(attackerX, attackerY, defenderX, defenderY)
                room.send('attack', [attackerX, attackerY, defenderX, defenderY])
            }else{
                console.log("illegal attack")
            }
        }

        this.inputManager.onEndTurn = () => {
            if(this.board.canEndTurn()){
                this.board.endTurn()
                this.ichorDisplay.updateIchor(this.board.myIchor)
                room.send('endTurn')
            }
        }

        // this.socket.on('otherSpawn', (message: Array<any>)=>{
        //     console.log(message)
        //     let [pieceTypeKey, x, y] = message;
        //     let pieceType = Piece.classFromKey(pieceTypeKey)
        //     this.board.spawnPiece(pieceType, this.add, x, y, this.board.otherPlayerNumber)
        // })

        // this.socket.on('otherMove', (message:any[])=>{
            // let [startX, startY, endX, endY] = message;
            // this.board.movePiece(startX, startY, endX, endY)
        // })

        // this.socket.on('otherAttack', (message:any[])=>{
        //     let [attackerX, attackerY, defenderX, defenderY] = message;
        //     this.board.attackPiece(attackerX, attackerY, defenderX, defenderY)
        // })

        // this.socket.on('otherEndTurn', ()=>{
        //     console.log("other player requested a turn end")
        //     this.board.endTurn()
        // })
    }

    update(){

    }
}