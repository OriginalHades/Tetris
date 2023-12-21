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

class ColorRGB{
    constructor(r,g,b){
        this.rin = r
        this.gin = g
        this.bin = b
    }
    stringified(){
        return `rgb(${this.r},${this.g},${this.b})`
    }
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
    getOffset(degs) {
        return new AngleD(this.degrees + degs)
    }
}

class Point2D {
    constructor(x, y) {
        this.x = x
        this.y = y
    }
    angleTo(x, y) {
        let dy = this.y - y
        let dx = this.x - x
        let theta = Math.atan2(dy, dx) // range (-PI, PI]
        theta *= 180 / Math.PI // rads to degs, range (-180, 180]
        if (theta < 0) theta = 360 + theta; // range [0, 360)
        return new AngleD((theta + 180) % 360) // rads to degs
    }
    distanceTo(x, y) {
        return Math.abs(Math.sqrt(Math.pow(this.x - x, 2) + Math.pow(this.y - y, 2)))
    }
    add(vec2d) {
        this.x += vec2d.x
        this.y += vec2d.y
    }
    getOffset(position) {
        return new Point2D(this.x + position.x, this.y + position.y)
    }
    getMultiplied(mult){
        return new Point2D(this.x * mult, this.y * mult)
    }
    getInverted() {
        return new Point2D(-this.rx, -this.ry)
    }
    moveOnAxis(angle, magnitude) {
        this.x += Math.cos(angle.radians) * magnitude
        this.y += Math.sin(angle.radians) * magnitude
    }
    rotateRelativeTo(point,angl){
        let angle = this.angleTo(point.x,point.y).getOffset(angl)
        let distance = this.distanceTo(point.x,point.y)

        //console.log(angle,distance,Math.cos(angle.radians),Math.sin(angle.radians))

        this.x = Math.floor(point.x + Math.cos(angle.radians)*distance)
        this.y = Math.floor(point.y + Math.sin(angle.radians)*distance)

        this.x = Math.abs(this.x) <= 1 ? 0 : this.x
        this.y = Math.abs(this.y) <= 1 ? 0 : this.y
    }
}

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