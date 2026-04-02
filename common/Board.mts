import { GameObjects, Tilemaps } from "phaser"
import { Piece, PieceKey, PieceType } from "./Piece.mjs"
import { Visual } from "../client/game/lib/Visual.js"
import { Loader } from "phaser"

export class Board implements Visual<Tilemaps.Tilemap> {
    static rows = 10
    static columns = 10
    reps: Array<Tilemaps.Tilemap>
    numReps = 1
    lookup: (Piece | null)[]
    playerNumber: number = 0;
    //0 by default until assigned
    isClientSide: boolean

    static maxIchorPerTurn: number = 5;
    ichor: [number, number] = [Board.maxIchorPerTurn, Board.maxIchorPerTurn];

    get myIchor(): number {
        return this.ichor[this.playerNumber]
    }

    constructor(isClientSide: boolean) {
        this.reps = []
        this.lookup = [];
        this.lookup.fill(null)
        this.isClientSide = isClientSide
    }

    static flipPoint(x: number, y: number): [number, number] {
        // -1 because it starts at 0
        y = (Board.rows - 1) - y
        return [x, y]
    }

    createReps(makePlugin: GameObjects.GameObjectCreator, x: number, y: number): Array<Tilemaps.Tilemap> {
        if (!this.isClientSide)
            throw new Error("Cannot create reps server-side")
        //Create the Tilemap
        let map = makePlugin.tilemap({ key: 'tilemap' })

        // add the tileset image we are using
        const tiles = map.addTilesetImage('V1_Tiles')
        // const tiles = map.addTilesetImage('exp_tileset_01')

        if (!tiles)
            throw new Error("tileset failed to load")

        let ground = map.createLayer(0, tiles, x, y)
        // ground!.setScale(1/8)

        this.reps = [map]
        return this.reps
    }

    static loadReps(loadPlugin: Loader.LoaderPlugin) {
        loadPlugin.image('V1_Tiles', 'tilemap/V1_Tiles.png')
        loadPlugin.tilemapTiledJSON('tilemap', 'tilemap/DemoBoard.json')
        // loadPlugin.image('exp_tileset_01', 'tilemap/exp_tileset_02.png')
        // loadPlugin.tilemapTiledJSON('tilemap', 'tilemap/exp_tilemap_01.json')
    }

    isOnHomeRow(y: number, playerNumber?: number) {
        if (playerNumber == undefined)
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
        if (playerNumber == undefined)
            playerNumber = this.playerNumber

        return playerNumber != -1;
    }

    doesHaveEnoughIchor(cost: number, playerNumber?: number) {
        if (playerNumber == undefined)
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

    // move to Game Rules
    canSpawnPiece(pieceType: PieceType, x: number, y: number, hand: PieceKey[], playerNumber?: number) {
        // console.log(`inputs ${x}, ${y}`)
        if (playerNumber == undefined)
            playerNumber = this.playerNumber

        // console.log([
        //     this.isSpaceEmpty(x, y),
        //     this.isOnHomeRow(y, playerNumber),
        //     this.isNotSpectator(playerNumber),
        //     this.doesHaveEnoughIchor(pieceType.spawnCost, playerNumber),
        // this.isMyTurn(playerNumber),
        // ])


        if (this.isSpaceEmpty(x, y) &&
            this.isOnHomeRow(y, playerNumber) &&
            this.isNotSpectator(playerNumber) &&
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
        console.log(`spawning from: ${x}, ${y}`)
        if (playerOwner == undefined)
            playerOwner = this.playerNumber
        let piece = new pieceType(addPlugin, this, x, y, this.isClientSide, playerOwner);
        this.setPiece(x, y, piece)
        console.log(`removing ${pieceType.spawnCost} from player: ${playerOwner}`)
        this.ichor[playerOwner] -= pieceType.spawnCost;
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

    canMovePiece(startX: number, startY: number, endX: number, endY: number, playerNumber?: number): boolean {
        if (playerNumber == undefined)
            playerNumber = this.playerNumber;

        let piece = this.getPiece(startX, startY)
        if (!piece)
            return false;

        let cost = (piece.constructor as PieceType).moveCost

        return (this.doesOwnPiece(piece, playerNumber) &&
            this.isSpaceEmpty(endX, endY) &&
            this.isMyTurn(playerNumber) &&
            this.doesHaveEnoughIchor(cost, playerNumber) &&
            piece.canMovePiece(startX, startY, endX, endY, playerNumber))
    }

    movePiece(startX: number, startY: number, endX: number, endY: number, playerNumber?: number) {
        console.log("player number before: " + playerNumber)
        if (playerNumber == undefined)
            playerNumber = this.playerNumber
        console.log("player number after: " + playerNumber)

        let piece = this.getPiece(startX, startY)
        if (!piece)
            return;

        const cost = (piece.constructor as PieceType).moveCost

        console.log(`removing ${cost} from player: ${playerNumber}`)
        this.ichor[playerNumber] -= cost

        piece.movePiece(startX, startY, endX, endY)
    }

    currentTurn = 0;

    canEndTurn(playerNumber?: number) {
        if (playerNumber == undefined)
            playerNumber = this.playerNumber

        return this.isMyTurn(playerNumber)
    }

    endTurn() {
        console.log("ending turn for player: " + this.currentTurn)
        this.ichor[this.currentTurn] = Board.maxIchorPerTurn;

        if (this.currentTurn == 0) {
            this.currentTurn = 1
        } else if (this.currentTurn == 1) {
            this.currentTurn = 0
        } else {
            throw new Error("how did we get here")
        }
    }

    areEnemyPieces(x: Piece, y: Piece): boolean {
        let xPlayerNumber = x?.playerOwner;
        let yPlayerNumber = y?.playerOwner;
        return xPlayerNumber != yPlayerNumber
    }

    //move to Game Rules
    canAttackPiece(attackerX: number, attackerY: number, defenderX: number, defenderY: number, playerNumber?: number) {
        if (playerNumber == undefined)
            playerNumber = this.playerNumber

        let attackingPiece = this.getPiece(attackerX, attackerY)
        let defendingPiece = this.getPiece(defenderX, defenderY)
        if (!attackingPiece || !defendingPiece)
            return false;

        return (this.areEnemyPieces(attackingPiece, defendingPiece) &&
            this.isMyTurn(playerNumber) &&
            attackingPiece.canAttackPiece(attackerX, attackerY, defenderX, defenderY, playerNumber) &&
            defendingPiece.canBeAttacked(attackerX, attackerY, defenderX, defenderY, playerNumber))
    }

    attackPiece(attackerX: number, attackerY: number, defenderX: number, defenderY: number) {
        let attackingPiece = this.getPiece(attackerX, attackerY)
        let defendingPiece = this.getPiece(defenderX, defenderY)
        if (!attackingPiece)
            throw new Error("no piece to attack with")
        if (!defendingPiece)
            throw new Error("no piece to defend")
        attackingPiece.attackPiece(defendingPiece)
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

    get otherPlayerNumber() {
        if (this.playerNumber == 0)
            return 1;
        else
            return 0;
    }
}
