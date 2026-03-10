import { InputManager } from './InputManager'
import {Visual} from './Visual'
import{GameObjects, Loader} from 'phaser'
import { Piece, PieceKey } from '@common/Piece.mjs'
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
        const scale = 3/4
        let background = addPlugin.sprite(x, y, 'cards', 0).setScale(scale)
        //let icon = addPlugin.sprite(x, y, this.pieceKey, 0)//.setZ(1)
        let pieceClass = Piece.classFromKey(this.pieceKey)

        let icon = pieceClass.createCard(addPlugin, x, y)[0]
        if(icon)
            icon.setScale(scale)
        if(!icon)
            icon = pieceClass.createRep(addPlugin, x, y)[0]


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

    stopInteraction(){
        this.reps[0].removeInteractive()
    }

    updateIcon(addPlugin:GameObjects.GameObjectFactory, key:PieceKey){
        this.pieceKey = key

        let oldRep = this.reps[0]
        let x = oldRep.x
        let y = oldRep.y
        // create icon where the old one was
        let icon = Piece.classFromKey(this.pieceKey).createRep(addPlugin, x, y)[0]
        oldRep.destroy(true)
        this.reps[0] = icon
    }
}