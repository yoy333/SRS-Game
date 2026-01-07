import {Scene} from 'phaser'

import {ModelManager} from '../managers/ModelManager'
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
        this.board = new Board()
    }

    preload(){
        
    }

    //model?: ModelManager

    create() {
        this.board.createReps(this.make, 0,0)
        //this.model = new ModelManager(this)
        this.io.on('connection',  (socket:defaultSocket)=>{
            console.log(`user ${socket.id} connected`);
            this.tryAddPlayer(socket)
            socket.on('disconnect',  () => {
                console.log(`user ${socket.id} disconnected`)
                this.removePlayer(socket)
                //this.model.removePlayer(socket.id);
            });

            socket.on('spawn', (message:Array<any>)=>{
                let [pieceTypeKey, x, y] = message;
                let pieceType = Piece
                if(pieceTypeKey==DefaultPiece.key)
                    pieceType = DefaultPiece
                this.board.spawnPiece(pieceType, this.add, x, y)
                console.log(this.board.getPiece(x,y))
            })

            /*socket.on('playerInput', (inputData)=>{
                this.handlePlayerInput(socket.id, inputData);
            });*/
            /*
            if(!this.model)
                throw new Error("model manager undefined")

            let newPlayer = this.model.addPlayer(socket.id);

            let gameState = this.model.getGameState()
            let info = newPlayer.getInfo()


            // send the players object to the new player
            socket.emit('gameState', gameState);
            // update all other players of the new player
            socket.broadcast.emit('newPlayer', info);*/
        });
    }

    sockets:Array<defaultSocket>
    connectedPlayers:number

    tryAddPlayer(socket:defaultSocket){
        if(this.connectedPlayers<2){
            this.connectedPlayers++;
            this.sockets.push(socket)
            socket.emit('playerAssignment', this.connectedPlayers)
        }else{
            console.log("spectator added: "+socket.id)
            socket.emit('playerAssignment', 0)
        }
    }

    removePlayer(socket:defaultSocket){
        this.connectedPlayers--;
        this.io.emit('playerDisconnect', socket.id);
    }

    update(){
        //this.model?.updatePlayPos()
        //window.io.emit('playerUpdates', this.model?.getGameState());
    }

    // handlePlayerInput(playerId:string, input:Input) {
    //     /*this.model?.players.forEach((player, id) => {
    //         if (playerId === id) {
    //             let player = this.model?.players.get(id)
    //             if(!player)
    //                 throw new Error("player not found at id: "+id)
    //             player.input = input;
    //         }
    //     });*/
    // }
} 