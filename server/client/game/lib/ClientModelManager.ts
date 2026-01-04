import {GameObjects} from 'phaser'
import { playerInfo } from '../../../common/SocketProtocols'

type addPlugin = GameObjects.GameObjectFactory

export class ClientModelManager{
    
    players:Map<string, Phaser.GameObjects.Image>
    playerGroup:Phaser.GameObjects.Group

    constructor(add:addPlugin){
        this.playerGroup = add.group();
        this.players = new Map()
    }

    addAllPlayers(add:addPlugin, players:playerInfo[], selfId:string){
        players.forEach( (player, id)=>{
            if (player.id === selfId) {
                this.addPlayer(add, player, 'ship');
            } else {
                this.addPlayer(add, player, 'otherPlayer');
            }
        });
    }

    addPlayer(add:addPlugin, playerI:playerInfo, sprite:string) {
        const player = add.image(playerI.x, playerI.y, sprite)
         .setOrigin(0.5, 0.5).setDisplaySize(53, 40);
        
        console.log(playerI.x, playerI.y, playerI.team)

        if (playerI.team === 'blue') 
            player.setTint(0x0000ff);
        else 
            player.setTint(0xff0000);
        
        if(!this.players)
            throw new Error("player map not created")
        this.players.set(playerI.id, player)
    }

    removePlayer(id:string){
        this.players.forEach( (rep, idPoss) => {
            if(id == idPoss){
                rep.destroy()
                this.players.delete(id)
            }
        });
    }

    updateAllPos(players: playerInfo[]){
        players.forEach( (info)=>{
            this.players.forEach(function (player, id) {
                if (info.id === id) {
                    player.setRotation(info.rotation);
                    player.setPosition(info.x, info.y);
                }
            });
        });
    }
}