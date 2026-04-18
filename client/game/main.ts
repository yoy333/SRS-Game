//import Phaser from 'phaser'
import { Game } from 'phaser'

import { Boot } from './scenes/Boot.js'
import { GameOver } from './scenes/GameOver.js';
import { Game as MainGame } from './scenes/Game.js';
import { MainMenu } from './scenes/MainMenu.js';
import { Preloader } from './scenes/Preloader.js';

import { initiateDiscordSDK } from '../utils/discordSdk';

initiateDiscordSDK();

// sendAuth()

const RATIO = 2 / 3
// const MAX_RATIO = 1

var config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: 'viewport',
    // min: {
    width: Math.round(1920 * RATIO),
    height: Math.round(1080 * RATIO),
    // },
    // max: {
    //     width: Math.round(1920 * MAX_RATIO),
    //     height: Math.round(1080 * MAX_RATIO),
    // },
    mode: Phaser.Scale.NONE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    backgroundColor: "#fff7f1",
    scene: [
        Boot,
        Preloader,
        MainMenu,
        MainGame,
        GameOver
    ]
};

let game = new Game(config);

function resizeGame(...args: any[]) {
    // if(window.innerWidth<1400){
    // console.log("applying")
    let idealWidth = 1920
    let idealHeight = 996
    let heightRatio = window.innerHeight / idealHeight
    let widthRatio = window.innerWidth / idealWidth
    let zoom = heightRatio < widthRatio ? heightRatio : widthRatio
    game.scale.setZoom(zoom);
}
resizeGame()

window.onresize = resizeGame
