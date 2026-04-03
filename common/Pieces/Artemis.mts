import { Piece, pattern, forward_1, square_1 } from "../Piece.mjs";
import { Board } from "../Board.mts";
import { GameObjects, Loader } from "phaser";

type sprite = GameObjects.Sprite
type image = GameObjects.Image

const artemis_attack: pattern = new Set([
  [-2, -2], [2, -2],
  [-1, -1], [1, -1],
  [-1, 1], [1, 1],
  [-2, 2], [2, 2],
])

export class Artemis extends Piece {
  static key = 'artemis'
  key = 'artemis'

  static spawnCost = 2;
  static moveCost = 1;

  constructor(addPlugin: GameObjects.GameObjectFactory, board: Board, x: number, y: number, isClientSide: boolean, playerOwner: number) {
    super(addPlugin, board, x, y, isClientSide, playerOwner)
    if (this.isClientSide)
      this.reps = this.createReps(addPlugin)
  }

  createReps(addPlugin: GameObjects.GameObjectFactory): Array<sprite | image> {
    if (!this.isClientSide)
      throw new Error("Cannot create reps server-side")
    let [worldX, worldY] = this.getWorldXYFromPerspective(this.perspectiveX, this.perspectiveY)

    if (this.key == "") {
      console.warn('no key specified')
    }
    let [primaryRep] = Artemis.createRep(addPlugin, worldX, worldY)
    return [primaryRep]
  }

  static createRep(addPlugin: GameObjects.GameObjectFactory, x: number, y: number) {
    let icon = addPlugin.image(x, y, this.key, 0)
    icon.setScale(1 / 32, 1 / 32)
    icon.setOrigin(0.5, 0.4)
    return [icon]
  }

  static loadReps(loadPlugin: Loader.LoaderPlugin) {
    loadPlugin.image(Artemis.key, 'artemis_v02.png')
  }

  static loadCard(loadPlugin: Loader.LoaderPlugin) {

  }

  static createCard(addPlugin: GameObjects.GameObjectFactory, x: number, y: number) {
    return []
  }

  relativeMovementPattern: pattern = square_1
  relativeAttackingPattern: pattern = artemis_attack;
}
