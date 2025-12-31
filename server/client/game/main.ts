//import Phaser from 'phaser'
import {Game} from 'phaser'

import { Boot } from './scenes/Boot.js'
import { GameOver } from './scenes/GameOver.js';
import { Game as MainGame } from './scenes/Game.js';
import { MainMenu } from './scenes/MainMenu.js';
import { Preloader } from './scenes/Preloader.js';

import { initiateDiscordSDK, discordSdk } from '../utils/discordSdk';

initiateDiscordSDK();

var config : Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 800,
  height: 600,
  scene: [
        Boot,
        Preloader,
        MainMenu,
        MainGame,
        GameOver
    ]
};
var game = new Game(config);
