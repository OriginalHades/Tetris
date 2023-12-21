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
            this.fall_counter.delay = 240 - (new Date() - this.start_time)/1000 // Seconds elapsed 4 minutes until fastest fall speed
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