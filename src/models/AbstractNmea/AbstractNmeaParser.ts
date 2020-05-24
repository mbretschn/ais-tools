import { default as moment } from 'moment'
import { INmeaData, INmeaModel, INmeaParser } from './INmea'

export abstract class AbstractNmeaParser<T extends INmeaData, M extends INmeaModel> implements INmeaParser<T> {
    model: M

    constructor (model: M) {
        this.model = model
    }

    abstract parse(bin: string, utc: moment.Moment, raw: string[]): Promise<T>

    parse_default(input: any): any {
        return input
    }

    parse_int(input: any): number {
        return parseInt(input, 2)
    }

    parse_bool(input: any): boolean {
        return parseInt(input, 2) === 1 && true || false
    }

    parse_aisstr6(bits: string): string {
        const character = [
            '@', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K',
            'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y',
            'Z', '[', '\\', ']', '^', '-', ' ',
            '!', '"', '#', '$', '%', '&', '`', '(', ')', '*', '+', ',', '-', '.', '/',
            '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
            ':', ';', '<', '=', '>', '?'
        ]

        const numchar = bits.length / 6
        let str = ''
        let isEmpty = true
        for (let i = 0; i < numchar; i++) {
            const c = character[parseInt(bits.substr(i * 6, 6), 2)]
            if (isEmpty) {
                isEmpty = (c === '@')
            }
            str += c
        }

        if (isEmpty) {
            return ''
        }

        return str.indexOf('@') > 0 && str.substr(0, str.indexOf('@')).trim() || str.trim()
    }

    parse_uint(input: any, nbit: number): number {
        let uint = parseInt(input, 2)

        nbit = +nbit || 32
        if (nbit > 32) {
            throw new RangeError('uintToInt only supports ints up to 32 bits')
        }

        uint <<= 32 - nbit
        uint >>= 32 - nbit

        return uint
    }
}
