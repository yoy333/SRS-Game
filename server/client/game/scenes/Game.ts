import { Scene } from 'phaser';
import io, {type Socket} from 'socket.io-client'
import {playerInfo} from '../../../common/SocketProtocols'
import { ClientModelManager } from '../managers/ClientModelManager';
import {InputManager} from '../managers/InputManager'
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

    create ()
    {
        //this.scale.resize(window.innerWidth/2, window.innerHeight/2);
        // this.cameras.main.setZoom(1.1)
        this.cameras.main.setPosition(0,0)

        //Create the Tilemap
        const map = this.make.tilemap({ key: 'tilemap' })

        // add the tileset image we are using
        const grass = map.addTilesetImage('Grass')
        const dirt = map.addTilesetImage('Dirt')
        
        // create the layers we want in the right order
        //map.createStaticLayer('Background', tileset)

        if(!grass||!dirt)
            throw new Error("tileset failed")
        let ground = map.createLayer(0, [grass, dirt])
        ground?.setScale(2)


        //grass.setTileSize(64, 64)
        //dirt.setTileSize(64, 64)

        this.input.on('pointerdown', ()=>{
            let tileClicked = map.getTileAtWorldXY(this.input.x, this.input.y)
            if(tileClicked){
                console.log(tileClicked.x, tileClicked.y)
                let x = tileClicked.getCenterX()
                let y = tileClicked.getCenterY()
                this.add.image(x,y,'swordIcon')
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
