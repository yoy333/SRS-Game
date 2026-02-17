import { GameObjects, Tilemaps } from "phaser"
import { Piece, PieceType } from "./Piece"
import { Visual } from "../client/game/lib/Visual"
import { Loader, Geom } from "phaser"

export class Board implements Visual<Tilemaps.Tilemap>{
    static rows = 10
    static columns = 10
    reps: Array<Tilemaps.Tilemap>
    numReps = 1
    lookup: (Piece | null)[]
    playerNumber:number = 0;
    //0 by default until assigned
    isClientSide:boolean

    static maxIchorPerTurn:number = 5;
    ichor:[number, number] = [Board.maxIchorPerTurn, Board.maxIchorPerTurn];

    get myIchor():number{
        return this.ichor[this.playerNumber-1]
    }

    constructor(isClientSide:boolean){
        this.reps  = []
        this.lookup = [];
        this.lookup.fill(null)
        this.isClientSide = isClientSide
    }

    static flipPoint(x:number, y:number):[number, number]{
        // -1 because it starts at 0
        y = (Board.rows-1)-y
        return [x, y]
    }

    createReps(makePlugin: GameObjects.GameObjectCreator, x: number, y: number):  Array<Tilemaps.Tilemap>{
        if(!this.isClientSide)
            throw new Error("Cannot create reps server-side")
        //Create the Tilemap
        let map = makePlugin.tilemap({ key: 'tilemap' })

        // add the tileset image we are using
        const tiles = map.addTilesetImage('V1_Tiles')

        if(!tiles)
            throw new Error("tileset failed")
        let ground = map.createLayer(0, tiles)
        //ground?.setScale(2)
        
        this.reps = [map]
        return this.reps
    }

    static loadReps(loadPlugin:Loader.LoaderPlugin){
        loadPlugin.image('V1_Tiles', 'tilemap/V1_Tiles.png')
        loadPlugin.tilemapTiledJSON('tilemap', 'tilemap/DemoBoard.json')
    }

    isOnHomeRow(y:number, playerNumber?:number){
        if(!playerNumber)
            playerNumber = this.playerNumber

        //console.log("checking "+y)
        if(playerNumber == 2){
            if(y==0)
                return true;
            else
                return false;
        }else if(playerNumber == 1){
            if(y==Board.rows-1)
                return true;
            else
                return false;
        }else{
            // if player is spectator they have no home row
            return false
        }
    }

    isNotSpectator(playerNumber?:number):boolean{
        if(!playerNumber)
            playerNumber = this.playerNumber

        return playerNumber != 0
    }

    doesHaveEnoughIchor(pieceType: PieceType, playerNumber?:number){
        if(!playerNumber)
            playerNumber = this.playerNumber

        return pieceType.spawnCost<=this.ichor[playerNumber-1]
    }

    isMyTurn(playerNumber?:number):boolean{
        if(!playerNumber)
            playerNumber = this.playerNumber

        return playerNumber==this.currentTurn
    }

    // move to Game Rules
    canSpawnPiece(pieceType: PieceType, x:number, y:number, playerNumber?:number){
        // console.log(`inputs ${x}, ${y}`)
        if(playerNumber == undefined)
            playerNumber = this.playerNumber

        if(this.isSpaceEmpty(x,y)&&
            this.isOnHomeRow(y, playerNumber)&&
            this.isNotSpectator(playerNumber)&&
            this.doesHaveEnoughIchor(pieceType, playerNumber)&&
            this.isMyTurn(playerNumber))
            return true;
        else
            return false;
    }

    spawnPiece(pieceType: PieceType, addPlugin:GameObjects.GameObjectFactory, x:number, y:number, playerOwner?:number):Piece{
        // console.log(`spawning from: ${x}, ${y}`)
        if(playerOwner == undefined)
            playerOwner = this.playerNumber
        let piece = new pieceType(addPlugin, this, x, y, this.isClientSide, playerOwner);
        this.setPiece(x, y, piece)
        this.ichor[playerOwner-1] -= pieceType.spawnCost;
        return piece
    }

    adjustIfFlip(x:number, y:number):[number, number]{
        if(this.playerNumber == 2)
            return Board.flipPoint(x, y);
        else
            return [x,y];
    }

    // move to Game Rules
    doesOwnPiece(piece:Piece, playerNumber?:number):boolean{
        if(!playerNumber)
            playerNumber = this.playerNumber

        return playerNumber == piece.playerOwner;
    }

    isSpaceFull(x:number, y:number):boolean{
        return !this.isSpaceEmpty(x,y);
    }

    isSpaceEmpty(x:number, y:number):boolean{
        return this.getPiece(x, y) == null;
    }

    // move to Game Rules
    canMovePiece(startX:number, startY: number, endX:number, endY:number, playerNumber?:number){
        let piece = this.getPiece(startX, startY)
        if(!playerNumber)
            playerNumber = this.playerNumber
        if(!piece)
            return false;

        return (this.doesOwnPiece(piece, playerNumber) &&
                this.isSpaceEmpty(endX, endY)&&
                piece.withinMovementPattern(endX, endY)&&
                this.isMyTurn(playerNumber))
    }

    movePiece(startX:number, startY:number, endX:number, endY:number){
        // console.log(`moving from ${startX}, ${startY} to ${endX}, ${endY}`)

        let piece = this.getPiece(startX, startY)


        this.setPiece(endX, endY, piece)

        if(!piece){
            console.warn(`no piece selected at (${startX}, ${startY})`)
            return;
        }
        piece.setCoord(endX, endY)

        this.setPiece(startX, startY, null);
    }

    currentTurn = 1;

    canEndTurn(playerNumber?:number){
        if(!playerNumber)
            playerNumber = this.playerNumber

        return this.isMyTurn(playerNumber)
    }

    endTurn(){
        this.ichor[this.currentTurn-1] = Board.maxIchorPerTurn;

        if(this.currentTurn == 1){
            this.currentTurn = 2
        }else if(this.currentTurn == 2){
            this.currentTurn = 1
        }else{
            throw new Error("how did we get here")
        }
    }

    areEnemyPieces(x:Piece, y:Piece):boolean{
        let xPlayerNumber = x?.playerOwner;
        let yPlayerNumber = y?.playerOwner;
        return xPlayerNumber != yPlayerNumber
    }

    //move to Game Rules
    canAttackPiece(attackerX:number, attackerY:number, defenderX:number, defenderY:number, playerNumber?:number){
        if(!playerNumber)
            playerNumber = this.playerNumber

        let attackingPiece = this.getPiece(attackerX, attackerY)
        let defendingPiece = this.getPiece(defenderX, defenderY)
        if(!attackingPiece || !defendingPiece)
            return false;

        return (this.areEnemyPieces(attackingPiece, defendingPiece) &&
                this.isSpaceFull(defenderX, defenderY)&&
                attackingPiece.withinAttackingPattern(defenderX, defenderY)&&
                this.isMyTurn(playerNumber))
    }

    attackPiece(attackerX:number, attackerY:number, defenderX:number, defenderY:number){
        let defendingPiece = this.getPiece(defenderX, defenderY)
        defendingPiece?.die()        
    }

    getIndexFromXY(x:number, y:number):number{
        return x + Board.columns*y;
    }

    getPiece(x:number, y:number):Piece | null{
        let i = this.getIndexFromXY(x, y);
        
        return this.lookup[i]
    }

    setPiece(x:number, y:number, p:Piece|null){
        let i = this.getIndexFromXY(x, y);
        this.lookup[i] = p
    }

    get otherPlayerNumber(){
        if(this.playerNumber==1)
            return 2;
        else
            return 1;
    }
}