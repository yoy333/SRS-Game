import { Game, GameObjects, Tilemaps } from "phaser"
export type visualPlugin = GameObjects.GameObjectFactory | GameObjects.GameObjectCreator

export interface Visual<T>{
    numReps:number
    reps:Array<T>
    createReps(plugin:visualPlugin, x:number, y:number):Array<T>
}

