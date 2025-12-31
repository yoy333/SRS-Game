import Phaser, { Physics } from 'phaser'
import { Server as SocketIOServer } from 'socket.io';
import {Board} from './scenes/board'

// defined in index.js
declare global {
  interface Window {
    gameLoaded: () => void;
    io: SocketIOServer;
  }
}

//const io = new SocketIOServer(window.server);
const config : Phaser.Types.Core.GameConfig = {
  autoFocus: false,
  type: Phaser.HEADLESS,
  parent: 'phaser-example',
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: {x:0, y: 0}
    }
  },
  scene: [
    Board
  ]
};

const game = new Phaser.Game(config);

window.gameLoaded();