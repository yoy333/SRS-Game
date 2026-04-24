import { Scene } from 'phaser';
import { pieceTypeRegistery } from '@common/pieceRegistery.mjs';
import { Board } from '@common/Board.mjs';
import { IconButton } from '../lib/IconButton';
import { EndTurnButton } from '../lib/ImageButton';
import { IchorDisplay } from '../lib/IchorDisplay';
import { PieceType } from '@common/Piece.mjs';
import { VisualConstructor } from '../lib/Visual';
import { GameSounds, SoundManager } from '../lib/GameSounds';

export class Preloader extends Scene {
    constructor() {
        super('Preloader');
    }

    init() {
        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0x000000);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress: number) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload() {
        this.load.setPath('phaserAssets');

        Board.loadReps(this.load)
        pieceTypeRegistery.forEach((pieceType: VisualConstructor & PieceType) => {
            pieceType.loadReps(this.load)
            pieceType.loadCard(this.load)
        })
        IconButton.loadReps(this.load)

        this.load.spritesheet('background_tiles', 'background_tiles_02.png', {
            frameWidth: 1024,
            frameHeight: 1024,
        })

        IchorDisplay.loadReps(this.load)

        EndTurnButton.loadReps(this.load)

        GameSounds.loadSounds(this.load)
    }

    create() {
        this.scene.start('MainMenu');
    }
}
