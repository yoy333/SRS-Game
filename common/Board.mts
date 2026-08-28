import { GameObjects, Tilemaps } from "phaser"
import { pattern as Pattern, Piece, PieceKey, PieceType } from "./Piece.mjs"
import { Rep, VisualConstructor, VisualMixin, visualPlugin } from "../client/game/lib/Visual.js"
import { Loader } from "phaser"
import { NeutralObjective } from './NeutralObjective.mjs'
import { ConcreteConstructor } from "./utils.mjs"
import { GameSounds } from "../client/game/lib/GameSounds.js"
import { Effect } from "./Effect.mjs"
import { StyleGuide } from "../client/game/lib/StyleGuides.js"

export const BOARDSCALINGFACTOR = 5 / 8
const tilemapImageKeys = [
    'V3_tiles_interior',
    'V3_border_top_left',
    'V3_border_top_right',
    'V3_border_left',
    'V3_border_bottom_left',
    'V3_border_bottom_right',
    'V3_border_bottom',
    'V3_border_right',
]

const tilemapImagePaths = [
    'tiles_interior.png',
    'border_top_left.png',
    'border_top_right.png',
    'border_left.png',
    'border_bottom_left.png',
    'border_bottom_right.png',
    'border_bottom.png',
    'border_right.png',
];
class TilemapRep implements Rep<Tilemaps.Tilemap> {
    createRep(makePlugin: GameObjects.GameObjectCreator, x: number, y: number): Tilemaps.Tilemap {
        //Create the Tilemap
        let map = makePlugin.tilemap({ key: 'tilemap' })

        // add the tileset image we are using
        let tilesetImages = tilemapImageKeys.map((key: string) => {
            let image = map.addTilesetImage(key)
            if (!image)
                throw new Error(`tileset ${key} failed to load`)
            return image
        })


        // assuming height and width are same here
        let offset = map.tileHeight * BOARDSCALINGFACTOR

        let ground = map.createLayer(0, tilesetImages, x + offset, y + offset)
        ground!.setScale(BOARDSCALINGFACTOR)

        return map
    }

    loadRep(loadPlugin: Loader.LoaderPlugin): void {
        for (let i = 0; i < tilemapImageKeys.length; i++) {
            loadPlugin.image(tilemapImageKeys[i], 'tilemap/' + tilemapImagePaths[i]);
        }
        loadPlugin.tilemapTiledJSON('tilemap', 'tilemap/V3_Board.json');
    }
}

class TilemapBorderRep implements Rep<Tilemaps.Tilemap> {
    // exclude the first element which includes the interior tileset
    exteriorKeys: string[] = tilemapImageKeys.slice(1)
    exteriorPaths: string[] = tilemapImagePaths.slice(1)

    createRep(makePlugin: GameObjects.GameObjectCreator, x: number, y: number): Tilemaps.Tilemap {
        let border = makePlugin.tilemap({ key: 'tilemapBorder' })

        // add the tileset image we are using
        let tilesetImages = this.exteriorKeys.map((key: string) => {
            let image = border.addTilesetImage(key)
            if (!image)
                throw new Error(`tileset ${key} failed to load`)
            return image
        })

        let ground = border.createLayer(0, tilesetImages, x, y)
        ground!.setScale(BOARDSCALINGFACTOR)

        return border
    }

    loadRep(loadPlugin: Loader.LoaderPlugin): void {
        for (let i = 0; i < this.exteriorKeys.length; i++) {
            loadPlugin.image(this.exteriorKeys[i], 'tilemap/' + this.exteriorPaths[i]);
        }
        loadPlugin.tilemapTiledJSON('tilemapBorder', 'tilemap/V3_Board_Border.json');
    }
}

const visualMixin = VisualMixin(Object, [new TilemapRep, new TilemapBorderRep])
export class Board extends visualMixin {
    static rows = 8
    static columns = 8
    numReps = 1
    lookup: (Piece | null)[]
    playerNumber: number = 0;
    //0 by default until assigned
    isClientSide: boolean
    tilemap?: Tilemaps.Tilemap

    static maxIchorPerTurn: number = 5;
    static startingIchorHandicap: number = 2
    private ichor: [number, number] = [Board.maxIchorPerTurn - Board.startingIchorHandicap, Board.maxIchorPerTurn];
    private ichorForNextTurn: [number, number] = [0, 0]
    static maxSpawnsPerTurn: number = 1;
    private spawnCreditsThisTurn: [number, number] = [Board.maxSpawnsPerTurn, Board.maxSpawnsPerTurn]

    addIchorToNextTurn(ichor: number, playerNumber: number) {
        this.ichorForNextTurn[playerNumber] += ichor
    }

    get myIchor(): number {
        return this.ichor[this.playerNumber]
    }

    constructor(isClientSide: boolean) {
        super()
        this.lookup = [];
        this.lookup.fill(null)
        this.isClientSide = isClientSide
    }

    initReps(plugin: GameObjects.GameObjectCreator, x: number, y: number): void {
        [this.tilemap] = Board.createReps(plugin, x, y)
    }

    static flipPoint(x: number, y: number): [number, number] {
        // -1 because it starts at 0
        y = (Board.rows - 1) - y
        return [x, y]
    }

    getWorldXYFromPerspective(x: number, y: number): [number, number] {
        let tile = this.tilemap?.getTileAt(x, y)
        if (!tile)
            throw new Error(`no tile at (${x}, ${y})`)
        return [tile.getCenterX(), tile.getCenterY()]
    }

    addNObj(addPlugin: GameObjects.GameObjectFactory | undefined, nObj: ConcreteConstructor<NeutralObjective> & VisualConstructor,
        xCoord: number, yCoord: number) {

        let [xPerspectiveCoord, yPerspectiveCoord] = this.adjustIfFlip(xCoord, yCoord)
        let inst = new nObj(xCoord, yCoord)
        if (addPlugin) {
            let [worldX, worldY] = this.getWorldXYFromPerspective(xPerspectiveCoord, yPerspectiveCoord)
            inst.initReps(addPlugin, worldX, worldY)
        }
        this.nObjs.push(inst)
    }

    isOnHomeRow(y: number, playerNumber?: number) {
        if (!playerNumber)
            playerNumber = this.playerNumber

        //console.log("checking "+y)
        if (playerNumber == 1) {
            if (y == 0)
                return true;
            else
                return false;
        } else if (playerNumber == 0) {
            if (y == Board.rows - 1)
                return true;
            else
                return false;
        } else {
            // if player is spectator they have no home row
            return false
        }
    }

    isNotSpectator(playerNumber?: number): boolean {
        if (!playerNumber)
            playerNumber = this.playerNumber

        return playerNumber >= 0
    }

    doesHaveEnoughIchor(cost: number, playerNumber?: number) {
        if (!playerNumber)
            playerNumber = this.playerNumber

        return cost <= this.ichor[playerNumber]
    }

    isMyTurn(playerNumber?: number): boolean {
        if (!playerNumber)
            playerNumber = this.playerNumber

        return playerNumber == this.currentTurn
    }

    isInHand(pieceType: PieceType, hand: PieceKey[]): boolean {
        return hand.includes(pieceType.key)
    }

    withinMaxSpawn(playerNumber?: number) {
        if (!playerNumber)
            playerNumber = this.playerNumber

        return this.spawnCreditsThisTurn[playerNumber] > 0
    }

    // move to Game Rules
    canSpawnPiece(pieceType: PieceType, x: number, y: number, hand: PieceKey[], playerNumber?: number) {
        if (playerNumber == undefined)
            playerNumber = this.playerNumber

        // console.log([
        //     this.isSpaceEmpty(x, y),
        //     this.isOnHomeRow(y, playerNumber),
        //     this.isNotSpectator(playerNumber),
        //     this.doesHaveEnoughIchor(pieceType.spawnCost, playerNumber),
        //     this.isMyTurn(playerNumber),
        // ])


        if (this.isSpaceEmpty(x, y) &&
            this.isOnHomeRow(y, playerNumber) &&
            this.isNotSpectator(playerNumber) &&
            this.withinMaxSpawn(playerNumber) &&
            this.doesHaveEnoughIchor(pieceType.spawnCost, playerNumber) &&
            this.isMyTurn(playerNumber) &&
            this.isInHand(pieceType, hand))
            return true;
        else
            return false;
    }

    spawnPiece(pieceType: PieceType, addPlugin: GameObjects.GameObjectFactory | undefined, x: number, y: number, playerOwner?: number): Piece {
        if (this.isClientSide && addPlugin == undefined) {
            throw new Error("must specify add plugin for client side pieces")
        }
        // console.log(`spawning from: ${x}, ${y}`)
        if (playerOwner == undefined)
            playerOwner = this.playerNumber
        let piece = new pieceType(addPlugin, this, x, y, this.isClientSide, playerOwner);
        if (addPlugin) {
            piece.initReps(addPlugin, x, y)
        }
        this.setPiece(x, y, piece)

        this.spawnCreditsThisTurn[playerOwner]--
        this.ichor[playerOwner] -= pieceType.spawnCost;
        if (this.isClientSide)
            GameSounds.place()

        return piece
    }

    adjustIfFlip(x: number, y: number): [number, number] {
        if (this.playerNumber == 1)
            return Board.flipPoint(x, y);
        else
            return [x, y];
    }

    // move to Game Rules
    doesOwnPiece(piece: Piece, playerNumber?: number): boolean {
        if (!playerNumber)
            playerNumber = this.playerNumber

        return playerNumber == piece.playerOwner;
    }

    isSpaceFull(x: number, y: number): boolean {
        return !this.isSpaceEmpty(x, y);
    }

    isSpaceEmpty(x: number, y: number): boolean {
        return this.getPiece(x, y) == null;
    }

    isInBounds(x: number, y: number) {
        return (
            x >= 0 &&
            x < Board.columns &&
            y >= 0 &&
            y < Board.rows
        )
    }

    canPushPiece(piece: Piece, endX: number, endY: number) {
        return (
            this.isSpaceEmpty(endX, endY) &&
            this.isInBounds(endX, endY)
        )
    }

    hasWon(playerNumber?: number): number {
        if (playerNumber == undefined) {
            if (this.hasWon(0) != -1)
                return 0
            else if (this.hasWon(1) != -1)
                return 1
            else
                return -1;
        }

        let opposingHomerow = 0
        if (playerNumber == 1)
            opposingHomerow = Board.flipPoint(0, opposingHomerow)[1]

        for (let column = 0; column < Board.columns; column++) {
            if (this.getPiece(column, opposingHomerow)?.playerOwner === playerNumber) {
                return playerNumber
            }
        }

        return -1
    }

    pushPiece(piece: Piece, endX: number, endY: number) {
        let startX = piece.coordX
        let startY = piece.coordY

        this.setPiece(endX, endY, piece)
        this.setPiece(startX, startY, null)

        this.getNObj(endX, endY).forEach((objective: NeutralObjective) => {
            objective.onCollision(piece)
        })

        piece.pushPiece(endX, endY)
    }

    canMovePiece(startX: number, startY: number, endX: number, endY: number, playerNumber?: number): boolean {
        if (!playerNumber)
            playerNumber = this.playerNumber;

        let piece = this.getPiece(startX, startY)
        if (!piece)
            return false;

        let effectAllowsMove = true
        let effects = this.effects.get(piece)
        if (!effects)
            effects = []
        for (let effect of effects) {
            if (effect.onPreMove?.(endX, endY) === false) {
                effectAllowsMove = false
                break;
            }
        }

        let cost = piece.getMoveCost()

        // console.log(this.doesOwnPiece(piece, playerNumber))
        // console.log(this.isSpaceEmpty(endX, endY))
        // console.log(this.isMyTurn(playerNumber))
        // console.log(this.doesHaveEnoughIchor(cost, playerNumber))
        // console.log(piece.canMovePiece(startX, startY, endX, endY, playerNumber))
        // console.log(effectAllowsMove)

        return (
            this.canPushPiece(piece, endX, endY) &&
            this.doesOwnPiece(piece, playerNumber) &&
            this.isMyTurn(playerNumber) &&
            this.doesHaveEnoughIchor(cost, playerNumber) &&
            piece.canMovePiece(startX, startY, endX, endY, playerNumber) &&
            effectAllowsMove
        )
    }

    nObjs: NeutralObjective[] = []

    getNObj(xCoord: number, yCoord: number): NeutralObjective[] {
        return this.nObjs.filter((nObj: NeutralObjective) => {
            return (nObj.xCoord == xCoord && nObj.yCoord == yCoord)
        })
    }

    movePiece(startX: number, startY: number, endX: number, endY: number, playerOwner?: number) {
        let piece = this.getPiece(startX, startY)
        if (!piece)
            return;

        if (!playerOwner)
            playerOwner = piece.playerOwner

        const cost = piece.getMoveCost()
        this.ichor[playerOwner] -= cost

        this.pushPiece(piece, endX, endY)
        piece.onMovePiece(endX, endY)

        this.effects.get(piece)?.forEach((effect: Effect) => {
            effect.onPostMove?.(endX, endY)
        })

        if (this.isClientSide)
            GameSounds.place()
    }

    currentTurn = 0;

    canEndTurn(playerNumber?: number) {
        if (!playerNumber)
            playerNumber = this.playerNumber

        return this.isMyTurn(playerNumber)
    }

    piecesOfPlayer(playerNumber: number): Piece[] {
        let ans = []
        for (let piece of this.lookup) {
            if (piece?.playerOwner == playerNumber)
                ans.push(piece)
        }
        return ans;
    }

    endTurn() {
        this.ichor[this.currentTurn] = Board.maxIchorPerTurn + this.ichorForNextTurn[this.playerNumber]
        this.ichorForNextTurn[this.currentTurn] = 0

        // posible to make effects apply after piece callback
        for (let [piece, effects] of this.effects) {
            effects.forEach(effect => effect?.onEndTurn?.())
        }

        for (let piece of this.piecesOfPlayer(this.currentTurn)) {
            piece.onEndTurn()
        }

        this.spawnCreditsThisTurn[this.currentTurn] = Board.maxSpawnsPerTurn

        if (this.currentTurn == 0) {
            this.currentTurn = 1
        } else if (this.currentTurn == 1) {
            this.currentTurn = 0
        } else {
            throw new Error("how did we get here")
        }

        this.startTurn()
    }

    startTurn() {
        // check for a win
        if (this.hasWon(this.currentTurn) != -1) {
            console.log("this is where the win screen would go, be we haven't made that yet")
        }

        // apply callbacks
        for (let [piece, effects] of this.effects) {
            effects.forEach(effect => effect?.onStartTurn?.())
        }
        for (let piece of this.piecesOfPlayer(this.currentTurn)) {
            piece.onStartTurn()
        }

        if (this.isClientSide)
            GameSounds.endTurn()
    }

    areEnemyPieces(x: Piece, y: Piece): boolean {
        return !this.areFriendlyPieces(x, y)
    }

    areFriendlyPieces(x: Piece, y: Piece): boolean {
        let xPlayerNumber = x?.playerOwner;
        let yPlayerNumber = y?.playerOwner;
        return xPlayerNumber == yPlayerNumber
    }

    //move to Game Rules
    canAttackPiece(attackerX: number, attackerY: number, defenderX: number, defenderY: number,
        playerNumber?: number) {

        if (!playerNumber)
            playerNumber = this.playerNumber

        let attackingPiece = this.getPiece(attackerX, attackerY)
        let defendingPiece = this.getPiece(defenderX, defenderY)
        if (!attackingPiece || !defendingPiece)
            return false;

        let effectAllowsAttack = true
        let effects = this.effects.get(attackingPiece)
        if (!effects)
            effects = []

        for (let effect of effects) {
            if (effect.onPreAttack?.(defendingPiece) === false) {
                effectAllowsAttack = false
                break;
            }
        }

        let cost = attackingPiece.getAttackCost()

        // console.log(this.isMyTurn(playerNumber))
        // console.log(this.doesHaveEnoughIchor(cost, playerNumber))
        // console.log(attackingPiece.canAttackPiece(defenderX, defenderY, playerNumber))
        // console.log(defendingPiece.canBeAttacked(attackingPiece, override))
        // console.log(effectAllowsAttack)

        let override = attackingPiece.doesOverrideDefense()

        return (
            this.isMyTurn(playerNumber) &&
            this.doesHaveEnoughIchor(cost, playerNumber) &&
            attackingPiece.canAttackPiece(defenderX, defenderY, playerNumber) &&
            defendingPiece.canBeAttacked(attackingPiece, override) &&
            effectAllowsAttack
        )
    }

    effects: Map<Piece, Effect[]> = new Map()
    applyEffect<T extends Effect>(effectType: ConcreteConstructor<T>, originatingPiece: Piece, xCoord?: number, yCoord?: number):
        T | undefined {

        let targetedPiece
        if (!xCoord || !yCoord)
            targetedPiece = originatingPiece
        else
            targetedPiece = this.getPiece(xCoord, yCoord)

        if (!targetedPiece) {
            return undefined;
        }

        let effect: T = new effectType(this, originatingPiece, targetedPiece)
        // if no target coords are specified the piece is assumed to be targeting itself

        let effects = this.effects.get(targetedPiece)
        if (!effects) {
            effects = []
            targetedPiece.linkEffects(effects)
        }
        effects.push(effect)
        this.effects.set(targetedPiece, effects)

        // console.log(targetedPiece)
        targetedPiece.updateEffectHint()

        return effect
    }

    removeEffect(piece: Piece, effect: Effect) {
        let effects = this.effects.get(piece)
        if (!effects)
            throw new Error("no effects on that piece")
        // return;
        let index = effects.indexOf(effect)
        if (index == -1) {
            throw new Error("no element at that index")
        }
        effects.splice(index, 1)

        piece.updateEffectHint()
    }

    getShownEffect(piece: Piece): Effect | undefined {
        let effectsArr = this.effects.get(piece)
        if (!effectsArr)
            return undefined
        let shownEffect = effectsArr.find(effect => {
            if (effect.effectHint)
                return effect
        })

        return shownEffect
    }

    attackPiece(attackerX: number, attackerY: number, defenderX: number, defenderY: number) {
        console.log("attack called")
        let attackingPiece = this.getPiece(attackerX, attackerY)
        let defendingPiece = this.getPiece(defenderX, defenderY)
        if (!attackingPiece)
            throw new Error("no piece to attack with")
        if (!defendingPiece)
            throw new Error("no piece to defend")

        let cost = attackingPiece.getAttackCost()
        this.ichor[attackingPiece.playerOwner] -= cost

        attackingPiece.attackPiece(defendingPiece)

        this.effects.get(attackingPiece)?.forEach((effect: Effect) => {
            effect.onPostAttack?.(defendingPiece)
        })

        if (this.isClientSide)
            GameSounds.capturePiece()
    }

    killPiece(coordX: number, coordY: number) {
        let piece = this.getPiece(coordX, coordY)
        if (!piece)
            throw new Error("no piece there")
        let effects = this.effects.get(piece)
        if (!effects)
            return;
        effects.forEach((effect: Effect) => {
            effect.onPostDeath?.()
        })

        this.setPiece(coordX, coordY, null)
    }

    getIndexFromXY(x: number, y: number): number {
        return x + Board.columns * y;
    }

    getPiece(x: number, y: number): Piece | null {
        let i = this.getIndexFromXY(x, y);

        return this.lookup[i]
    }

    setPiece(x: number, y: number, p: Piece | null) {
        let i = this.getIndexFromXY(x, y);

        this.lookup[i] = p
    }

    hintMoves(addPlugin: GameObjects.GameObjectFactory, piece: Piece) {
        this.hintSquares(addPlugin, piece, piece.relativeMovementPattern, StyleGuide.moveHintColor)
    }

    hintAttacks(addPlugin: GameObjects.GameObjectFactory, piece: Piece) {
        this.hintSquares(addPlugin, piece, piece.relativeAttackingPattern, StyleGuide.attackHintColor)
    }

    hints: GameObjects.Rectangle[] = []
    private hintSquares(addPlugin: GameObjects.GameObjectFactory, piece: Piece, pattern: Pattern, color: number = 0x000000) {
        this.clearHints()
        for (const relCoord of pattern) {
            let [relX, relY] = relCoord
            if (piece.playerOwner != this.playerNumber)
                relY *= -1
            const absX = piece.perspectiveX + relX
            const absY = piece.perspectiveY + relY

            if (!this.isInBounds(absX, absY))
                continue;

            let tile = this.tilemap?.getTileAt(absX, absY)
            if (!tile)
                throw new Error("no tilemap. me sad")

            // tile.setAlpha(0)

            let hint = addPlugin.rectangle(
                // tile.getCenterX(), tile.getCenterX(),
                tile.getCenterX(), tile.getCenterY(),
                tile.getRight() - tile.getLeft(), tile.getBottom() - tile.getTop()
            )
            hint.setStrokeStyle(2, color)
            this.hints.push(hint)
        }
    }

    clearHints() {
        for (let hint of this.hints) {
            hint.destroy(true)
        }
        this.hints = []
    }

    printBoardState() {
        console.log("board state")
        for (let y = 0; y < Board.rows; y++) {
            let rowStr = "| "
            for (let x = 0; x < Board.columns; x++) {
                let name = this.getPiece(x, y)?.constructor.name ?? 0
                rowStr += name + " | "
            }
            console.log(rowStr)
        }
    }

    get otherPlayerNumber() {
        if (this.playerNumber == 0)
            return 1;
        else if (this.playerNumber == 1)
            return 0;
        else
            throw new Error("uhhhh ... wrong player number bucko")
    }
}
