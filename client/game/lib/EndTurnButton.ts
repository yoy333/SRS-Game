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

class EndTurnButtonInactiveRep implements Rep<GameObjects.Image> {
    static key = 'endTurnButtonInactive'
    constructor() {

    }

    createRep(addPlugin: GameObjects.GameObjectFactory, x: number, y: number): GameObjects.Image {
        let rep = addPlugin.image(x, y, EndTurnButtonInactiveRep.key)
        rep.setScale(1 / 10, 1 / 10)
        return rep
    }

    loadRep(loadPlugin: Loader.LoaderPlugin): void {
        loadPlugin.image(EndTurnButtonInactiveRep.key, 'endTurnButton_v02-inactive.png')
    }
}

const endTurnMixin = VisualMixin(Button, [new EndTurnButtonRep(), new EndTurnButtonInactiveRep()])
export class EndTurnButton extends endTurnMixin {
    button: GameObjects.Image
    inactiveButton: GameObjects.Image

    constructor(plugin: visualPlugin, x: number, y: number) {
        super()
        let reps = EndTurnButton.createReps(plugin, x, y)
        if (!(reps[0] instanceof GameObjects.Image) || !(reps[1] instanceof GameObjects.Image))
            throw new Error("Reps for EndTurn not an image as expected")
        this.button = reps[0]
        this.inactiveButton = reps[1]

        this.bindInteraction(this.button)
        this.setActive(true)
    }

    // both images are created, but only the one matching the state is shown
    setActive(active: boolean) {
        this.button.setVisible(active)
        this.inactiveButton.setVisible(!active)

        if (active)
            this.button.setInteractive()
        else
            this.button.removeInteractive()
    }
}
