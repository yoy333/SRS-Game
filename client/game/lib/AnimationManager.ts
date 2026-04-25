import { GameObjects } from "phaser"

type Ref = GameObjects.Sprite | GameObjects.Image
type AnimationRef = [Ref, number]
type size = [number, number]

abstract class AnimationLoop {
  animationRefs: AnimationRef[] = []

  addPiece(ref: Ref, ...args: any[]): void {
    this.animationRefs.push([ref, 1])
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
        this.animationRefs.splice(index, 1)
      } else
        this.animationRefs[index][1]++
    })
  }
}

class SpawnAnimationLoop extends AnimationLoop {
  totalFrames = 5

  private originalScalesSpawning: size[] = []
  firstLoop(ref: Ref, index: number): void {
    this.originalScalesSpawning[index] = [ref.scaleX, ref.scaleY]
  }

  loop(ref: Ref, index: number, frame: number): void {
    let ogScaleX = this.originalScalesSpawning[index][0]
    let ogScaleY = this.originalScalesSpawning[index][1]

    let percentDone = frame / this.totalFrames
    ref.setScale(percentDone * ogScaleX, percentDone * ogScaleY)
  }

  lastLoop(ref: Ref, index: number): void {
    let ogScaleX = this.originalScalesSpawning[index][0]
    let ogScaleY = this.originalScalesSpawning[index][1]

    ref.setScale(ogScaleX, ogScaleY)
    this.originalScalesSpawning.splice(index, 1)
    return;
  }
}

type coords = [number, number]

class MoveAnimationLoop extends AnimationLoop {
  totalFrames: number = 5

  endCoords: coords[] = []

  addPiece(ref: Ref, endX: number, endY: number): void {
    super.addPiece(ref)
    this.endCoords.push([endX, endY])
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
  constructor() {
    this.spawnAnimationLoop = new SpawnAnimationLoop()
    this.moveAnimationLoop = new MoveAnimationLoop()
  }

  addSpawnAnim(piece: Ref) {
    this.spawnAnimationLoop.addPiece(piece)
  }

  addMoveAnim(piece: Ref, endX: number, endY: number) {
    this.moveAnimationLoop.addPiece(piece, endX, endY)
  }

  update() {
    this.spawnAnimationLoop.update()
    this.moveAnimationLoop.update()
  }
}

export const AnimationManager = new AM()
