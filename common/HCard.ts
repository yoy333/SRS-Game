import { GameObjects } from "phaser";
import { PieceType } from "./Piece.mjs";

export class HCard {
  constructor(private leftBound: number, private rightBound: number,
    private topBound: number, private bottomBound: number) {

  }

  updateCard(addPlugin: GameObjects.GameObjectFactory, pieceType: PieceType): void {
    if (pieceType.hCard_bg && pieceType.hCard_fg) {
      let xCenter = this.leftBound + (this.rightBound - this.leftBound) / 2
      let bg = pieceType.hCard_bg.createRep(addPlugin, xCenter, 200)
      let fg = pieceType.hCard_fg.createRep(addPlugin, xCenter, 200)
    }
  }
}
