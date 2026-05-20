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
  textBox?: GameObjects.Rectangle
  textBoxBorder?: GameObjects.Rectangle
  text?: GameObjects.Text

  updateCard(addPlugin: GameObjects.GameObjectFactory, pieceType: PieceType): void {
    let styleGuide = pieceType.hCard
    if (styleGuide) {
      let leftContent = this.leftBound
      let rightContent = this.rightBound - HCard.paddingPx
      let topContent = this.topBound
      let bottomContent = this.bottomBound - HCard.paddingPx

      // create fg and bg in right position
      let xCenter = leftContent + (rightContent - leftContent) / 2
      this.bg = styleGuide.bg.createRep(addPlugin, xCenter, topContent)
      this.fg = styleGuide.fg.createRep(addPlugin, xCenter, topContent)
      this.bg.setOrigin(0.5, 0)
      this.fg.setOrigin(0.5, 0)

      // scale them to right bound
      let bg_ratio = (rightContent - leftContent) / this.bg.displayWidth
      this.bg.setScale(bg_ratio)
      let fg_ratio = (rightContent - leftContent) / this.fg.displayWidth
      this.fg.setScale(fg_ratio)

      // add a border
      let contentWidth = this.bg.displayWidth;
      let contentHeight = this.bg.displayHeight;

      this.border = addPlugin.rectangle(this.leftBound, this.topBound, contentWidth, contentHeight)
      // substring one to leave out #, then parsed to a hexadecimal
      this.border.setStrokeStyle(HCard.paddingPx, styleGuide.colorPallete.bg_1, 1)
      this.border.setOrigin(0, 0)

      // this.fg.setAlpha(0)
      // this.bg.setAlpha(0)

      // add textbox
      let tboxX = leftContent + contentWidth * 0.05
      let tboxY = topContent + contentHeight * 0.6
      let tboxW = contentWidth * 0.9
      let tboxH = contentHeight * 0.35
      this.textBox = addPlugin.rectangle(
        tboxX, tboxY,
        tboxW, tboxH,
        styleGuide.colorPallete.accent, 0.9
      ).setOrigin(0, 0)

      this.textBoxBorder = addPlugin.rectangle(
        tboxX, tboxY,
        tboxW, tboxH,
      ).setStrokeStyle(2, styleGuide.colorPallete.fg_2).setOrigin(0, 0)

      const textSequence =
        "Spawn Cost: " + pieceType.spawnCost + "\n" +
        "Move Cost: " + pieceType.moveCost + "\n" +
        "Attack Cost: " + pieceType.attackCost + "\n" +
        styleGuide.text
      this.text = addPlugin.text(
        tboxX + tboxW * 0.05, tboxY + tboxH * 0.05,
        textSequence,
        {
          color: "#" + styleGuide.colorPallete.text.toString(16),
          font: '600 16px Tahoma',
          lineSpacing: 5,
          wordWrap: {
            width: tboxW * 0.9
          }
        }
      )
    } else {
      this.bg?.destroy()
      this.fg?.destroy()
      this.border?.destroy()
      this.textBox?.destroy()
      this.textBoxBorder?.destroy()
      this.textBox?.destroy()
      this.text?.destroy()
      delete this.bg
      delete this.fg
      delete this.border
      delete this.textBox
      delete this.textBoxBorder
      delete this.text
    }
  }
}
