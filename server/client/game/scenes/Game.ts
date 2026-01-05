import { Scene } from 'phaser';
import io, {type Socket} from 'socket.io-client'
import {playerInfo} from '../../../common/SocketProtocols'
import { ClientModelManager } from '../lib/ClientModelManager';
import {InputManager} from '../managers/InputManager'
import { IconButton } from '../lib/IconButton';
import { DefaultPiece, Piece } from '../lib/Piece';
import { Board } from '../lib/Board';
export class Game extends Scene{

    socket?: typeof Socket;
    model?: ClientModelManager;
    keys?: InputManager

    constructor ()
    {
        super('Game');
    }

    preload(){
        
    }

    board?: Board

    create ()
    {
        this.board = new Board(this.make, 0,0)

        let selected:string|Piece = "";
        
        new IconButton(this.add, 384,48).setCallback(()=>{
            selected = "swordIcon"
        })

        this.input.on('pointerdown', ()=>{
            if(!this.board){
                console.warn("no board when clicking")
                return;
            }
            let tileClicked = this.board?.rep.getTileAtWorldXY(this.input.x, this.input.y)
            if(tileClicked){
                console.log(tileClicked.x, tileClicked.y)
                //if(this.board?.rep.)
                if(selected==="")
                    return;
                else if(selected == "swordIcon"){
                    this.board.spawnPiece(DefaultPiece, this.add, tileClicked.x, tileClicked.y)
                }
            }else
                console.log("no tile clicked")
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
