let canvas = document.getElementById("ctx")
let ctx = canvas.getContext("2d")

canvas.width = window.innerWidth
canvas.height = window.innerHeight

let game_position = new Point2D(window.innerWidth/2-(GAME_WIDTH/2*BLOCK_SIZE),window.innerHeight/2-(GAME_HEIGHT/2*BLOCK_SIZE))

let game = new GameGrid(game_position,GAME_WIDTH,GAME_HEIGHT)

/*
    Draw loop
*/
let drawing = true
function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height)
    game.draw(ctx)

    if(drawing){
        requestAnimationFrame(draw)
    }
}
draw()

let game_ended = false

/*
    Create main loop
*/
function startGame(){
    let game_interval = setInterval(function(){
        if(!game.update()){
            console.log("Game over")
            menu.setAttribute("started",false)
            game_ended = true
            //canvas.style.backgroundColor = "red"
            clearInterval(game_interval)
        }
    },1)
}

let start_button = document.getElementById("start_button")
let menu = document.getElementById("menu")
let theme_selection = document.getElementById("themes")
for(let i in themes){
    let theme = document.createElement("option")
    theme.innerHTML = i
    theme.value = i
    theme.style.backgroundColor = themes[i].primary
    theme.style.color = themes[i].text1
    theme_selection.addEventListener("change",function(){
        if(theme_selection.value == theme.value){
            applyTheme(themes[i])
        }
    })
    theme_selection.appendChild(theme)
}

start_button.onclick = function(){
    if(game_ended){
        game = new GameGrid(game_position,GAME_WIDTH,GAME_HEIGHT)
    }
    start_button.blur()
    menu.setAttribute("started",true)
    startGame()
}
//block.rotate(90)
