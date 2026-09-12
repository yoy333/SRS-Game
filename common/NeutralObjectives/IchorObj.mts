import { NeutralObjective } from "@common/NeutralObjective.mjs";
import { Piece } from "@common/Piece.mjs";
import { GameObjects } from "phaser";
import { VisualMixin } from "../../client/game/lib/Visual.js";
import { Drop } from '../../client/game/lib/IchorDisplay.js'
import { Effect } from "@common/Effect.mjs";

const visualMixin = VisualMixin(NeutralObjective, [new Drop()])
class Frozen extends Effect {
  onPreMove = () => {
    return false;
  }

  onEndTurn = () => {
    this.remove()
  };
}

export class IchorObj extends visualMixin {
  ichor: number

  constructor(xCoord: number, yCoord: number, ichor: number = 3) {
    super(xCoord, yCoord)
    this.ichor = ichor
  }

  collisionEffect(piece: Piece): void {
    let playerNumber = piece.playerOwner
    piece.board.addIchorToNextTurn(this.ichor, playerNumber)
    piece.board.applyEffect(Frozen, piece)
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


