import { default as moment } from 'moment'
import { INmeaInfo, INmeaParser, INmeaFormatter } from '../AbstractNmea/INmea'
import { AbstractNmeaIterableModel } from '../AbstractNmea/AbstractNmeaIterableModel'
import { INmeaShipdataCollection, INmeaShipdataDataParsed, INmeaShipdataData, INmeaShipdata, INmeaShipdataDB } from './INmeaShipdata'
import { NmeaShipdataFormatter } from './NmeaShipdataFormatter'
import { NmeaShipdataParser } from './NmeaShipdataParser'
import { Description } from './NmeaShipdataMetadata'

export class NmeaShipdata extends AbstractNmeaIterableModel<INmeaShipdata> implements INmeaShipdata {
    [key: string]: any

    collection: INmeaShipdataCollection
    parser: INmeaParser<INmeaShipdataData>
    formatter: INmeaFormatter

    Data: INmeaShipdataDataParsed = {
        AISversion: 0,
        IMOnumber: 0,
        CallSign: '',
        Name: '',
        ShipType: 0,
        PositionType: 0,
        DimA: 0,
        DimB: 0,
        DimC: 0,
        DimD: 0,
        Draught: 0,
        Destination: '',
        ETA: ''
    }

    get AISversion() { return this.Data.AISversion }
    get IMOnumber() { return this.Data.IMOnumber }
    get CallSign() { return this.Data.CallSign }
    get Name() { return this.Data.Name }
    get ShipType() { return this.Data.ShipType }
    get PositionType() { return this.Data.PositionType }
    get DimA() { return this.Data.DimA }
    get DimB() { return this.Data.DimB }
    get DimC() { return this.Data.DimC }
    get DimD() { return this.Data.DimD }
    get Draught() { return this.Data.Draught }
    get Destination() { return this.Data.Destination }
    get ETA() { return this.Data.ETA }

    set AISversion(AISversion) { this.Data.AISversion = AISversion }
    set IMOnumber(IMOnumber) { this.Data.IMOnumber = IMOnumber }
    set CallSign(CallSign) { this.Data.CallSign = CallSign }
    set Name(Name) { this.Data.Name = Name}
    set ShipType(ShipType) { this.Data.ShipType = ShipType}
    set PositionType(PositionType) { this.Data.PositionType = PositionType }
    set DimA(DimA) { this.Data.DimA = DimA }
    set DimB(DimB) { this.Data.DimB = DimB }
    set DimC(DimC) { this.Data.DimC = DimC }
    set DimD(DimD) { this.Data.DimD = DimD }
    set Draught(Draught) { this.Data.Draught = Draught }
    set Destination(Destination) { this.Data.Destination = Destination }
    set ETA(ETA) { this.Data.ETA = ETA }

    constructor(collection: INmeaShipdataCollection, model?: INmeaShipdata) {
        super()
        this.collection = collection
        this.parser = new NmeaShipdataParser(this)
        this.formatter = new NmeaShipdataFormatter(this)

        if (model) {
            this.fromModel(model)
        }
    }

    public fromModel(model: INmeaShipdata): INmeaShipdata {
        const fields: any[keyof INmeaShipdataDB] = [
            '_id',
            'AIS', 'Channel', 'MMSI', 'TimeStamp',
            'Data',
            'CreatedAt', 'CreatedBy', 'UpdatedAt', 'UpdatedBy',
            'Sender',
            'RAW'
        ]

        for (const field of fields) {
            this[field] = model[field]
        }

        return this
    }

    public async toModel(bin: string, utc: moment.Moment, raw: string[]): Promise<INmeaShipdata> {
        const data: INmeaShipdataData = await this.parser.parse(bin, utc, raw)
        const result: INmeaShipdata = { _id: this.collection.database.createObjectID(), ...data }
        return this.fromModel(result)
    }

    public toJSON(): INmeaShipdata {
        const fields: any[keyof INmeaShipdata] = [
            '_id',
            'AIS', 'Channel', 'MMSI', 'TimeStamp',
            'Data',
            'CreatedAt', 'CreatedBy', 'UpdatedAt', 'UpdatedBy',
            'Sender',
            'RAW'
        ]

        return super._toJSON(fields)
    }

    public toDB(): INmeaShipdataDB  {
        const head: any[keyof INmeaShipdata] = [
            'UpdatedAt', 'UpdatedBy', 'TimeStamp'
        ]

        const tail: any[keyof INmeaShipdata] = [
            '_id', 'Data',
            'AIS', 'Channel', 'MMSI',
            'CreatedAt', 'CreatedBy',
            'RAW'
        ]

        const ret: INmeaShipdataDB = {
            filter: { MMSI: this.MMSI },
            head: super._toDB(head),
            tail: super._toDB(tail)
        }

        return ret
    }

    public isValid(): boolean {
        return true
    }

    public compare(other: INmeaShipdata): boolean {
        const fields: any[keyof INmeaShipdata] = [
            'IMOnumber', 'CallSign', 'Name', 'ShipType', 'DimA', 'DimB', 'DimC',
            'DimD', 'Draught', 'Destination', 'ETA'
        ]

        return fields.every((key: any) => this[key] === other[key])
    }

    public toReport(): string[] {
        const fields: any[keyof INmeaShipdata] = [
            'MMSI', 'AISversion', 'IMOnumber', 'CallSign',
            'Name', 'ShipType', 'PositionType', 'DimA', 'DimB', 'DimC', 'DimD',
            'Draught', 'Destination', 'ETA', 'Sender', 'CreatedAt', 'CreatedBy'
        ]

        return super._toReport(Description, fields)
    }

    public toReportDiff(other: INmeaShipdata): string[] {
        const fields: any[keyof INmeaShipdata] = [
            'MMSI', 'AISversion', 'IMOnumber', 'CallSign',
            'Name', 'ShipType', 'PositionType', 'DimA', 'DimB', 'DimC', 'DimD',
            'Draught', 'Destination', 'ETA', 'Sender', 'CreatedAt', 'CreatedBy'
        ]

        return super._toReportDiff(Description, fields, other)
    }

    public toInfo(): INmeaInfo[] {
        const data: INmeaInfo[] = [
            {
                key: 'Class',
                val: 'NmeaPosition'
            },
            {
                key: 'MMSI',
                val: String(this.MMSI)
            },
            {
                key: 'Name',
                val: this.Name
            },
            {
                key: 'Sender',
                val: this.format('Sender')
            }
        ]

        return data
    }
}
