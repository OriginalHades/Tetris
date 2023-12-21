let canvas = document.getElementById("ctx")
let ctx = canvas.getContext("2d")

canvas.width = window.innerWidth
canvas.height = window.innerHeight

function isNumeric(str) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
           !isNaN(parseInt(str)) // ...and ensure strings of whitespace fail
  }

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

class GameGrid{
    constructor(position, width,height){
        this.position = position
        this.start_time = new Date()

        width = width*BLOCK_SIZE
        height = height*BLOCK_SIZE

        this.width = width
        this.height = height

        this.block_generator = new BlockGenerator(3)

        this.rows = {

        }
        for(let i = 0; i < height/BLOCK_SIZE;i++){
            this.rows[i] = {

            }
            for(let j = 0; j < width/BLOCK_SIZE;j++){
                this.rows[i][j] = undefined
            }
        }

        this.score = 0

        this.selected_block = undefined
        this.can_hold = true
        this.held_block = undefined

        this.left_counter = new Counter(50, function(){
            if(!this.collides(new Point2D(-BLOCK_SIZE,0))){
                this.selected_block.position.add(new Point2D(-BLOCK_SIZE,0))
            }
        }.bind(this))
        this.right_counter = new Counter(50, function(){
            if(!this.collides(new Point2D(BLOCK_SIZE,0))){
                this.selected_block.position.add(new Point2D(BLOCK_SIZE,0))
            }
        }.bind(this))
        this.fall_counter = new Counter(200,function(){
            this.selected_block.position.add(new Point2D(0,BLOCK_SIZE))
        }.bind(this))
        this.rotate_counter = new Counter(200, function(){
            this.selected_block.rotate()
            console.log(this.selected_block.getLeftest().x,this.selected_block.getRightest().x > this.width ,this.selected_block.getLowest().y > this.height)
            while(this.collides()){
                this.selected_block.rotate()
            }
        }.bind(this))
        this.score_count = new Counter(100, function(){
            this.score += 1
        }.bind(this))
        this.hold_counter = new Counter(200 , function(){
            let temp = undefined
            if(this.held_block != undefined){
                temp = this.held_block
                this.held_block.position = new Point2D(Math.floor((this.width/BLOCK_SIZE)/2)*BLOCK_SIZE,BLOCK_SIZE)
            }
            this.held_block = this.selected_block
            this.selected_block = temp
            this.can_hold = false

            console.log(this.selected_block)
        }.bind(this))
        this.drop_counter = new Counter(200, function(){
            let offset = 1
            while(!this.collides(new Point2D(0,BLOCK_SIZE*offset)) && offset < DROP_COLLISION_ITER_LIMIT){
                offset += 1
            }
            this.selected_block.position.add(new Point2D(0,BLOCK_SIZE*(offset-1)))
            this.score += offset*2
        }.bind(this))


        this.consecutive_collision = 0

        this.placed_blocks = [

        ]

        this.movement = {
            left:false,
            right:false,
            rotate: false,
            faster: false,
            hold: false,
            drop: false
        }

        this.controlls = {
            left: "a",
            right: "d",
            rotate: "e",
            faster: "s",
            hold: "q",
            drop: 32
        }

        document.addEventListener("keydown", function(ev){
            for(let i in this.controlls){
                //console.log(ev.keyCode == this.controlls[i])
                if(ev.key == this.controlls[i] || ev.keyCode == this.controlls[i]){
                    this.movement[i] = true
                }
            }
        }.bind(this))
        document.addEventListener("keyup", function(ev){
            for(let i in this.controlls){
                if(ev.key == this.controlls[i] || ev.keyCode == this.controlls[i]){
                    this.movement[i] = false
                }
            }
        }.bind(this))
    }
    collides(offset= new Point2D(0,0)){
        let collision = false
        /*for(let i in this.placed_blocks){
            let block = this.placed_blocks[i]

            if(this.selected_block.collidesWith(block,offset)){
                collision = true
                break
            }
        }*/
        for(let j = 0;j < this.height/BLOCK_SIZE;j++){
            let row = this.rows[j]
            if(collision){
                break
            }

            for(let i = 0;i < this.width/BLOCK_SIZE;i++){
                if(row[i] != undefined){
                    if(this.selected_block.collidesWith(new Block(new Point2D(i*BLOCK_SIZE,j*BLOCK_SIZE)),offset)){
                        collision = true
                        break
                    }
                }
            }
        }

        return collision || this.selected_block.getLeftest().x+offset.x < 0 || this.selected_block.getRightest().x+offset.x > this.width || this.selected_block.getLowest().y > this.height+offset.y || this.selected_block.getLowest().y+offset.y > this.height
    }
    update(){
        if(this.selected_block == undefined){
            this.selected_block = this.block_generator.getNext()
            this.selected_block.position = new Point2D(Math.floor((this.width/BLOCK_SIZE)/2)*BLOCK_SIZE,BLOCK_SIZE)
            //let box = this.selected_block.getBoundingBox()
            //console.log(box)
            //if(box.y < 0){
            //    this.selected_block.position.y -= box.y
            //}

            this.can_hold = true
        }
        //let rughtest = this.selected_block.getLeftest()
        //console.log(rughtest.x,this.width)
        if(this.selected_block.getRightest().x >= this.width){
            this.right_counter.current = 0
        }
        if(this.selected_block.getLeftest().x <= 0){
            this.left_counter.current = 0
        }

        if(this.movement.left){
            this.left_counter.trigger()
        }
        if(this.movement.right){
            this.right_counter.trigger()
        }
        if(this.movement.rotate){
            this.rotate_counter.trigger()
        }
        if(this.movement.hold && this.can_hold){
            this.hold_counter.trigger()
        }
        if(this.movement.drop){
            this.drop_counter.trigger()
        }

        if(this.movement.faster){
            this.score += 1
            this.fall_counter.delay = 1
        }
        else{
            this.fall_counter.delay = 600 - (new Date() - this.start_time)/1000 // Seconds elapsed
        }

        this.score_count.trigger()

        let collision = this.collides(new Point2D(0,BLOCK_SIZE))

        if(collision){
            this.placed_blocks.push(this.selected_block)
            let blocks = this.selected_block.core_segment.getChildren().concat([this.selected_block.core_segment])
            
            if(sound.BLOCK_SET){
                block_set.play()
            }

            for(let i in blocks){
                let block = blocks[i]
                let position = block.getPosition().getOffset(new Point2D(this.selected_block.position.x/BLOCK_SIZE,this.selected_block.position.y/BLOCK_SIZE))

                this.rows[position.y][position.x] = {block:block,parent:parent}
            }

            this.selected_block = undefined
            this.consecutive_collision += 1
        }
        else{
            this.consecutive_collision = 0
            this.fall_counter.trigger()
        }

        
        for(let j = 0;j < this.height/BLOCK_SIZE;j++){
            let row = this.rows[j]
            let full = true

            for(let i = 0;i < this.width/BLOCK_SIZE;i++){
                if(row[i] == undefined){
                    full = false
                    break
                }
            }

            if(full){
                let new_rows = {}
                for(let i = 0; i < this.height/BLOCK_SIZE;i++){
                    new_rows[i] = {}
                    for(let j = 0; j < this.width/BLOCK_SIZE;j++){
                        new_rows[i][j] = undefined
                    }
                }

                for(let g = 0;g < j;g++){
                    for(let i = 0;i < this.width/BLOCK_SIZE;i++){
                        new_rows[g+1][i] = this.rows[g][i]
                    }
                }
                for(let g = j+1; g < this.height/BLOCK_SIZE;g++){
                    for(let i = 0;i < this.width/BLOCK_SIZE;i++){
                        new_rows[g][i] = this.rows[g][i]
                    }
                }


                this.rows = new_rows
                this.score += 100
                if(sound.CLEAR_LINE){
                    clear_line.play()
                }
            }
        }

        if(this.consecutive_collision > 1){
            return false
        }
        else{
            return true
        }
    }
    draw(ctx){
        ctx.save()

        ctx.translate(this.position.x, this.position.y)
        ctx.fillStyle = "rgba(245, 245, 245)"
        ctx.strokeStyle = "black"
        ctx.fillRect(0,0,this.width,this.height)
        ctx.strokeRect(0,0,this.width,this.height)

        ctx.fillStyle = "black"
        ctx.font = "30px monospace"
        ctx.fillText("Score:" + this.score,-200,250)

        ctx.font = "20px monospace"
        let a = 0
        for(let i in this.controlls){
            a += 35
            let name = i
            let value = this.controlls[i]

            if(typeof value == "number"){
                value = keyboardMap[value]
            }

            ctx.fillText(name[0].toUpperCase() + name.substring(1,name.length) + ":" + value,-200,300+a)
        }

        if(this.selected_block != undefined){
            this.selected_block.draw(ctx)
        
            let offset = 1
            while(!this.collides(new Point2D(0,BLOCK_SIZE*offset)) && offset < DROP_COLLISION_ITER_LIMIT){
                offset += 1
            }
            this.selected_block.drawWire(ctx,new Point2D(0,BLOCK_SIZE*(offset-1)))
        }

        for(let j = 0;j < this.height/BLOCK_SIZE;j++){
            let row = this.rows[j]

            for(let i = 0;i < this.width/BLOCK_SIZE;i++){
                if(row[i] != undefined){
                    //row[i].block.draw(ctx,new Point2D(i*BLOCK_SIZE,j*BLOCK_SIZE))
                    ctx.fillStyle = row[i].block.color.stringified()
                    Block.drawSegment(ctx, new Point2D(i*BLOCK_SIZE,j*BLOCK_SIZE))
                }
            }
        }

        ctx.strokeRect(-200,0,150,150)

        if(this.held_block != undefined){
            let box = this.held_block.getBoundingBox()
            let offset = this.held_block.getCenterOffset()
            
            //console.log(offset)
            //ctx.strokeRect(box.x,box.y,box.width,box.height)
        
            this.held_block.core_segment.draw(ctx, new Point2D(-200+75-box.width/2,75-box.height/2).getOffset(offset))
        }

        for(let i in this.block_generator.blocks){
            let block = this.block_generator.blocks[i].block

            let box = block.getBoundingBox()
            let offset = block.getCenterOffset()
            
            //console.log(offset)
            //ctx.strokeRect(box.x,box.y,box.width,box.height)
            ctx.strokeRect(this.width+25,(200*i),150,150)
            block.core_segment.draw(ctx, new Point2D(this.width+100-box.width/2,75+(200*i)-box.height/2).getOffset(offset))
        }

        ctx.restore()
    }
}

const BLOCK_SIZE = 30
const GAME_WIDTH = 14
const GAME_HEIGHT = 25
const DROP_COLLISION_ITER_LIMIT = 50

let sound = {
    BLOCK_SET: false,
    CLEAR_LINE: true
}

const block_set = new Audio('sound/drop.wav');
const clear_line = new Audio('sound/clear_line.wav');

let game = new GameGrid(new Point2D(window.innerWidth/2-(GAME_WIDTH/2*BLOCK_SIZE),window.innerHeight/2-(GAME_HEIGHT/2*BLOCK_SIZE)),GAME_WIDTH,GAME_HEIGHT)

let drawing = true
function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height)
    game.draw(ctx)

    if(drawing){
        requestAnimationFrame(draw)
    }
}
draw()

let game_interval = setInterval(function(){
    if(!game.update()){
        console.log("Game over")
        drawing = false

        //canvas.style.backgroundColor = "red"
        clearInterval(game_interval)
    }
},1)

let block = new Block(new Point2D(200,200))
block.setSegmentsFromTemplate(L_BLOCK_TEMPLATE)

block.draw(ctx)
//block.rotate(90)
