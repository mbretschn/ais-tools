import { IDatabase, IMessageLogger } from '../../lib/Interfaces'
import { INmeaIterableCollection, INmeaModel, INmeaDB } from '../AbstractNmea/INmea'
import { INmeaDefaultData, INmeaDefaultCollection } from '../NmeaDefault/INmeaDefault'

export type TLocation = 'point'

export interface ILatLng {
    lat: number
    lng: number
}

export interface ILocation {
    type: string
    coordinates: number[]
}

export interface INamePositionDataParsed {
    Longitude: number
    Latitude: number
    ROT: number
    SOG: number
    COG: number
    TrueHeading: number
    NavigationStatus: number
    PositionAccuracy: number
    TimeStampStatus: number
}

export interface INmeaPositionData extends INmeaDefaultData {
    [key: string]: any

    Location: ILocation
    Data: INamePositionDataParsed
}

export interface INmeaPosition extends INmeaPositionData, INmeaModel {
    [key: string]: any

    _id: string
}

export interface INmeaPositionDB extends INmeaDB {
    filter: any,
    head: INmeaPosition,
    tail: INmeaPosition
}

export interface INmeaPositionCollection extends INmeaDefaultCollection, INmeaIterableCollection {
    logger: IMessageLogger
    database: IDatabase
    Sender: string

    model(data: any): any
    create(current: INmeaPosition): Promise<INmeaPosition>
    findBefore(current: INmeaPosition): INmeaPosition | undefined
}