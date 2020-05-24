import { default as moment } from 'moment'
import { MongoClient, ObjectID } from 'mongodb'
import { INmeaDB, INmeaFetchConfig } from '../models/AbstractNmea/INmea'
import { TColNames, IDbConfig } from './Interfaces'
import { AbstractDatabase } from './AbstractDatabase'

export interface IDiff {
    [key: string]: any
}

export interface IAdd {
    [key: string]: any
}

export class Database extends AbstractDatabase {
    public sender: string
    private config: any

    public db: any
    private client: MongoClient
    private expireAfterSeconds: number = 60 * 60 * 24

    constructor(config: IDbConfig) {
        super()

        this.config = config
        this.sender = this.config.sender

        this.client = new MongoClient(this.config.url, this.config.options)
    }

    public createObjectID(): string {
        return String(new ObjectID())
    }

    public tail(colName: TColNames, filter?: any): any {
        if (filter) {
            return this.db.collection(colName).find(filter).addCursorFlag('tailable', true)
        } else {
            return this.db.collection(colName).find().addCursorFlag('tailable', true)
        }
    }

    public async findAll(colName: TColNames, filter: any = {}, limit: number = 0, options?: INmeaFetchConfig): Promise<any> {
        return this.db.collection(colName).find(filter).sort([['TimeStamp', -1]]).limit(limit).toArray()
    }

    // NmeaShipdata
    public async update(name: TColNames, data: INmeaDB): Promise<any> {
        const foundA = await this.db.collection(name).findOne(data.filter)

        if (!foundA) {
            data.tail.Sender = [{
                Name: data.tail.CreatedBy,
                TimeStamp: data.tail.CreatedAt
            }]
        }

        await this.db.collection(name).updateOne(data.filter, {
            $set: data.head,
            $setOnInsert: data.tail,
        }, { upsert: true })

        if (!foundA) {
            const foundB = await this.db.collection(name).findOne(data.filter)

            if (foundB.AIS === 5) {
                await this.db.collection('messages').insertOne({
                    Type: 'NmeaShipdata',
                    Data: foundB,
                    TimeStamp: Date.now()
                })
            }

            return foundB
        }

        return foundA
    }

    // NmeaPosition, NmeaDefault
    public async create(name: TColNames, data: INmeaDB): Promise<any> {
        if (data.reject) {
            const reject = await this.db.collection(name).findOne(data.reject)
            if (reject) {
                return
            }
        }

        await this.db.collection(name).updateOne(data.filter, {
            $set: data.head,
            $setOnInsert: data.tail,
            $addToSet: {
                Sender: {
                    Name: data.tail.CreatedBy,
                    TimeStamp: data.tail.CreatedAt
                }
            }
        }, { upsert: true })

        const foundA = await this.db.collection(name).findOne(data.filter)

        await this.db.collection(name).updateOne({ _id: foundA._id }, {
            $pull: {
                Sender: {
                    TimeStamp: {
                        $lt: new Date(moment().subtract(2, 'minutes').toISOString())
                    }
                }
            }
        })

        const foundB = await this.db.collection(name).findOne(data.filter)

        if (foundB.AIS < 4 && foundB.Sender.length === 1) {
            await this.db.collection('messages').insertOne({
                Type: 'NmeaPosition',
                Data: foundB,
                TimeStamp: Date.now()
            })
        }

        return foundB
    }

    public async findOne(name: TColNames, filter: any): Promise<any> {
        const result = await this.db.collection(name).find(filter).sort([['TimeStamp', -1]]).limit(1).toArray()
        return result[0]
    }

    public async connect(): Promise<undefined> {
        await this.client.connect()

        this.db = this.client.db(this.config.dbName)

        const collections = await this.db.listCollections().toArray()

        if (!collections.find((collection: any) => collection.name === 'messages')) {
            await this.db.createCollection('messages', { capped: true, size: 100000 })
            await this.db.collection('messages').insertOne({ type: 'init', message: 'capped collection created' })
        }

        if (!collections.find((collection: any) => collection.name === 'defaults')) {
            await this.db.createCollection('defaults')
        }

        if (!await this.db.collection('defaults').indexExists("TimeStamp_1")) {
            await this.db.collection('defaults').createIndex({ "TimeStamp": 1 }, { expireAfterSeconds: this.expireAfterSeconds })
        }

        if (!collections.find((collection: any) => collection.name === 'ships')) {
            await this.db.createCollection('ships')
        }

        if (!collections.find((collection: any) => collection.name === 'positions')) {
            await this.db.createCollection('positions')
        }

        if (!await this.db.collection('positions').indexExists("TimeStamp_1")) {
            await this.db.collection('positions').createIndex({ "TimeStamp": 1 }, { expireAfterSeconds: this.expireAfterSeconds })
            await this.db.collection('positions').createIndex({ "Location" : "2dsphere" })
        }

        if (!collections.find((collection: any) => collection.name === 'images')) {
            await this.db.createCollection('images')
        }

        return
    }

    public async close(): Promise<undefined> {
        await this.client.close()
        return
    }
}
