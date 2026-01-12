import { Board } from "./Board";
import { Visual, visualRep } from "../client/game/lib/Visual";
import { Game, GameObjects } from "phaser";

type image = GameObjects.Image
export class Piece implements Visual<image>{
    reps:Array<image>
    numReps = 1;
    board:Board
    coordX:number
    coordY:number
    key = ''
    isClientSide:boolean
    playerOwner:number
    constructor(addPlugin: GameObjects.GameObjectFactory, board:Board, x: number, y: number, isClientSide:boolean, playerOwner:number){
        this.reps = []
        this.board = board;
        this.coordX = x;
        this.coordY = y;
        this.isClientSide = isClientSide;
        this.playerOwner = playerOwner;
        //this.reps = this.createReps(addPlugin,x,y)
    }

    createReps(addPlugin: GameObjects.GameObjectFactory, x: number, y: number): Array<image> {
        if(!this.isClientSide)
            throw new Error("Cannot create reps server-side")
        let tile = this.board.reps[0].getTileAt(x,y)
        if(!tile)
            throw new Error(`no tile at (${x}, ${y})`)
        let worldX = tile.getCenterX()
        let worldY = tile.getCenterY()
        if(this.key==""){
            console.warn('no key specified')
        }
        let primaryRep = addPlugin.image(worldX,worldY,this.key)
        return [primaryRep]
    }

    setCoord(x:number, y:number){
        this.coordX = x;
        this.coordY = y;

        if(this.isClientSide)
            this.updateRep();
    }

    updateRep(){
        let tile = this.board.reps[0].getTileAt(this.coordX,this.coordY)
        if(!tile)
            throw new Error(`no tile at (${this.coordX}, ${this.coordY})`)
        let worldX = tile.getCenterX()
        let worldY = tile.getCenterY()
        this.reps[0].setPosition(worldX, worldY)
    }
}

export class DefaultPiece extends Piece{
    static key = 'default'
    key = 'default'
    constructor(addPlugin: GameObjects.GameObjectFactory, board:Board, x: number, y: number, isClientSide:boolean, playerOwner:number){
        super(addPlugin,board,x,y, isClientSide, playerOwner)
        if(this.isClientSide)
            this.reps = this.createReps(addPlugin, x, y)
    }
}