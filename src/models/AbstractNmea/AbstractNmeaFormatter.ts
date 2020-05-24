import { INmeaFormatter, INmeaLookup } from './INmea'
import { INmeaModel } from './INmea'

export abstract class AbstractNmeaFormatter<T extends INmeaModel> implements INmeaFormatter {
    model: T

    constructor(model: T) {
        this.model = model
    }

    abstract format(name: string | number): string

    public lookup(value: number, lookup: INmeaLookup[]): string | number {
        const f = lookup.find(item => item.value === value)

        if (f) {
            return f.description
        }

        return value
    }
}