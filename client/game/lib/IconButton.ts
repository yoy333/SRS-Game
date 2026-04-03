import { InputManager } from './InputManager'
import { Visual } from './Visual'
import { GameObjects, Loader } from 'phaser'
import { Piece, PieceKey, PieceType } from '@common/Piece.mjs'
import { pieceUtils } from '@common/pieceRegistery.mjs'
type spriteOrImage = GameObjects.Sprite | GameObjects.Image
export class IconButton implements Visual<spriteOrImage> {
    reps: Array<spriteOrImage>
    numReps: number = 3
    //dragable: GameObjects.Image
    pieceKey: string

    constructor(addPlugin: GameObjects.GameObjectFactory, inputManager: InputManager, x: number, y: number, key: string) {
        //this.dragable = this.reps[2]
        this.pieceKey = key
        this.reps = this.createReps(addPlugin, x, y)
        this.createInteraction(inputManager)
    }

    static scale = 3 / 4

    createReps(addPlugin: GameObjects.GameObjectFactory, x: number, y: number): spriteOrImage[] {
        let background = addPlugin.sprite(x, y, 'cards', 0).setScale(IconButton.scale)
        //let icon = addPlugin.sprite(x, y, this.pieceKey, 0)//.setZ(1)
        let pieceClass = pieceUtils.classFromKey(this.pieceKey)

        let icon = this.tryUseCard(addPlugin, pieceClass, x, y)

        return [icon, background]
    }

    tryUseCard(addPlugin: GameObjects.GameObjectFactory, pieceClass: PieceType, x: number, y: number): spriteOrImage {
        let icon = pieceClass.createCard(addPlugin, x, y)[0]
        if (icon)
            icon.setScale(IconButton.scale)
        if (!icon)
            icon = pieceClass.createRep(addPlugin, x, y)[0]
        return icon
    }

    static loadReps(loadPlugin: Loader.LoaderPlugin) {
        // loadPlugin.spritesheet('buttons', 'ClassicalButtons.png', {
        //     frameWidth:16,
        //     frameHeight: 16
        // })
        loadPlugin.spritesheet('cards', 'V1_Cards.png', {
            frameWidth: 256,
            frameHeight: 256,
            margin: 0,
        })
    }

    createInteraction(inputManager: InputManager) {
        this.reps[0].setInteractive()
        this.reps[0].on('pointerdown', () => {
            inputManager.selectForSpawn(pieceUtils.classFromKey(this.pieceKey));
        })
    }

    stopInteraction() {
        this.reps[0].removeInteractive()
    }

    updateIcon(addPlugin: GameObjects.GameObjectFactory, key: PieceKey) {
        this.pieceKey = key

        let oldRep = this.reps[0]
        let x = oldRep.x
        let y = oldRep.y
        // create icon where the old one was
        let pieceClass = pieceUtils.classFromKey(this.pieceKey)
        let icon = this.tryUseCard(addPlugin, pieceClass, x, y)
        oldRep.destroy(true)
        this.reps[0] = icon
    }
}
