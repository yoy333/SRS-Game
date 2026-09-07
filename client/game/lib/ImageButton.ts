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
    button: GameObjects.Image

    constructor(plugin: visualPlugin, x: number, y: number) {
        super()
        let reps = EndTurnButton.createReps(plugin, x, y)
        if (!(reps[0] instanceof GameObjects.Image))
            throw new Error("Reps for EndTurn not an image as expected")
        this.button = reps[0]

        this.bindInteraction(this.button)
    }
}
