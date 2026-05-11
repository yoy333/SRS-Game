import { Piece, pattern, forward_1, square_1 } from "../Piece.mjs";
import { Board } from "../Board.mjs";
import { GameObjects, Loader } from "phaser";
import { Rep, VisualMixin } from "../../client/game/lib/Visual.js";
import { Effect } from "@common/Effect.mjs";

class HadesToken implements Rep<GameObjects.Image> {
  createRep(addPlugin: GameObjects.GameObjectFactory, x: number, y: number): GameObjects.Image {
    let icon = addPlugin.image(x, y, Hades.key)
    icon.setScale(1 / 20)
    icon.setOrigin(0.5, 0.45)
    return icon
  }

  loadRep(loadPlugin: Loader.LoaderPlugin): void {
    loadPlugin.image(Hades.key, 'hades_v02.png')
  }
}

class RecyleDeath extends Effect {
  // technically to do optional methods instead of having empty function bodies
  // I use a property that is a method
  onPostDeath = () => {
    console.log("applying effect")
    this.actionSpace.addIchorToNextTurn(3, this.originatingPiece.playerOwner)
  }
}

const visualMixin = VisualMixin(Piece, [new HadesToken()])
export class Hades extends visualMixin {
  static key = 'hades'
  key = 'hades'

  static spawnCost = 2;
  static moveCost = 1;
  static attackCost = 1

  constructor(addPlugin: GameObjects.GameObjectFactory, board: Board, x: number, y: number, isClientSide: boolean, playerOwner: number) {
    super(addPlugin, board, x, y, isClientSide, playerOwner)
    this.board.applyEffect(RecyleDeath, this)
  }

  static loadCard(loadPlugin: Loader.LoaderPlugin) {
    // loadPlugin.image('hades_card', 'hades_card_v01.png')
  }

  static createCard(addPlugin: GameObjects.GameObjectFactory, x: number, y: number) {
    // let rep = addPlugin.image(x, y, 'hades_card')
    return []
  }

  relativeMovementPattern: pattern = forward_1
  relativeAttackingPattern: pattern = square_1;

  attackPiece(defendingPiece: Piece): void {
    if (defendingPiece.tryToKill(this)) {
      this.board.pushPiece(this, defendingPiece.coordX, defendingPiece.coordY)
    }
  }
}
