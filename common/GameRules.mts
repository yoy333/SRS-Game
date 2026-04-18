import { GameObjects } from "phaser";
import { Board } from "./Board.mjs";
import { IchorObj } from "./NeutralObjectives/IchorObj.mjs";

export class GameRules {
  actionSpace: Board

  constructor(board: Board) {
    this.actionSpace = board
  }

  startGame(addPlugin: GameObjects.GameObjectFactory | undefined) {
    this.actionSpace.addNObj(addPlugin, IchorObj, 2, 4)
    this.actionSpace.addNObj(addPlugin, IchorObj, 5, 4)
    this.actionSpace.addNObj(addPlugin, IchorObj, 2, 3)
    this.actionSpace.addNObj(addPlugin, IchorObj, 5, 3)
  }
}
