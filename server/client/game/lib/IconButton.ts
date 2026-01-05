import {Visual, visualRep} from './Visual'
import{GameObjects} from 'phaser'
export class IconButton implements Visual{
    reps:Array<visualRep>
    numReps: number = 2
    constructor(addPlugin: GameObjects.GameObjectFactory, x: number, y: number){
        this.reps = this.createReps(addPlugin, x, y)
    }

    createReps(addPlugin: GameObjects.GameObjectFactory, x: number, y: number){
        let background = addPlugin.sprite(x, y, 'buttons', 3).setScale(2.5)
        let icon = addPlugin.image(384, 48, 'swordIcon')
        return [icon, background]
    }

    setCallback(onClick:()=>void){
        this.reps[0].setInteractive();
        this.reps[0].on('pointerdown', onClick)
    }
}