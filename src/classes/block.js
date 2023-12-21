class Block{
    constructor(position){
        this.position = position
        this.color = Random.color()
        this.core_segment = new BlockSegment(undefined,new Point2D(0,0),this.color)
    }
    collidesWith(block,offset=new Point2D(0,0)){
        let collides = false

        let chld_this = this.core_segment.getChildren().concat([this.core_segment])
        let chld_frgn = block.core_segment.getChildren().concat([block.core_segment])

        for(let i in chld_this){
            if(collides){
                break
            }

            let block_this = chld_this[i]
            for(let j in chld_frgn){
                let block_frgn = chld_frgn[j]

                if(block_this.collidesWith(block_frgn,this.position.getOffset(offset),block.position)){
                    collides = true
                    break
                }
            }
        }

        return collides
    }
    setSegmentsFromTemplate(segments,element=this.core_segment){
        for(let i in segments){
            let elem = segments[i]
            let direction = elem.direction

            this.setSegmentsFromTemplate(elem.segments,element["add"+direction[0].toUpperCase()+direction.substr(1,direction.length)]())
        }
    }
    draw(ctx,offset=new Point2D(0,0)){
        //let box = this.getBoundingBox()

        //ctx.strokeStyle = "green"
        //ctx.strokeRect(box.x+offset.x,box.y+offset.y,box.width,box.height)

        this.core_segment.draw(ctx, this.position.getOffset(offset))
    }
    drawWire(ctx,offset=new Point2D(0,0)){
        this.core_segment.drawWire(ctx, this.position.getOffset(offset))
    }
    getLowest(){
        let lowest = new Point2D(0,0)

        let chld = this.core_segment.getChildren().concat([this.core_segment])
        for(let i in chld){
            let pos = chld[i].getPosition().getMultiplied(BLOCK_SIZE).getOffset(this.position)
            
            //console.log(this.position)
            lowest = pos.y > lowest.y ? pos : lowest;
        }

        lowest.y += BLOCK_SIZE

        return lowest
    }
    getHighest(){
        let highest = new Point2D(0,canvas.height)

        let chld = this.core_segment.getChildren().concat([this.core_segment])
        for(let i in chld){
            let pos = chld[i].getPosition().getMultiplied(BLOCK_SIZE).getOffset(this.position)
            
            //console.log(this.position)
            highest = pos.y < highest.y ? pos : highest;
        }
        return highest
    }
    getRightest(){
        let rightest = new Point2D(0,0)

        let chld = this.core_segment.getChildren().concat([this.core_segment])
        for(let i in chld){
            let pos = chld[i].getPosition().getMultiplied(BLOCK_SIZE).getOffset(this.position)
            
            //console.log(this.position)
            rightest = pos.x > rightest.x ? pos : rightest;
        }

        rightest.x += BLOCK_SIZE
        //console.log(rightest.x)

        return rightest
    }
    getLeftest(){
        let leftest = new Point2D(canvas.width,0)

        let chld = this.core_segment.getChildren().concat([this.core_segment])
        for(let i in chld){
            let pos = chld[i].getPosition().getMultiplied(BLOCK_SIZE).getOffset(this.position)
            
            //console.log(this.position)
            leftest = pos.x < leftest.x ? pos : leftest;
        }

        //console.log(leftest.x)

        return leftest
    }
    rotate(){
        this.core_segment.shift()
    }
    getBoundingBox(){
        let highest = this.getHighest()
        let lowest = this.getLowest()
        let leftest = this.getLeftest()
        let rightest = this.getRightest()

        return {
            x: leftest.x,
            y: highest.y,
            width: rightest.x - leftest.x,
            height: lowest.y - highest.y
        }
    }
    getCenterOffset(){
        let x = this.position.x - this.getLeftest().x
        let y = this.position.y - this.getHighest().y

        return new Point2D(x,y)
    }
    static drawSegment(ctx, pos){
        ctx.fillRect(pos.x,pos.y, BLOCK_SIZE, BLOCK_SIZE)
        ctx.fillStyle = "rgba(255,255,255,0.2)"
        ctx.fillRect(pos.x+BLOCK_SIZE/8,pos.y+BLOCK_SIZE/8,BLOCK_SIZE-BLOCK_SIZE/2,BLOCK_SIZE-BLOCK_SIZE/2)

        ctx.strokeStyle = "black"
        ctx.strokeRect(pos.x,pos.y, BLOCK_SIZE, BLOCK_SIZE)
    }
    static drawWireSegment(ctx,pos){
        ctx.shadowBlur = 10;

        ctx.strokeStyle = "black"
        ctx.strokeRect(pos.x,pos.y, BLOCK_SIZE, BLOCK_SIZE)
        ctx.shadowBlur = 0;
    }
}