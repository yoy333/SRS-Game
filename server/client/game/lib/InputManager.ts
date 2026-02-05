import { Input } from "phaser"
//import {Input as InputProtocol} from '../../../common/SocketProtocols'
import { GameObjects } from "phaser";
import { Board } from "../../../common/Board";
import {Piece, DefaultPiece } from "../../../common/Piece";


export class InputManager{
    //selected:string|Piece = "";

    constructor(){

    }

    proccessClick(socket:SocketIOClient.Socket, addPlugin: GameObjects.GameObjectFactory, board:Board, perspectiveX:number, perspectiveY:number){
        let [x, y] = board.adjustIfFlip(perspectiveX, perspectiveY)
        if(!this.selectionForSpawn && !this.selectionForMove){
            // do nothing
        }else if(this.selectionForSpawn){
            let pieceType = this.selectionForSpawn
            if(this.onSpawn)
                this.onSpawn(pieceType, x, y)
            this.selectionForSpawn = undefined;
            return
        }else if(this.selectionForMove){
            let moveCoords = [this.selectionForMove.coordX, this.selectionForMove.coordY, x, y] as const
            if(this.onMove)
                this.onMove(...moveCoords)
            this.selectionForMove = undefined;
            return;
        }

        // if you click on a piece, select it for movement
        let selectedPiece = board.lookup[y][x]
        if(selectedPiece != null){
            this.selectForMove(selectedPiece)
            console.log("selected for movement: "+x+", "+y)
            return;
        }
    }

    private selectionForSpawn?:typeof Piece;
    private selectionForMove?:Piece;

    getSelectionForSpawn():typeof Piece|undefined{
        return this.selectionForSpawn
    }

    getSelectionForMove():Piece|undefined{
        return this.selectionForMove
    }

    selectForSpawn(pieceType: typeof Piece){
        this.selectionForSpawn = pieceType
        this.selectionForMove = undefined;
    }

    selectForMove(piece: Piece){
        this.selectionForSpawn = undefined;
        this.selectionForMove = piece;
    }

    onMove?:(startX:number, startY:number, endX:number, endY:number)=>void

    onSpawn?:(pieceType: typeof Piece, x:number, y:number, playerOwner?:number)=>void
}