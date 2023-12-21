class BlockGenerator{
    constructor(que_length){
        this.blocks = []
        this.que_length = que_length

        for(let i = 0;i < que_length;i++){
            this.generateNew()
        }
        console.log(this.blocks)
    }
    getNext(){
        this.generateNew()
        return this.blocks.pop().block
    }
    generateNew(){
        let nw = new Block(new Point2D(0,0))

        let selected = Random.choice(BLOCK_TEMPLATES)

        while(this.blocks[0] != undefined && selected == this.blocks[0].template){
            selected = Random.choice(BLOCK_TEMPLATES)
        }
            //console.log(selected)
        nw.setSegmentsFromTemplate(selected)

        this.blocks.unshift({
            block:nw,
            template:selected
        })
    }
}