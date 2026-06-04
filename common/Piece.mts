import { AnimationManager } from "../client/game/lib/AnimationManager.js";
import { StyleGuide } from "../client/game/lib/StyleGuides.js";
import { Rep, VisualConstructor, VisualMixin, visualPlugin } from "../client/game/lib/Visual.js";
import { Board } from "./Board.mjs";
import { GameObjects, Loader } from "phaser";
import { Effect } from "./Effect.mjs";

type sprite = GameObjects.Sprite
type image = GameObjects.Image
type point = [number, number]
export type pattern = Set<point>
const emptyPattern: pattern = new Set()

export type PieceKey = string

export type ColorPallete = {
    fg_1: number
    fg_2: number
    muted: number
    accent: number
    bg_1: number
    bg_2: number
    bg_3: number
    bg_4: number
    text: number
}

type PieceStatics = {
    key: string

    loadCard: (loadPlugin: Loader.LoaderPlugin) => void
    createCard: (addPlugin: GameObjects.GameObjectFactory, x: number, y: number) => (sprite | image)[]
    spawnCost: number
    moveCost: number
    attackCost: number
    hCard?: HCardStyle
}

export type HCardStyle = {
    colorPallete: ColorPallete
    fg: Rep<GameObjects.Image>
    bg: Rep<GameObjects.Image>
    text: string
}

export class TeamRect implements Rep<GameObjects.Rectangle> {
    createRep(plugin: GameObjects.GameObjectFactory, x: number, y: number): GameObjects.Rectangle {
        let rect = plugin.rectangle(x, y, 72, 72)
        // rect.setStrokeStyle(2, StyleGuide.myTeamHintColor)
        return rect
    }

    loadRep(loadPlugin: Loader.LoaderPlugin): void {
        // nothing
    }
}

export class EffectHint implements Rep<GameObjects.Image> {
    createRep(plugin: GameObjects.GameObjectFactory, x: number, y: number): GameObjects.Image {
        let star = plugin.image(x, y, 'star')
        star.setOrigin(-0.25, 1.25)
        star.setScale(1 / 150)
        star.setAlpha(0)
        return star
    }

    loadRep(loadPlugin: Loader.LoaderPlugin): void {
        loadPlugin.image('star', 'star.png')
    }
}

type pieceConstructor = new (...args: any[]) => Piece
export type PieceType = pieceConstructor & PieceStatics & VisualConstructor

const visualMixin = VisualMixin(Object, [new TeamRect(), new EffectHint()])
export abstract class Piece extends visualMixin {
    token?: sprite | image
    teamHint?: GameObjects.Rectangle
    effectHint?: GameObjects.Image
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

    activeEffects: Effect[] = []

    constructor(addPlugin: GameObjects.GameObjectFactory | undefined, board: Board, x: number, y: number, isClientSide: boolean, playerOwner: number) {
        super()
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
        let tile = this.board.tilemap?.getTileAt(x, y)
        if (!tile)
            throw new Error(`no tile at (${x}, ${y})`)
        const ans: [number, number] = [tile.getCenterX(), tile.getCenterY()]
        return ans
    }

    setTeamRectColor() {
        const rectWeight = 2
        if (this.playerOwner != this.board.playerNumber)
            this.teamHint?.setStrokeStyle(rectWeight, StyleGuide.otherTeamHintColor)
        else
            this.teamHint?.setStrokeStyle(rectWeight, StyleGuide.myTeamHintColor)
    }

    linkEffects(effects: Effect[]) {
        this.activeEffects = effects
    }

    updateEffectHint() {
        let shownEffect = this.board.getShownEffect(this)
        if (shownEffect)
            this.effectHint?.setAlpha(1)
        else
            this.effectHint?.setAlpha(0)
    }

    initReps(addPlugin: GameObjects.GameObjectFactory, x: number, y: number): void {
        let [worldX, worldY] = this.getWorldXYFromPerspective(this.perspectiveX, this.perspectiveY) as [number, number]

        // this.initToken(addPlugin, worldX, worldY)
        [this.teamHint, this.effectHint, this.token] = (this.constructor as VisualConstructor).createReps(addPlugin, worldX, worldY)

        if (!this!.token)
            throw new Error("create reps failed")

        this.setTeamRectColor()
        this.updateEffectHint()

        AnimationManager.addSpawnAnim(this!.token)
    }

    setCoord(x: number, y: number): void {
        this.coordX = x;
        this.coordY = y;

        [this.perspectiveX, this.perspectiveY] = this.board.adjustIfFlip(x, y)
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


    updateRep() {
        if (!this.isClientSide)
            return;

        let tile = this.board.tilemap?.getTileAt(this.perspectiveX, this.perspectiveY)
        if (!tile)
            throw new Error(`no tile at (${this.coordX}, ${this.coordY})`)

        let worldX = tile.getCenterX()
        let worldY = tile.getCenterY()
        if (!this.token || !this.teamHint || !this.effectHint)
            throw new Error("no token. Sadge")
        console.log("token")
        AnimationManager.addMoveAnim(this.token, worldX, worldY)
        AnimationManager.addMoveAnim(this.effectHint, worldX, worldY)
        AnimationManager.addMoveAnim(this.teamHint, worldX, worldY)
    }

    canMovePiece(startX: number, startY: number, endX: number, endY: number, playerNumber: number) {
        return (
            this.withinPattern(this.relativeMovementPattern, endX, endY)
        )
    }

    pushPiece(endX: number, endY: number) {
        // console.log(`moving from ${startX}, ${startY} to ${endX}, ${endY}`)
        this.setCoord(endX, endY)
        if (!this.isClientSide)
            return;

        this.updateRep()

        if (!this.token)
            throw new Error("no token when trying to move")
    }

    movePiece(endX: number, endY: number) {
        this.pushPiece(endX, endY)
        this.updateRep()
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

    doesOverrideDefense(): boolean {
        return false
    }

    tryToKill(attackingPiece: Piece, override: boolean = false): boolean {
        if (this.canBeAttacked(attackingPiece, override)) {
            if (!this.isClientSide) {
                this.die()
                return true;
            }

            if (!this.token)
                throw new Error("no token when trying to kill")

            let promise = AnimationManager.addDeathAnim(this.token)
            this.die()
            promise.then(() => {
                if (!attackingPiece.token)
                    throw new Error("this should never happen")

                attackingPiece.updateRep()
            })
            return true
        }
        return false
    }

    // TODO implement optional turn number parameter
    onStartTurn() { }
    onEndTurn() { }

    die() {
        this.token?.destroy(true)
        this.teamHint?.destroy(true)
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
