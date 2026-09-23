import { GameObjects } from "phaser";
import { Piece, PieceType } from "./Piece.mjs";

/**
 * Owns the reps of the piece-type card: the layered bg/fg artwork, its border,
 * and the stat/flavour text box drawn over it. It knows nothing about where it
 * sits on screen beyond the bounds it is handed, and it reports back how tall
 * it ended up drawing so whatever follows it can stack underneath.
 */
class HCard {
  private bg?: GameObjects.Image
  private fg?: GameObjects.Image
  private border?: GameObjects.Rectangle
  private textBox?: GameObjects.Rectangle
  private textBoxBorder?: GameObjects.Rectangle
  private text?: GameObjects.Text

  /** Tears down every rep this card owns, leaving it in its empty state. */
  clear(): void {
    this.bg?.destroy()
    this.fg?.destroy()
    this.border?.destroy()
    this.textBox?.destroy()
    this.textBoxBorder?.destroy()
    this.text?.destroy()
    delete this.bg
    delete this.fg
    delete this.border
    delete this.textBox
    delete this.textBoxBorder
    delete this.text
  }

  /**
   * Redraws the card for `pieceType` inside the given horizontal span, starting
   * at `top`. Returns the y coordinate just below the drawn card.
   */
  draw(addPlugin: GameObjects.GameObjectFactory, pieceType: PieceType,
    left: number, right: number, top: number): number {
    this.clear()

    const styleGuide = pieceType.hCard
    if (!styleGuide)
      return top

    const contentWidth = right - left
    const xCenter = left + contentWidth / 2

    this.bg = styleGuide.bg.createRep(addPlugin, xCenter, top)
    this.fg = styleGuide.fg.createRep(addPlugin, xCenter, top)
    this.bg.setOrigin(0.5, 0)
    this.fg.setOrigin(0.5, 0)

    // scale them to right bound
    this.bg.setScale(contentWidth / this.bg.displayWidth)
    this.fg.setScale(contentWidth / this.fg.displayWidth)

    // the artwork's scaled height drives everything laid out below it
    const contentHeight = this.bg.displayHeight

    this.border = addPlugin.rectangle(left, top, contentWidth, contentHeight)
    this.border.setStrokeStyle(HelpSidebar.paddingPx, styleGuide.colorPallete.bg_1, 1)
    this.border.setOrigin(0, 0)

    const tboxX = left + contentWidth * 0.05
    const tboxY = top + contentHeight * 0.6
    const tboxW = contentWidth * 0.9
    const tboxH = contentHeight * 0.35

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

    return top + contentHeight + HelpSidebar.paddingPx
  }
}

/**
 * Owns the reps of the hint panel that hangs below the card, describing the
 * effect currently active on the selected piece. Split out from HCard because
 * it appears and disappears on its own schedule: a piece can have a card with
 * no effect, and the effect can change while the same card stays up.
 */
class HEffect {
  private box?: GameObjects.Rectangle
  private text?: GameObjects.Text

  /** Tears down every rep this panel owns, leaving it in its empty state. */
  clear(): void {
    this.box?.destroy()
    this.text?.destroy()
    delete this.box
    delete this.text
  }

  /**
   * Redraws the hint for whatever effect `piece` is currently showing, if any.
   * Returns the y coordinate just below the drawn panel.
   */
  draw(addPlugin: GameObjects.GameObjectFactory, piece: Piece | undefined,
    left: number, right: number, top: number): number {
    this.clear()

    if (!piece)
      return top
    const shownEffect = piece.board.getShownEffect(piece)
    if (!shownEffect)
      return top
    const effectHint = shownEffect.effectHint
    if (!effectHint)
      return top

    const contentWidth = right - left
    const boxHeight = 50

    this.box = addPlugin.rectangle(
      left, top,
      contentWidth, boxHeight,
      0x999999, 0.9
    ).setOrigin(0, 0)

    const tboxW = contentWidth * 0.9
    const tboxH = boxHeight * 0.35
    this.text = addPlugin.text(
      left + tboxW * 0.05, top + tboxH * 0.05,
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

    return top + boxHeight
  }
}

/**
 * The help panel down the side of the board. It is the single thing the scene
 * talks to: it holds the region of screen the help occupies and delegates the
 * actual drawing to the sections stacked inside it, threading each section's
 * bottom edge into the next one's top so the stack stays packed regardless of
 * how tall any one section turns out to be.
 */
export class HelpSidebar {
  static paddingPx = 5
  width: number
  height: number

  private card = new HCard()
  private sidebar = new HEffect()

  constructor(private leftBound: number, private rightBound: number,
    private topBound: number, private bottomBound: number) {
    this.width = this.rightBound - this.leftBound
    this.height = this.bottomBound - this.topBound
  }

  /** Redraws the whole panel for `pieceType`, optionally tied to a live piece. */
  updateCard(addPlugin: GameObjects.GameObjectFactory, pieceType: PieceType, piece?: Piece): void {
    const left = this.leftBound
    const right = this.rightBound - HelpSidebar.paddingPx

    let cursor = this.topBound
    cursor = this.card.draw(addPlugin, pieceType, left, right, cursor)
    cursor = this.sidebar.draw(addPlugin, piece, left, right, cursor)
  }

  /** Tears down every rep in the panel. */
  clear(): void {
    this.card.clear()
    this.sidebar.clear()
  }
}
