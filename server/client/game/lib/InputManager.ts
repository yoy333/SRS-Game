import { Input } from "phaser"
//import {Input as InputProtocol} from '../../../common/SocketProtocols'
import { GameObjects } from "phaser";
import { Board } from "../../../common/Board";
import {Piece, DefaultPiece } from "../../../common/Piece";


export class InputManager{

    constructor(){

    }

    proccessClick(socket:SocketIOClient.Socket, addPlugin: GameObjects.GameObjectFactory, board:Board, perspectiveX:number, perspectiveY:number){
        let [x, y] = board.adjustIfFlip(perspectiveX, perspectiveY)
        if(this.selectionForSpawn){
            let pieceType = this.selectionForSpawn
            if(this.onSpawn)
                this.onSpawn(pieceType, x, y)
            this.selectionForSpawn = undefined;
            return
        }else if(this.selectionForMove){
            let moveCoords = [this.selectionForMove.coordX, this.selectionForMove.coordY, x, y] as const
            //if double click
            if(moveCoords[0]==moveCoords[2] && moveCoords[1]==moveCoords[3]){
                console.log("selection for attack")
                this.selectForAttack(this.selectionForMove)
                return;
            }
            if(this.onMove)
                this.onMove(...moveCoords)
            this.selectionForMove = undefined;
            return;
        }else if(this.selectionForAttack){
            if(this.onAttack)
                this.onAttack(this.selectionForAttack.coordX, this.selectionForAttack.coordY, x, y)
        }else{
            this.clearSelection()
        }

        // if you click on a piece, select it for movement
        let selectedPiece = board.lookup[y][x]
        if(selectedPiece != null){
            this.selectForMove(selectedPiece)
            return;
        }
    }

    selectionForSpawn?:typeof Piece;
    selectionForMove?:Piece;
    selectionForAttack?:Piece

    clearSelection(){
        this.selectionForSpawn = undefined
        this.selectionForMove = undefined
        this.selectionForAttack = undefined
    }

    selectForSpawn(pieceType: typeof Piece){
        this.selectionForSpawn = pieceType;
        this.selectionForMove = undefined;
        this.selectionForAttack = undefined;
    }

    selectForMove(piece: Piece){
        this.selectionForSpawn = undefined;
        this.selectionForMove = piece;
    }

    selectForAttack(piece:Piece){
        this.selectionForAttack = piece;
        this.selectionForSpawn = undefined;
        this.selectionForMove = undefined
    }

    prop: number = 0

    onMove?:(startX:number, startY:number, endX:number, endY:number)=>void

    onSpawn?:(pieceType: typeof Piece, x:number, y:number, playerOwner?:number)=>void

    onAttack?: (attackerX:number, attackerY:number, defenderX:number, defenderY:number)=>void
}