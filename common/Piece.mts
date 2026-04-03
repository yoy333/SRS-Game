import { Board } from "./Board.mjs";
import { Visual } from "../client/game/lib/Visual.js";
import { Game, GameObjects } from "phaser";
import { Loader } from "phaser";
// import { pieceTypeRegistery } from './pieceRegistery.mjs'

type sprite = GameObjects.Sprite
type image = GameObjects.Image
type point = [number, number]
export type pattern = Set<point>
const emptyPattern: pattern = new Set()

type PT = new (...args: any[]) => Piece

export type PieceKey = string
type pieceStatics = {
    /* fix */
    key: string
    createRep: (addPlugin: GameObjects.GameObjectFactory, x: number, y: number) => Array<sprite | image>
    createCard: (addPlugin: GameObjects.GameObjectFactory, x: number, y: number) => Array<sprite | image>
    loadReps: (loadPlugin: Loader.LoaderPlugin) => void
    loadCard: (loadPlugin: Loader.LoaderPlugin) => void
    spawnCost: number
    moveCost: number
}
export type PieceType = PT & pieceStatics


export abstract class Piece implements Visual<sprite | image> {
    reps: Array<sprite | image>
    numReps = 1;
    board: Board

    coordX: number
    coordY: number
    perspectiveX: number
    perspectiveY: number

    static key: string
    isClientSide: boolean
    playerOwner: number

    relativeMovementPattern: pattern = emptyPattern;
    relativeAttackingPattern: pattern = emptyPattern;

    static spawnCost = 1;

    constructor(addPlugin: GameObjects.GameObjectFactory | undefined, board: Board, x: number, y: number, isClientSide: boolean, playerOwner: number) {
        if (addPlugin == undefined && isClientSide) {
            throw new Error("add plugin must be provided for client side pieces")
        }

        this.reps = []
        this.board = board;

        this.coordX = x;
        this.coordY = y;
        if (board.playerNumber == 1)
            [this.perspectiveX, this.perspectiveY] = Board.flipPoint(x, y)
        else
            [this.perspectiveX, this.perspectiveY] = [x, y]

        // console.log(`coords of new piece ${x}, ${y}`)

        this.isClientSide = isClientSide;
        this.playerOwner = playerOwner;
    }

    getWorldXYFromPerspective(x: number, y: number): [number, number] {
        // console.log(`creating rep at ${x}, ${y}`)
        let tile = this.board.reps[0].getTileAt(x, y)
        if (!tile)
            throw new Error(`no tile at (${x}, ${y})`)
        return [tile.getCenterX(), tile.getCenterY()]
    }

    createReps(addPlugin: GameObjects.GameObjectFactory): Array<sprite | image> {
        return []
    }

    setCoord(x: number, y: number) {
        this.coordX = x;
        this.coordY = y;

        [this.perspectiveX, this.perspectiveY] = this.board.adjustIfFlip(x, y)

        if (this.isClientSide)
            this.updateRep();
    }

    updateRep() {
        let tile = this.board.reps[0].getTileAt(this.perspectiveX, this.perspectiveY)
        if (!tile)
            throw new Error(`no tile at (${this.coordX}, ${this.coordY})`)
        let worldX = tile.getCenterX()
        let worldY = tile.getCenterY()
        this.reps[0].setPosition(worldX, worldY)
    }

    withinPattern(pattern: pattern, x: number, y: number) {
        for (let point of pattern) {
            let [checkX, checkY] = point;
            if (this.playerOwner == 1)
                checkY *= -1
            const absX = this.coordX + checkX
            const absY = this.coordY + checkY
            if (absX == x && absY == y)
                return true;
        }
        return false;
    }

    /* fix: move certain conditions to the board */
    canMovePiece(startX: number, startY: number, endX: number, endY: number, playerNumber: number) {
        return (
            this.withinPattern(this.relativeMovementPattern, endX, endY)
        )
    }

    movePiece(startX: number, startY: number, endX: number, endY: number) {
        // console.log(`moving from ${startX}, ${startY} to ${endX}, ${endY}`)

        this.board.setPiece(endX, endY, this)

        this.setCoord(endX, endY)

        this.board.setPiece(startX, startY, null);
    }

    canAttackPiece(attackerX: number, attackerY: number, defenderX: number, defenderY: number, playerNumber: number) {
        return (
            this.board.isSpaceFull(defenderX, defenderY) &&
            this.withinPattern(this.relativeAttackingPattern, defenderX, defenderY)
        )
    }

    attackPiece(defendingPiece: Piece) {
        defendingPiece.tryToKill(this)
    }

    canBeAttacked(attackerX: number, attackerY: number, defenderX: number, defenderY: number, playerNumber: number) {
        return true;
    }

    tryToKill(attackingPiece: Piece, override?: string[]): boolean {
        this.die()
        return true
    }

    die() {
        this.reps.forEach((rep: sprite | image) => {
            rep.destroy(true)
        })
        this.board.setPiece(this.coordX, this.coordY, null)
    }
}

export const square_1: pattern = new Set([
    [-1, -1], [0, -1], [1, -1],
    [-1, 0], [1, 0],
    [-1, 1], [0, 1], [1, 1]
])
export const forward_1: pattern = new Set([
    [-1, -1], [0, -1], [1, -1]
])



