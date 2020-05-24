import { IDatabase, IMessageLogger } from '../../lib/Interfaces'
import { INmeaModel, INmeaData, INmeaDB, INmeaCollection } from '../AbstractNmea/INmea'

export interface INmeaDefaultData extends INmeaData {
    [key: string]: any
}

export interface INmeaDefault extends INmeaDefaultData, INmeaModel {
    [key: string]: any

    _id: string
}

export interface INmeaDefaultDB extends INmeaDB {
    filter: any,
    head: INmeaDefault,
    tail: INmeaDefault
}

export interface INmeaDefaultCollection extends INmeaCollection {
    logger: IMessageLogger
    database: IDatabase
    Sender: string

    model(data: any): any
    create(current: INmeaDefault): Promise<INmeaDefault>
}