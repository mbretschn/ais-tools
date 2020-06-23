import { FeatureCollection, Feature } from 'geojson'
import { IMessageLogger, IDatabase } from '../../lib/Interfaces'
import { INmeaFetchConfig, TMomentKeys } from '../AbstractNmea/INmea'
import { NmeaShipdataFeatureCollection } from '../NmeaShipdataFeature/NmeaShipdataFeatureCollection'
import { NmeaPositionFeatureCollection } from '../NmeaPositionFeature/NmeaPositionFeatureCollection'
import { NmeaPositionFeature } from '../NmeaPositionFeature/NmeaPositionFeature'
import { INmeaShipdata } from '../NmeaShipdata/INmeaShipdata'
import { Ship } from './Ship'

export class ShipCollection extends NmeaShipdataFeatureCollection {
    positions: NmeaPositionFeatureCollection

    constructor(db: IDatabase, logger: IMessageLogger) {
        super(db, logger)
        this.positions = new NmeaPositionFeatureCollection(db, logger)
    }

    public emitPosition = async (position: NmeaPositionFeature): Promise<void> => {
        this.emit('position', position)
    }

    public emitShip = async (ship: Ship): Promise<void> => {
        const position = await this.positions.findByMMSI(ship.MMSI, { cache: true, force: false })
        if (position) {
            ship.position = position as NmeaPositionFeature
        }
        this.emit('ship', ship)
    }

    public unsubscribe(): void {
        this.off('shipdata', this.emitShip)
        this.positions.off('position', this.emitPosition)
        super.unsubscribe()
        this.positions.unsubscribe()
    }

    public async subscribe(): Promise<void> {
        await super.subscribe()
        await this.positions.subscribe()

        for (const ship of this) {
            const position = await this.positions.findByMMSI(ship.MMSI, { cache: true, force: false })
            if (position) {
                ship.position = position as NmeaPositionFeature
            }
        }

        this.on('shipdata', this.emitShip)
        this.positions.on('position', this.emitPosition)
    }

    public model(data: INmeaShipdata): Ship {
        const ship = new Ship(this, data)
        return ship
    }

    // ***************************************
    // Find
    // ***************************************

    public async findByMMSI(mmsi: number, options?: INmeaFetchConfig): Promise<Ship> {
        const shipdata = await super.findByMMSI(mmsi, options)
        if (shipdata) {
            let ship = this.collection.find(item => item.MMSI === shipdata.MMSI)
            if (!ship) {
                ship = this.model(shipdata)
            }

            const position = await this.positions.findByMMSI(mmsi, options)
            if (position) {
                ship.position = position as NmeaPositionFeature
            } else {
                throw new Error(`Position not found, MMSI(${mmsi})`)
            }
            return ship as Ship
        }
        throw new Error(`Shipdata not found, MMSI(${mmsi})`)
    }

    public async fetchInterval(sl: number, sk: TMomentKeys, el?: number, ek?: TMomentKeys, limit: number = 0): Promise<ShipCollection> {
        this._collection = []

        await this.positions.fetchIntervalAll(sl, sk, el, ek, limit)

        if (!this.positions.isEmpty) {
            await this.fetch({ MMSI: { $in: this.positions.collection.map(position => position.MMSI) } })

            for (const ship of this) {
                const position = await this.positions.findByMMSI(ship.MMSI, { cache: true, force: false })
                if (position) {
                    ship.position = position as NmeaPositionFeature
                }
            }
        }

        return this
    }

    // ***************************************
    // GeoJSON
    // ***************************************

    public async toFeatureCollection(): Promise<FeatureCollection> {
        const features: Feature[] = []

        for (const ship of this) {
            try {
                const feature = ship.toFeature()
                features.push(...feature)
            } catch (ex) {
                if (ex.message !== 'No Position for Ship') {
                    throw(ex)
                }
            }
        }

        const featureCollection: FeatureCollection = {
            "type": "FeatureCollection",
            "features": features
        }

        return featureCollection
    }
}
