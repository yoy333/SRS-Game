import { GameObjects } from "phaser";
import { Visual } from "./Visual";
import { StyleGuide } from "./StyleGuides";

export class Button implements Visual<GameObjects.Text>{
    reps:GameObjects.Text[] = []
    numReps:number = 1

    constructor(addPlugin:GameObjects.GameObjectFactory, x:number, y:number, text?:string){
        this.createReps(addPlugin, x, y, text)
        this.createInteraction()
    }

    createReps(addPlugin:GameObjects.GameObjectFactory, x:number, y:number, text?:string):GameObjects.Text[]{
        if(!text)
            text=""

        this.reps[0] = addPlugin.text(x, y, text, {
            fontFamily:StyleGuide.textFontFamily,
            fontSize:"30px"
        })
        
        return this.reps;
    }

    onClick?:()=>void
    createInteraction(){
        this.reps[0].setInteractive().on('pointerdown', ()=>{
            if(this.onClick)
                this.onClick()
        })
    }
}