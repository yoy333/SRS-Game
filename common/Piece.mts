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

export type PieceKey = string
type pieceStatics = {
    /* fix */
    key:string
    createRep:(addPlugin:GameObjects.GameObjectFactory, x:number, y:number)=>Array<sprite|image>
    createCard:(addPlugin:GameObjects.GameObjectFactory, x:number, y:number)=>Array<sprite|image>
    loadReps:(loadPlugin:Loader.LoaderPlugin)=>void
    loadCard:(loadPlugin:Loader.LoaderPlugin)=>void
    spawnCost:number
    moveCost:number
}
export type PieceType = PT & pieceStatics

export const pieceTypeRegistery: Map<string, PieceType> = new Map()

export abstract class Piece implements Visual<sprite|image>{
    reps:Array<sprite|image>
    numReps = 1;
    board:Board

    coordX:number
    coordY:number
    perspectiveX:number
    perspectiveY:number

    static key:string
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

    withinPattern(pattern:pattern, x:number, y:number){
        for(let point of pattern){
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

    /* fix: move certain conditions to the board */
    canMovePiece(startX:number, startY: number, endX:number, endY:number, playerNumber:number){
        return (
                this.withinPattern(this.relativeMovementPattern,endX, endY)
                )
    }

    movePiece(startX:number, startY:number, endX:number, endY:number){
        // console.log(`moving from ${startX}, ${startY} to ${endX}, ${endY}`)

        this.board.setPiece(endX, endY, this)

        this.setCoord(endX, endY)

        this.board.setPiece(startX, startY, null);
    }

    canAttackPiece(attackerX:number, attackerY:number, defenderX:number, defenderY:number, playerNumber:number){
        return (
            this.board.isSpaceFull(defenderX, defenderY)&&
            this.withinPattern(this.relativeAttackingPattern, defenderX, defenderY)
        )
    }

    attackPiece(defendingPiece:Piece){
        defendingPiece.tryToKill(this)
    }

    canBeAttacked(attackerX:number, attackerY:number, defenderX:number, defenderY:number, playerNumber:number){
        return true;
    }

    tryToKill(attackingPiece:Piece, override?:string[]):boolean{
        this.die()
        return true
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

    static classFromKey(key:string):PieceType{
        let pt = pieceTypeRegistery.get(key)
        if(!pt)
            throw new Error("tried to get nonexistent piece type")
        return pt
    }
}

const square_1:pattern = new Set([
    [-1, -1], [0, -1], [1, -1],
    [-1, 0],           [1, 0],
    [-1, 1],  [0, 1],  [1, 1]
])
const forward_1:pattern = new Set([
    [-1, -1], [0, -1], [1, -1]
])


export class DefaultPiece extends Piece{
    static key = 'default'
    key = 'default'

    static spawnCost = 2;
    static moveCost = 1;

    constructor(addPlugin: GameObjects.GameObjectFactory, board:Board, x:number, y:number, isClientSide:boolean, playerOwner:number){
        super(addPlugin,board, x, y, isClientSide, playerOwner)
        if(this.isClientSide)
            this.reps = this.createReps(addPlugin)
    }

    /* fix */
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

    static loadCard(loadPlugin:Loader.LoaderPlugin){
        
    }

    static createCard(addPlugin:GameObjects.GameObjectFactory, x:number, y:number){
        return [];
    }

    relativeMovementPattern: pattern = forward_1
    relativeAttackingPattern: pattern = square_1;

    attackPiece(defendingPiece: Piece): void {
        if(defendingPiece.tryToKill(this)){
            this.board.movePiece(this.coordX, this.coordY, defendingPiece.coordX, defendingPiece.coordY)
        }
    }
}

pieceTypeRegistery.set(DefaultPiece.key, DefaultPiece)

export class Zeus extends Piece{
    static key = 'zeus'
    key = 'zeus'

    static spawnCost = 2;
    static moveCost = 0;

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

    static loadCard(loadPlugin:Loader.LoaderPlugin){
        loadPlugin.image('zeus_card', 'zeus_card_v01.png')
    }

    static createCard(addPlugin:GameObjects.GameObjectFactory, x:number, y:number){
        let rep = addPlugin.image(x, y, 'zeus_card')
        return [rep]
    }

    relativeMovementPattern: pattern = forward_1
    relativeAttackingPattern: pattern = square_1;

    tryToKill(attackingPiece:Piece, override?: string[]): boolean {
        let attackerY = attackingPiece.coordY
        let defenderY = this.coordY
        if(this.playerOwner==2){
            attackerY = Board.flipPoint(0, attackerY)[1]
            defenderY = Board.flipPoint(0, defenderY)[1]
        }
        if(override?.includes('power')){
            this.die(); 
            return true;
        }else if(attackerY>=defenderY){
            this.die()
            return true;
        }
        return false;
    }
}

pieceTypeRegistery.set(Zeus.key, Zeus)

const artemis_attack:pattern = new Set([
    [-2, -2],                  [2, -2],
             [-1, -1],[1, -1],
             [-1,  1],[1,  1],
    [-2, 2],                   [2, 2],
])

export class Artemis extends Piece{
    static key = 'artemis'
    key = 'artemis'

    static spawnCost = 2;
    static moveCost = 0;

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
        icon.setScale(1/32, 1/32)
        icon.setOrigin(0.5, 0.4)
        return [icon]
    }

    static loadReps(loadPlugin:Loader.LoaderPlugin){
        loadPlugin.image(Artemis.key, 'artemis_v02.png')    
    }

    static loadCard(loadPlugin:Loader.LoaderPlugin){
        
    }

    static createCard(addPlugin:GameObjects.GameObjectFactory, x:number, y:number){
        return []
    }    

    relativeMovementPattern: pattern = square_1
    relativeAttackingPattern: pattern = artemis_attack;
}

pieceTypeRegistery.set(Artemis.key, Artemis)