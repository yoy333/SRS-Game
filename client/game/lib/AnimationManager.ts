import { GameObjects } from "phaser"

type Ref = GameObjects.Sprite | GameObjects.Image | GameObjects.Rectangle
type AnimationRef = [Ref, number]
type size = [number, number]

type PromiseTriplet = {
  promise: Promise<void>,
  resolve: (value: void | PromiseLike<void>) => void
  reject: (reason?: any) => void,
}

abstract class AnimationLoop {
  animationRefs: AnimationRef[] = []
  private animationPromises: PromiseTriplet[] = []

  addPiece(ref: Ref, ...args: any[]): Promise<void> {
    this.animationRefs.push([ref, 1])
    const { promise, resolve, reject } = Promise.withResolvers<void>();
    this.animationPromises.push({
      promise: promise,
      resolve: resolve,
      reject: reject
    })
    return promise
  }

  removePiece(ref: Ref, resolvePromise: boolean = true) {
    let index = this.animationRefs.findIndex(animationRef => {
      return animationRef[0] == ref
    })
    if (index == -1) {
      return;
    }

    if (resolvePromise)
      this.animationPromises[index].resolve()
    else
      1;
    // this.animationPromises[index].reject()
    this.animationRefs.splice(index, 1)
    this.animationPromises.splice(index, 1)
  }

  // if an animation gets canceled use this method to resolve it immediately
  endAnim(ref: Ref) {
    let index = this.animationRefs.findIndex(animationRef => {
      return animationRef[0] == ref
    })
    if (index == -1) {
      return;
    }

    let frame = this.animationRefs[index][1]
    if (frame == 0)
      this.firstLoop(ref, index)
    this.lastLoop(ref, index)
    this.removePiece(ref, false)
  }

  abstract totalFrames: number
  abstract firstLoop(ref: Ref, index: number): void
  abstract loop(ref: Ref, index: number, frame: number): void
  abstract lastLoop(ref: Ref, index: number): void

  update() {
    this.animationRefs.forEach((animationRef: AnimationRef, index: number) => {
      let ref = animationRef[0]
      let frame = animationRef[1]
      if (frame == 1)
        this.firstLoop(ref, index)

      this.loop(ref, index, frame)

      if (frame == this.totalFrames) {
        this.lastLoop(ref, index)
        this.removePiece(ref, true)
      } else
        this.animationRefs[index][1]++
    })
  }
}

class SpawnAnimationLoop extends AnimationLoop {
  totalFrames = 5

  private originalScalesSpawning: size[] = []
  firstLoop(ref: Ref, index: number): void {
    console.log("first loop")
    this.originalScalesSpawning[index] = [ref.scaleX, ref.scaleY]
  }

  loop(ref: Ref, index: number, frame: number): void {
    console.log("loop")
    let ogScaleX = this.originalScalesSpawning[index][0]
    let ogScaleY = this.originalScalesSpawning[index][1]

    let percentDone = frame / this.totalFrames
    ref.setScale(percentDone * ogScaleX, percentDone * ogScaleY)
  }

  lastLoop(ref: Ref, index: number): void {
    console.log("calling lastLoop")
    let ogScaleX = this.originalScalesSpawning[index][0]
    let ogScaleY = this.originalScalesSpawning[index][1]
    console.log(ogScaleX, ogScaleY)

    ref.setScale(ogScaleX, ogScaleY)
    this.originalScalesSpawning.splice(index, 1)
    return;
  }
}

class DeathAnimationLoop extends AnimationLoop {
  totalFrames = 5

  private originalScales: size[] = []
  firstLoop(ref: Ref, index: number): void {
    this.originalScales[index] = [ref.scaleX, ref.scaleY]
  }

  loop(ref: Ref, index: number, frame: number): void {
    // console.log(`frame: ${frame}`)
    let ogScaleX = this.originalScales[index][0]
    let ogScaleY = this.originalScales[index][1]

    let percentSize = 1 - frame / this.totalFrames
    ref.setScale(percentSize * ogScaleX, percentSize * ogScaleY)
  }

  lastLoop(ref: Ref, index: number): void {
    this.originalScales.splice(index, 1)
  }
}

type coords = [number, number]

class MoveAnimationLoop extends AnimationLoop {
  totalFrames: number = 5

  endCoords: coords[] = []

  addPiece(ref: Ref, endX: number, endY: number): Promise<void> {
    let promise = super.addPiece(ref)
    this.endCoords.push([endX, endY])
    return promise
  }

  startCoords: coords[] = []

  firstLoop(ref: Ref, index: number): void {
    this.startCoords[index] = [ref.x, ref.y]
  }

  loop(ref: Ref, index: number, frame: number): void {
    let startX = this.startCoords[index][0]
    let startY = this.startCoords[index][1]
    let endX = this.endCoords[index][0]
    let endY = this.endCoords[index][1]

    let deltaX = endX - startX
    let deltaY = endY - startY

    let percentDone = frame / this.totalFrames

    let renderX = startX + percentDone * deltaX
    let renderY = startY + percentDone * deltaY

    ref.setPosition(renderX, renderY)
  }

  lastLoop(ref: Ref, index: number): void {
    this.endCoords.splice(index, 1)
  }
}

class AM {
  spawnAnimationLoop: SpawnAnimationLoop
  moveAnimationLoop: MoveAnimationLoop
  deathAnimationLoop: DeathAnimationLoop
  constructor() {
    this.spawnAnimationLoop = new SpawnAnimationLoop()
    this.moveAnimationLoop = new MoveAnimationLoop()
    this.deathAnimationLoop = new DeathAnimationLoop()
  }

  addSpawnAnim(piece: Ref) {
    this.clearPreviousAnims(piece)
    return this.spawnAnimationLoop.addPiece(piece)
  }

  addMoveAnim(piece: Ref, endX: number, endY: number) {
    this.clearPreviousAnims(piece)
    return this.moveAnimationLoop.addPiece(piece, endX, endY)
  }

  addDeathAnim(piece: Ref) {
    this.clearPreviousAnims(piece)
    return this.deathAnimationLoop.addPiece(piece)
  }

  clearPreviousAnims(piece: Ref) {
    for (let loop of this.allLoops()) {
      loop.endAnim(piece)
    }
  }

  *allLoops() {
    yield this.spawnAnimationLoop
    yield this.moveAnimationLoop
    yield this.deathAnimationLoop
  }

  update() {
    for (let loop of this.allLoops()) {
      loop.update()
    }
  }
}

export const AnimationManager = new AM()
