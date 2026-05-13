import { Piece, pattern, forward_1, square_1, ColorPallete, HCardStyle } from "../Piece.mjs";
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
    loadPlugin.image(Aries.key, 'aries_v02.png')
  }
}

class ariesHCard_fg implements Rep<GameObjects.Image> {
  createRep(plugin: GameObjects.GameObjectFactory, x: number, y: number): GameObjects.Image {
    let fg = plugin.image(x, y, 'aries_hcard_fg')
    return fg
  }

  loadRep(loadPlugin: Loader.LoaderPlugin): void {
    loadPlugin.image('aries_hcard_fg', 'hCard_aries_fg.png')
  }
}

class ariesHCard_bg implements Rep<GameObjects.Image> {
  createRep(plugin: GameObjects.GameObjectFactory, x: number, y: number): GameObjects.Image {
    let bg = plugin.image(x, y, 'aries_hcard_bg')
    return bg
  }

  loadRep(loadPlugin: Loader.LoaderPlugin): void {
    loadPlugin.image('aries_hcard_bg', 'hCard_aries_bg.png')
  }
}

const ariesPallete: ColorPallete = {
  fg_1: '#EBBBA4',
  fg_2: '#E48278',
  muted: '#A86F68',
  text: '#F1E7C6',
  accent: '#DB3C42',
  bg_1: '#61617f',
  bg_2: '#564c63',
  bg_3: '#8B8298',
  bg_4: '#D5D1D9'
}

const ariesHCard: HCardStyle = {
  fg: new ariesHCard_fg(),
  bg: new ariesHCard_bg(),
  colorPallete: ariesPallete
}

const visualMixin = VisualMixin(Piece, [new AriesToken()])
export class Aries extends visualMixin {
  static key = 'aries'
  key = 'aries'

  static hCard = ariesHCard

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
