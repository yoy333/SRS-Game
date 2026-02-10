import { GameObjects, Tilemaps } from "phaser"
export type visualPlugin = GameObjects.GameObjectFactory | GameObjects.GameObjectCreator
export interface Visual<T>{
    reps:Array<T>
    numReps:number
    createReps(plugin:visualPlugin, x:number, y:number):Array<T>
}