import { GameObjects, Tilemaps } from "phaser"
import { Piece } from "./Piece"
import { Visual } from "../client/game/lib/Visual"
import { Loader } from "phaser"

export type coordContent = Piece | null
export class Board implements Visual<Tilemaps.Tilemap>{
    rows = 10
    columns = 10
    reps: Array<Tilemaps.Tilemap>
    numReps = 1
    lookup: coordContent[][]
    playerNumber:number = 0;
    isClientSide:boolean
    //0 by default until assigned


    constructor(isClientSide:boolean){
        this.reps  = []
        this.lookup = Array.from({ length: this.rows }, () => new Array(this.columns).fill(null));
        this.isClientSide = isClientSide
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

    canSpawnPiece(pieceType: typeof Piece, x:number, y:number, playerOwner?:number){
        if(playerOwner == undefined)
            playerOwner = this.playerNumber

        if(this.lookup[y][x]==null&&this.playerNumber!=0)
            return true;
        else
            return false;
    }

    spawnPiece(pieceType: typeof Piece, addPlugin:GameObjects.GameObjectFactory, x:number, y:number, playerOwner?:number):Piece{
        if(playerOwner == undefined)
            playerOwner = this.playerNumber
        let piece = new pieceType(addPlugin, this, x, y, this.isClientSide, playerOwner);
        this.lookup[y][x] = piece
        return piece
    }

    canMovePiece(startX:number, startY: number, endX:number, endY:number, playerNumber?:number){
        let piece = this.lookup[startY][startX]
        if(!playerNumber)
            playerNumber = this.playerNumber
        return (this.playerNumber == piece?.playerOwner && playerNumber == piece.playerOwner)
    }

    movePiece(startX:number, startY: number, endX:number, endY:number){
        let piece = this.lookup[startY][startX]

        this.lookup[endY][endX] = piece;

        if(!piece){
            console.warn(`no piece selected at (${startX}, ${startY})`)
            return;
        }
        piece.setCoord(endX, endY)

        this.lookup[startY][startX] = null;
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