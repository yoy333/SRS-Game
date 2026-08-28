import { GameObjects, Loader } from "phaser";
import { Button } from "./Button";
import { Rep, VisualMixin, visualPlugin } from "./Visual";

class EndTurnButtonRep implements Rep<GameObjects.Image> {
    static key = 'endTurnButton'
    constructor() {

    }

    createRep(addPlugin: GameObjects.GameObjectFactory, x: number, y: number): GameObjects.Image {
        let rep = addPlugin.image(x, y, EndTurnButtonRep.key)
        rep.setScale(1 / 10, 1 / 10)
        return rep
    }

    loadRep(loadPlugin: Loader.LoaderPlugin): void {
        loadPlugin.image(EndTurnButtonRep.key, 'EndTurnButton_v02.png')
    }
}

const endTurnMixin = VisualMixin(Button, [new EndTurnButtonRep()])
export class EndTurnButton extends endTurnMixin {
    button?: GameObjects.Image

    constructor() {
        super()
    }

    initReps(plugin: visualPlugin, x: number, y: number): void {
        [this.button] = (this.constructor as typeof endTurnMixin).createReps(plugin, x, y)
        this.createInteraction()
    }
}
