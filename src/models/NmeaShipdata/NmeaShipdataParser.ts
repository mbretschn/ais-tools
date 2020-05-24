import { default as moment } from 'moment'
import { AbstractNmeaParser } from '../AbstractNmea/AbstractNmeaParser'
import { INmeaShipdata, INmeaShipdataData } from './INmeaShipdata'

export class NmeaShipdataParser<T extends INmeaShipdataData> extends AbstractNmeaParser<T, INmeaShipdata> {
    public async parse(bin: string, utc: moment.Moment, raw: string[]): Promise<T> {
        const date = moment(utc);
        date.milliseconds(0)

        const month = this.parse_int(bin.substr(274, 4))
        const day = this.parse_int(bin.substr(278, 5))
        const hour = this.parse_int(bin.substr(283, 5))
        const minute = this.parse_int(bin.substr(288, 6))

        let ETA: string = ''
        const _ETA: moment.Moment = moment(utc)
        if (month !== 0 && day !== 0 && hour !== 24 && minute !== 60) {
            if (month !== 0) _ETA.month(month)
            if (day !== 0) _ETA.day(day)
            if (hour !== 24) _ETA.hour(hour)
            if (minute !== 60) _ETA.minute(minute)
            _ETA.second(0)
            ETA = _ETA.format()
        }

        const TimeStamp = new Date(utc.format())

        const Draught = Number((this.parse_int(bin.substr(294, 8)) / 10).toFixed(1))

        const _Destination = this.parse_aisstr6(bin.substr(302, 120)).trim()
        let Destination: string = ''
        if (_Destination.indexOf('@') !== 0) {
            Destination = _Destination
        }

        const result: INmeaShipdataData = {
            AIS: this.parse_int(bin.substr(0, 6)),
            Channel: raw[0].split(',')[4],
            MMSI: this.parse_int(bin.substr(8, 30)),
            TimeStamp: TimeStamp,
            Data: {
                AISversion: this.parse_int(bin.substr(38, 2)),
                IMOnumber: this.parse_int(bin.substr(40, 30)),
                CallSign: this.parse_aisstr6(bin.substr(70, 42)),
                Name: this.parse_aisstr6(bin.substr(112, 120)).trim(),
                ShipType: this.parse_int(bin.substr(232, 8)),
                Destination: Destination,
                ETA: ETA,
                DimA: this.parse_int(bin.substr(240, 9)),
                DimB: this.parse_int(bin.substr(249, 9)),
                DimC: this.parse_int(bin.substr(258, 6)),
                DimD: this.parse_int(bin.substr(264, 6)),
                Draught: Draught,
                PositionType: this.parse_int(bin.substr(270, 4))
            },
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
