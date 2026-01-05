import { GameObjects, Tilemaps } from "phaser"
import { Piece } from "./Piece"

export type coordContent = Piece | null
export class Board{
    rows = 10
    columns = 10
    rep: Tilemaps.Tilemap
    lookup: coordContent[][]

    constructor(makePlugin: GameObjects.GameObjectCreator, x: number, y: number){
        this.rep  = this.createReps(makePlugin, x, y)
        this.lookup = Array.from({ length: this.rows }, () => new Array(this.columns).fill(null));
    }

    createReps(makePlugin: GameObjects.GameObjectCreator, x: number, y: number):  Tilemaps.Tilemap{
        //Create the Tilemap
        const map = makePlugin.tilemap({ key: 'tilemap' })

        // add the tileset image we are using
        const grass = map.addTilesetImage('Grass')
        const dirt = map.addTilesetImage('Dirt')
        

        if(!grass||!dirt)
            throw new Error("tileset failed")
        let ground = map.createLayer(0, [grass, dirt])
        ground?.setScale(2)
        
        return map
    }

    spawnPiece(pieceType: typeof Piece, addPlugin:GameObjects.GameObjectFactory, x:number, y:number):Piece{
        let piece = new pieceType(addPlugin, this, x, y);
        this.lookup[y][x] = piece
        return piece
    }
}