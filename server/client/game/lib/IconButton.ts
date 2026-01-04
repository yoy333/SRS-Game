import {Visual, visualRep} from './Visual'
import{GameObjects} from 'phaser'
export class IconButton implements Visual{
    background: visualRep
    rep: visualRep
    constructor(addPlugin: GameObjects.GameObjectFactory, x: number, y: number){
        [this.background, this.rep] = this.createReps(addPlugin, x, y)
    }

    createReps(addPlugin: GameObjects.GameObjectFactory, x: number, y: number){
        let background = addPlugin.sprite(x, y, 'buttons', 3).setScale(2.5)
        let rep = addPlugin.image(384, 48, 'swordIcon')
        return [background, rep]
    }

    setCallback(onClick:()=>void){
        this.rep.setInteractive();
        this.rep.on('pointerdown', onClick)
    }
}