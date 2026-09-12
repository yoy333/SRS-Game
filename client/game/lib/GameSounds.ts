import { Loader } from "phaser";

export type SoundManager = Phaser.Sound.NoAudioSoundManager | Phaser.Sound.HTML5AudioSoundManager | Phaser.Sound.WebAudioSoundManager

let sound: SoundManager | undefined
let scene: Phaser.Scene | undefined
export class GameSounds {
  static canPlaySounds = false

  static loadSounds(loadPlugin: Loader.LoaderPlugin) {
    loadPlugin.setPath('sounds')
    loadPlugin.audio('draw_card', 'card_draw_1.ogg')
    loadPlugin.audio('click', 'Minimalist1.ogg')
    loadPlugin.audio('double_click', 'Minimalist12.ogg')
    loadPlugin.audio('place', 'Minimalist8.ogg')
    loadPlugin.audio('capture_piece', 'kick.ogg')
    loadPlugin.audio('end_turn', 'toggle_on.ogg')
    loadPlugin.setPath()
  }

  static initSound(myScene: Phaser.Scene) {
    scene = myScene
    sound = myScene.sound

  }

  static drawCard() {
    if (scene!.game.hasFocus)
      sound!.play('draw_card')
  }

  static click() {
    if (scene!.game.hasFocus)
      sound!.play('click')
  }

  static doubleClick() {
    if (scene!.game.hasFocus)
      sound!.play('double_click')
  }

  static place() {
    if (scene!.game.hasFocus)
      sound!.play('place')
  }

  static capturePiece() {
    if (scene!.game.hasFocus)
      sound!.play('capture_piece')
  }

  static endTurn() {
    sound!.play('end_turn')
  }
}
