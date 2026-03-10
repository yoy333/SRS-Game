//import Phaser from 'phaser'
import {Game} from 'phaser'

import { Boot } from './scenes/Boot.js'
import { GameOver } from './scenes/GameOver.js';
import { Game as MainGame } from './scenes/Game.js';
import { MainMenu } from './scenes/MainMenu.js';
import { Preloader } from './scenes/Preloader.js';

import { initiateDiscordSDK, discordSdk } from '../utils/discordSdk';

initiateDiscordSDK();

async function sendAuth(){
    await discordSdk.ready()

    console.log("discord sdk ready")

    const { code } = await discordSdk.commands.authorize({
        client_id: import.meta.env.VITE_CLIENT_ID,
        response_type: 'code',
        state: '',
        prompt: 'none',
        scope: [
        // Activities will launch through app commands and interactions of user-installable apps.
        // https://discord.com/developers/docs/tutorials/developing-a-user-installable-app#configuring-default-install-settings-adding-default-install-settings
        'applications.commands',

        // "applications.builds.upload",
        // "applications.builds.read",
        // "applications.store.update",
        // "applications.entitlements",
        // "bot",
        'identify',
        // "connections",
        // "email",
        // "gdm.join",
        'guilds',
        // "guilds.join",
        'guilds.members.read',
        // "messages.read",
        // "relationships.read",
        // 'rpc.activities.write',
        // "rpc.notifications.read",
        // "rpc.voice.write",
        'rpc.voice.read',
        // "webhook.incoming",
        ]
    })

    console.log(code)
}

// sendAuth()

const RATIO = 2/3

var config : Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'viewport',
  width: Math.round(1920*RATIO),
  height: Math.round(1080*RATIO),
  autoCenter: Phaser.Scale.CENTER_BOTH,
  backgroundColor:"#fff7f1",
  scene: [
        Boot,
        Preloader,
        MainMenu,
        MainGame,
        GameOver
    ]
};
var game = new Game(config);
