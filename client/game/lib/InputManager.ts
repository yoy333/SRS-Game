import { GameObjects } from "phaser";
import { Board } from "@common/Board.mjs";
import {Piece, PieceType, DefaultPiece, Zeus, Artemis, pieceTypeRegistery, PieceKey } from "@common/Piece.mjs";
import { Visual } from "./Visual";
import { IconButton } from "./IconButton";
import { Button } from "./Button";
import {type Socket} from 'socket.io-client'

export class InputManager implements Visual<undefined>{

    constructor(){

    }

    proccessClick(addPlugin: GameObjects.GameObjectFactory, board:Board, perspectiveX:number, perspectiveY:number){
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
                // console.log("selection for attack")
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
        let selectedPiece = board.getPiece(x, y)
        if(selectedPiece != null){
            this.selectForMove(selectedPiece)
            return;
        }
    }

    selectionForSpawn?:PieceType;
    selectionForMove?:Piece;
    selectionForAttack?:Piece

    clearSelection(){
        this.selectionForSpawn = undefined
        this.selectionForMove = undefined
        this.selectionForAttack = undefined
    }

    selectForSpawn(pieceType: PieceType){
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

    reps:undefined[] = []
    numReps = 0
    iconButtons:IconButton[] = []
    endTurnButton?:Button

    createReps(addPlugin:GameObjects.GameObjectFactory):undefined[]{
        /*
        Probably should have them extend from the same thing
        Definently should standarize the implementation of both
        */

        /* fix */

        const rows = 3
        const startX = 1168
        const startY = 96
        const cellWidth = 150
        const cellHeight = 200
        let i = 0;
        pieceTypeRegistery.forEach((e:PieceType, key: string)=>{
            let xGrid = Math.floor(i/rows)
            let yGrid = i%rows
            i++
            let xPos = startX+xGrid*cellWidth;
            let yPos = startY+yGrid*cellHeight;

            this.iconButtons.push(
                new IconButton(addPlugin, this, xPos, yPos, key)
            )
        })

        // this.iconButtons[0] =
        //     new IconButton(addPlugin, this, 768, 96, DefaultPiece.key)

        // this.iconButtons[1] =
        //     new IconButton(addPlugin, this, 768, 296, Zeus.key)

        // this.iconButtons[2] =
        //     new IconButton(addPlugin, this, 768, 496, Artemis.key)

        // this.iconButtons[3] =
        //     new IconButton(addPlugin, this, 918, 96, Artemis.key)

        this.endTurnButton = new Button(addPlugin, 500, 660, 'End Turn')
        this.endTurnButton.onClick = () => {
            if(this.onEndTurn)
                this.onEndTurn()
        }

        return [];
    }

    updateHand(addPlugin:GameObjects.GameObjectFactory, hand:PieceKey[]){
        if(this.iconButtons.length!=hand.length)
            throw new Error("Hand not equal to length of icon buttons")
        this.iconButtons.forEach((button:IconButton, index:number)=>{
            button.updateIcon(addPlugin, hand[index])
            button.createInteraction(this)
        })
    }

    prop: number = 0

    onMove?:(startX:number, startY:number, endX:number, endY:number)=>void

    onSpawn?:(pieceType: PieceType, x:number, y:number, playerOwner?:number)=>void

    onAttack?: (attackerX:number, attackerY:number, defenderX:number, defenderY:number)=>void

    onEndTurn?: ()=>void
}