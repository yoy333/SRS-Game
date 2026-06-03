import { Board } from "./Board.mjs";
import { Piece } from "./Piece.mjs";

export interface EffectHint {
  text?: string
}

export abstract class Effect {
  effectHint?: EffectHint

  actionSpace: Board
  originatingPiece: Piece
  targetedPiece: Piece
  constructor(actionSpace: Board, originatingPiece: Piece, targetedPiece: Piece) {
    this.actionSpace = actionSpace
    this.originatingPiece = originatingPiece
    this.targetedPiece = targetedPiece
  }

  onPreMove?: (xEnd: number, yEnd: number) => boolean
  onPostMove?: (xEnd: number, yEnd: number) => void
  onPreAttack?: (defendingPiece: Piece) => boolean
  onPostAttack?: (defendingPiece: Piece) => void
  // onPreDeath?: () => boolean
  onPostDeath?: () => void
  // TODO
  onEndTurn?: () => void
  onStartTurn?: () => void

  // effect only removes itself by default
  // but you may want to remove related effects
  remove() {
    this.actionSpace.removeEffect(this.targetedPiece, this)
  }
}
