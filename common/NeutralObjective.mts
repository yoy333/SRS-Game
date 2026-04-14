import { Piece } from './Piece.mjs'

export abstract class NeutralObjective {
  xCoord: number
  yCoord: number


  constructor(xCoord: number, yCoord: number) {
    this.xCoord = xCoord
    this.yCoord = yCoord
  }

  onCollision(piece: Piece): void {
    this.collisionEffect(piece)
    this.destroy()
  }

  abstract destroy(): void

  abstract collisionEffect(piece: Piece): void
}
