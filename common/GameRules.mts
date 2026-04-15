import { GameObjects } from "phaser";
import { Board } from "./Board.mjs";
import { IchorObj } from "./NeutralObjectives/IchorObj.mjs";

export class GameRules {
  actionSpace: Board

  constructor(board: Board) {
    this.actionSpace = board
  }

  startGame(addPlugin: GameObjects.GameObjectFactory | undefined) {
    this.actionSpace.addNObj(addPlugin, IchorObj, 3, 5)
    this.actionSpace.addNObj(addPlugin, IchorObj, 6, 5)
    this.actionSpace.addNObj(addPlugin, IchorObj, 3, 4)
    this.actionSpace.addNObj(addPlugin, IchorObj, 6, 4)
  }
}
