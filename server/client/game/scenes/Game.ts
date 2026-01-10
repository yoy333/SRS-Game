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

        new IconButton(this.add, 384,48).setCallback(()=>{
            this.inputManager.selected = "swordIcon"
        })

        this.input.on('pointerdown', ()=>{
            let tileClicked = this.board?.reps[0].getTileAtWorldXY(this.input.x, this.input.y)
            if(tileClicked&&this.socket){
                this.inputManager.proccessClick(this.socket, this.add, this.board, tileClicked.x, tileClicked.y)
            }else{
                //console.log("no tile clicked")
            }
        })

        this.socket.on('otherSpawn', (message: Array<any>)=>{
            let [pieceTypeKey, x, y] = message;
            let pieceType = Piece
            if(pieceTypeKey==DefaultPiece.key)
                pieceType = DefaultPiece
            this.board.spawnPiece(pieceType, this.add, x, y, this.board.otherPlayerNumber)
        })

        this.socket.on('otherMove', (message:any[])=>{
            let [startX, startY, endX, endY] = message;
            this.board.movePiece(startX, startY, endX, endY)
        })
    }

    update(){

    }
}