import {Scene} from 'phaser'

import {ModelManager} from '../managers/ModelManager'
import { Server as SocketIOServer } from 'socket.io';
import { Input } from '../../../common/SocketProtocols';

export class Board extends Scene{
    io:SocketIOServer

    constructor(){
        super('board')
        this.io = window.io
    }

    preload(){
        
    }

    model?: ModelManager

    create() {
        this.model = new ModelManager(this)
        this.io.on('connection',  (socket)=>{
            console.log(`user ${socket.id} connected`);
            socket.on('disconnect',  () => {
                console.log(`user ${socket.id} disconnected`)
                if(!this.model)
                    throw new Error("un-initialized game manager")
                this.model.removePlayer(socket.id);
                this.io.emit('playerDisconnect', socket.id);
            });

            socket.on('playerInput', (inputData)=>{
                this.handlePlayerInput(socket.id, inputData);
            });
            
            if(!this.model)
                throw new Error("model manager undefined")

            let newPlayer = this.model.addPlayer(socket.id);

            let gameState = this.model.getGameState()
            let info = newPlayer.getInfo()


            // send the players object to the new player
            socket.emit('gameState', gameState);
            // update all other players of the new player
            socket.broadcast.emit('newPlayer', info);
        });
    }

    update(){
        this.model?.updatePlayPos()
        window.io.emit('playerUpdates', this.model?.getGameState());
    }

    handlePlayerInput(playerId:string, input:Input) {
        this.model?.players.forEach((player, id) => {
            if (playerId === id) {
                let player = this.model?.players.get(id)
                if(!player)
                    throw new Error("player not found at id: "+id)
                player.input = input;
            }
        });
    }
} 