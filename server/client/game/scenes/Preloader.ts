import { Scene } from 'phaser';
import { DefaultPiece } from '../../../common/Piece';
import { Board } from '../../../common/Board';
import { Piece } from '../../../common/Piece';
import { IconButton } from '../lib/IconButton';

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

        Board.loadReps(this.load)
        Piece.loadReps(this.load)
        IconButton.loadReps(this.load)
    }

    create ()
    {
        this.scene.start('MainMenu');
    }
}
