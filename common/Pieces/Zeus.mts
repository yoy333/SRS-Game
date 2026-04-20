import { Piece, pattern, forward_1, square_1 } from "../Piece.mjs";
import { Board } from "../Board.mjs";
import { GameObjects, Loader } from "phaser";
import { Rep, VisualMixin } from "../../client/game/lib/Visual.js";

type image = GameObjects.Image

class ZeusToken implements Rep<GameObjects.Image> {
  createRep(addPlugin: GameObjects.GameObjectFactory, x: number, y: number): GameObjects.Image {
    let icon = addPlugin.image(x, y, Zeus.key, 0)
    icon.setScale(1 / 20, 1 / 20)
    return icon
  }

  loadRep(loadPlugin: Loader.LoaderPlugin): void {
    loadPlugin.image(Zeus.key, 'zeus_v01.png')
  }
}

const visualMixin = VisualMixin(Piece, [new ZeusToken()])
export class Zeus extends visualMixin {
  static key = 'zeus'

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
    loadPlugin.image('zeus_card', 'zeus_card_v01.png')
  }

  static createCard(addPlugin: GameObjects.GameObjectFactory, x: number, y: number) {
    let rep = addPlugin.image(x, y, 'zeus_card')
    return [rep]
  }

  relativeMovementPattern: pattern = forward_1
  relativeAttackingPattern: pattern = square_1;

  tryToKill(attackingPiece: Piece, override?: string[]): boolean {
    let attackerY = attackingPiece.coordY
    let defenderY = this.coordY
    if (this.playerOwner == 1) {
      attackerY = Board.flipPoint(0, attackerY)[1]
      defenderY = Board.flipPoint(0, defenderY)[1]
    }
    if (override?.includes('power')) {
      this.die();
      return true;
    } else if (attackerY >= defenderY) {
      this.die()
      return true;
    }
    return false;
  }
}
