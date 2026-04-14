import { GameObjects } from "phaser";
import { NeutralObjective } from "./NeutralObjective.mjs";
import { Piece } from "./Piece.mjs";
import { VisualMixin } from "../client/game/lib/Visual";
import { Drop } from '../client/game/lib/IchorDisplay'

const visualMixin = VisualMixin(NeutralObjective, [new Drop()])
export class IchorObj extends visualMixin {
  ichor: number

  constructor(xCoord: number, yCoord: number, ichor: number = 3) {
    super(xCoord, yCoord)
    this.ichor = ichor
  }

  collisionEffect(piece: Piece): void {
    let playerNumber = piece.playerOwner
    piece.board.addIchorToNextTurn(this.ichor, playerNumber)
  }

  drop?: GameObjects.Image

  initReps(plugin: GameObjects.GameObjectFactory, x: number, y: number): void {
    [this.drop] = IchorObj.createReps(plugin, x, y)
    this.drop?.setScale(this.drop?.scale * 3 / 4)
  }

  destroy() {
    this.drop?.destroy(true)
  }
}


