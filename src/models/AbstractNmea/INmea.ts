import { default as moment } from 'moment'
import { IDatabase, IMessageLogger } from '../../lib/Interfaces'

export type TPositionDirection = 'Bow' | 'Stern'
export type TMomentKeys =  'days' | 'day' | 'hours' | 'hour' | 'minutes' | 'minute'

export interface INmeaFetchConfig {
    cache?: boolean
    force?: boolean
    unique?: boolean
}

export interface INmeaLookup {
    value: number,
    description: string
}

export interface INmeaInfo {
    key: string
    val: string | string[]
}

export interface INmeaFieldDescriptions {
    [key: string]: string
}

export interface INmeaDataSender {
    Name: string,
    TimeStamp: Date
    Diff?: any
}

export interface INmeaData {
    [key: string]: any

    AIS: number
    Channel: string
    MMSI: number
    TimeStamp: Date
    Sender: INmeaDataSender[]
    CreatedAt: Date
    CreatedBy: string
    UpdatedAt: Date
    UpdatedBy: string

    RAW: string[]
}

export interface INmeaDB {
    filter: any,
    reject?: any,
    head: INmeaModel,
    tail: INmeaModel
}

export interface INmeaModel extends INmeaData {
    [key: string]: any

    _id: string
}

export interface INmeaCollection {
    logger: IMessageLogger
    database: IDatabase
    Sender: string

    model(data: INmeaModel): INmeaModel

    // ***************************************
    // Storage
    // ***************************************

    create(current: INmeaModel): Promise<INmeaModel>
}

export interface INmeaIterableCollection extends INmeaCollection {
    on(eventName: string, callback: (payload: any) => void): void
    off(eventName: string, callback: (payload: any) => void): void
}

export interface INmeaFormatter {
    model: INmeaModel
    format(name: keyof INmeaModel): string
}

export interface INmeaParser<T extends INmeaData> {
    model: INmeaModel

    parse_default(input: any): any
    parse_int(input: any): number
    parse_bool(input: any): boolean
    parse_aisstr6(bits: string): string
    parse_uint(input: any, nbit: number): number

    parse(bin: string, utc: moment.Moment, raw: string[]): Promise<T>
}