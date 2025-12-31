import { Scene } from 'phaser';

export class GameOver extends Scene
{

    constructor ()
    {
        super('GameOver');
    }

    create ()
    {
        let gameover_text = this.add.text(512, 384, 'Game Over', {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        });
        gameover_text.setOrigin(0.5);

        this.input.once('pointerdown', () => {

            this.scene.start('MainMenu');

        });
    }
}
