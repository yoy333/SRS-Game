import { GameObjects } from "phaser";
import { PieceType } from "./Piece.mjs";

export class HCard {
  static paddingPx = 5
  width: number
  height: number

  constructor(private leftBound: number, private rightBound: number,
    private topBound: number, private bottomBound: number) {
    this.width = this.rightBound - this.leftBound
    this.height = this.bottomBound - this.topBound
  }

  bg?: GameObjects.Image
  fg?: GameObjects.Image
  border?: GameObjects.Rectangle

  updateCard(addPlugin: GameObjects.GameObjectFactory, pieceType: PieceType): void {
    let styleGuide = pieceType.hCard
    if (styleGuide) {
      let leftContent = this.leftBound
      let rightContent = this.rightBound - HCard.paddingPx
      let topContent = this.topBound
      let bottomContent = this.bottomBound - HCard.paddingPx

      let xCenter = leftContent + (rightContent - leftContent) / 2
      this.bg = styleGuide.bg.createRep(addPlugin, xCenter, topContent)
      this.fg = styleGuide.fg.createRep(addPlugin, xCenter, topContent)
      this.bg.setOrigin(0.5, 0)
      this.fg.setOrigin(0.5, 0)


      let bg_ratio = (rightContent - leftContent) / this.bg.displayWidth
      this.bg.setScale(bg_ratio)
      let fg_ratio = (rightContent - leftContent) / this.fg.displayWidth
      console.log(fg_ratio)
      this.fg.setScale(fg_ratio)

      let contentWidth = this.bg.displayWidth;
      let contentHeight = this.bg.displayHeight;

      this.border = addPlugin.rectangle(this.leftBound, this.topBound, contentWidth, contentHeight)
      // substring one to leave out #, then parsed to a hexadecimal
      let borderColorHex: number = parseInt(styleGuide.colorPallete.bg_1.substring(1), 16)
      console.log(styleGuide.colorPallete.accent)
      this.border.setStrokeStyle(HCard.paddingPx, borderColorHex, 1)
      this.border.setOrigin(0, 0)
    } else {
      this.bg?.destroy()
      this.fg?.destroy()
      delete this.bg
      delete this.fg
    }
  }
}
