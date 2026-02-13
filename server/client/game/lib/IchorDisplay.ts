import { Game, GameObjects } from "phaser";
import { Visual, visualPlugin } from "./Visual";
import { StyleGuide } from "./StyleGuides";

export class IchorDisplay implements Visual<GameObjects.Text>{
    reps: GameObjects.Text[]
    numReps: number = 1;
    ichor:number = 0;

    constructor(){
        this.reps = []
        
    }

    createReps(plugin: GameObjects.GameObjectFactory, x: number, y: number): GameObjects.Text[] {
        this.reps[0] = 
            plugin.text(0, 650, 'Ichor: X', { 
                fontFamily: StyleGuide.textFontFamily,
                fontSize: "50px"
            })
        return this.reps
    }

    updateIchor(ichor:number){
        this.ichor = ichor;
        this.reps[0].setText('Ichor: '+ichor)
    }
}