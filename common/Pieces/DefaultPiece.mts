import { Piece, pattern, forward_1, square_1 } from "../Piece.mjs";
import { Board } from "../Board.mjs";
import { GameObjects, Loader } from "phaser";
import { Rep, VisualConstructor, VisualMixin, visualPlugin } from "../../client/game/lib/Visual.js";

type sprite = GameObjects.Sprite

class DefaultPieceToken implements Rep<sprite> {
    createRep(plugin: GameObjects.GameObjectFactory, x: number, y: number): GameObjects.Sprite {
        let icon = plugin.sprite(x, y, DefaultPiece.key, 0)
        return icon
    }

    loadRep(loadPlugin: Loader.LoaderPlugin): void {
        loadPlugin.spritesheet(DefaultPiece.key, 'Placeholder.png', {
            frameWidth: 64,
            frameHeight: 64,
            margin: 32
        })
    }
}

const visualMixin = VisualMixin(Piece, [new DefaultPieceToken()])
export class DefaultPiece extends visualMixin {
    static key = 'default'

    static spawnCost = 2;
    static moveCost = 1;

    // static reps: Rep<sprite>[] = [new DefaultPieceToken()]

    constructor(addPlugin: GameObjects.GameObjectFactory, board: Board, x: number, y: number, isClientSide: boolean, playerOwner: number) {
        super(addPlugin, board, x, y, isClientSide, playerOwner)
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
