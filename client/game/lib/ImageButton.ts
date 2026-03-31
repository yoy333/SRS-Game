import { GameObjects, Loader } from "phaser";
import { Visual, visualPlugin } from "./Visual";
import { Button } from "./Button";

export class ImageButton extends Button implements Visual<GameObjects.Image>{
    numReps: number = 1;
    reps: GameObjects.Image[] = [];
    key: string;


    constructor(addPlugin:GameObjects.GameObjectFactory, x:number, y:number, key:string){
        super()
        this.key = key;
        this.reps = this.createReps(addPlugin, x, y)
        this.createInteraction()
    }

    createReps(addPlugin: GameObjects.GameObjectFactory, x: number, y: number): GameObjects.Image[] {
        let rep = addPlugin.image(x, y, this.key)
        return [rep]
    }
}

export class EndTurnButton extends ImageButton{
    static key = 'endTurnButton'

    constructor(addPlugin:GameObjects.GameObjectFactory, x:number, y:number){
        super(addPlugin, x, y, EndTurnButton.key)
    }

    createReps(addPlugin: GameObjects.GameObjectFactory, x: number, y: number): GameObjects.Image[] {
        let [rep] = super.createReps(addPlugin, x, y)
        rep.setScale(1/12, 1/12)
        return [rep]
    }

    static loadReps(loadPlugin: Loader.LoaderPlugin){
        loadPlugin.image('endTurnButton', 'EndTurnButton_v02.png')
    }
}