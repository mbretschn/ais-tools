import { IDatabase, IMessageLogger } from '../../lib/Interfaces'
import { INmeaIterableCollection, INmeaModel, INmeaDB } from '../AbstractNmea/INmea'
import { INmeaDefaultData, INmeaDefaultCollection } from '../NmeaDefault/INmeaDefault'

export interface INmeaShipdataDataParsed {
    AISversion: number
    IMOnumber: number
    CallSign: string
    Name: string
    ShipType: number
    DimA: number
    DimB: number
    DimC: number
    DimD: number
    PositionType: number
    ETA: string
    Draught: number
    Destination: string
}

export interface INmeaShipdataData extends INmeaDefaultData {
    [key: string]: any

    Data?: INmeaShipdataDataParsed
}

export interface INmeaShipdata extends INmeaShipdataData, INmeaModel {
    [key: string]: any

    _id: string
}

export interface INmeaShipdataDB extends INmeaDB {
    filter: any,
    head: INmeaShipdata,
    tail: INmeaShipdata
}

export interface INmeaShipdataCollection extends INmeaDefaultCollection, INmeaIterableCollection {
    logger: IMessageLogger
    database: IDatabase
    Sender: string

    model(data: any): any
    create(current: INmeaShipdata): Promise<INmeaShipdata>
}