import { GameObjects, Loader } from "phaser";
import { Rep, VisualMixin } from "./Visual";

// TODO turn into object literals
export class Drop implements Rep<GameObjects.Image> {
    createRep(plugin: GameObjects.GameObjectFactory, x: number, y: number): GameObjects.Image {
        let drop = plugin.image(x, y, 'ichor_drop')
        drop.setScale(1 / 10)
        return drop
    }

    loadRep(loadPlugin: Loader.LoaderPlugin) {
        loadPlugin.image('ichor_drop', 'ichor_drop_v01.png')
    }
}

class Text implements Rep<GameObjects.Sprite> {
    createRep(plugin: GameObjects.GameObjectFactory, x: number, y: number): GameObjects.Sprite {
        let text = plugin.sprite(x, y, 'text_white', 0)
        text.setScale(1 / 10)
        text.setOrigin(0.45, 0.45)
        return text
    }

    loadRep(loadPlugin: Loader.LoaderPlugin) {
        loadPlugin.spritesheet('text_white', 'text_white_v01.png', {
            frameWidth: 216,
            frameHeight: 1620
        })
    }
}

const visualMixin = VisualMixin(Object, [new Drop(), new Text])
export class IchorDisplay extends visualMixin {
    drop?: GameObjects.Image
    text?: GameObjects.Sprite

    ichor: number = 0;

    constructor() {
        super()
    }

    initReps(plugin: GameObjects.GameObjectFactory, x: number, y: number): void {
        [this.drop, this.text] = IchorDisplay.createReps(plugin, x, y)
    }

    updateIchor(ichor: number) {
        this.ichor = ichor;
        this.text?.setFrame(ichor)
    }
}
