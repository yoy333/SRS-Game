import { Board } from "./Board";
import { Visual, visualRep } from "../client/game/lib/Visual";
import { Game, GameObjects } from "phaser";

type image = GameObjects.Image
export class Piece implements Visual<image>{
    reps:Array<image>
    numReps = 1;
    frame = ''
    board:Board
    coordX:number
    coordY:number
    key = ''

    constructor(addPlugin: GameObjects.GameObjectFactory, board:Board, x: number, y: number){
        this.reps = []
        this.board = board;
        this.coordX = x;
        this.coordY = y;
        //this.reps = this.createReps(addPlugin,x,y)
    }

    createReps(addPlugin: GameObjects.GameObjectFactory, x: number, y: number): Array<image> {
        let tile = this.board.reps[0].getTileAt(x,y)
        if(!tile)
            throw new Error(`no tile at (${x}, ${y})`)
        let worldX = tile.getCenterX()
        let worldY = tile.getCenterY()
        if(this.frame==""){
            console.log('no frame specified')
        }
        let primaryRep = addPlugin.image(worldX,worldY,this.frame)
        return [primaryRep]
    }

    setCoord(x:number, y:number){
        this.coordX = x;
        this.coordY = y;

        let tile = this.board.reps[0].getTileAt(x,y)
        if(!tile)
            throw new Error(`no tile at (${x}, ${y})`)
        let worldX = tile.getCenterX()
        let worldY = tile.getCenterY()
        this.reps[0].setPosition(worldX, worldY)
    }
}

export class DefaultPiece extends Piece{
    frame = 'swordIcon'
    static key = 'default'
    constructor(addPlugin: GameObjects.GameObjectFactory, board:Board, x: number, y: number){
        super(addPlugin,board,x,y)
        this.reps = this.createReps(addPlugin, x, y)
    }
}