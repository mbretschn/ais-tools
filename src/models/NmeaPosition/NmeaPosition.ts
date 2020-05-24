import { default as moment } from 'moment'
import { default as GeographicLib } from 'geographiclib'
import { INmeaInfo, INmeaParser, INmeaFormatter } from '../AbstractNmea/INmea'
import { AbstractNmeaIterableModel } from '../AbstractNmea/AbstractNmeaIterableModel'
import { ILatLng, ILocation, INmeaPositionCollection, INmeaPositionData, INmeaPosition, INamePositionDataParsed, INmeaPositionDB } from './INmeaPosition'
import { NmeaPositionFormatter } from './NmeaPositionFormatter'
import { NmeaPositionParser } from './NmeaPositionParser'
import { Description } from './NmeaPositionMetadata'

export class NmeaPosition extends AbstractNmeaIterableModel<INmeaPosition> implements INmeaPosition {
    [key: string]: any

    collection: INmeaPositionCollection
    parser: INmeaParser<INmeaPositionData>
    formatter: INmeaFormatter

    Location: ILocation = {
        type: "Point",
        coordinates: [ 181, 91 ]
    }

    chkDistance: number[] = [ 0.5, 2 ]

    Data: INamePositionDataParsed = {
        Longitude: 181,
        Latitude: 91,
        ROT: -128,
        SOG: 102.3,
        COG: 360,
        TrueHeading: 511,
        NavigationStatus: 15,
        PositionAccuracy: 0,
        TimeStampStatus: 60
    }

    get Longitude() { return this.Data.Longitude }
    get Latitude() { return this.Data.Latitude }
    get ROT() { return this.Data.ROT }
    get SOG() { return this.Data.SOG }
    get COG() { return this.Data.COG }
    get TrueHeading() { return this.Data.TrueHeading }
    get NavigationStatus() { return this.Data.NavigationStatus }
    get PositionAccuracy() { return this.Data.PositionAccuracy }
    get TimeStampStatus() { return this.Data.TimeStampStatus }

    set Longitude(Longitude: number) { this.Data.Longitude = Longitude }
    set Latitude(Latitude: number) { this.Data.Latitude = Latitude }
    set ROT(ROT: number) { this.Data.ROT = ROT }
    set SOG(SOG: number) { this.Data.SOG = SOG }
    set COG(COG: number) { this.Data.COG = COG }
    set TrueHeading(TrueHeading: number) { this.Data.TrueHeading = TrueHeading }
    set NavigationStatus(NavigationStatus: number) { this.Data.NavigationStatus = NavigationStatus }
    set PositionAccuracy(PositionAccuracy: number) { this.Data.PositionAccuracy = PositionAccuracy }
    set TimeStampStatus(TimeStampStatus: number) { this.Data.TimeStampStatus = TimeStampStatus }

    private _previous?: INmeaPosition

    public set previous(previous: INmeaPosition | undefined) {
        this._previous = previous
    }

    public get previous(): INmeaPosition | undefined {
        if (!this._previous) {
            this._previous = this.collection.findBefore(this)
        }
        return this._previous
    }

    public get latlng(): ILatLng {
        return {
            lat: this.Latitude,
            lng: this.Longitude
        }
    }

    constructor(collection: INmeaPositionCollection, model?: INmeaPosition) {
        super()
        this.collection = collection
        this.parser = new NmeaPositionParser(this)
        this.formatter = new NmeaPositionFormatter(this)

        if (model) {
            this.fromModel(model)
        }
    }

    public fromModel(model: INmeaPosition): INmeaPosition {
        const fields: any[keyof INmeaPosition] = [
            '_id',
            'AIS', 'Channel', 'MMSI', 'TimeStamp',
            'Location', 'Data',
            'CreatedAt', 'CreatedBy', 'UpdatedAt', 'UpdatedBy',
            'Sender',
            'RAW'
        ]

        for (const field of fields) {
            this[field] = model[field]
        }

        return this
    }

    public async toModel(bin: string, utc: moment.Moment, raw: string[]): Promise<INmeaPosition> {
        const data: INmeaPositionData = await this.parser.parse(bin, utc, raw)
        const result: INmeaPosition = { _id: this.collection.database.createObjectID(), ...data }
        this.fromModel(result)

        if (!this.isValid()) {
            throw new Error(`Invalid Position (${result.MMSI})`)
        }

        return this
    }

    // ***************************************
    // Storage
    // ***************************************

    public toJSON(): INmeaPosition {
        const fields: any[keyof INmeaPosition] = [
            '_id',
            'AIS', 'Channel', 'MMSI', 'TimeStamp',
            'Location', 'Data',
            'CreatedAt', 'CreatedBy', 'UpdatedAt', 'UpdatedBy',
            'Sender',
            'RAW'
        ]

        return super._toJSON(fields)
    }

    public toDB(): INmeaPositionDB {
        const head: any[keyof INmeaPosition] = [
            'UpdatedAt', 'UpdatedBy'
        ]

        const tail: any[keyof INmeaPosition] = [
            '_id',
            'TimeStamp',
            'AIS', 'Channel', 'MMSI',
            'Location', 'Data', 'RAW',
            'CreatedAt', 'CreatedBy'
        ]

        let maxDistance = 15
        if (this.PositionAccuracy === 1) {
            if (this.SOG > 1) {
                maxDistance = this.chkDistance[0]
            } else {
                maxDistance = this.chkDistance[1]
            }
        }

        const result: INmeaPositionDB = {
            filter: {
                MMSI: this.MMSI,
                Location: {
                    $nearSphere: {
                        $geometry: this.Location,
                        $minDistance: 0,
                        $maxDistance: maxDistance
                    }
                },
                TimeStamp: {
                    $gte: moment(this.TimeStamp).subtract(2, 'minute').toDate(),
                    $lt: moment(this.TimeStamp).add(2, 'minute').toDate()
                }
            },
            reject: {
                MMSI: this.MMSI,
                TimeStamp: this.TimeStamp
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
        return this.MMSI > 0 && this.TimeStampStatus < 60
            && this.Longitude >= -180 && this.Latitude >= -90
            && this.Longitude <= 180 && this.Latitude <= 90
    }

    private calcDistanceMoved(previous: INmeaPosition): number {
        const geod = GeographicLib.Geodesic.WGS84;
        const res = geod.Inverse(this.Latitude, this.Longitude, previous.Latitude, previous.Longitude).s12
        return Number(res.toFixed(2))
    }

    public calcDerivedSpeed(previous: INmeaPosition): number {
        const ctime = moment(this.TimeStamp)
        const ptime = moment(previous.TimeStamp)
        const diff = Math.abs(ptime.diff(ctime, 'seconds'))

        if (diff > 0) {
            const res = this.calcDistanceMoved(previous) / diff
            return Number(res.toFixed(2))
        }
        return -1
    }

    public compare(other: INmeaPosition): boolean {
        const fields: any[keyof INmeaPosition] = [
            'MMSI', 'Longitude', 'Latitude', 'SOG', 'COG',
            'TrueHeading', 'NavigationStatus', 'TimeStamp'
        ]

        return fields.every((key: any) => this[key] === other[key])
    }

    public calcWithinBBbox(bbox: string): boolean {
        const bounds = bbox.split(',')

        const northeast = { lat: Number(bounds[1]), lng: Number(bounds[0]) }
        const southwest = { lat: Number(bounds[3]), lng: Number(bounds[2]) }
        const position = { lat: this.Latitude, lng: this.Longitude }

        return (southwest.lat >= position.lat)
            && (northeast.lat <= position.lat)
            && (southwest.lng >= position.lng)
            && (northeast.lng <= position.lng);
    }

    // ***************************************
    // Report
    // ***************************************

    public toReport(): string[] {
        const fields: any[keyof INmeaPosition] = [
            '_id', 'Latitude', 'Longitude', 'ROT', 'SOG', 'COG', 'TrueHeading',
            'NavigationStatus', 'PositionAccuracy', 'TimeStamp', 'TimeStampStatus',
            'CreatedAt', 'CreatedBy', 'UpdatedAt', 'UpdatedBy'
        ]

        return super._toReport(Description, fields)
    }

    public toReportDiff(other: INmeaPosition): string[] {
        const fields: any[keyof INmeaPosition] = [
            '_id', 'Latitude', 'Longitude', 'ROT', 'SOG', 'COG', 'TrueHeading',
            'NavigationStatus', 'PositionAccuracy', 'TimeStamp', 'TimeStampStatus',
            'CreatedAt', 'CreatedBy', 'UpdatedAt', 'UpdatedBy'
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
                key: 'Sender',
                val: this.format('Sender')
            }
        ]

        return data
    }
}