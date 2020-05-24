import { default as moment } from 'moment'
import { INmeaInfo, INmeaParser, INmeaFormatter } from '../AbstractNmea/INmea'
import { AbstractNmeaModel } from '../AbstractNmea/AbstractNmeaModel'
import { INmeaDefaultCollection, INmeaDefaultData, INmeaDefaultDB, INmeaDefault } from './INmeaDefault'
import { NmeaDefaultParser } from './NmeaDefaultParser'
import { NmeaDefaultFormatter } from './NmeaDefaultFormatter'
import { Description } from './NmeaDefaultMetadata'

export class NmeaDefault extends AbstractNmeaModel<INmeaDefault> implements INmeaDefault {
    [key: string]: any

    collection: INmeaDefaultCollection
    parser: INmeaParser<INmeaDefaultData>
    formatter: INmeaFormatter

    constructor(collection: INmeaDefaultCollection, model?: INmeaDefault) {
        super()
        this.collection = collection
        this.parser = new NmeaDefaultParser(this)
        this.formatter = new NmeaDefaultFormatter(this)

        if (model) {
            this.fromModel(model)
        }
    }

    public fromModel(model: INmeaDefault): INmeaDefault {
        const fields: any[keyof INmeaDefault] = [
            '_id',
            'AIS', 'Channel', 'MMSI', 'TimeStamp',
            'CreatedAt', 'CreatedBy', 'UpdatedAt', 'UpdatedBy',
            'Sender',
            'RAW'
        ]

        for (const field of fields) {
            this[field] = model[field]
        }

        return this
    }

    public async toModel(bin: string, utc: moment.Moment, raw: string[]): Promise<INmeaDefault> {
        const data: INmeaDefaultData = await this.parser.parse(bin, utc, raw)
        const result: INmeaDefault = { _id: this.collection.database.createObjectID(), ...data }
        return this.fromModel(result)
    }

    // ***************************************
    // Storage
    // ***************************************

    public toJSON(): INmeaDefault {
        const fields: any[keyof INmeaDefault] = [
            'AIS', 'Channel', 'MMSI', 'TimeStamp',
            'CreatedAt', 'CreatedBy', 'UpdatedAt', 'UpdatedBy',
            'Sender',
            'RAW'
        ]

        return super._toJSON(fields)
    }

    public toDB(): INmeaDefaultDB {
        const head: any[keyof INmeaDefault] = [
            'UpdatedAt', 'UpdatedBy', 'TimeStamp'
        ]

        const tail: any[keyof INmeaDefault] = [
            '_id',
            'AIS', 'Channel', 'MMSI',
            'CreatedAt', 'CreatedBy',
            'RAW'
        ]

        const result: INmeaDefaultDB = {
            filter: {
                RAW: { $all: this.RAW },
                TimeStamp: {
                    $gte: moment(this.TimeStamp).subtract(1, 'minute').toDate(),
                    $lt: moment(this.TimeStamp).add(1, 'minute').toDate()
                }
            },
            head: super._toDB(head),
            tail: super._toDB(tail)
        }

        return result
    }

    // ***************************************
    // Analyse
    // ***************************************

    public isValid(): boolean {
        return true
    }

    // ***************************************
    // Report
    // ***************************************

    public toReport(): string[] {
        const fields: any[keyof INmeaDefault] = [
            '_id', 'MMSI', 'AIS', 'Channel', 'Sender',
            'TimeStamp', 'CreatedAt', 'CreatedBy'
        ]

        return super._toReport(Description, fields)
    }

    public toInfo(): INmeaInfo[] {
        const data: INmeaInfo[] = [
            {
                key: 'Class',
                val: 'NmeaDefault'
            },
            {
                key: 'MMSI',
                val: String(this.MMSI)
            },
            {
                key: 'Type',
                val: String(this.AIS)
            },
            {
                key: 'Sender',
                val: this.format('Sender')
            }
        ]

        return data
    }
}
