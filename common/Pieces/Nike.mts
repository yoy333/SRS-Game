import { Piece, pattern, forward_1, square_1 } from "../Piece.mjs";
import { Board } from "../Board.mjs";
import { GameObjects, Loader } from "phaser";
import { Rep, VisualMixin } from "../../client/game/lib/Visual.js";

class NikeToken implements Rep<GameObjects.Image> {
  createRep(addPlugin: GameObjects.GameObjectFactory, x: number, y: number): GameObjects.Image {
    let icon = addPlugin.image(x, y, Nike.key)
    icon.setScale(1 / 20)
    return icon
  }

  loadRep(loadPlugin: Loader.LoaderPlugin): void {
    loadPlugin.image(Nike.key, 'nike_v02.png')
  }
}

const visualMixin = VisualMixin(Piece, [new NikeToken()])
export class Nike extends visualMixin {
  static key = 'nike'
  key = 'nike'

  static spawnCost = 2;
  static moveCost = 1;
  static attackCost = 2

  constructor(addPlugin: GameObjects.GameObjectFactory, board: Board, x: number, y: number, isClientSide: boolean, playerOwner: number) {
    super(addPlugin, board, x, y, isClientSide, playerOwner)
  }

  static loadCard(loadPlugin: Loader.LoaderPlugin) {
    // loadPlugin.image('nike_card', 'nike_card_v01.png')
  }

  static createCard(addPlugin: GameObjects.GameObjectFactory, x: number, y: number) {
    // let rep = addPlugin.image(x, y, 'nike_card')
    return []
  }

  relativeMovementPattern: pattern = forward_1
  relativeAttackingPattern: pattern = square_1;

  killCount = 0;
  attackPiece(defendingPiece: Piece): void {
    if (defendingPiece.tryToKill(this)) {
      this.board.pushPiece(this, defendingPiece.coordX, defendingPiece.coordY)
      this.killCount++
      this.board.addIchorToNextTurn(this.killCount, this.playerOwner)
    }
  }
}
