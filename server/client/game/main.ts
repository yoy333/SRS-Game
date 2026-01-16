//import Phaser from 'phaser'
import {Game} from 'phaser'

import { Boot } from './scenes/Boot.js'
import { GameOver } from './scenes/GameOver.js';
import { Game as MainGame } from './scenes/Game.js';
import { MainMenu } from './scenes/MainMenu.js';
import { Preloader } from './scenes/Preloader.js';

import { initiateDiscordSDK, discordSdk } from '../utils/discordSdk';

initiateDiscordSDK();

const RATIO = 3/4

var config : Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'viewport',
  width: Math.round(1920*RATIO),
  height: Math.round(1080*RATIO),
  autoCenter: Phaser.Scale.CENTER_BOTH,
  scene: [
        Boot,
        Preloader,
        MainMenu,
        MainGame,
        GameOver
    ]
};
var game = new Game(config);
