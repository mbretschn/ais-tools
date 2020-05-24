import { RGBColor } from './RGBColor'
import { Color } from './Color'

export const rgba = (r: number, g: number, b: number, a: number) => {
    return new RGBColor(r, g, b, a)
}

export class Colors implements Iterable<Color> {
    private colors: Color[] = []
    private cnt: number = 0

    public get length(): number {
        return this.colors.length;
    }

    public [Symbol.iterator](): Iterator<Color> {
        this.cnt = 0
        return {
            next: () => {
                return {
                    done: this.colors.length === 0 || this.cnt === this.colors.length,
                    value: this.colors[this.cnt++]
                }
            }
        }
    }

    public add(color: Color): void {
        const idx = this.colors.findIndex(item => item.name === color.name)
        if (idx > -1) {
            this.colors.splice(idx, 1, color);
        } else {
            this.colors.push(color)
        }
    }

    public get(name?: string | number): Color
    public get(name?: string | number, level?: number): string | Color {
        if (typeof(name) === 'string') {
            const c = this.colors.find(color => color.name === name)
            if (c) {
                if (!level) {
                    return c
                }
                return c.get(level)
            }
        } else if (typeof(name) === 'number') {
            const d = this.colors[name]
            if (d) {
                return d
            }
        }
        throw new Error('Color not found')
    }

    public random(): string {
        const idx1 = Math.floor(Math.random() * Math.floor(this.length))
        const idx2 = Math.floor(Math.random() * Math.floor(5))
        return this.colors[idx1].get(idx2)
    }
}

const blueColor = new Color('blue')
blueColor.add('.rgba-primary-0', { color: rgba(106,152,206,1) })
blueColor.add('.rgba-primary-1', { color: rgba(200,221,245,1) })
blueColor.add('.rgba-primary-2', { color: rgba(149,185,228,1) })
blueColor.add('.rgba-primary-3', { color: rgba( 72,121,180,1) })
blueColor.add('.rgba-primary-4', { color: rgba( 44, 96,158,1) })

const greenColor = new Color('green')
greenColor.add('.rgba-primary-0', { color: rgba( 99,210,163,1) })
greenColor.add('.rgba-primary-1', { color: rgba(197,246,225,1) })
greenColor.add('.rgba-primary-2', { color: rgba(143,230,193,1) })
greenColor.add('.rgba-primary-3', { color: rgba( 64,187,134,1) })
greenColor.add('.rgba-primary-4', { color: rgba( 36,166,110,1) })

const violetColor = new Color('violet')
violetColor.add('.rgba-primary-0', { color: rgba(176,103,207,1) })
violetColor.add('.rgba-primary-1', { color: rgba(231,198,246,1) })
violetColor.add('.rgba-primary-2', { color: rgba(204,146,229,1) })
violetColor.add('.rgba-primary-3', { color: rgba(148, 68,183,1) })
violetColor.add('.rgba-primary-4', { color: rgba(124, 40,161,1) })

const redColor = new Color('red')
redColor.add('.rgba-primary-0', { color: rgba(255,120,120,1) })
redColor.add('.rgba-primary-1', { color: rgba(255,204,204,1) })
redColor.add('.rgba-primary-2', { color: rgba(255,159,159,1) })
redColor.add('.rgba-primary-3', { color: rgba(255, 87, 87,1) })
redColor.add('.rgba-primary-4', { color: rgba(241, 52, 52,1) })

const pinkColor = new Color('pink')
pinkColor.add('.rgba-primary-0', { color: rgba(229,108,172,1) })
pinkColor.add('.rgba-primary-1', { color: rgba(250,200,226,1) })
pinkColor.add('.rgba-primary-2', { color: rgba(241,150,198,1) })
pinkColor.add('.rgba-primary-3', { color: rgba(215, 74,148,1) })
pinkColor.add('.rgba-primary-4', { color: rgba(197, 42,124,1) })

const orangeColor = new Color('orange')
orangeColor.add('.rgba-primary-0', { color: rgba(255,197,120,1) })
orangeColor.add('.rgba-primary-1', { color: rgba(255,233,204,1) })
orangeColor.add('.rgba-primary-2', { color: rgba(255,214,159,1) })
orangeColor.add('.rgba-primary-3', { color: rgba(255,183, 87,1) })
orangeColor.add('.rgba-primary-4', { color: rgba(241,160, 52,1) })

const yellowColor = new Color('yellow')
yellowColor.add('.rgba-primary-0', { color: rgba(255,222,120,1) })
yellowColor.add('.rgba-primary-1', { color: rgba(255,242,204,1) })
yellowColor.add('.rgba-primary-2', { color: rgba(255,231,159,1) })
yellowColor.add('.rgba-primary-3', { color: rgba(255,214, 87,1) })
yellowColor.add('.rgba-primary-4', { color: rgba(241,195, 52,1) })

const lightgreenColor = new Color('lightgreen')
lightgreenColor.add('.rgba-primary-0', { color: rgba(114,228,108,1) })
lightgreenColor.add('.rgba-primary-1', { color: rgba(202,250,199,1) })
lightgreenColor.add('.rgba-primary-2', { color: rgba(154,240,149,1) })
lightgreenColor.add('.rgba-primary-3', { color: rgba( 80,214, 73,1) })
lightgreenColor.add('.rgba-primary-4', { color: rgba( 50,196, 42,1) })

export const ColorSchemes = new Colors()

ColorSchemes.add(blueColor)
ColorSchemes.add(greenColor)
ColorSchemes.add(redColor)
ColorSchemes.add(violetColor)
ColorSchemes.add(pinkColor)
ColorSchemes.add(orangeColor)
ColorSchemes.add(lightgreenColor)
ColorSchemes.add(yellowColor)
