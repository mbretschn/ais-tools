export class RGBColor {
    private r: number
    private g: number
    private b: number
    private a: number
    constructor(r: number, g: number, b: number, a: number) {
        this.r = r
        this.g = g
        this.b = b
        this.a = a
    }
    toString(opacity: number = 1): string {
        return `rgba(${this.r},${this.g},${this.b},${opacity})`
    }
}
