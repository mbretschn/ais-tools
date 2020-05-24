import { Feature } from 'geojson'
import { INmeaPosition } from '../NmeaPosition/INmeaPosition'
import { INmeaPositionFeatureCollection } from './INmeaPositionFeature'
import { NmeaPositionCollection } from '../NmeaPosition/NmeaPositionCollection'
import { NmeaPositionFeature } from './NmeaPositionFeature'
import { Color } from '../../lib/Color'
import { ColorSchemes } from '../../lib/Colors'

export class NmeaPositionFeatureCollection extends NmeaPositionCollection implements INmeaPositionFeatureCollection {
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

    public model(data: INmeaPosition): NmeaPositionFeature {
        return new NmeaPositionFeature(this, data)
    }

    // ***************************************
    // GeoJSON
    // ***************************************

    public async toTrack(d: number = 5): Promise<Feature[]> {
        let track: Feature[] = []

        let idx: number = 0
        for (const current of this._collection) {
            if (++idx < this.collection.length) {
                const feature = await current.toTrackFragment(d)
                track = track.concat(feature)
            }
        }

        return track
    }

    public async toFeatureCollection(d: number = 5): Promise<Feature[]> {
        let features: Feature[] = []

        let idx: number = 0
        for (const current of this._collection) {
            if (idx > 0) {
                const fragment = await current.toFeature(d)
                if (fragment) {
                    features = features.concat(fragment)
                }
            }
            idx++
        }

        return features
    }
}
