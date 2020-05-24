import { default as moment } from 'moment'
import { default as GeographicLib } from 'geographiclib'
import { TColNames, IQuery } from '../../lib/Interfaces'
import { TMomentKeys, INmeaFetchConfig, INmeaIterableCollection } from '../AbstractNmea/INmea'
import { AbstractNmeaIterableCollection } from '../AbstractNmea/AbstractNmeaIterableCollection'
import { INmeaShipdataCollection, INmeaShipdata } from './INmeaShipdata'
import { NmeaShipdata } from './NmeaShipdata'


export class NmeaShipdataCollection extends AbstractNmeaIterableCollection<INmeaShipdata> implements INmeaIterableCollection, INmeaShipdataCollection {
    collectionName: TColNames = 'ships'
    isSubscription: boolean = false
    typeSubscription: string = 'NmeaShipdata'

    public model(data: INmeaShipdata): INmeaShipdata {
        return new NmeaShipdata(this, data)
    }

    // ***************************************
    // Storage
    // ***************************************

    public comperator(a: INmeaShipdata, b: INmeaShipdata) {
        if (a.Name > b.Name) { return 1 }
        if (b.Name > a.Name) { return -1 }
        return 0
    }

    public async create(current: INmeaShipdata): Promise<INmeaShipdata> {
        const data = await this.database.update(this.collectionName, current.toDB()) as INmeaShipdata
        const res = this.model(data)
        this.info('NmeaShipdata created', current)
        return res
    }

    public async onSubscription(data: any): Promise<void> {
        if (!this.isSubscription) {
            return
        }
        const toRemove: INmeaShipdata[] = []

        const ship = this.model(data.Data)

        const idx = this.collection.findIndex(shipdata => shipdata.MMSI === ship.MMSI)
        if (idx > -1) {
            const found = this.collection[idx]
            found.fromModel(data.Data)
        } else {
            this._collection.unshift(ship)
            this._collection.sort(this.comperator)
        }

        const timeout = moment()
        timeout.subtract(1, 'day')

        for (const item of this) {
            const time = moment(item.TimeStamp)

            if (time.isBefore(timeout)) {
                toRemove.push(item)
            }
        }

        this._collection = this._collection.filter(item => {
            return toRemove.findIndex(remove => remove._id === item._id) < 0
        })

        this.emit('shipdata', ship)
    }

    // ***************************************
    // Find
    // ***************************************

    public async fetch(filter: any = {}, limit: number = 0): Promise<INmeaShipdata[]> {
        this._collection = []

        const data = await this.database.findAll(this.collectionName, filter, limit)

        if (Array.isArray(data)) {
            for (const item of data) {
                this._collection.push(this.model(item))
            }
            this._collection.sort(this.comperator)
        }

        return this._collection
    }

    public async find(filter: any): Promise<INmeaShipdata | undefined> {
        const item = await this.database.findOne(this.collectionName, filter)
        if (item) {
            const res = this.model(item)
            this._collection.push(res)
            return res
        }
    }

    public async findByMMSI(mmsi: number, options?: INmeaFetchConfig): Promise<INmeaShipdata | undefined> {
        const cache = options && options.cache !== undefined ? options.cache : false
        const force = options && options.force !== undefined ? options.force : true

        if (cache) {
            const idx = this._collection.findIndex(ship => ship.MMSI === mmsi)
            if (idx >= 0) {
                return this._collection[idx]
            }
        }

        if (force) {
            const data = await this.database.findOne(this.collectionName, { MMSI: mmsi })
            if (data) {
                const item = this.model(data)
                if (cache === true) {
                    this._collection.unshift(item)
                }
                return item
            }
        }
    }
}
