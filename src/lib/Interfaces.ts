import { INmeaData, INmeaDB, INmeaInfo, INmeaFetchConfig } from '../models/AbstractNmea/INmea'
import { RGBColor } from './RGBColor'
export type TColNames = 'positions' | 'ships' | 'defaults' | 'messages' | 'images'
export type TLogLevels = 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly'
export type TColors = '.rgba-primary-0' | '.rgba-primary-1' | '.rgba-primary-2' | '.rgba-primary-3' | '.rgba-primary-4'

export interface IColor {
    [key: string]: any

    idx: TColors,
    color: RGBColor
}

export interface IColors {
    name: string
    colors: IColor[]
}

export interface IQuery {
    [key: string]: any
}

export interface IDatabase {
    sender: string
    connect(): Promise<undefined>
    close(): Promise<undefined>

    createObjectID(): string

    create(colName: TColNames, data: INmeaDB): Promise<INmeaData>
    update(colName: TColNames, data: INmeaDB): Promise<INmeaData>

    findOne(colName: TColNames, filter: any): Promise<any>
    findAll(colName: TColNames, filter?: any, limit?: number, options?: INmeaFetchConfig): Promise<any>
    tail(name: TColNames, filter?: any): any
}

export interface IDbConfig {
    url: string,
    options: any,
    dbName: string
    sender: string
}

export interface IMessageLogger {
    level: number
    error(message: string, opt?: any): void
    warn(message: string, opt?: any): void
    info(message: string, opt?: any): void
    debug(message: string, opt?: any): void
    verbose(message: string, opt?: any): void
    silly(message: string, opt?: any): void
}

export interface IMessageLoggerConfig {
    level: TLogLevels
    filter: number
    filename?: string
    custom?: any
    zippedArchive: boolean
}

export interface IMessage {
    message: string
    data?: INmeaInfo[]
}