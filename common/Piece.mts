import { Board } from "./Board.mjs";
import { Visual } from "../client/game/lib/Visual.js";
import { Game, GameObjects } from "phaser";
import { Loader } from "phaser";

type sprite = GameObjects.Sprite
type image = GameObjects.Image
type point = [number, number]
type pattern = Set<point>
const emptyPattern:pattern = new Set()

type PT = new (...args: any[]) => Piece
type pieceStatics = {
    createRep:(addPlugin:GameObjects.GameObjectFactory, x:number, y:number)=>Array<sprite|image>
    loadReps:(loadPlugin:Loader.LoaderPlugin)=>void
    spawnCost:number
}
export type PieceType = PT & pieceStatics

export const pieceTypeRegistery: PieceType[] = []

export abstract class Piece implements Visual<sprite|image>{
    reps:Array<sprite|image>
    numReps = 1;
    board:Board

    coordX:number
    coordY:number
    perspectiveX:number
    perspectiveY:number

    key = ''
    isClientSide:boolean
    playerOwner:number

    relativeMovementPattern:pattern = emptyPattern;
    relativeAttackingPattern:pattern = emptyPattern;

    static spawnCost = 1;

    constructor(addPlugin: GameObjects.GameObjectFactory|undefined, board:Board, x:number, y:number, isClientSide:boolean, playerOwner:number){
        if(addPlugin == undefined && isClientSide){
            throw new Error("add plugin must be provided for client side pieces")
        }

        this.reps = []
        this.board = board;

        this.coordX = x;
        this.coordY = y;
        if(board.playerNumber == 2)
            [this.perspectiveX, this.perspectiveY] = Board.flipPoint(x, y)
        else
            [this.perspectiveX, this.perspectiveY] = [x, y]

        // console.log(`coords of new piece ${x}, ${y}`)

        this.isClientSide = isClientSide;
        this.playerOwner = playerOwner;
    }    

    createReps(addPlugin: GameObjects.GameObjectFactory): Array<sprite|image>{
        return []
    }

    setCoord(x:number, y:number){
        this.coordX = x;
        this.coordY = y;

        [this.perspectiveX, this.perspectiveY] = this.board.adjustIfFlip(x,y)
        
        if(this.isClientSide)
            this.updateRep();
    }

    updateRep(){
        let tile = this.board.reps[0].getTileAt(this.perspectiveX,this.perspectiveY)
        if(!tile)
            throw new Error(`no tile at (${this.coordX}, ${this.coordY})`)
        let worldX = tile.getCenterX()
        let worldY = tile.getCenterY()
        this.reps[0].setPosition(worldX, worldY)
    }

    withinMovementPattern(x:number, y:number):boolean{
        for(let point of this.relativeMovementPattern){
            let [checkX, checkY] = point;
            if(this.playerOwner == 2)
                checkY *= -1
            const absX = this.coordX+checkX
            const absY = this.coordY+checkY
            if(absX == x && absY == y)
                return true;
        }
        return false;
    }

    withinAttackingPattern(x:number, y:number):boolean{
        for(let point of this.relativeAttackingPattern){
            let [checkX, checkY] = point;
            if(this.playerOwner == 2)
                checkY *= -1
            const absX = this.coordX+checkX
            const absY = this.coordY+checkY
            if(absX == x && absY == y)
                return true;
        }
        return false;
    }

    die(){
        this.reps.forEach((rep:sprite|image)=>{
            rep.destroy(true)
        })
        this.board.setPiece(this.coordX, this.coordY, null)
    }

    static createFromKey(key:string, addPlugin: GameObjects.GameObjectFactory, board:Board, x: number, y: number, isClientSide:boolean, playerOwner:number):Piece{
        let pieceType:PieceType = (this.classFromKey(key))
        return new pieceType(addPlugin, board, x, y, true, playerOwner)
    }

    /* fix */

    static classFromKey(key:string):PieceType{
        switch(key){
            case DefaultPiece.key: return DefaultPiece;
            case Zeus.key: return Zeus;
            case Artemis.key: return Artemis;
            default: return DefaultPiece
        }
    }
}

const square_1:pattern = new Set([
    [-1, -1], [0, -1], [1, -1],
    [-1, 0],  [0, 0],  [1, 0],
    [-1, 1],  [0, 1],  [1, 1]
])
const forward_1:pattern = new Set([
    [-1, -1], [0, -1], [1, -1]
])
export class DefaultPiece extends Piece{
    static key = 'default'
    key = 'default'

    static spawnCost = 2;

    constructor(addPlugin: GameObjects.GameObjectFactory, board:Board, x:number, y:number, isClientSide:boolean, playerOwner:number){
        super(addPlugin,board, x, y, isClientSide, playerOwner)
        if(this.isClientSide)
            this.reps = this.createReps(addPlugin)
    }

    createReps(addPlugin: GameObjects.GameObjectFactory): Array<sprite> {
        if(!this.isClientSide)
            throw new Error("Cannot create reps server-side")
        let x = this.perspectiveX;
        let y = this.perspectiveY; 
        // console.log(`creating rep at ${x}, ${y}`)
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

    static createRep(addPlugin:GameObjects.GameObjectFactory, x:number, y:number){
        let icon = addPlugin.sprite(x, y, this.key, 0)
        return [icon]
    }

    static loadReps(loadPlugin:Loader.LoaderPlugin){
        loadPlugin.spritesheet(DefaultPiece.key, 'Placeholder.png', {
            frameWidth:64,
            frameHeight:64,
            margin:32
        })    
    }

    relativeMovementPattern: pattern = forward_1
    relativeAttackingPattern: pattern = square_1;
}

pieceTypeRegistery.push(DefaultPiece)

export class Zeus extends Piece{
    static key = 'zeus'
    key = 'zeus'

    static spawnCost = 2;

    constructor(addPlugin: GameObjects.GameObjectFactory, board:Board, x:number, y:number, isClientSide:boolean, playerOwner:number){
        super(addPlugin,board, x, y, isClientSide, playerOwner)
        if(this.isClientSide)
            this.reps = this.createReps(addPlugin)
    }

    createReps(addPlugin: GameObjects.GameObjectFactory): Array<sprite|image> {
        if(!this.isClientSide)
            throw new Error("Cannot create reps server-side")
        let x = this.perspectiveX;
        let y = this.perspectiveY; 
        // console.log(`creating rep at ${x}, ${y}`)
        let tile = this.board.reps[0].getTileAt(x,y)
        if(!tile)
            throw new Error(`no tile at (${x}, ${y})`)
        let worldX = tile.getCenterX()
        let worldY = tile.getCenterY()
        if(this.key==""){
            console.warn('no key specified')
        }
        let [primaryRep] = Zeus.createRep(addPlugin, worldX, worldY)
        return [primaryRep]
    }

    static createRep(addPlugin:GameObjects.GameObjectFactory, x:number, y:number){
        let icon = addPlugin.image(x,y,this.key, 0)
        icon.setScale(1/20, 1/20)
        return [icon]
    }

    static loadReps(loadPlugin:Loader.LoaderPlugin){
        loadPlugin.image(Zeus.key, 'zeus_v01.png')    
    }

    relativeMovementPattern: pattern = forward_1
    relativeAttackingPattern: pattern = square_1;
}

pieceTypeRegistery.push(Zeus)

export class Artemis extends Piece{
    static key = 'artemis'
    key = 'artemis'

    static spawnCost = 2;

    constructor(addPlugin: GameObjects.GameObjectFactory, board:Board, x:number, y:number, isClientSide:boolean, playerOwner:number){
        super(addPlugin,board, x, y, isClientSide, playerOwner)
        if(this.isClientSide)
            this.reps = this.createReps(addPlugin)
    }

    createReps(addPlugin: GameObjects.GameObjectFactory): Array<sprite|image> {
        if(!this.isClientSide)
            throw new Error("Cannot create reps server-side")
        let x = this.perspectiveX;
        let y = this.perspectiveY; 
        // console.log(`creating rep at ${x}, ${y}`)
        let tile = this.board.reps[0].getTileAt(x,y)
        if(!tile)
            throw new Error(`no tile at (${x}, ${y})`)
        let worldX = tile.getCenterX()
        let worldY = tile.getCenterY()
        if(this.key==""){
            console.warn('no key specified')
        }
        let [primaryRep] = Artemis.createRep(addPlugin, worldX, worldY)
        return [primaryRep]
    }

    static createRep(addPlugin:GameObjects.GameObjectFactory, x:number, y:number){
        let icon = addPlugin.image(x,y,this.key, 0)
        icon.setScale(1/30, 1/40)
        icon.setOrigin(0.5, 0.55)
        return [icon]
    }

    static loadReps(loadPlugin:Loader.LoaderPlugin){
        loadPlugin.image(Artemis.key, 'artemis_v01.png')    
    }

    relativeMovementPattern: pattern = forward_1
    relativeAttackingPattern: pattern = square_1;
}

pieceTypeRegistery.push(Artemis)