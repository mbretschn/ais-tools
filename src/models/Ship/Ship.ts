import { default as moment } from 'moment'
import { FeatureCollection, Feature } from 'geojson'
import { TMomentKeys } from '../AbstractNmea/INmea'
import { INmeaPosition } from '../NmeaPosition/INmeaPosition'
import { INmeaShipdataCollection, INmeaShipdata } from '../NmeaShipdata/INmeaShipdata'
import { NmeaPositionFeature } from '../NmeaPositionFeature/NmeaPositionFeature'
import { NmeaPositionFeatureCollection } from '../NmeaPositionFeature/NmeaPositionFeatureCollection'
import { NmeaShipdataFeature } from '../NmeaShipdataFeature/NmeaShipdataFeature'

export class Ship extends NmeaShipdataFeature {
    private _position?: NmeaPositionFeature
    private _positions: NmeaPositionFeatureCollection
    private subscriptions: number = 0

    constructor(collection: INmeaShipdataCollection, model?: INmeaShipdata) {
        super(collection, model)

        this._positions = new NmeaPositionFeatureCollection(collection.database, collection.logger)
    }

    public async fetchInterval(sl: number, sk: TMomentKeys, el?: number, ek?: TMomentKeys, limit: number = 0): Promise<INmeaPosition[]> {
        const positions = await this._positions.fetchInterval({ MMSI: this.MMSI }, sl, sk, el, ek, limit)
        this.position = positions[0] as NmeaPositionFeature
        return positions
    }

    private emitShip = (ship: Ship): void => {
        if (ship.MMSI === this.MMSI) {
            this.emit('ship', this.fromModel(ship))
        }
    }

    private emitPosition = (position: NmeaPositionFeature): void => {
        if (position.MMSI === this.MMSI) {
            let isAfter = true
            if (this._position) {
                const A = moment.utc(position.TimeStamp)
                const B = moment.utc(this._position.TimeStamp)
                if (A.isBefore(B)) {
                    isAfter = false
                }
            }

            if (isAfter) {
                this._position = position
                this.emit('position', position)
            }
        }
    }

    public unsubscribe(): void {
        this.subscriptions--
        if (this.subscriptions === 0) {
            this.collection.off('shipdata', this.emitShip)
            this._positions.off('position', this.emitPosition)
            this._positions.unsubscribe()
        }
    }

    public async subscribe(): Promise<void> {
        this.subscriptions++
        if (this.subscriptions < 2) {
            await this._positions.subscribe()
            this._positions.on('position', this.emitPosition)
            this.collection.on('shipdata', this.emitShip)
        }
    }

    public set position(position: NmeaPositionFeature) {
        this._position = position
    }

    public get position(): NmeaPositionFeature {
        if (this._position) {
            return this._position
        }
        throw new Error('Ship has no position')
    }

    public set positions(positions: NmeaPositionFeatureCollection) {
        this._positions = positions
    }

    public get positions(): NmeaPositionFeatureCollection {
        if (this._positions) {
            return this._positions
        }
        throw new Error('Ship has no positions')
    }

    public toJSON(): any {
        if (this._position) {
            return {...super.toJSON(), position: {...this._position.toJSON()}}
        }
        return {...super.toJSON(), position: {}}
    }

    public toReport(): string[] {
        const report: string[] = super.toReport()

        if (this._position) {
            return report.concat(this._position.toReport())
        }

        return report
    }

    public toFeature(): Feature[] {
        if (!this._position) {
            throw new Error('No Position for Ship')
        }

        return super.toFeature(this._position)
    }

    public async toFeatureCollection(sl: number, sk: TMomentKeys, length: number = 10): Promise<FeatureCollection> {
        let features: Feature[] = []

        if (this._positions) {
            await this._positions.fetchInterval({ MMSI: this.MMSI }, sl, sk, undefined, undefined, length, { unique: false })

            const track = await this._positions.toTrack()
            features = features.concat(track)
        }

        features = features.concat(this.toFeature())

        const featureCollection: FeatureCollection = {
            "type": "FeatureCollection",
            "features": features
        }

        return featureCollection
    }

    public async toTrackFragment(): Promise<Feature[] | undefined> {
        if (this._position) {
            const features: Feature[] = await this._position.toTrackFragment()
            return features.concat(this.toFeature())
        }
    }
}
