import { GameObjects, Tilemaps } from "phaser"
import { Piece } from "./Piece"
import { Visual } from "../client/game/lib/Visual"
import { Loader, Geom } from "phaser"


export type coordContent = Piece | null
export class Board implements Visual<Tilemaps.Tilemap>{
    static rows = 10
    static columns = 10
    reps: Array<Tilemaps.Tilemap>
    numReps = 1
    lookup: coordContent[][]
    playerNumber:number = 0;
    isClientSide:boolean
    //0 by default until assigned


    constructor(isClientSide:boolean){
        this.reps  = []
        this.lookup = Array.from({ length: Board.rows }, () => new Array(Board.columns).fill(null));
        this.isClientSide = isClientSide
    }

    static flipPoint(x:number, y:number):[number, number]{
        // -1 because it starts at 0
        y = (Board.rows-1)-y
        return [x, y]
    }

    createReps(makePlugin: GameObjects.GameObjectCreator, x: number, y: number):  Array<Tilemaps.Tilemap>{
        if(!this.isClientSide)
            throw new Error("Cannot create reps server-side")
        //Create the Tilemap
        let map = makePlugin.tilemap({ key: 'tilemap' })

        // add the tileset image we are using
        const tiles = map.addTilesetImage('V1_Tiles')

        if(!tiles)
            throw new Error("tileset failed")
        let ground = map.createLayer(0, tiles)
        //ground?.setScale(2)
        
        this.reps = [map]
        return this.reps
    }

    static loadReps(loadPlugin:Loader.LoaderPlugin){
        loadPlugin.image('V1_Tiles', 'tilemap/V1_Tiles.png')
        loadPlugin.tilemapTiledJSON('tilemap', 'tilemap/DemoBoard.json')
    }

    isOnHomeRow(y:number){

        //console.log("checking "+y)
        if(this.playerNumber == 2){
            if(y==0)
                return true;
            else
                return false;
        }else if(this.playerNumber == 1){
            if(y==Board.rows-1)
                return true;
            else
                return false;
        }else{
            // if player is spectator they have no home row
            return false
        }
    }

    isNotSpectator():boolean{
        return this.playerNumber != 0
    }

    // move to Game Rules
    canSpawnPiece(pieceType: typeof Piece, x:number, y:number, playerOwner?:number){
        // console.log(`inputs ${x}, ${y}`)
        if(playerOwner == undefined)
            playerOwner = this.playerNumber

        if(this.isSpaceEmpty(x,y)&&
            this.isOnHomeRow(y)&&
            this.isNotSpectator())
            return true;
        else
            return false;
    }

    spawnPiece(pieceType: typeof Piece, addPlugin:GameObjects.GameObjectFactory, x:number, y:number, playerOwner?:number):Piece{
        // console.log(`spawning from: ${x}, ${y}`)
        if(playerOwner == undefined)
            playerOwner = this.playerNumber
        let piece = new pieceType(addPlugin, this, x, y, this.isClientSide, playerOwner);
        this.lookup[y][x] = piece
        return piece
    }

    adjustIfFlip(x:number, y:number):[number, number]{
        if(this.playerNumber == 2)
            return Board.flipPoint(x, y);
        else
            return [x,y];
    }

    // move to Game Rules
    doesOwnPiece(piecePlayerNumber:number):boolean{
        return this.playerNumber == piecePlayerNumber;
    }

    isSpaceFull(x:number, y:number):boolean{
        return !this.isSpaceEmpty(x,y);
    }

    isSpaceEmpty(x:number, y:number):boolean{
        return this.lookup[y][x] == null;
    }

    // move to Game Rules
    canMovePiece(startX:number, startY: number, endX:number, endY:number, playerNumber?:number){
        let piece = this.lookup[startY][startX]
        if(!playerNumber)
            playerNumber = this.playerNumber
        if(!piece)
            return false;

        return (this.doesOwnPiece(playerNumber) &&
                this.isSpaceEmpty(endX, endY)&&
                piece.withinMovementPattern(endX, endY))
    }

    movePiece(startX:number, startY:number, endX:number, endY:number){
        console.log(`moving from ${startX}, ${startY} to ${endX}, ${endY}`)

        let piece = this.lookup[startY][startX]

        this.lookup[endY][endX] = piece;

        if(!piece){
            console.warn(`no piece selected at (${startX}, ${startY})`)
            return;
        }
        piece.setCoord(endX, endY)

        this.lookup[startY][startX] = null;
    }

    areEnemyPieces(x:Piece, y:Piece):boolean{
        let xPlayerNumber = x?.playerOwner;
        let yPlayerNumber = y?.playerOwner;
        return xPlayerNumber != yPlayerNumber
    }

    //move to Game Rules
    canAttackPiece(attackerX:number, attackerY:number, defenderX:number, defenderY:number){
        let attackingPiece = this.getPiece(attackerX, attackerY)
        let defendingPiece = this.getPiece(defenderX, defenderY)
        if(!attackingPiece || !defendingPiece)
            return false;

        return (this.areEnemyPieces(attackingPiece, defendingPiece) &&
                this.isSpaceFull(defenderX, defenderY)&&
                attackingPiece.withinAttackingPattern(defenderX, defenderY))
    }

    attackPiece(attackerX:number, attackerY:number, defenderX:number, defenderY:number){
        let defendingPiece = this.getPiece(defenderX, defenderY)
        defendingPiece?.die()        
    }

    getPiece(x:number, y:number):coordContent{
        return this.lookup[y][x]
    }

    get otherPlayerNumber(){
        if(this.playerNumber==1)
            return 2;
        else
            return 1;
    }
}