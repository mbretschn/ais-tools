import { default as moment } from 'moment'
import { AbstractNmeaParser } from '../AbstractNmea/AbstractNmeaParser'
import { INmeaPosition, INmeaPositionData } from './INmeaPosition'

export class NmeaPositionParser<T extends INmeaPositionData> extends AbstractNmeaParser<T, INmeaPosition> {
    public async parse(bin: string, utc: moment.Moment, raw: string[]): Promise<T> {
        const date = moment(utc)
        date.milliseconds(0)

        const TimeStampStatus = this.parse_int(bin.substr(137, 6))
        const TimeStampReceived = date.second()

        let TimeStamp
        if (Math.abs(TimeStampReceived - TimeStampStatus) > 10) {
            TimeStamp = date.toDate()
        } else {
            const timeStamp = moment(utc)
            timeStamp.seconds(TimeStampStatus)
            timeStamp.milliseconds(0)

            if (TimeStampReceived < 10 && TimeStampStatus > 50) {
                timeStamp.subtract(1, 'minutes')
            }
            if (TimeStampReceived > 50 && TimeStampStatus < 10) {
                timeStamp.add(1, 'minutes')
            }

            TimeStamp = timeStamp.toDate()
        }

        const Longitude = Number((this.parse_uint(bin.substr(61, 28), 28) / 600000).toFixed(5))
        const Latitude = Number((this.parse_uint(bin.substr(89, 27), 27) / 600000).toFixed(5))
        const result: INmeaPositionData = {
            AIS: this.parse_int(bin.substr(0, 6)),
            Channel: raw[0].split(',')[4],
            MMSI: this.parse_int(bin.substr(8, 30)),
            TimeStamp: TimeStamp,
            Location: {
                type: "Point",
                coordinates: [ Longitude, Latitude ]
            },
            Data: {
                Longitude: Longitude,
                Latitude: Latitude,
                ROT: this.parse_uint(bin.substr(42, 8), 8),
                SOG: Number((this.parse_int(bin.substr(50, 10)) / 10).toFixed(1)),
                COG: Number((this.parse_int(bin.substr(116, 12)) / 10).toFixed(1)),
                TrueHeading: this.parse_int(bin.substr(128, 9)),
                NavigationStatus: this.parse_int(bin.substr(38, 4)),
                PositionAccuracy: this.parse_int(bin.substr(60, 1)),
                TimeStampStatus: TimeStampStatus
            },
            Sender: [ {
                Name: this.model.collection.Sender,
                TimeStamp: date.toDate()
            } ],
            CreatedAt: date.toDate(),
            CreatedBy: this.model.collection.Sender,
            UpdatedAt: date.toDate(),
            UpdatedBy: this.model.collection.Sender,
            RAW: raw
        }

        return result as T
    }
}
