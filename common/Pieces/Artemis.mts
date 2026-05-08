import { ColorPallete, Piece, pattern, square_1 } from "../Piece.mjs";
import { Board } from "../Board.mjs";
import { GameObjects, Loader } from "phaser";
import { Rep, VisualMixin, visualPlugin } from "../../client/game/lib/Visual.js";

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

const artemisPallete: ColorPallete = {
  fg_1: '#C5E4FE',
  fg_2: '#87C7FE',
  muted: '#8E99BD',
  text: '#FFFBF2',
  accent: '#2D3E95',
  bg_1: '#1A2130',
  bg_2: '#2A3B5D',
  bg_3: '#465777',
  bg_4: '#727D90',
}

const CARD_SCALE = 1 / 6

class artemisHCard_fg implements Rep<GameObjects.Image> {
  createRep(plugin: GameObjects.GameObjectFactory, x: number, y: number): GameObjects.Image {
    let fg = plugin.image(x, y, 'artemis_hcard_fg')
    fg.setScale(CARD_SCALE)
    return fg
  }

  loadRep(loadPlugin: Loader.LoaderPlugin): void {
    loadPlugin.image('artemis_hcard_fg', 'hCard_artemis_fg.png')
  }
}

class artemisHCard_bg implements Rep<GameObjects.Image> {
  createRep(plugin: GameObjects.GameObjectFactory, x: number, y: number): GameObjects.Image {
    let bg = plugin.image(x, y, 'artemis_hcard_bg')
    bg.setScale(CARD_SCALE)
    return bg
  }

  loadRep(loadPlugin: Loader.LoaderPlugin): void {
    loadPlugin.image('artemis_hcard_bg', 'hCard_artemis_bg.png')
  }
}

const visualMixin = VisualMixin(Piece, [new ArtemisToken()])
export class Artemis extends visualMixin {
  static key = 'artemis'
  static reps: Rep<image>[] = [new ArtemisToken()]

  static spawnCost = 1;
  static moveCost = 2;
  static attackCost = 1;

  static colorPallete = artemisPallete;
  static hCard_fg = new artemisHCard_fg()
  static hCard_bg = new artemisHCard_bg()

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
