import { Piece, pattern, forward_1, square_1 } from "../Piece.mjs";
import { Board } from "../Board.mjs";
import { GameObjects, Loader } from "phaser";

type sprite = GameObjects.Sprite

export class DefaultPiece extends Piece {
    static key = 'default'
    key = 'default'

    static spawnCost = 2;
    static moveCost = 1;

    constructor(addPlugin: GameObjects.GameObjectFactory, board: Board, x: number, y: number, isClientSide: boolean, playerOwner: number) {
        super(addPlugin, board, x, y, isClientSide, playerOwner)
        if (this.isClientSide)
            this.reps = this.createReps(addPlugin)
    }

    /* fix */
    createReps(addPlugin: GameObjects.GameObjectFactory): Array<sprite> {
        if (!this.isClientSide)
            throw new Error("Cannot create reps server-side")
        let [worldX, worldY] = this.getWorldXYFromPerspective(this.perspectiveX, this.perspectiveY)
        if (this.key == "") {
            console.warn('no key specified')
        }
        let primaryRep = addPlugin.sprite(worldX, worldY, this.key, 0)
        return [primaryRep]
    }

    static createRep(addPlugin: GameObjects.GameObjectFactory, x: number, y: number) {
        let icon = addPlugin.sprite(x, y, this.key, 0)
        return [icon]
    }

    static loadReps(loadPlugin: Loader.LoaderPlugin) {
        loadPlugin.spritesheet(DefaultPiece.key, 'Placeholder.png', {
            frameWidth: 64,
            frameHeight: 64,
            margin: 32
        })
    }

    static loadCard(loadPlugin: Loader.LoaderPlugin) {

    }

    static createCard(addPlugin: GameObjects.GameObjectFactory, x: number, y: number) {
        return [];
    }

    relativeMovementPattern: pattern = forward_1
    relativeAttackingPattern: pattern = square_1;

    attackPiece(defendingPiece: Piece): void {
        if (defendingPiece.tryToKill(this)) {
            this.board.movePiece(this.coordX, this.coordY, defendingPiece.coordX, defendingPiece.coordY)
        }
    }
}
