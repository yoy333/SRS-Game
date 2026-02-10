import { Scene } from 'phaser';
import io, {type Socket} from 'socket.io-client'
import {InputManager} from '../lib/InputManager'
import { IconButton } from '../lib/IconButton';
import { DefaultPiece, Piece, PieceType } from '../../../common/Piece';
import { Board } from '../../../common/Board';
import { IchorDisplay } from '../lib/IchorDisplay';
export class Game extends Scene{

    socket?: typeof Socket;
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

    create ()
    {
        this.socket = io("http://localhost:8080/");

        this.socket.on('playerAssignment', (playerNumber:number)=>{
            this.board.playerNumber = playerNumber
            console.log("I am Player "+playerNumber)
        })

        this.board.createReps(this.make, 0, 0)

        new IconButton(this.add, this.inputManager, 768,96, DefaultPiece.key)

        this.ichorDisplay.createReps(this.add, 50, 650)
        this.ichorDisplay.updateIchor(Board.maxIchorPerTurn)

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

        this.inputManager.onSpawn = (pieceType: PieceType, x:number, y:number, playerOwner?:number) => {
            if(this.board.canSpawnPiece(pieceType, x, y, playerOwner)){
                this.board.spawnPiece(pieceType, this.add, x, y)
                this.ichorDisplay.updateIchor(this.board.ichor[this.board.playerNumber-1])
                if(!this.socket)
                    throw new Error("no socket :(")
                this.socket.emit('spawn', [DefaultPiece.key, x, y])
            }else{
                console.log("illegal spawn")
            }
        }

        this.inputManager.onAttack = (attackerX, attackerY, defenderX, defenderY) => {
            if(this.board.canAttackPiece(attackerX, attackerY, defenderX, defenderY)){
                this.board.attackPiece(attackerX, attackerY, defenderX, defenderY)
                if(!this.socket)
                    throw new Error("no socket :(")
                this.socket.emit('attack', [attackerX, attackerY, defenderX, defenderY])
            }else{
                console.log("illegal attack")
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

        this.socket.on('otherAttack', (message:any[])=>{
            let [attackerX, attackerY, defenderX, defenderY] = message;
            this.board.attackPiece(attackerX, attackerY, defenderX, defenderY)
        })

        // this.socket.on('gameState', (message:string)=>{
        //     let lookup = JSON.parse(message)
        //     console.log(lookup)
        // })
    }

    update(){

    }
}