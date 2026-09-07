import { GameObjects } from "phaser"


export class Button {
    button?: GameObjects.GameObject

    onClick?: () => void
    bindInteraction(button: GameObjects.GameObject) {
        this.button = button
        button.setInteractive().on('pointerdown', () => {
            if (this.onClick)
                this.onClick()
        })
    }

    unbindInteraction() {
        if (!this.button)
            throw new Error("no bound buttont to unbind")
        this.button.removeInteractive()
    }
}
