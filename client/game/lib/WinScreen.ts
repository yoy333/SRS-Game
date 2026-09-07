import { GameObjects, Loader } from "phaser";
import { Button } from "./Button";
import { Rep, VisualMixin, visualPlugin } from "./Visual";

type spriteOrImage = GameObjects.Sprite | GameObjects.Image

class WinScreenFrameRep implements Rep<GameObjects.Image> {
  static key = 'winScreenFrame'
  constructor() {

  }

  createRep(addPlugin: GameObjects.GameObjectFactory, x: number, y: number): GameObjects.Image {
    let rep = addPlugin.image(x, y, WinScreenFrameRep.key)
    rep.setScale(0.45)
    return rep
  }

  loadRep(loadPlugin: Loader.LoaderPlugin): void {
    loadPlugin.image(WinScreenFrameRep.key, 'winScreen_frame.png')
  }
}

class WinScreenPlayAgainRep implements Rep<GameObjects.Image> {
  static key = 'winScreenPlayAgain'
  constructor() {

  }

  createRep(addPlugin: GameObjects.GameObjectFactory, x: number, y: number): GameObjects.Image {
    let rep = addPlugin.image(x, y, WinScreenPlayAgainRep.key)
    rep.setScale(0.15)
    return rep
  }

  loadRep(loadPlugin: Loader.LoaderPlugin): void {
    loadPlugin.image(WinScreenPlayAgainRep.key, 'winScreen_playAgain.png')
  }
}

class WinScreenHomeRep implements Rep<GameObjects.Image> {
  static key = 'winScreenHome'

  createRep(addPlugin: GameObjects.GameObjectFactory, x: number, y: number): GameObjects.Image {
    let rep = addPlugin.image(x, y, WinScreenHomeRep.key)
    rep.setScale(0.10)
    return rep
  }

  loadRep(loadPlugin: Loader.LoaderPlugin): void {
    loadPlugin.image(WinScreenHomeRep.key, 'winScreen_home.png')
  }
}

class WinScreenMaskRep implements Rep<GameObjects.GameObject> {
  createRep(addPlugin: GameObjects.GameObjectFactory, x: number, y: number): GameObjects.GameObject {
    let rep = addPlugin.rectangle(0, 0, 1280, 720, 0x333333, 0.6).setOrigin(0, 0)
    return rep
  }

  // uses a generated rectangle, not a predefined asset
  loadRep(loadPlugin: Loader.LoaderPlugin): void {

    return;
  }
}

const winScreenMixin = VisualMixin(Object,
  [new WinScreenMaskRep(), new WinScreenFrameRep(), new WinScreenPlayAgainRep(), new WinScreenHomeRep()]
)
export class WinScreen extends winScreenMixin {
  frame: spriteOrImage
  playAgain: spriteOrImage
  playAgainButton: Button
  homeScreen: spriteOrImage
  homeScreenButton: Button

  constructor(addPlugin: GameObjects.GameObjectFactory, x: number, y: number) {
    super()
    let reps = WinScreen.createReps(addPlugin, x, y)

    this.frame = reps[1]
    this.playAgain = reps[2]
    this.homeScreen = reps[3]

    this.initReps(x, y)

    this.playAgainButton = new Button()
    this.playAgainButton.bindInteraction(this.playAgain)

    this.homeScreenButton = new Button()
    this.playAgainButton.bindInteraction(this.homeScreen)
  }

  initReps(x: number, y: number) {
    this.playAgain.setPosition(x, y + 15)
    this.homeScreen.setPosition(x, y + 125)
  }
}
