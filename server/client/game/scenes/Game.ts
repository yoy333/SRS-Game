import { Scene } from 'phaser';
import io, {type Socket} from 'socket.io-client'
import {InputManager} from '../lib/InputManager'
import { IconButton } from '../lib/IconButton';
import { DefaultPiece, Piece } from '../../../common/Piece';
import { Board } from '../../../common/Board';
//import { GameObjects } from 'phaser';
export class Game extends Scene{

    socket?: typeof Socket;
    inputManager: InputManager

    constructor ()
    {
        super('Game');
        this.inputManager = new InputManager()
        this.board = new Board(true)
    }

    preload(){
        
    }

    board: Board

    create ()
    {
        this.socket = io("http://localhost:8080/");

        this.socket.on('playerAssignment', (playerNumber:number)=>{
            this.board.playerNumber = playerNumber
            console.log("I am Player "+playerNumber)
        })

        this.board.createReps(this.make, 0, 0)

        new IconButton(this.add, this.inputManager, 768,96, DefaultPiece.key)

        this.input.on('pointerdown', ()=>{
            let tileClicked = this.board?.reps[0].getTileAtWorldXY(this.input.x, this.input.y)
            if(tileClicked&&this.socket){
                this.inputManager.proccessClick(this.socket, this.add, this.board, tileClicked.x, tileClicked.y)
            }else{
                //console.log("no tile clicked")
            }
        })

        this.inputManager.onMove = (startX:number, startY:number, endX:number, endY:number)=>{
            let moveCoords = [startX, startY, endX, endY] as const
            if(this.board.canMovePiece(...moveCoords)){
                this.board.movePiece(...moveCoords)
                if(!this.socket)
                    throw new Error("no socket :(")
                this.socket.emit('move', moveCoords)
            }else{
                console.log("illegal move")
            }
        }

        this.inputManager.onSpawn = (pieceType: typeof Piece, x:number, y:number, playerOwner?:number) => {
            if(this.board.canSpawnPiece(pieceType, x, y, playerOwner)){
                this.board.spawnPiece(pieceType, this.add, x, y)
                if(!this.socket)
                    throw new Error("no socket :(")
                this.socket.emit('spawn', [DefaultPiece.key, x, y])
            }else{
                console.log("illegal spawn")
            }
        }

        this.socket.on('otherSpawn', (message: Array<any>)=>{
            let [pieceTypeKey, x, y] = message;
            let pieceType = Piece.classFromKey(pieceTypeKey)
            this.board.spawnPiece(pieceType, this.add, x, y, this.board.otherPlayerNumber)
        })

        this.socket.on('otherMove', (message:any[])=>{
            let [startX, startY, endX, endY] = message;
            this.board.movePiece(startX, startY, endX, endY)
        })

        // this.socket.on('gameState', (message:string)=>{
        //     let lookup = JSON.parse(message)
        //     console.log(lookup)
        // })
    }

    update(){

    }
}