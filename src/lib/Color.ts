import { TColors, IColor, IColors } from './Interfaces'

export class Color implements IColors {
    public colors: IColor[] = [ ]
    public name: string

    constructor(name: string) {
        this.name = name
    }

    add(idx: TColors, color: any): void {
        const c = this.colors.find(item => item.idx === idx)
        if (c) {
            c.color = color.color
        } else {
            this.colors.push({ idx, color: color.color })
        }
    }

    get(i: number, opacity: number = 1): string {
        switch (i) {
            case 0:
                return this.colors[1].color.toString(opacity)
            case 1:
                return this.colors[2].color.toString(opacity)
            case 2:
                return this.colors[0].color.toString(opacity)
            case 3:
                return this.colors[3].color.toString(opacity)
            case 4:
                return this.colors[4].color.toString(opacity)
        }
        throw new Error('Color not found')
    }
}