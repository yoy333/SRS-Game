import { AnimationManager } from "../client/game/lib/AnimationManager.js";
import { Rep, VisualConstructor } from "../client/game/lib/Visual.js";
import { Board } from "./Board.mjs";
import { GameObjects, Loader } from "phaser";

type sprite = GameObjects.Sprite
type image = GameObjects.Image
type point = [number, number]
export type pattern = Set<point>
const emptyPattern: pattern = new Set()

export type PieceKey = string

type hexColor = `#${string}`

export type ColorPallete = {
    fg_1: hexColor
    fg_2: hexColor
    muted: hexColor
    accent: hexColor
    bg_1: hexColor
    bg_2: hexColor
    bg_3: hexColor
    bg_4: hexColor
    text: hexColor
}

type PieceStatics = {
    key: string

    loadCard: (loadPlugin: Loader.LoaderPlugin) => void
    createCard: (addPlugin: GameObjects.GameObjectFactory, x: number, y: number) => (sprite | image)[]
    spawnCost: number
    moveCost: number
    attackCost: number
    colorPallete?: ColorPallete,
    hCard_fg?: Rep<GameObjects.Image>
    hCard_bg?: Rep<GameObjects.Image>
}
type pieceConstructor = new (...args: any[]) => Piece
export type PieceType = pieceConstructor & PieceStatics & VisualConstructor

export abstract class Piece {
    token?: sprite | image
    board: Board

    coordX: number
    coordY: number
    perspectiveX: number
    perspectiveY: number

    // if dynXCost is suppied then it overrides XCost
    dynMoveCost?: number
    dynAttackCost?: number

    isClientSide: boolean
    playerOwner: number

    relativeMovementPattern: pattern = emptyPattern;
    relativeAttackingPattern: pattern = emptyPattern;

    constructor(addPlugin: GameObjects.GameObjectFactory | undefined, board: Board, x: number, y: number, isClientSide: boolean, playerOwner: number) {
        // super()
        if (addPlugin == undefined && isClientSide) {
            throw new Error("add plugin must be provided for client side pieces")
        }

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

        if (!addPlugin)
            return;
    }

    getWorldXYFromPerspective(x: number, y: number): [number, number] {
        // console.log(`creating rep at ${x}, ${y}`)
        let tile = this.board.tilemap?.getTileAt(x, y)
        if (!tile)
            throw new Error(`no tile at (${x}, ${y})`)
        return [tile.getCenterX(), tile.getCenterY()]
    }

    initReps(addPlugin: GameObjects.GameObjectFactory, x: number, y: number): void {
        let [worldX, worldY] = this.getWorldXYFromPerspective(this.perspectiveX, this.perspectiveY) as [number, number]

        // this.initToken(addPlugin, worldX, worldY)
        [this.token] = (this.constructor as VisualConstructor).createReps(addPlugin, worldX, worldY)
        if (!this!.token)
            throw new Error("create reps failed")
        AnimationManager.addSpawnAnim(this!.token)
    }

    setCoord(x: number, y: number): void {
        this.coordX = x;
        this.coordY = y;

        [this.perspectiveX, this.perspectiveY] = this.board.adjustIfFlip(x, y)

        if (this.isClientSide)
            this.updateRep();
    }

    updateRep() {
        let tile = this.board.tilemap?.getTileAt(this.perspectiveX, this.perspectiveY)
        if (!tile)
            throw new Error(`no tile at (${this.coordX}, ${this.coordY})`)
        let worldX = tile.getCenterX()
        let worldY = tile.getCenterY()
        // this.token?.setPosition(worldX, worldY)
        if (!this.token)
            throw new Error("no token. Sadge")
        AnimationManager.addMoveAnim(this.token, worldX, worldY)
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

    getMoveCost(): number {
        let staticCost = (this.constructor as PieceType).moveCost;
        let dynamicCost = this?.dynMoveCost;
        return dynamicCost ?? staticCost;
    }

    getAttackCost(): number {
        let staticCost = (this.constructor as PieceType).attackCost;
        let dynamicCost = this?.dynAttackCost;
        return dynamicCost ?? staticCost;
    }

    canMovePiece(startX: number, startY: number, endX: number, endY: number, playerNumber: number) {
        return (
            this.withinPattern(this.relativeMovementPattern, endX, endY)
        )
    }

    movePiece(startX: number, startY: number, endX: number, endY: number) {
        // console.log(`moving from ${startX}, ${startY} to ${endX}, ${endY}`)
        this.setCoord(endX, endY)
    }

    canAttackPiece(defenderX: number, defenderY: number, playerNumber: number) {
        let defendingPiece = this.board.getPiece(defenderX, defenderY)
        if (!defendingPiece)
            return false;

        return (
            this.board.areEnemyPieces(this, defendingPiece) &&
            this.withinPattern(this.relativeAttackingPattern, defenderX, defenderY)
        )
    }

    attackPiece(defendingPiece: Piece) {
        defendingPiece.tryToKill(this)
    }

    canBePushed(attacker?: Piece) {
        return true
    }

    canBeAttacked(attacker: Piece, override: boolean = false) {
        return true;
    }

    tryToKill(attackingPiece: Piece, override: boolean = false): boolean {
        if (this.canBeAttacked(attackingPiece, override)) {
            this.die()
            return true
        }
        return false
    }

    // TODO implement optional turn number parameter
    onStartTurn() { }
    onEndTurn() { }

    die() {
        this.token?.destroy(true)
        this.board.killPiece(this.coordX, this.coordY)
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
export const myself: pattern = new Set([
    [0, 0]
])
