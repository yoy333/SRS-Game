import { GameObjects, Loader } from "phaser"
export type visualPlugin = GameObjects.GameObjectFactory | GameObjects.GameObjectCreator

export type Rep<T> = {
    createRep(plugin: visualPlugin, x: number, y: number): T
    loadRep(loadPlugin: Loader.LoaderPlugin): void
}


type Constructor = new (...args: any[]) => {};
type AbstractConstructor = abstract new (...args: any[]) => {};
export function VisualMixin<TBase extends Constructor | AbstractConstructor>(Base: TBase, reps: Rep<any>[]) {
    abstract class Visual extends Base {
        constructor(...args: any[]) {
            super(...args)
        }

        static reps: Rep<any>[] = reps

        static createReps(plugin: visualPlugin, x: number, y: number): any[] {
            return Visual.reps.map((rep: Rep<any>) => {
                return rep.createRep(plugin, x, y)
            })
        }

        static loadReps(loadPlugin: Loader.LoaderPlugin): void {
            Visual.reps.forEach((rep: Rep<any>) => {
                rep.loadRep(loadPlugin)
            })
        }

        abstract initReps(plugin: visualPlugin, x: number, y: number): void
    }
    return Visual
}

export type VisualConstructor = ReturnType<typeof VisualMixin>
export type VisualInstance = InstanceType<VisualConstructor>
