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
            
        }else if(this.selected === DefaultPiece.key && board.lookup[y][x]==null){
            board.spawnPiece(DefaultPiece, addPlugin, x, y)
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