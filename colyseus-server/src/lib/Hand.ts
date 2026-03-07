import { PieceKey } from "@common/Piece.mjs";
import { Deck } from "./Deck.js"; 
export class Hand{
    static handSize = 3;
    hand:PieceKey[] = []

    constructor(deck:Deck){
        for(let i=0; i<Hand.handSize; i++){
            this.hand.push(deck.drawCard())
        }
    }

    replace(oldCard:PieceKey, newCard:PieceKey){
        let index = this.hand.indexOf(oldCard)
        this.hand[index] = newCard;
    }
}