import { InputManager } from './InputManager'
import {Visual, visualRep} from './Visual'
import{Game, GameObjects, Input} from 'phaser'
type spriteOrImage = GameObjects.Sprite | GameObjects.Image
export class IconButton implements Visual<spriteOrImage>{
    reps:Array<spriteOrImage>
    numReps: number = 3
    //dragable: GameObjects.Image
    pieceKey: string

    constructor(addPlugin: GameObjects.GameObjectFactory, inputManager:InputManager, x: number, y: number, key:string){
        this.reps = this.createReps(addPlugin, x, y)
        //this.dragable = this.reps[2]
        this.pieceKey = key
        this.createReps(addPlugin, x, y)
        this.createInteraction(inputManager)
    }


    createReps(addPlugin: GameObjects.GameObjectFactory, x: number, y: number){
        let background = addPlugin.sprite(x, y, 'buttons', 3).setScale(2.5)
        let icon = addPlugin.image(x, y, this.pieceKey).setZ(1)
        //let dragable = addPlugin.image(x, y, this.pieceKey).setVisible(false).setZ(-1)
        // icon.setInteractive({dragable:true})
        // icon.on('drag', (pointer:any, x:number, y:number)=>{
        //     console.log("start drag")
        //     //dragable.setVisible(true)
        //     dragable.setPosition(x, y)
        // })
        // icon.on('dragend', ()=>{
        //     console.log("end drag")
        //     //dragable.setVisible(false)
        //     dragable.setPosition(x,y)
        // })
        return [icon, background]//, dragable]
    }

    createInteraction(inputManager:InputManager){
        this.reps[0].setInteractive()
        this.reps[0].on('pointerdown', ()=>{
            inputManager.selected = this.pieceKey;
        })
    }

    setCallback(onClick:()=>void){
        this.reps[0].setInteractive();
        this.reps[0].on('pointerdown', onClick)
    }


}