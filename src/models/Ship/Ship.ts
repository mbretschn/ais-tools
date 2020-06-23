import { default as moment } from 'moment'
import { FeatureCollection, Feature } from 'geojson'
import { TMomentKeys } from '../AbstractNmea/INmea'
import { INmeaPosition } from '../NmeaPosition/INmeaPosition'
import { INmeaShipdata } from '../NmeaShipdata/INmeaShipdata'
import { NmeaPositionFeature } from '../NmeaPositionFeature/NmeaPositionFeature'
import { NmeaPositionFeatureCollection } from '../NmeaPositionFeature/NmeaPositionFeatureCollection'
import { NmeaShipdataFeature } from '../NmeaShipdataFeature/NmeaShipdataFeature'
import { ShipCollection } from './ShipCollection'
import { Color } from '../../lib/Color'
import { ColorSchemes } from '../../lib/Colors'

export class Ship extends NmeaShipdataFeature {
    private _position?: NmeaPositionFeature
    private _positions: NmeaPositionFeatureCollection
    private subscriptions: number = 0
    public collection: ShipCollection

    private _color?: Color

    get color(): Color {
        if (!this._color) {
            this._color = ColorSchemes.get(0)
        }
        return this._color
    }

    set color(color: Color) {
        this._color = color
    }

    constructor(collection: ShipCollection, model?: INmeaShipdata) {
        super(collection, model)
        this.collection = collection
        this._positions = new NmeaPositionFeatureCollection(collection.database, collection.logger)
    }

    public async fetchInterval(sl: number, sk: TMomentKeys, el?: number, ek?: TMomentKeys, limit: number = 0): Promise<INmeaPosition[]> {
        const positions = await this._positions.fetchInterval({ MMSI: this.MMSI }, sl, sk, el, ek, limit)
        const position = positions[0] as NmeaPositionFeature
        this.emitPosition(position)
        this.collection.emitPosition(position)
        return positions
    }

    private emitShip = (ship: Ship): void => {
        if (ship.MMSI === this.MMSI) {
            this.emit('ship', this.fromModel(ship))
        }
    }

    private emitPosition = (position: NmeaPositionFeature): void => {
        if (position.MMSI === this.MMSI) {
            if (!this._position || moment.utc(position.TimeStamp).isAfter(moment.utc(this.position.TimeStamp))) {
                this.position = position
            }
        }
    }

    public unsubscribe(): void {
        this.subscriptions--
        if (this.subscriptions === 0) {
            this.collection.off('shipdata', this.emitShip)
            this.positions.off('position', this.emitPosition)
            this.positions.unsubscribe()
        }
    }

    public async subscribe(): Promise<void> {
        this.subscriptions++
        if (this.subscriptions < 2) {
            await this._positions.subscribe()
            this.positions.on('position', this.emitPosition)
            this.collection.on('shipdata', this.emitShip)
        }
    }

    public set position(position: NmeaPositionFeature) {
        this._position = position
        this.emit('position', this.position)
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

            const track = await this._positions.toTrack(2, this.color)
            features = features.concat(track)
        }

        features = features.concat(this.toFeature())

        const featureCollection: FeatureCollection = {
            "type": "FeatureCollection",
            "features": features
        }

        return featureCollection
    }

    public async toTrack(): Promise<Feature[]> {
        return this.positions.toTrack(2, this.color)
    }

    public async toTrackFragment(position: NmeaPositionFeature): Promise<Feature[] | undefined> {
        return position.toTrackFragment(2, this.color)
    }
}
