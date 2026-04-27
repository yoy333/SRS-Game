import { Piece, PieceType } from "./Piece.mjs"
import { DefaultPiece } from "./Pieces/DefaultPiece.mjs"
import { Zeus } from "./Pieces/Zeus.mjs"
import { Artemis } from "./Pieces/Artemis.mjs"
import { Aries } from "./Pieces/Aries.mjs"
import { Apollo } from "./Pieces/Apollo.mjs"

import { GameObjects } from "phaser"
import { Board } from "./Board.mjs"
import { VisualConstructor } from "../client/game/lib/Visual.js"
import { Nike } from "./Pieces/Nike.mjs"
import { Hermes } from "./Pieces/Hermes.mjs"
import { Aphrodite } from "./Pieces/Aphrodite.mjs"
import { Hades } from "./Pieces/Hades.mjs"

const pieceTypeRegistery: Map<string, VisualConstructor & PieceType> = new Map()
type ConcretePiece = new (...args: any[]) => Piece

export const pieceUtils = {
  classFromKey: function (key: string): PieceType {
    let pt = pieceTypeRegistery.get(key)
    if (!pt)
      throw new Error("tried to get nonexistent piece type: " + key)
    return pt
  },

  createFromKey: function (key: string, addPlugin: GameObjects.GameObjectFactory, board: Board, x: number, y: number, isClientSide: boolean, playerOwner: number): Piece {
    let pieceType: ConcretePiece = (pieceUtils.classFromKey(key)) as ConcretePiece
    return new pieceType(addPlugin, board, x, y, true, playerOwner)
  }
}

pieceTypeRegistery.set(DefaultPiece.key, DefaultPiece)
pieceTypeRegistery.set(Zeus.key, Zeus)
pieceTypeRegistery.set(Artemis.key, Artemis)
pieceTypeRegistery.set(Aries.key, Aries)
pieceTypeRegistery.set(Apollo.key, Apollo)
pieceTypeRegistery.set(Nike.key, Nike)
pieceTypeRegistery.set(Hermes.key, Hermes)
pieceTypeRegistery.set(Aphrodite.key, Aphrodite)
pieceTypeRegistery.set(Hades.key, Hades)
export { pieceTypeRegistery }
