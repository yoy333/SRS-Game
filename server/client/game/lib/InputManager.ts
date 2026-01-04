import { Input } from "phaser"
import {Input as InputProtocol} from '../../../common/SocketProtocols'

type keysPlugin = Input.InputPlugin



export class InputManager{
    cursors?:Phaser.Types.Input.Keyboard.CursorKeys
    leftKeyPressed = false
    rightKeyPressed = false
    upKeyPressed = false

    constructor(input:keysPlugin){
        if(!input.keyboard)
            throw new Error("no keyboard detected")

        this.cursors = input.keyboard.createCursorKeys();

        // this.leftKeyPressed = false;
        // this.rightKeyPressed = false;
        // this.upKeyPressed = false;
    }

    getInputs():InputProtocol{
        if(!this.cursors)
            throw new Error("no cursors")

        if (this.cursors.left.isDown) {
            this.leftKeyPressed = true;
        } else if (this.cursors.right.isDown) {
            this.rightKeyPressed = true;
        } else {
            this.leftKeyPressed = false;
            this.rightKeyPressed = false;
        }
        if (this.cursors.up.isDown) {
            this.upKeyPressed = true;
        } else {
            this.upKeyPressed = false;
        }

        return {
            left: this.leftKeyPressed,
            right: this.rightKeyPressed,
            up: this.upKeyPressed
        }
    }

    didInputChange():boolean{
        return true;
        //if(left !== this.leftKeyPressed || right !== this.rightKeyPressed || up !== this.upKeyPressed)
    }
}