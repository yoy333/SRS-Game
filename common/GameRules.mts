import { GameObjects } from "phaser";
import { Board } from "./Board.mjs";
import { IchorObj } from "./NeutralObjectives/IchorObj.mjs";

export class GameRules {
  gameState: Board

  constructor(board: Board) {
    this.gameState = board
  }

  startGame(addPlugin: GameObjects.GameObjectFactory | undefined) {
    this.gameState.addNObj(addPlugin, IchorObj, 2, 4)
    this.gameState.addNObj(addPlugin, IchorObj, 5, 4)
    this.gameState.addNObj(addPlugin, IchorObj, 2, 3)
    this.gameState.addNObj(addPlugin, IchorObj, 5, 3)
  }
}
