import { Scene } from 'phaser';
import io, {type Socket} from 'socket.io-client'
import { ClientModelManager } from '../lib/ClientModelManager';
import {InputManager} from '../../../common/InputManager'
import { IconButton } from '../lib/IconButton';
import { DefaultPiece, Piece } from '../../../common/Piece';
import { Board } from '../../../common/Board';
import { GameObjects } from 'phaser';
export class Game extends Scene{

    socket?: typeof Socket;
    model?: ClientModelManager;
    inputManager: InputManager

    constructor ()
    {
        super('Game');
        this.inputManager = new InputManager()
        this.board = new Board()
    }

    preload(){
        
    }

    board: Board

    create ()
    {
        this.board.createReps(this.make, 0, 0)

        new IconButton(this.add, 384,48).setCallback(()=>{
            this.inputManager.selected = "swordIcon"
        })

        this.input.on('pointerdown', ()=>{
            let tileClicked = this.board?.reps[0].getTileAtWorldXY(this.input.x, this.input.y)
            if(tileClicked){
                this.inputManager.proccessClick(this.add, this.board, tileClicked.x, tileClicked.y)
            }else{
                console.log("no tile clicked")
            }
        })

        //map.getTileAt(0,0)
        
        // this.model = new ClientModelManager(this.add)

        // this.socket = io();

        // this.socket.on('gameState',  (players:playerInfo[]) => {
        //     if(!this.socket)
        //         throw new Error("no socket :(")
        //     this.model?.addAllPlayers(this.add, players, this.socket?.id)
        // });

        // this.socket.on('newPlayer', (player:playerInfo)=>{
        //     this.model?.addPlayer(this.add, player, 'otherPlayer');
        // });
        // this.socket.on('playerDisconnect',  (id:string)=>{
        //     console.log(id)
        //     this.model?.removePlayer(id)
        // });

        // this.input.once('pointerdown', () => {

        //     this.scene.start('GameOver');

        // });

        // this.socket.on('playerUpdates',  (players:playerInfo[])=>{
        //     this.model?.updateAllPos(players)
        // });

        // this.keys = new InputManager(this.input)
    }

    update(){
        // let inputs = this.keys?.getInputs()

        // if(!this.socket)
        //     throw new Error("no socket")

        // if(this.keys?.didInputChange())
        //     this.socket.emit('playerInput', inputs);

    }
}