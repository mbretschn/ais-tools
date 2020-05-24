import { INmeaShipdata } from '../NmeaShipdata/INmeaShipdata'
import { NmeaShipdataCollection } from '../NmeaShipdata/NmeaShipdataCollection'
import { NmeaShipdataFeature } from './NmeaShipdataFeature'

export class NmeaShipdataFeatureCollection extends NmeaShipdataCollection {
    public model(data: INmeaShipdata): NmeaShipdataFeature {
        return new NmeaShipdataFeature(this, data)
    }
}
