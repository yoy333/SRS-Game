import { Piece, pattern, forward_1, square_1 } from "../Piece.mjs";
import { Board } from "../Board.mjs";
import { GameObjects, Loader } from "phaser";
import { Rep, VisualMixin } from "../../client/game/lib/Visual.js";

type image = GameObjects.Image

class ZeusToken implements Rep<GameObjects.Image> {
  createRep(addPlugin: GameObjects.GameObjectFactory, x: number, y: number): GameObjects.Image {
    let icon = addPlugin.image(x, y, Aries.key)
    icon.setScale(1 / 25)
    return icon
  }

  loadRep(loadPlugin: Loader.LoaderPlugin): void {
    loadPlugin.image(Aries.key, 'aries_v01.png')
  }
}

const visualMixin = VisualMixin(Piece, [new ZeusToken()])
export class Aries extends visualMixin {
  static key = 'aries'
  key = 'aries'

  static spawnCost = 2;
  static moveCost = 1;
  static attackCost = 1

  constructor(addPlugin: GameObjects.GameObjectFactory, board: Board, x: number, y: number, isClientSide: boolean, playerOwner: number) {
    super(addPlugin, board, x, y, isClientSide, playerOwner)
  }

  static loadCard(loadPlugin: Loader.LoaderPlugin) {
    loadPlugin.image('aries_card', 'aries_card_v01.png')
  }

  static createCard(addPlugin: GameObjects.GameObjectFactory, x: number, y: number) {
    let rep = addPlugin.image(x, y, 'aries_card')
    return [rep];
  }

  relativeMovementPattern: pattern = forward_1
  relativeAttackingPattern: pattern = square_1;

  attackPiece(defendingPiece: Piece): void {
    if (defendingPiece.tryToKill(this)) {
      this.board.movePiece(this.coordX, this.coordY, defendingPiece.coordX, defendingPiece.coordY)
    }
  }
}
