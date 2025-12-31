import {Board} from '../scenes/board'

import {playerInfo, Sendalbe, Input} from '../../../common/SocketProtocols'


const players:Map<string, Player> = new Map()
type playerRep = Phaser.Types.Physics.Arcade.ImageWithDynamicBody

export class ModelManager{
    board:Board
    players:Map<string, Player>
    playerGroup:Phaser.Physics.Arcade.Group

    constructor(board:Board){
        this.board = board;
        this.players = players;
        this.playerGroup = this.board.physics.add.group()
    }

    addPlayer(id:string):Player {
        let rotation = 0;
        let x = Math.floor(Math.random() * 700)+50;
        let y = Math.floor(Math.random() * 500) + 50;

        const playerRep = this.board.physics.add.image(x, y, 'ship')
        .setOrigin(0.5, 0.5)
        .setDisplaySize(53, 40);

        playerRep.setDrag(100);
        playerRep.setAngularDrag(100);
        playerRep.setMaxVelocity(200);

        let newPlayer = new Player(id,  x, y, rotation, playerRep)

        players.set(id, newPlayer)
        this.playerGroup.add(newPlayer.rep)


        return newPlayer;
    }

    removePlayer(id:string){
        //destroy object in phaser
        players.forEach((player) => {
            if (player.id === id) {
                this.playerGroup.remove(player.rep)
                player.rep.destroy();
            }
        });

        // destroy object on our map
        players.delete(id);
    }

    getGameState():playerInfo[]{
        let arr:playerInfo[] = []
        players.forEach(p=>{
            arr.push(p.getInfo())
        })
        return arr;
    }

    matchPosFromRep(){
        this.players.forEach((player)=>{
            player.x = player.rep.x;
            player.y = player.rep.y;
            player.rotation = player.rep.rotation;
        })
    }

    updatePlayPos(){
        this.players.forEach((player) => {
            const input = player.input;
            if (input.left) {
                player.rep.setAngularVelocity(-300);
            } else if (input.right) {
                player.rep.setAngularVelocity(300);
            } else {
                player.rep.setAngularVelocity(0);
            }
            if (input.up) {
                this.board.physics.velocityFromRotation(player.rotation + 1.5, 200, player.rep.body.acceleration);
            } else {
                player.rep.setAcceleration(0);
            }
        });
        this.board.physics.world.wrap(this.playerGroup, 5);
        this.matchPosFromRep()
    }
}

export class Player implements Sendalbe{
  id: string
  x: number
  y: number
  rotation:number
  team:string
  rep:playerRep
  input:Input


  constructor(id: string, x: number, y: number, rotation: number, rep:playerRep){
    this.id = id
    this.x = x;
    this.y = y;
    this.rep = rep;
    this.rotation = rotation;
    this.team = (Math.floor(Math.random() * 2) == 0) ? 'red' : 'blue'
    this.input = {
        up:false,
        left:false,
        right:false
    }
  }

  getInfo():playerInfo{
    return {
        x: this.x,
        y: this.y,
        rotation: this.rotation,
        id: this.id,
        team: this.team
    }
  }
}