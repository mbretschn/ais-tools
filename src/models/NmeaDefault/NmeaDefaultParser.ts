import { default as moment } from 'moment'
import { INmeaDefault, INmeaDefaultData } from './INmeaDefault'
import { AbstractNmeaParser } from '../AbstractNmea/AbstractNmeaParser'

export class NmeaDefaultParser<T extends INmeaDefaultData> extends AbstractNmeaParser<T, INmeaDefault> {
    public async parse(bin: string, utc: moment.Moment, raw: string[]): Promise<T> {
        const TimeStamp = new Date(utc.format())

        const result: INmeaDefaultData = {
            AIS: this.parse_int(bin.substr(0, 6)),
            Channel: raw[0].split(',')[4],
            MMSI: this.parse_int(bin.substr(8, 30)),
            TimeStamp: TimeStamp,
            Sender: [ {
                Name: this.model.collection.Sender,
                TimeStamp:  TimeStamp
            } ],
            CreatedAt: TimeStamp,
            CreatedBy: this.model.collection.Sender,
            UpdatedAt: TimeStamp,
            UpdatedBy: this.model.collection.Sender,
            RAW: raw
        }

        return result as T
    }
}
