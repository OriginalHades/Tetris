/*
    A class to handle all things random ¯\_(ツ)_/¯
*/
class Random {
    constructor() {

    }
    static range(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }
    static color(){
        return new ColorRGB(this.range(0,255),this.range(0,255),this.range(0,255))
    }
    static choice(array){
        let index = this.range(0,array.length)
        //console.log(index,array)
        return array[index]
    }
}

/*
    And red,green,blue color
*/
class ColorRGB{
    constructor(r,g,b){
        this.rin = r
        this.gin = g
        this.bin = b
    }
    /*
        Returns the color in a usable string format
    */
    stringified(){
        return `rgb(${this.r},${this.g},${this.b})`
    }
    /*
        Add a value to r,g,b and return a new color

        note: doesnt affect the current object, creates a new one
    */  
    getOffset(offset){
        return new ColorRGB(this.r + offset, this.g + offset, this.b + offset)
    }
    set r(r){
        this.rin = r%255
    }
    set g(g){
        this.gin = g%255
    }
    set b(b){
        this.bin = b%255
    }
    get r(){
        return this.rin
    }
    get g(){
        return this.gin
    }
    get b(){
        return this.bin
    }
}

/*
    A class to simplify working with angles, makes everything work in degrees
*/
class AngleD {
    constructor(angle) {
        this.angle = angle
    }
    get radians() {
        return Math.PI / 180 * this.angle
    }
    get degrees() {
        return this.angle
    }
    set radians(rads) {
        this.angle = 180 / Math.PI * rads
    }
    set degrees(degs) {
        this.angle = degs
    }
    /*
        Returns new angle offset by an amount of degrees
    */
    getOffset(degs) {
        return new AngleD(this.degrees + degs)
    }
}

/*
    A class that handles all positions, has x,y coordinates and supporting functions
*/
class Point2D {
    constructor(x, y) {
        this.x = x
        this.y = y
    }
    add(vec2d) {
        this.x += vec2d.x
        this.y += vec2d.y
    }
    /*
        Returns a new position offset by another position
    */    
    getOffset(position) {
        return new Point2D(this.x + position.x, this.y + position.y)
    }
    /*
        Returns a new position, properties x and y are multiplied by a number
    */
    getMultiplied(mult){
        return new Point2D(this.x * mult, this.y * mult)
    }
}

/*
    A class that handles timing, used for controlls.

    delay -> the delay between activations in ms
    callback -> a function to be called on each activation
*/
class Counter{
    constructor(delay, callback){
        this.delay = delay
        this.callback = callback
        this.current = new Date()
   }
    trigger(){
        if(new Date() - this.current >= this.delay){
            this.callback()
            this.current = new Date()
        }
    }
}


/*
    A function to apply a theme
*/
function applyTheme(theme){
    for(let i in theme){
        document.documentElement.style.setProperty(`--${i}`, theme[i]);
    }    
}

function isNumeric(str) {
    if (typeof str != "string") return false
    return !isNaN(str) && 
           !isNaN(parseInt(str)) 
}
