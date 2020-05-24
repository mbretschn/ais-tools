import { default as moment } from 'moment'
import { default as GeographicLib } from 'geographiclib'
import { TColNames } from '../../lib/Interfaces'
import { TMomentKeys, INmeaFetchConfig, INmeaIterableCollection } from '../AbstractNmea/INmea'
import { AbstractNmeaIterableCollection } from '../AbstractNmea/AbstractNmeaIterableCollection'
import { INmeaPositionCollection, INmeaPosition } from './INmeaPosition'
import { NmeaPosition } from './NmeaPosition'

export class NmeaPositionCollection extends AbstractNmeaIterableCollection<INmeaPosition> implements INmeaIterableCollection, INmeaPositionCollection {
    collectionName: TColNames = 'positions'
    isSubscription: boolean = false
    typeSubscription: string = 'NmeaPosition'

    public model(data: INmeaPosition): INmeaPosition {
        return new NmeaPosition(this, data)
    }

    // ***************************************
    // Storage
    // ***************************************

    public comperator(a: INmeaPosition, b: INmeaPosition) {
        return b.TimeStamp.getTime() - a.TimeStamp.getTime()
    }

    public findBefore(current: INmeaPosition): INmeaPosition | undefined {
        let before: INmeaPosition | undefined
        let item: INmeaPosition

        const cur = moment(current.TimeStamp)

        let cnt = 0
        while (item = this._collection[cnt++]) {
            if (current.MMSI !== item.MMSI) {
                continue;
            }
            const oth = moment(item.TimeStamp)
            if (cur.isAfter(oth)) {
                before = item
                break
            }
        }

        return before
    }

    public async create(current: INmeaPosition): Promise<INmeaPosition> {
        const data = await this.database.create(this.collectionName, current.toDB()) as INmeaPosition
        const res = this.model(data)
        this.info('NmeaPosition created', current)
        return res
    }

    public async onSubscription(data: any): Promise<undefined> {
        if (!this.isSubscription) {
            return
        }

        const position = this.model(data.Data)

        this._collection.unshift(position)
        this._collection.sort(this.comperator)

        const toRemove: INmeaPosition[] = []

        const timeout = moment()
        timeout.subtract(1, 'hour')

        for (const item of this) {
            const time = moment(item.TimeStamp)

            if (time.isBefore(timeout)) {
                toRemove.push(item)
            }
        }

        this._collection = this._collection.filter(item => {
            return toRemove.findIndex(remove => remove._id === item._id) < 0
        })

        this.emit('position', position)
    }

    // ***************************************
    // Find
    // ***************************************

    public async fetch(filter: any, limit: number = 0, options?: INmeaFetchConfig): Promise<INmeaPosition[]> {
        const unique = options && options.unique !== undefined ? options.unique : false

        this._collection = []

        const collection = await this.database.findAll(this.collectionName, filter, limit, options)

        if (Array.isArray(collection)) {
            if (unique === true) {
                for (const item of collection) {
                    const p = this.model(item)
                    if (this._collection.findIndex(h => h.MMSI === p.MMSI) < 0) {
                        this._collection.push(p)
                    }
                }
            } else {
                for (const item of collection) {
                    this._collection.push(this.model(item))
                }
            }

            this._collection.sort(this.comperator)
        }

        return this._collection
    }

    public async find(filter: any): Promise<INmeaPosition | undefined> {
        const item = await this.database.findOne(this.collectionName, filter)
        if (item) {
            return this.model(item)
        }
    }

    public async findByMMSI(mmsi: number, options?: INmeaFetchConfig): Promise<INmeaPosition | undefined> {
        const cache = options && options.cache !== undefined ? options.cache : false
        const force = options && options.force !== undefined ? options.force : true

        if (cache) {
            const idx = this._collection.findIndex(item => item.MMSI === mmsi)
            if (idx > -1) {
                return this._collection[idx]
            }
        }

        if (force) {
            const item = await this.database.findOne(this.collectionName, { MMSI: mmsi })
            if (item) {
                return this.model(item)
            }
        }
    }

    public async findClosest(current: NmeaPosition): Promise<INmeaPosition | undefined> {
        const geod = GeographicLib.Geodesic.WGS84;

        let distance = -1
        let nearest
        for (const item of this) {
            if (item.MMSI === current.MMSI) {
                const dist = geod.Inverse(current.Latitude, current.Longitude, item.Latitude, item.Longitude).s12
                if (distance < 0 || dist < distance) {
                    distance = dist
                    nearest = item
                }
            }
        }

        return nearest
    }

    public async fetchInterval(filter: any, sl: number, sk: TMomentKeys, el?: number, ek?: TMomentKeys, limit: number = 0, options: INmeaFetchConfig = {}): Promise<INmeaPosition[]> {
        const s = moment()
        s.subtract(sl, sk)

        if (el && ek) {
            const e = moment()
            e.subtract(sl, sk)
            return await this.fetch(Object.assign(filter, { "TimeStamp": { "$gt": s.toDate(), "$lt": e.toDate() } }), limit, options)
        } else {
            return await this.fetch(Object.assign(filter, { "TimeStamp": { "$gt": s.toDate() } }), limit, options)
        }
    }

    public async fetchIntervalAll(sl: number, sk: TMomentKeys, el?: number, ek?: TMomentKeys, limit: number = 0): Promise<INmeaPosition[]> {
        return this.fetchInterval({}, sl, sk, el, ek, limit, { unique: true })
    }
}