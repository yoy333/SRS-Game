import {Scene, Geom} from 'phaser'

import { Server as SocketIOServer, Socket, DefaultEventsMap } from 'socket.io';
import {io} from '../main'
import { Board } from '../../../common/Board';
import { Piece } from '../../../common/Piece';

export type defaultSocket = Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>

export class GameServer extends Scene{
    io:SocketIOServer
    board:Board

    constructor(){
        super('board')
        this.io = io
        this.sockets = []
        this.connectedPlayers = 0;
        this.board = new Board(false)
    }

    preload(){
        
    }


    create() {
        this.io.on('connection',  (socket:defaultSocket)=>{
            console.log(`user ${socket.id} connected`);
            this.tryAddPlayer(socket)
            socket.on('disconnect',  () => {
                console.log(`user ${socket.id} disconnected`)
                this.removePlayer(socket)
            });

            socket.on('spawn', (message:Array<any>)=>{
                let [pieceTypeKey, x, y] = message;
                let pieceType = Piece.classFromKey(pieceTypeKey)
                // server must check player ownership in case of hijacked calls
                let playerNumber = this.getPlayerAssignment(socket.id)

                this.board.spawnPiece(pieceType, this.add, x, y, playerNumber)
                socket.broadcast.emit('otherSpawn', message)
            })

            socket.on('move', (message:any[])=>{
                let [startX, startY, endX, endY] = message;
                let playerNumber = this.getPlayerAssignment(socket.id)

                if(this.board.canMovePiece(startX, startY, endX, endY, playerNumber)){
                    this.board.movePiece(startX, startY, endX, endY)
                }
                   
                socket.broadcast.emit('otherMove', message)
            })

            socket.on('attack', (message:any[])=>{
                let [attackerX, attackerY, defenderX, defenderY] = message;
                let playerNumber = this.getPlayerAssignment(socket.id)

                if(this.board.canAttackPiece(attackerX, attackerY, defenderX, defenderY)){
                    this.board.movePiece(attackerX, attackerY, defenderX, defenderY)
                }
                   
                socket.broadcast.emit('otherAttack', message)
            })

            socket.on('endTurn', ()=>{
                if(this.board.currentTurn==1)
                    this.sockets[1]?.emit("otherEndTurn")
                else if(this.board.currentTurn==2)
                    this.sockets[0]?.emit("otherEndTurn")
                this.board.endTurn()
                console.log("ending turn from server")
            })
        });
    }

    sockets:Array<defaultSocket|null>
    connectedPlayers:number

    tryAddPlayer(socket:defaultSocket){
        if(!this.sockets[0]?.id){
            this.sockets[0] = socket;
            socket.emit('playerAssignment', 1)
            // this.sendGameState(socket)
        }else if(!this.sockets[1]?.id){
            this.sockets[1] = socket;
            socket.emit('playerAssignment', 2)
            // this.sendGameState(socket)
        }else{
            this.sockets.push(socket)
            socket.emit('playerAssignment', 0)
        }
    }

    // sendGameState(socket:defaultSocket){
    //     socket.emit('gameState', this.board.lookup)
    // }

    removePlayer(socket:defaultSocket){
        this.connectedPlayers--;
        this.sockets.forEach((possibleDisconnected, index)=>{
            if(possibleDisconnected?.id == socket.id)
                this.sockets[index] = null;
        })
        this.io.emit('playerDisconnect', socket.id);
    }

    getPlayerAssignment(id:string){
        if(id == this.sockets[0]?.id)
            return 1;
        else if(id == this.sockets[1]?.id)
            return 2;
        else
            return 0;
    }

    update(){
        
    }


} 