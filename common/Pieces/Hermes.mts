import { Piece, pattern, square_1 } from "../Piece.mjs";
import { Board } from "../Board.mjs";
import { GameObjects, Loader } from "phaser";
import { Rep, VisualMixin } from "../../client/game/lib/Visual.js";

class HermesToken implements Rep<GameObjects.Image> {
  createRep(addPlugin: GameObjects.GameObjectFactory, x: number, y: number): GameObjects.Image {
    let icon = addPlugin.image(x, y, Hermes.key)
    icon.setScale(1 / 20)
    icon.setOrigin(0.5, 0.45)
    return icon
  }

  loadRep(loadPlugin: Loader.LoaderPlugin): void {
    loadPlugin.image(Hermes.key, 'hermes_v02.png')
  }
}

const diamond_2_1: Set<[number, number]> = new Set([
  [0, -2],
  [-1, -1], [0, -1], [1, -1],
  [-1, 0], [1, 0],
  [-1, 1], [0, 1], [1, 1],
  [0, 2]
])

const visualMixin = VisualMixin(Piece, [new HermesToken()])
export class Hermes extends visualMixin {
  static key = 'hermes'
  key = 'hermes'

  static spawnCost = 2;
  static moveCost = 1;
  static attackCost = 1

  constructor(addPlugin: GameObjects.GameObjectFactory, board: Board, x: number, y: number, isClientSide: boolean, playerOwner: number) {
    super(addPlugin, board, x, y, isClientSide, playerOwner)
  }

  static loadCard(loadPlugin: Loader.LoaderPlugin) {
    // loadPlugin.image('hermes_card', 'hermes_card_v01.png')
  }

  static createCard(addPlugin: GameObjects.GameObjectFactory, x: number, y: number) {
    // let rep = addPlugin.image(x, y, 'hermes_card')
    return []
  }

  relativeMovementPattern: pattern = diamond_2_1;
  relativeAttackingPattern: pattern = square_1;

  canMovePiece(startX: number, startY: number, endX: number, endY: number, playerNumber: number): boolean {
    return !this.movedThisTurn
  }

  movedThisTurn = false
  movePiece(endX: number, endY: number) {
    super.movePiece(endX, endY)
    this.movedThisTurn = true
  }

  attackPiece(defendingPiece: Piece): void {
    if (defendingPiece.tryToKill(this)) {
      this.board.pushPiece(this, defendingPiece.coordX, defendingPiece.coordY)
    }
  }

  onEndTurn(): void {
    this.movedThisTurn = false
  }
}
