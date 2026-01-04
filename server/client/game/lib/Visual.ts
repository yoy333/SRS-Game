import { GameObjects } from "phaser"
export type visualRep = Phaser.GameObjects.Sprite | Phaser.GameObjects.Image
export interface Visual{
    rep:visualRep
    createReps(addPlugin:GameObjects.GameObjectFactory, x:number, y:number):Array<visualRep>
}