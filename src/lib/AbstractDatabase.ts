import { TColNames, IDatabase } from './Interfaces'
import { INmeaDB, INmeaFetchConfig } from '../models/AbstractNmea/INmea'

export abstract class AbstractDatabase implements IDatabase {
    abstract sender: string
    connect(): Promise<undefined> {
        throw new Error("Method not implemented.")
    }
    close(): Promise<undefined> {
        throw new Error("Method not implemented.")
    }
    createObjectID(): string {
        throw new Error("Method not implemented.")
    }
    create(colName: TColNames, data: any): Promise<any> {
        throw new Error("Method not implemented.")
    }
    update(colName: TColNames, data: INmeaDB): Promise<any> {
        throw new Error("Method not implemented.")
    }
    findOne(colName: TColNames, filter: any): Promise<any> {
        throw new Error("Method not implemented.")
    }
    findAll(colName: TColNames, filter?: any, limit?: number | undefined, options?: INmeaFetchConfig): Promise<any> {
        throw new Error("Method not implemented.")
    }
    tail(name: TColNames, filter?: any) {
        throw new Error("Method not implemented.")
    }
}
