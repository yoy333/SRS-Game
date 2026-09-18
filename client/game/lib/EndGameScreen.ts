import { GameObjects, Loader, Scenes } from "phaser";
import { Button } from "./Button";
import { Rep, VisualMixin, visualPlugin } from "./Visual";
import { ConcreteConstructor } from "@common/utils.mjs";
import { Room } from "@colyseus/sdk";

class EndGameScreenWinFrameRep implements Rep<GameObjects.Image> {
  static key = 'endGameScreenWinFrame'
  constructor() {

  }

  createRep(addPlugin: GameObjects.GameObjectFactory, x: number, y: number): GameObjects.Image {
    let rep = addPlugin.image(x, y, EndGameScreenWinFrameRep.key)
    rep.setScale(0.45)
    return rep
  }

  loadRep(loadPlugin: Loader.LoaderPlugin): void {
    loadPlugin.image(EndGameScreenWinFrameRep.key, 'winScreen_frame.png')
  }
}

class EndGameScreenLoseFrameRep implements Rep<GameObjects.Image> {
  static key = 'endGameScreenLoseFrame'
  constructor() {

  }

  createRep(addPlugin: GameObjects.GameObjectFactory, x: number, y: number): GameObjects.Image {
    let rep = addPlugin.image(x, y, EndGameScreenLoseFrameRep.key)
    rep.setScale(0.45)
    return rep
  }

  loadRep(loadPlugin: Loader.LoaderPlugin): void {
    loadPlugin.image(EndGameScreenLoseFrameRep.key, 'loseScreen_frame.png')
  }
}

class EndGameScreenPlayAgainRep implements Rep<GameObjects.Image> {
  static key = 'endGameScreenPlayAgain'
  constructor() {

  }

  createRep(addPlugin: GameObjects.GameObjectFactory, x: number, y: number): GameObjects.Image {
    let rep = addPlugin.image(x, y, EndGameScreenPlayAgainRep.key)
    rep.setScale(0.15)
    return rep
  }

  loadRep(loadPlugin: Loader.LoaderPlugin): void {
    loadPlugin.image(EndGameScreenPlayAgainRep.key, 'winScreen_playAgain.png')
  }
}

class EndGameScreenHomeRep implements Rep<GameObjects.Image> {
  static key = 'endGameScreenHome'

  createRep(addPlugin: GameObjects.GameObjectFactory, x: number, y: number): GameObjects.Image {
    let rep = addPlugin.image(x, y, EndGameScreenHomeRep.key)
    rep.setScale(0.10)
    return rep
  }

  loadRep(loadPlugin: Loader.LoaderPlugin): void {
    loadPlugin.image(EndGameScreenHomeRep.key, 'winScreen_home.png')
  }
}

class EndGameScreenMaskRep implements Rep<GameObjects.Rectangle> {
  createRep(addPlugin: GameObjects.GameObjectFactory, x: number, y: number): GameObjects.Rectangle {
    let rep = addPlugin.rectangle(0, 0, 1280, 720, 0x333333, 0.6).setOrigin(0, 0)
    return rep
  }

  // uses a generated rectangle, not a predefined asset
  loadRep(loadPlugin: Loader.LoaderPlugin): void {

    return;
  }
}

type things = GameObjects.Sprite | GameObjects.Image | GameObjects.Rectangle
const endGameScreenMixin = VisualMixin<things, ConcreteConstructor<any>>(Object,
  [new EndGameScreenMaskRep(), new EndGameScreenWinFrameRep(), new EndGameScreenLoseFrameRep(), new EndGameScreenPlayAgainRep(), new EndGameScreenHomeRep()]
)

export class EndGameScreen extends endGameScreenMixin {
  frame: things
  playAgain: things
  playAgainButton: Button
  homeScreen: things
  homeScreenButton: Button
  winnerIsClient: boolean

  constructor(addPlugin: GameObjects.GameObjectFactory, x: number, y: number, winnerIsClient: boolean) {
    super()

    this.winnerIsClient = winnerIsClient

    let reps = EndGameScreen.createReps(addPlugin, x, y)

    // both frames are created, but only the one matching the outcome is kept
    let winFrame = reps[1]
    let loseFrame = reps[2]
    this.frame = winnerIsClient ? winFrame : loseFrame
    let unusedFrame = winnerIsClient ? loseFrame : winFrame
    unusedFrame.destroy()
    this.playAgain = reps[3]
    this.homeScreen = reps[4]

    this.initReps(x, y)

    this.playAgainButton = new Button()
    this.homeScreenButton = new Button()
  }

  initReps(x: number, y: number) {
    this.playAgain.setPosition(x, y + 15)
    this.homeScreen.setPosition(x, y + 125)
  }

  bindInteraction(room: Room<any, any>, scene: Scenes.ScenePlugin) {
    this.playAgainButton.onClick = () => {
      room.leave()
      scene.restart()
    }

    this.homeScreenButton.onClick = () => {
      room.leave()
      scene.start('MainMenu')
    }

    this.playAgainButton.bindInteraction(this.playAgain)
    this.homeScreenButton.bindInteraction(this.homeScreen)
  }
}
