import { GameObjects } from "phaser";
import { Board } from "@common/Board.mjs";
import { Piece, PieceKey, PieceType } from "@common/Piece.mjs";
import { DefaultPiece } from "@common/Pieces/DefaultPiece.mjs";
import { IconButton } from "./IconButton";
import { EndTurnButton } from "./ImageButton";
import { Hand } from '@common/Hand.mjs';
import { VisualMixin } from "./Visual";
import { GameSounds } from "./GameSounds";
import { pieceUtils } from "@common/pieceRegistery.mjs";


const visualMixin = VisualMixin(Object, [])
export class InputManager extends visualMixin {
    constructor() {
        super()
    }

    proccessClick(addPlugin: GameObjects.GameObjectFactory, board: Board, worldX: number, worldY: number) {
        board.clearHints()
        let tileClicked = board?.tilemap?.getTileAtWorldXY(worldX, worldY)
        if (!tileClicked) {
            if (this.selectionForAttack || this.selectionForMove)
                this.clearSelection()
            return;
        }

        let perspectiveX = tileClicked.x
        let perspectiveY = tileClicked.y
        let [x, y] = board.adjustIfFlip(perspectiveX, perspectiveY)


        if (this.selectionForSpawn) {
            let pieceType = this.selectionForSpawn
            if (this.onSpawn)
                this.onSpawn(pieceType, x, y, undefined)
            this.selectionForSpawn = undefined;
            return
        } else if (this.selectionForMove) {
            let moveCoords = [this.selectionForMove.coordX, this.selectionForMove.coordY, x, y] as const
            //if double click
            if (moveCoords[0] == moveCoords[2] && moveCoords[1] == moveCoords[3]) {
                this.selectForAttack(this.selectionForMove)
                return;
            }
            if (this.onMove)
                this.onMove(...moveCoords)
            this.selectionForMove = undefined;
            return;
        } else if (this.selectionForAttack) {
            if (this.onAttack)
                this.onAttack(this.selectionForAttack.coordX, this.selectionForAttack.coordY, x, y)
        } else {
            this.clearSelection()
        }

        // if you click on a piece, select it for movement
        let selectedPiece = board.getPiece(x, y)
        if (selectedPiece != null) {
            this.selectForMove(selectedPiece)
            return;
        }
    }

    selectionForSpawn?: PieceType;
    selectionForMove?: Piece;
    selectionForAttack?: Piece

    clearSelection() {
        this.selectionForSpawn = undefined
        this.selectionForMove = undefined
        this.selectionForAttack = undefined
        this?.onUnselection?.()
    }

    onSelectionForMove?: (piece: Piece) => void
    onSelectionForAttack?: (piece: Piece) => void
    onSelection?: (pieceType: PieceType) => void
    onUnselection?: () => void

    selectionIndex: number = 0
    selectForSpawn(pieceType: PieceType) {
        this.selectionForSpawn = pieceType;
        this.selectionForMove = undefined;
        this.selectionForAttack = undefined;
        this?.onSelection?.(pieceType)
        GameSounds.click()
    }

    selectForMove(piece: Piece) {
        this.selectionForSpawn = undefined;
        this.selectionForMove = piece;
        this?.onSelection?.(piece.constructor as PieceType)
        this?.onSelectionForMove?.(piece)
        GameSounds.click()
    }

    selectForAttack(piece: Piece) {
        this.selectionForAttack = piece;
        this.selectionForSpawn = undefined;
        this.selectionForMove = undefined
        this?.onSelection?.(piece.constructor as PieceType)
        this?.onSelectionForAttack?.(piece)
        GameSounds.doubleClick()
    }

    reps: undefined[] = []
    numReps = 0
    iconButtons: IconButton[] = []
    endTurnButton?: EndTurnButton

    initReps(addPlugin: GameObjects.GameObjectFactory): void {
        /* fix add boundaries from constructor */
        const rows = 3
        const startX = 1168
        const startY = 96
        const cellWidth = 150
        const cellHeight = 200

        for (let i = 0; i < Hand.handSize; i++) {
            let xGrid = Math.floor(i / rows)
            let yGrid = i % rows
            let xPos = startX + xGrid * cellWidth;
            let yPos = startY + yGrid * cellHeight;

            let button = new IconButton(this, DefaultPiece.key)
            button.initReps(addPlugin, xPos, yPos)

            button.onClick = () => {
                this.selectForSpawn(pieceUtils.classFromKey(button.pieceKey));
                this.selectionIndex = i
            }

            this.iconButtons.push(
                button
            )
        }

        this.endTurnButton = new EndTurnButton()
        this.endTurnButton.initReps(addPlugin, 1050, 680)
        this.endTurnButton.onClick = () => {
            if (this.onEndTurn)
                this.onEndTurn()
        }
    }

    updateHand(addPlugin: GameObjects.GameObjectFactory, hand: PieceKey[]) {
        if (this.iconButtons.length != hand.length)
            throw new Error("Hand not equal to length of icon buttons")
        this.iconButtons.forEach((button: IconButton, index: number) => {
            button.updateIcon(addPlugin, hand[index])
            button.createInteraction()
        })
    }

    prop: number = 0

    onMove?: (startX: number, startY: number, endX: number, endY: number) => void

    onSpawn?: (pieceType: PieceType, x: number, y: number, playerOwner?: number) => void

    onAttack?: (attackerX: number, attackerY: number, defenderX: number, defenderY: number) => void

    onEndTurn?: () => void
}
