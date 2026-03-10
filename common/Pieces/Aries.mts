import { Board } from "../Board.mjs";
import { forward_1, pattern, Piece, pieceTypeRegistery, square_1 } from "../Piece.mjs";
import { GameObjects } from "phaser";
import { Loader } from "phaser";

type image = GameObjects.Image


export class Aries extends Piece{
    static key = 'aries'
    key = 'aries'

    static spawnCost = 2;
    static moveCost = 1;

    constructor(addPlugin: GameObjects.GameObjectFactory, board:Board, x:number, y:number, isClientSide:boolean, playerOwner:number){
        super(addPlugin,board, x, y, isClientSide, playerOwner)
        if(this.isClientSide)
            this.reps = this.createReps(addPlugin)
    }

    createReps(addPlugin: GameObjects.GameObjectFactory): Array<image> {
        if(!this.isClientSide)
            throw new Error("Cannot create reps server-side")
        let [worldX, worldY] = this.getWorldXYFromPerspective(this.perspectiveX, this.perspectiveY)

        if(this.key==""){
            console.warn('no key specified')
        }
        let [primaryRep] = Aries.createRep(addPlugin, worldX, worldY)
        return [primaryRep]
    }

    static createRep(addPlugin:GameObjects.GameObjectFactory, x:number, y:number){
        let icon = addPlugin.image(x, y, Aries.key)
        icon.setScale(1/25)
        return [icon]
    }

    static loadReps(loadPlugin:Loader.LoaderPlugin){
        loadPlugin.image(Aries.key, 'aries_v01.png')    
    }

    static loadCard(loadPlugin:Loader.LoaderPlugin){
        loadPlugin.image('aries_card', 'aries_card_v01.png')
    }

    static createCard(addPlugin:GameObjects.GameObjectFactory, x:number, y:number){
        let rep = addPlugin.image(x, y, 'aries_card')
        return [rep];
    }

    relativeMovementPattern: pattern = forward_1
    relativeAttackingPattern: pattern = square_1;

    attackPiece(defendingPiece: Piece): void {
        if(defendingPiece.tryToKill(this)){
            this.board.movePiece(this.coordX, this.coordY, defendingPiece.coordX, defendingPiece.coordY)
        }
    }
}

pieceTypeRegistery.set(Aries.key, Aries)