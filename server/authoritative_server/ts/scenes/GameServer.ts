import {Scene} from 'phaser'

import { Server as SocketIOServer, Socket, DefaultEventsMap } from 'socket.io';
//import { Input } from '../../../common/SocketProtocols';
import {io} from '../main'
import { Board } from '../../../common/Board';
import { DefaultPiece, Piece } from '../../../common/Piece';

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
                let pieceType = Piece
                if(pieceTypeKey==DefaultPiece.key)
                    pieceType = DefaultPiece

                let playerNumber:number;
                if(socket.id == this.sockets[0]?.id)
                    playerNumber = 1;
                else
                    playerNumber = 0;

                this.board.spawnPiece(pieceType, this.add, x, y, playerNumber)
                socket.broadcast.emit('otherSpawn', message)
            })

            socket.on('move', (message:any[])=>{
                let [startX, startY, endX, endY] = message;
                this.board.movePiece(startX, startY, endX, endY)
                socket.broadcast.emit('otherMove', message)
            })
        });
    }

    sockets:Array<defaultSocket|null>
    connectedPlayers:number

    tryAddPlayer(socket:defaultSocket){
        if(!this.sockets[0]?.id){
            this.sockets[0] = socket; 
            socket.emit('playerAssignment', 1)
        }else if(!this.sockets[1]?.id){
            this.sockets[1] = socket;
            socket.emit('playerAssignment', 2)
        }else{
            this.sockets.push(socket)
            socket.emit('playerAssignment', 0)
        }
    }

    removePlayer(socket:defaultSocket){
        this.connectedPlayers--;
        this.sockets.forEach((possibleDisconnected, index)=>{
            if(possibleDisconnected?.id == socket.id)
                this.sockets[index] = null;
        })
        console.log(this.sockets.map((socket:defaultSocket|null)=>{
            return socket?.id
        }))
        this.io.emit('playerDisconnect', socket.id);
    }

    update(){
        
    }


} 