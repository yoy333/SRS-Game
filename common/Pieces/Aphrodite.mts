import { Piece, pattern, forward_1, square_1 } from "../Piece.mjs";
import { Board } from "../Board.mjs";
import { GameObjects, Loader } from "phaser";
import { Rep, VisualMixin } from "../../client/game/lib/Visual.js";
import { Effect, EffectHint } from "@common/Effect.mjs";

class AphroditeToken implements Rep<GameObjects.Image> {
  createRep(addPlugin: GameObjects.GameObjectFactory, x: number, y: number): GameObjects.Image {
    let icon = addPlugin.image(x, y, Aphrodite.key)
    icon.setScale(1 / 20)
    return icon
  }

  loadRep(loadPlugin: Loader.LoaderPlugin): void {
    loadPlugin.image(Aphrodite.key, 'aphrodite_v02.png')
  }
}

class CharmedEffectHint extends EffectHint {
  constructor(effect: Effect) {
    super(effect)
  }

  text = "This character cannot attack this turn"
}

class CharmedEffect extends Effect {
  constructor(actionSpace: Board, originatingPiece: Piece, targetedPiece: Piece) {
    super(actionSpace, originatingPiece, targetedPiece)
    this.effectHint = new CharmedEffectHint(this)
  }

  onPreAttack = (defendingPiece: Piece) => {
    return false
  };
}

const visualMixin = VisualMixin(Piece, [new AphroditeToken()])
export class Aphrodite extends visualMixin {
  static key = 'aphrodite'
  key = 'aphrodite'

  static spawnCost = 2;
  static moveCost = 1;
  static attackCost = 0;

  constructor(addPlugin: GameObjects.GameObjectFactory, board: Board, x: number, y: number, isClientSide: boolean, playerOwner: number) {
    super(addPlugin, board, x, y, isClientSide, playerOwner)
  }

  static loadCard(loadPlugin: Loader.LoaderPlugin) {
    // loadPlugin.image('aphrodite_card', 'aphrodite_card_v01.png')
  }

  static createCard(addPlugin: GameObjects.GameObjectFactory, x: number, y: number) {
    // let rep = addPlugin.image(x, y, 'aphrodite_card')
    return []
  }

  relativeMovementPattern: pattern = forward_1
  relativeAttackingPattern: pattern = square_1;

  private effectsThisTurn: CharmedEffect[] = []
  private effectsLastTurn: CharmedEffect[] = []
  attackPiece(defendingPiece: Piece): void {
    // if (defendingPiece.tryToKill(this)) {
    //   this.board.pushPiece(this, defendingPiece.coordX, defendingPiece.coordY)
    // }
    let effect = this.board.applyEffect(CharmedEffect, this, defendingPiece.coordX, defendingPiece.coordY)
    if (effect) {
      this.effectsThisTurn.push(effect)
    }
  }


  onEndTurn(): void {
    for (let effect of this.effectsLastTurn)
      effect.remove()

    this.effectsLastTurn = this.effectsThisTurn
    this.effectsThisTurn = []
  }
}
