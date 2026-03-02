import { InputManager } from './InputManager'
import {Visual} from './Visual'
import{GameObjects, Loader} from 'phaser'
import { Piece } from '@common/Piece.mjs'
type spriteOrImage = GameObjects.Sprite | GameObjects.Image
export class IconButton implements Visual<spriteOrImage>{
    reps:Array<spriteOrImage>
    numReps: number = 3
    //dragable: GameObjects.Image
    pieceKey: string

    constructor(addPlugin: GameObjects.GameObjectFactory, inputManager:InputManager, x: number, y: number, key:string){
        //this.dragable = this.reps[2]
        this.pieceKey = key
        this.reps = this.createReps(addPlugin, x, y)
        this.createInteraction(inputManager)
    }


    createReps(addPlugin: GameObjects.GameObjectFactory, x: number, y: number):spriteOrImage[]{
        let background = addPlugin.sprite(x, y, 'cards', 0).setScale(2/3)
        //let icon = addPlugin.sprite(x, y, this.pieceKey, 0)//.setZ(1)

        let icon = Piece.classFromKey(this.pieceKey).createRep(addPlugin, x, y)[0]

        return [icon, background]
    }

    static loadReps(loadPlugin:Loader.LoaderPlugin){
        // loadPlugin.spritesheet('buttons', 'ClassicalButtons.png', {
        //     frameWidth:16,
        //     frameHeight: 16
        // })
        loadPlugin.spritesheet('cards', 'V1_Cards.png', {
            frameWidth:256,
            frameHeight:256,
            margin: 0,
        })
    }

    createInteraction(inputManager:InputManager){
        this.reps[0].setInteractive()
        this.reps[0].on('pointerdown', ()=>{
            inputManager.selectForSpawn(Piece.classFromKey(this.pieceKey));
        })
    }
}