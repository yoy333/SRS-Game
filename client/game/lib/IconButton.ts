import { GameObjects, Loader } from 'phaser'
import { PieceKey, PieceType } from '@common/Piece.mjs'
import { pieceUtils } from '@common/pieceRegistery.mjs'
import { Rep, VisualMixin } from './Visual'
import { DefaultPiece } from '@common/Pieces/DefaultPiece.mjs'
import { Button } from './Button'

type spriteOrImage = GameObjects.Sprite | GameObjects.Image

const IconButtonScale = 3 / 4

class IconButtonBackground implements Rep<spriteOrImage> {
    createRep(addPlugin: GameObjects.GameObjectFactory, x: number, y: number): spriteOrImage {
        let background = addPlugin.sprite(x, y, 'cards', 0).setScale(IconButtonScale)
        return background
    }

    loadRep(loadPlugin: Loader.LoaderPlugin): void {
        loadPlugin.spritesheet('cards', 'V1_Cards.png', {
            frameWidth: 256,
            frameHeight: 256,
            margin: 0,
        })
    }
}

const visualMixin = VisualMixin(Object, [new IconButtonBackground()])
export class IconButton extends visualMixin {
    pieceKey: string

    background: GameObjects.Sprite
    icon: GameObjects.Image
    button: Button

    constructor(addPlugin: GameObjects.GameObjectFactory, x: number, y: number, key: string) {
        super()

        this.pieceKey = key
        let reps = this.initReps(addPlugin, x, y)
        this.background = reps[0]
        this.icon = reps[1]

        // this.reps = this.createReps(addPlugin, x, y)
        this.button = new Button()
        this.button.bindInteraction(this.icon)
    }

    initReps(addPlugin: GameObjects.GameObjectFactory, x: number, y: number): [GameObjects.Sprite, GameObjects.Image] {
        let pieceClass = pieceUtils.classFromKey(this.pieceKey)
        let reps = IconButton.createReps(addPlugin, x, y, pieceClass)

        if (!(reps[0] instanceof GameObjects.Sprite))
            throw new Error("something very wrong")

        return reps
    }

    static createReps(addPlugin: GameObjects.GameObjectFactory, x: number, y: number, pieceClass: PieceType = DefaultPiece)
        : [GameObjects.Sprite, GameObjects.Image] {
        let background = IconButton.reps[0].createRep(addPlugin, x, y)

        let icon = IconButton.tryUseCard(addPlugin, pieceClass, x, y)

        return [background, icon]
    }

    static tryUseCard(addPlugin: GameObjects.GameObjectFactory, pieceClass: PieceType, x: number, y: number): spriteOrImage {
        let icon = pieceClass.createCard(addPlugin, x, y)[0]
        if (icon)
            icon.setScale(IconButtonScale)
        if (!icon) {
            const lastIndex = pieceClass.reps.length - 1
            icon = pieceClass.reps[lastIndex].createRep(addPlugin, x, y)
        }
        return icon
    }

    updateIcon(addPlugin: GameObjects.GameObjectFactory, key: PieceKey) {
        this.pieceKey = key

        let oldRep = this.icon
        if (!oldRep) {
            throw new Error("trying to update Icon when not init yet")
        }
        let x = oldRep.x
        let y = oldRep.y
        // create icon where the old one was
        oldRep.destroy(true)

        let pieceClass = pieceUtils.classFromKey(this.pieceKey)
        let icon = IconButton.tryUseCard(addPlugin, pieceClass, x, y)
        this.icon = icon

        this.button.bindInteraction(icon)
    }
}
