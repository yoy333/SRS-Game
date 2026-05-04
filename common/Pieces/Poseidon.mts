import { Piece, pattern, forward_1, square_1 } from "../Piece.mjs";
import { Board } from "../Board.mjs";
import { GameObjects, Loader } from "phaser";
import { Rep, VisualMixin } from "../../client/game/lib/Visual.js";

type image = GameObjects.Image

class PoseidonToken implements Rep<GameObjects.Image> {
  createRep(addPlugin: GameObjects.GameObjectFactory, x: number, y: number): GameObjects.Image {
    let icon = addPlugin.image(x, y, Poseidon.key, 0)
    icon.setScale(1 / 20, 1 / 20)
    return icon
  }

  loadRep(loadPlugin: Loader.LoaderPlugin): void {
    loadPlugin.image(Poseidon.key, 'poseidon_v01.png')
  }
}

const visualMixin = VisualMixin(Piece, [new PoseidonToken()])
export class Poseidon extends visualMixin {
  static key = 'poseidon'

  static spawnCost = 2;
  static moveCost = 1;
  static attackCost = 1;

  constructor(addPlugin: GameObjects.GameObjectFactory, board: Board, x: number, y: number, isClientSide: boolean, playerOwner: number) {
    super(addPlugin, board, x, y, isClientSide, playerOwner)
  }

  // createReps(addPlugin: GameObjects.GameObjectFactory): Array<sprite | image> {
  //   if (!this.isClientSide)
  //     throw new Error("Cannot create reps server-side")
  //   let [worldX, worldY] = this.getWorldXYFromPerspective(this.perspectiveX, this.perspectiveY)
  //   if (this.key == "") {
  //     console.warn('no key specified')
  //   }
  //   let [primaryRep] = Zeus.createRep(addPlugin, worldX, worldY)
  //   return [primaryRep]
  // }

  static loadCard(loadPlugin: Loader.LoaderPlugin) {
    loadPlugin.image('poseidon_card', 'poseidon_card_v01.png')
  }

  static createCard(addPlugin: GameObjects.GameObjectFactory, x: number, y: number) {
    let rep = addPlugin.image(x, y, 'poseidon_card')
    return [rep]
  }

  relativeMovementPattern: pattern = forward_1
  relativeAttackingPattern: pattern = square_1;

  attackPiece(defendingPiece: Piece): void {
    const backY = defendingPiece.coordY + (defendingPiece.playerOwner === 0 ? -1 : 1)
    if (backY >= 0 && backY < Board.rows && this.board.getPiece(defendingPiece.coordX, backY) === null) {
      this.board.movePiece(defendingPiece.coordX, defendingPiece.coordY, defendingPiece.coordX, backY)
    }
  }
}
