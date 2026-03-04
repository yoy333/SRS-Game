import { Game, GameObjects, Tilemaps } from "phaser"
export type visualPlugin = GameObjects.GameObjectFactory | GameObjects.GameObjectCreator
export interface Visual<T>{
    reps:Array<T>
    numReps:number
    createReps(plugin:visualPlugin, x:number, y:number):Array<T>
}

interface MyClassInstance<T> {
  // instance methods/properties here if needed
    reps:Array<T>,
    numReps:number
}

// This interface defines the STATIC side of the class
interface MyClassConstructor<T> {
    new (): MyClassInstance<T>; // Constructor signature
    requiredStaticProp: string; // The required static property
}

//const ValidClass: MyClassConstructor<T> = 
class ValidClass<T> implements MyClassInstance<T> {
  static requiredStaticProp = "some value"; // This is required by MyClassConstructor
  numReps: number = 0;
  reps = []
};
