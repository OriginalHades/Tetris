class BlockSegment{
    constructor(parent,offset,color="#000000"){
        this.offset = offset
        this.parent = parent
        this.segments = {
            top: undefined,
            right: undefined,
            bottom: undefined,
            left: undefined
        }
        this.rotation_sheet = {
            top: "right",
            right: "bottom",
            bottom: "left",
            left: "top"
        }
        this.position_sheet = {
            top: new Point2D(0,-1),
            right: new Point2D(1,0),
            bottom: new Point2D(0,1),
            left: new Point2D(-1,0)
        }
        this.color = color
    }
    getPosition(){
        return this.parent == undefined ? this.offset : this.offset.getOffset(this.parent.getPosition())
    }
    addLeft(){
        this.segments.left = new BlockSegment(this,this.position_sheet.left,this.color)
        return this.segments.left
    }
    addRight(){
        this.segments.right = new BlockSegment(this,this.position_sheet.right,this.color)
        return this.segments.right
    }
    addTop(){
        this.segments.top = new BlockSegment(this,this.position_sheet.top,this.color)
        return this.segments.top
    }
    addBottom(){
        this.segments.bottom = new BlockSegment(this,this.position_sheet.bottom,this.color)
        return this.segments.bottom
    }
    draw(ctx, offset=new Point2D(0,0)){
        //console.log(this.getPosition())

        for(let i in this.segments){
            let segment = this.segments[i]
            if(segment == undefined){
                continue
            }
            
            segment.draw(ctx,offset)
        }

        ctx.fillStyle = this.color.stringified()
        let pos = this.getPosition().getMultiplied(BLOCK_SIZE).getOffset(offset)
        Block.drawSegment(ctx,pos)
    }
    drawWire(ctx, offset=new Point2D(0,0)){
        for(let i in this.segments){
            let segment = this.segments[i]
            if(segment == undefined){
                continue
            }
            
            segment.drawWire(ctx,offset)
        }

        ctx.shadowColor = this.color.stringified()
        let pos = this.getPosition().getMultiplied(BLOCK_SIZE).getOffset(offset)
        Block.drawWireSegment(ctx,pos)
    }
    shift(){
        let new_segments = {
            top: undefined,
            right: undefined,
            bottom: undefined,
            left: undefined
        }

        for(let i in this.segments){
            //console.log(i,this.segments[i])
            let segment = this.segments[i]
            if(segment == undefined){
                new_segments[this.rotation_sheet[i]] = undefined
                continue
            }

            //console.log(i,"->",this.rotation_sheet[i])
            new_segments[this.rotation_sheet[i]] = segment
        }

        this.segments = new_segments

        for(let i in this.segments){
            let segment = this.segments[i]
            if(segment == undefined){
                continue
            }

            segment.shift()
        }
        //console.log(this.segments)

        this.alignOffset()
    }
    alignOffset(){
        if(this.parent == undefined){
            return
        }

        for(let i in this.parent.segments){
            let segment = this.parent.segments[i]
            if(segment == undefined || segment != this){
                continue
            }
            //console.log(i,this.position_sheet[i])
            this.offset = this.position_sheet[i]
        }
    }
    getCore(){
        let pivot = this
        while(pivot.parent != undefined){
            pivot = pivot.parent
        }

        return pivot
    }
    collidesWith(segment,offset1=new Point2D(0,0),offset2=new Point2D(0,0)){
        let pos = this.getPosition().getMultiplied(BLOCK_SIZE).getOffset(offset1)
        let pos2 = segment.getPosition().getMultiplied(BLOCK_SIZE).getOffset(offset2)

        //console.log(pos,pos2)

        return pos.x + BLOCK_SIZE > pos2.x && pos.x < pos2.x + BLOCK_SIZE &&
            pos.y + BLOCK_SIZE > pos2.y && pos.y < pos2.y + BLOCK_SIZE
    }
    getChildren(){
        let output = []
        
        for(let i in this.segments){
            let segment = this.segments[i]
            if(segment == undefined){
                continue
            }

            output.push(segment)
            output = output.concat(segment.getChildren())
        }

        return output
    }
}