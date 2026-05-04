import { GameObjects } from "phaser"

export abstract class Button {
    abstract button?: GameObjects.Image | GameObjects.Sprite

    onClick?: () => void
    createInteraction() {
        if (!this.button)
            console.warn("no button but trying to create interactivity")
        this.button?.setInteractive().on('pointerdown', () => {
            if (this.onClick)
                this.onClick()
        })
    }

    stopInteraction() {
        this.button?.removeInteractive()
    }
}
