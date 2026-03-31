import { Game, GameObjects, Loader } from "phaser";
import { Visual, visualPlugin } from "./Visual";
import { StyleGuide } from "./StyleGuides";

type spriteOrImage = GameObjects.Image|GameObjects.Sprite

export class IchorDisplay implements Visual<spriteOrImage>{
    reps: spriteOrImage[]
    numReps: number = 2;
    ichor:number = 0;

    constructor(){
        this.reps = []
        
    }

    createReps(plugin: GameObjects.GameObjectFactory, x: number, y: number): spriteOrImage[] {
        // this.reps[0] = 
        //     plugin.text(0, 650, 'Ichor: X', { 
        //         fontFamily: StyleGuide.textFontFamily,
        //         fontSize: "50px",
        //         color: StyleGuide.textFontColor
        //     })
        let drop = plugin.image(x, y, 'ichor_drop')
        drop.setScale(1/10)
        this.reps[0] = drop

        let text = plugin.sprite(x, y, 'text_white', this.ichor)
        text.setScale(1/10)
        text.setOrigin(0.45, 0.45)
        this.reps[1] = text

        return this.reps
    }

    static loadReps(loadPlugin: Loader.LoaderPlugin){
        loadPlugin.image('ichor_drop', 'ichor_drop_v01.png')
        loadPlugin.spritesheet('text_white', 'text_white_v01.png', {
            frameWidth: 216,
            frameHeight: 1620
        })
        
    }

    updateIchor(ichor:number){
        this.ichor = ichor;
        this.reps[1].setFrame(ichor)
    }
}