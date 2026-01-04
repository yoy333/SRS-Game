import { Scene } from 'phaser';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress: number) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload ()
    {
        this.load.setPath('phaserAssets');

        //this.load.image('ship', 'spaceShips_001.png');

        //this.load.image('otherPlayer', 'enemyBlack5.png');

        // load the PNG files
        this.load.image('Grass', 'tilemap/Grass.png')
        this.load.image('Dirt', 'tilemap/Tilled_Dirt_v2.png')
        this.load.image('swordIcon', 'fb155.png')
        this.load.spritesheet('buttons', 'ClassicalButtons.png', {
            frameWidth:16,
            frameHeight: 16
        })

        // load the JSON file
        this.load.tilemapTiledJSON('tilemap', 'tilemap/DemoBoard.json')
    }

    create ()
    {
        this.scene.start('MainMenu');
    }
}
