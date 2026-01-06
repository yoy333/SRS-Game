import { GameObjects, Tilemaps } from "phaser"
import { Piece } from "./Piece"
import { Visual, visualPlugin } from "../client/game/lib/Visual"

export type coordContent = Piece | null
export class Board implements Visual<Tilemaps.Tilemap>{
    rows = 10
    columns = 10
    reps: Array<Tilemaps.Tilemap>
    numReps = 1
    lookup: coordContent[][]

    constructor(){
        this.reps  = []
        this.lookup = Array.from({ length: this.rows }, () => new Array(this.columns).fill(null));
    }

    createReps(makePlugin: GameObjects.GameObjectCreator, x: number, y: number):  Array<Tilemaps.Tilemap>{
        //Create the Tilemap
        let map = makePlugin.tilemap({ key: 'tilemap' })

        // add the tileset image we are using
        const grass = map.addTilesetImage('Grass')
        const dirt = map.addTilesetImage('Dirt')
        

        if(!grass||!dirt)
            throw new Error("tileset failed")
        let ground = map.createLayer(0, [grass, dirt])
        ground?.setScale(2)
        
        this.reps = [map]
        return this.reps
    }

    spawnPiece(pieceType: typeof Piece, addPlugin:GameObjects.GameObjectFactory, x:number, y:number):Piece{
        let piece = new pieceType(addPlugin, this, x, y);
        this.lookup[y][x] = piece
        return piece
    }

    movePiece(startX:number, startY: number, endX:number, endY:number){
        let piece = this.lookup[startY][startX]
        console.log(piece)

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
}