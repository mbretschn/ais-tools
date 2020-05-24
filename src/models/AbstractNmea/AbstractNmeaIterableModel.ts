
import { INmeaFieldDescriptions, INmeaModel } from './INmea'
import { AbstractNmeaModel } from './AbstractNmeaModel'

export abstract class AbstractNmeaIterableModel<T extends INmeaModel> extends AbstractNmeaModel<T> {
    [key: string]: any

    abstract toReportDiff(other: T): string[]

    _toReportDiff(Description: INmeaFieldDescriptions, fields: any[], other: any): string[] {
        const plen = 46
        const plen2 = 27
        const pchr = '.'
        const pchr2 = '.'

        const s = `${this.AIS},${this.Channel},${String(this.Revision).padStart(3, '0')}`
        const o = `${other.AIS},${this.Channel},${String(other.Revision).padStart(3, '0')}`

        const report: string[] = this.toReportHeader()
        report.push(''.padEnd(100, '-'))
        report.push('AIS,Channel,Revision'.padEnd(plen, pchr) + ': ' + s.padEnd(plen2, pchr2) + o)

        for (const field of fields) {
            if (this[field] !== other[field]) {
                report.push(Description[field].padEnd(plen, pchr)
                    + ': '
                    + this.format(field).padEnd(plen2, pchr2)
                    + other.format(field))
            }
        }

        return report
    }
}
