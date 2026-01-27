import { Board } from "./Board";
import { Visual, visualRep } from "../client/game/lib/Visual";
import { Game, GameObjects } from "phaser";
import { Loader } from "phaser";

type sprite = GameObjects.Sprite
export class Piece implements Visual<sprite>{
    reps:Array<sprite>
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

    createReps(addPlugin: GameObjects.GameObjectFactory, x: number, y: number): Array<sprite> {
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
        let primaryRep = addPlugin.sprite(worldX,worldY,this.key, 0)
        return [primaryRep]
    }

    static loadReps(loadPlugin:Loader.LoaderPlugin){
        loadPlugin.spritesheet(DefaultPiece.key, 'Placeholder.png', {
            frameWidth:64,
            frameHeight:64,
            margin:32
        })    
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

    static createFromKey(key:string, addPlugin: GameObjects.GameObjectFactory, board:Board, x: number, y: number, isClientSide:boolean, playerOwner:number):Piece{
        let pieceType:typeof Piece = (this.classFromKey(key))
        return new pieceType(addPlugin, board, x, y, true, playerOwner)
    }

    static classFromKey(key:string):typeof Piece{
        switch(key){
            case DefaultPiece.key: return DefaultPiece;
            default: return Piece
        }
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