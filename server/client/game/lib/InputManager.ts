import { Input } from "phaser"
//import {Input as InputProtocol} from '../../../common/SocketProtocols'
import { GameObjects } from "phaser";
import { Board } from "../../../common/Board";
import {Piece, DefaultPiece } from "../../../common/Piece";


export class InputManager{
    selected:string|Piece = "";

    constructor(){

    }

    proccessClick(socket:SocketIOClient.Socket, addPlugin: GameObjects.GameObjectFactory, board:Board, x:number, y:number){
        if(this.selected===""){
            
        }else if(this.selected === "swordIcon" && board.lookup[y][x]==null){
            board.spawnPiece(DefaultPiece, addPlugin, x, y)
            console.log(DefaultPiece.key)
            socket.emit('spawn', [DefaultPiece.key, x, y])
            return;
        }else if(this.selected instanceof Piece){
            let moveCoords = [this.selected.coordX, this.selected.coordY, x, y] as const
            if(board.canMovePiece(...moveCoords)){
                board.movePiece(...moveCoords)
                socket.emit('move', moveCoords)
                this.selected = ""
                return;
            }else{
                console.log("illegal move")
            }
        }
        let selectedPiece = board.lookup[y][x]
        if(selectedPiece != null){
            this.selected = selectedPiece
            return;
        }
    }
}

/*

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
}*/