import { GameObjects } from "phaser";
import { Piece, PieceType } from "./Piece.mjs";

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
  piece?: Piece

  updateCard(addPlugin: GameObjects.GameObjectFactory, pieceType: PieceType, piece?: Piece): void {
    let styleGuide = pieceType.hCard
    this.piece = piece

    let leftContent = this.leftBound
    let rightContent = this.rightBound - HCard.paddingPx
    let topContent = this.topBound
    let xCenter = leftContent + (rightContent - leftContent) / 2
    let contentWidth = rightContent - leftContent

    if (styleGuide) {
      this.bg = styleGuide.bg.createRep(addPlugin, xCenter, topContent)
      this.fg = styleGuide.fg.createRep(addPlugin, xCenter, topContent)
      this.bg.setOrigin(0.5, 0)
      this.fg.setOrigin(0.5, 0)

      // scale them to right bound
      let bg_ratio = (rightContent - leftContent) / this.bg.displayWidth
      this.bg.setScale(bg_ratio)
      let fg_ratio = (rightContent - leftContent) / this.fg.displayWidth
      this.fg.setScale(fg_ratio)

      // find bottom content after scaling to see where to render elements below it

      // add a border
      let contentHeight = this.bg.displayHeight;

      this.border = addPlugin.rectangle(leftContent, topContent, contentWidth, contentHeight)
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

    let bottomContent = topContent;
    if (this.bg)
      bottomContent += this.bg.displayHeight + HCard.paddingPx

    if (!this.piece)
      return
    let shownEffect = this.piece.board.getShownEffect(this.piece)
    if (!shownEffect)
      return

    let effectHint = shownEffect.effectHint
    if (!effectHint)
      return

    let effectTextBoxHeight = 50
    let effectTextBox = addPlugin.rectangle(
      leftContent, bottomContent,
      contentWidth, effectTextBoxHeight,
      0x999999, 0.9
    )
    effectTextBox.setOrigin(0, 0)


    let tboxW = contentWidth * 0.9
    let tboxH = effectTextBoxHeight * 0.35
    let effectText = addPlugin.text(
      leftContent + tboxW * 0.05, bottomContent + tboxH * 0.05,
      effectHint.text,
      {
        color: "#000000",
        font: '600 16px Tahoma',
        lineSpacing: 5,
        wordWrap: {
          width: tboxW * 0.9
        }
      }
    )
  }
}
