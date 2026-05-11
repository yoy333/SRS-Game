import { GameObjects } from "phaser";
import { PieceType } from "./Piece.mjs";

export class HCard {
  constructor(private leftBound: number, private rightBound: number,
    private topBound: number, private bottomBound: number) {

  }

  bg?: GameObjects.Image
  fg?: GameObjects.Image

  updateCard(addPlugin: GameObjects.GameObjectFactory, pieceType: PieceType): void {
    if (pieceType.hCard_bg && pieceType.hCard_fg) {
      let xCenter = this.leftBound + (this.rightBound - this.leftBound) / 2
      this.bg = pieceType.hCard_bg.createRep(addPlugin, xCenter, this.topBound)
      this.fg = pieceType.hCard_fg.createRep(addPlugin, xCenter, this.topBound)
      this.bg.setOrigin(0.5, 0)
      this.fg.setOrigin(0.5, 0)


      let bg_ratio = (this.rightBound - this.leftBound) / this.bg.displayWidth
      this.bg.setScale(bg_ratio)
      let fg_ratio = (this.rightBound - this.leftBound) / this.fg.displayWidth
      this.fg.setScale(fg_ratio)
    } else {
      this.bg?.destroy()
      this.fg?.destroy()
      delete this.bg
      delete this.fg
    }
  }
}
