import { PieceKey, PieceType, pieceTypeRegistery } from "@common/Piece.mjs"

export class Deck{
    static numCards = 15
    drawCards:PieceKey[] = []
    discardedCards:PieceKey[] = []

    constructor(){
        console.log(pieceTypeRegistery)
        for(let i=0; i<5; i++){
            pieceTypeRegistery.forEach((piece: PieceType)=>{
                this.drawCards.push(piece.key)
            })
        }
        console.log(this.drawCards.length)
    }

    shuffle(){
        let currentIndex = this.drawCards.length, randomIndex;

        // While there remain elements to shuffle.
        while (currentIndex !== 0) {
            // Pick a remaining element.
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element using ES6 destructuring.
            [this.drawCards[currentIndex], this.drawCards[randomIndex]] = [
                this.drawCards[randomIndex], this.drawCards[currentIndex]];
        }
    }

    drawCard():PieceKey{
        let piece = this.drawCards.pop()
        // if no more cards left in draw pile, put cards from discard back in hand then draw again.
        if(!piece){
            this.recycle()
            return this.drawCard()
        }
        return piece
    }

    returnCard(card:PieceKey){
        this.discardedCards.push(card)
    }

    recycle(){
        this.drawCards = this.discardedCards
        this.discardedCards = []
        this.shuffle()
    }
}