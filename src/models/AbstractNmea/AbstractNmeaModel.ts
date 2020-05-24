import { default as moment } from 'moment'
import { EventEmitter } from 'events'
import { INmeaInfo, INmeaFieldDescriptions, INmeaDB, INmeaModel, INmeaDataSender } from './INmea'

export abstract class AbstractNmeaModel<T extends INmeaModel> extends EventEmitter implements INmeaModel {
    [key: string]: any

    _id: string = ''
    AIS: number = 0
    Channel: string = ''
    MMSI: number = 0
    TimeStamp: Date = new Date()
    Sender: INmeaDataSender[] = []
    CreatedAt: Date = new Date()
    CreatedBy: string = ''
    UpdatedAt: Date = new Date()
    UpdatedBy: string = ''
    RAW: string[] = []

    abstract fromModel (model: T): T
    abstract toModel (bin: string, utc: moment.Moment, raw: string[]): Promise<T>
    abstract toJSON(): T
    abstract toDB(): INmeaDB
    abstract toReport(): string[]
    abstract toInfo(): INmeaInfo[]

    public async create(): Promise<T> {
        return this.collection.create(this)
    }

    // ***************************************
    // Export
    // ***************************************

    _toJSON(fields: any[]): any {
        const json: any = this._toDB(fields)

        for (const field of fields) {
            if (json[field] instanceof Date) {
                json[field] = moment(json[field]).toISOString(true)
            }
        }

        return json
    }

    _toDB(fields: any[]): T {
        const json: any = {}

        for (const field of fields) {
            if ('TimeStamp,CreatedAt'.indexOf(field) >=0 && !(this[field] instanceof Date)) {
                json[field] = new Date(this[field])
            } else {
                json[field] = this[field]
            }
        }

        return json
    }

    // ***************************************
    // Export
    // ***************************************

    isBefore(t?: T | moment.Moment): boolean {
        let o
        if (t) {
            if (moment.isMoment(t)) {
                o = t
            } else {
                o = moment(t.TimeStamp)
            }
        } else if (this._previous) {
            o = moment(this._previous.TimeStamp)
        }

        if (o === undefined) {
            return true
        }

        const s = moment(this.TimeStamp)

        s.millisecond(0)
        o.millisecond(0)

        return s.isBefore(o)
    }

    isAfter(t?: T | moment.Moment): boolean {
        let o
        if (t) {
            if (moment.isMoment(t)) {
                o = t
            } else {
                o = moment(t.TimeStamp)
            }
        } else if (this._previous) {
            o = moment(this._previous.TimeStamp)
        }

        if (o === undefined) {
            return true
        }

        const s = moment(this.TimeStamp)

        s.millisecond(0)
        o.millisecond(0)

        return s.isAfter(o)
    }

    isValid(): boolean {
        return true
    }

    // ***************************************
    // Reporting
    // ***************************************

    format(name: keyof T, options?: any): string {
        return this.formatter.format(name, options)
    }

    _toReport(description: INmeaFieldDescriptions, fields: any[]): string[] {
        const plen = 46
        const pchr = '.'

        const report: string[] = this.toReportHeader()
        report.push(''.padEnd(100, '-'))

        for (const field of fields) {
            report.push(description[field].padEnd(plen, pchr) + ': ' + this.format(field))
        }

        return report
    }

    toReportHeader(): string[] {
        const info = this.toInfo()

        return info.map((item: INmeaInfo) => {
            if (item.val instanceof Array) {
                return `${item.key} ${item.val.join('; ')}`
            }
            return `${item.key} ${item.val}`
        })
    }

    toString(): string {
        const info = this.toInfo()

        return info.map((item: INmeaInfo) => {
            if (item.val instanceof Array) {
                return `${item.key} ${item.val.join('; ')}`
            }
            return `${item.key} ${item.val}`
        }).join(', ')
    }
}
