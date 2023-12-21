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

const themes = {
    light: {
        primary: "rgba(255,255,255,1)",
        secondary: "rgba(200,200,200,1)",
        text1: "rgba(0,0,0,1)",
        text2: "rgba(255,255,255,1)"
    },
    dark: {
        primary: "rgba(0,0,0,1)",
        secondary: "rgba(100,100,100,1)",
        text1: "rgba(200,200,200,1)",
        text2: "rgba(0,0,0,1)"
    },
    rose: {
        primary: "#660025",
        secondary: "#280711",
        text1: "#828282",
        text2: "rgba(0,0,0,1)"
    }
}


applyTheme(themes.light)