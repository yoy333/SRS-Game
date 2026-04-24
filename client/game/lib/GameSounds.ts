import { Loader } from "phaser";

export type SoundManager = Phaser.Sound.NoAudioSoundManager | Phaser.Sound.HTML5AudioSoundManager | Phaser.Sound.WebAudioSoundManager

let sound: SoundManager | undefined
export class GameSounds {
  static canPlaySounds = false

  static loadSounds(loadPlugin: Loader.LoaderPlugin) {
    loadPlugin.setPath('sounds')
    loadPlugin.audio('draw_card', 'card_draw_1.ogg')
    loadPlugin.audio('click', 'Minimalist1.ogg')
    loadPlugin.audio('double_click', 'Minimalist12.ogg')
    loadPlugin.audio('place', 'Minimalist8.ogg')
    loadPlugin.audio('capture_piece', 'kick.ogg')
    loadPlugin.setPath()

  }

  static initSound(soundManager: SoundManager) {
    sound = soundManager
  }

  static drawCard() {
    sound!.play('draw_card')
  }

  static click() {
    sound!.play('click')
  }

  static doubleClick() {
    sound!.play('double_click')
  }

  static place() {
    sound!.play('place')
  }

  static capturePiece() {
    sound!.play('capture_piece')
  }
}
