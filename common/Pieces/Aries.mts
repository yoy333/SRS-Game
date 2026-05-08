import { Piece, pattern, forward_1, square_1 } from "../Piece.mjs";
import { Board } from "../Board.mjs";
import { GameObjects, Loader } from "phaser";
import { Rep, VisualMixin } from "../../client/game/lib/Visual.js";

class AriesToken implements Rep<GameObjects.Image> {
  createRep(addPlugin: GameObjects.GameObjectFactory, x: number, y: number): GameObjects.Image {
    let icon = addPlugin.image(x, y, Aries.key)
    icon.setScale(1 / 25)
    return icon
  }

  loadRep(loadPlugin: Loader.LoaderPlugin): void {
    loadPlugin.image(Aries.key, 'aries_v01.png')
  }
}

const visualMixin = VisualMixin(Piece, [new AriesToken()])
export class Aries extends visualMixin {
  static key = 'aries'
  key = 'aries'

  static spawnCost = 1;
  static moveCost = 1;
  static attackCost = 2;
  dynAttackCost = Aries.attackCost;

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

  attackedPieceThisTurn: boolean = false
  attackPiece(defendingPiece: Piece): void {
    if (defendingPiece.tryToKill(this, true)) {
      this.board.pushPiece(this, defendingPiece.coordX, defendingPiece.coordY)
      this.dynAttackCost = 0;
      this.attackedPieceThisTurn = true
    }
  }

  onEndTurn() {
    this.dynAttackCost = Aries.attackCost
    this.attackedPieceThisTurn = false
  }
}
