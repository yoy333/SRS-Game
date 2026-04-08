// import { GameObjects } from "phaser";
// import { Visual, visualPlugin } from "./Visual";
//
// export class Border{
//     constructor(addPlugin:GameObjects.GameObjectFactory, xBounds:[number, number], yBounds:[number, number]){
//         const scale = 1/12
//         let graphics = addPlugin.graphics()
//         let borderWidth = 1
//         graphics.lineStyle(borderWidth, 0x555555, 1)
//         for(let i = 0; i<12; i++){
//             let x = (1024*scale+borderWidth)*i
//             let tile = addPlugin.sprite(x, yBounds[0], 'background_tiles', 2)
//             tile.scale = scale
//             tile.setOrigin(0,0)
//
//             graphics.strokeRect(tile.getTopLeft().x, tile.getTopCenter().y, tile.width*tile.scale, tile.height*tile.scale)
//         }
//     }
// }
