export abstract class Button{
    reps: any[] = []

    onClick?:()=>void
    createInteraction(){
        this.reps[0].setInteractive().on('pointerdown', ()=>{
            if(this.onClick)
                this.onClick()
        })
    }
}