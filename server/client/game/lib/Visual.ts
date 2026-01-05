import { GameObjects } from "phaser"
export type visualRep = Phaser.GameObjects.Sprite | Phaser.GameObjects.Image
export interface Visual{
    reps:Array<visualRep>
    numReps:number
    createReps(addPlugin:GameObjects.GameObjectFactory, x:number, y:number):Array<visualRep>
}