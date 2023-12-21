let canvas = document.getElementById("ctx")
let ctx = canvas.getContext("2d")

canvas.width = window.innerWidth
canvas.height = window.innerHeight

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
