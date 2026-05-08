import { Piece, pattern, forward_1, square_1 } from "../Piece.mjs";
import { Board } from "../Board.mjs";
import { GameObjects, Loader } from "phaser";
import { Rep, VisualMixin } from "../../client/game/lib/Visual.js";

class AphroditeToken implements Rep<GameObjects.Image> {
  createRep(addPlugin: GameObjects.GameObjectFactory, x: number, y: number): GameObjects.Image {
    let icon = addPlugin.image(x, y, Aphrodite.key)
    icon.setScale(1 / 40)
    return icon
  }

  loadRep(loadPlugin: Loader.LoaderPlugin): void {
    loadPlugin.image(Aphrodite.key, 'aphrodite_v01.png')
  }
}

const visualMixin = VisualMixin(Piece, [new AphroditeToken()])
export class Aphrodite extends visualMixin {
  static key = 'aphrodite'
  key = 'aphrodite'

  static spawnCost = 2;
  static moveCost = 1;
  static attackCost = 1

  constructor(addPlugin: GameObjects.GameObjectFactory, board: Board, x: number, y: number, isClientSide: boolean, playerOwner: number) {
    super(addPlugin, board, x, y, isClientSide, playerOwner)
  }

  static loadCard(loadPlugin: Loader.LoaderPlugin) {
    // loadPlugin.image('aphrodite_card', 'aphrodite_card_v01.png')
  }

  static createCard(addPlugin: GameObjects.GameObjectFactory, x: number, y: number) {
    // let rep = addPlugin.image(x, y, 'aphrodite_card')
    return []
  }

  relativeMovementPattern: pattern = forward_1
  relativeAttackingPattern: pattern = square_1;

  attackPiece(defendingPiece: Piece): void {
    if (defendingPiece.tryToKill(this)) {
      this.board.pushPiece(this, defendingPiece.coordX, defendingPiece.coordY)
    }
  }
}
