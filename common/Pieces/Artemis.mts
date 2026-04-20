import { Piece, pattern, square_1 } from "../Piece.mjs";
import { Board } from "../Board.mjs";
import { GameObjects, Loader } from "phaser";
import { Rep, VisualMixin } from "../../client/game/lib/Visual.js";

type image = GameObjects.Image

const artemis_attack: pattern = new Set([
  [-2, -2], [2, -2],
  [-1, -1], [1, -1],
  [-1, 1], [1, 1],
  [-2, 2], [2, 2],
])

class ArtemisToken implements Rep<GameObjects.Sprite | GameObjects.Image> {
  createRep(plugin: GameObjects.GameObjectFactory, x: number, y: number): GameObjects.Sprite | GameObjects.Image {
    let icon = plugin.image(x, y, Artemis.key, 0)
    icon.setScale(1 / 32, 1 / 32)
    icon.setOrigin(0.5, 0.4)
    return icon
  }

  loadRep(loadPlugin: Loader.LoaderPlugin): void {
    loadPlugin.image(Artemis.key, 'artemis_v02.png')
  }
}

const visualMixin = VisualMixin(Piece, [new ArtemisToken()])
export class Artemis extends visualMixin {
  static key = 'artemis'
  static reps: Rep<image>[] = [new ArtemisToken()]

  static spawnCost = 2;
  static moveCost = 2;
  static attackCost = 1;

  constructor(addPlugin: GameObjects.GameObjectFactory, board: Board, x: number, y: number, isClientSide: boolean, playerOwner: number) {
    super(addPlugin, board, x, y, isClientSide, playerOwner)
    if (!this.isClientSide)
      return;
  }

  static loadCard(loadPlugin: Loader.LoaderPlugin) {

  }

  static createCard(addPlugin: GameObjects.GameObjectFactory, x: number, y: number) {
    return []
  }

  relativeMovementPattern: pattern = square_1
  relativeAttackingPattern: pattern = artemis_attack;
}
