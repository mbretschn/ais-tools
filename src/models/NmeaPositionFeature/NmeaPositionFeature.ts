import { Feature, Position, GeoJsonProperties } from 'geojson'
import { default as GeographicLib } from 'geographiclib'
import { TPositionDirection } from '../AbstractNmea/INmea'
import { INmeaPosition } from '../NmeaPosition/INmeaPosition'
import { INmeaPositionFeatureCollection } from './INmeaPositionFeature'
import { NmeaPosition } from '../NmeaPosition/NmeaPosition'
import { Color } from '../../lib/Color'

export class NmeaPositionFeature extends NmeaPosition {
    collection: INmeaPositionFeatureCollection

    constructor(collection: INmeaPositionFeatureCollection, model?: INmeaPosition) {
        super(collection, model)
        this.collection = collection
    }

    public toFeature(d: number = 5, color: Color, before?: INmeaPosition): Feature[] {
        before = before || this
        const features: Feature[] = []

        const senders = []
        for (const sender of this.Sender) {
            if (senders.indexOf(sender.Name) < 0) {
                senders.push(sender.Name)
            }
        }

        if (senders.length > 3) {
            features.push(before.toFeatureFragment('Bow', d, color.get(4)))
            features.push(this.toFeatureFragment('Stern', d, color.get(0)))
        } else if (senders.length > 2) {
            features.push(before.toFeatureFragment('Bow', d, color.get(4)))
            features.push(this.toFeatureFragment('Stern', d, color.get(1)))
        } else if (senders.length > 1) {
            features.push(before.toFeatureFragment('Bow', d, color.get(4)))
            features.push(this.toFeatureFragment('Stern', d, color.get(2)))
        } else {
            features.push(before.toFeatureFragment('Bow', d, color.get(4)))
            features.push(this.toFeatureFragment('Stern', d, color.get(3)))
        }

        return features
    }

    public toFeatureFragment(direction: TPositionDirection, d: number = 5, color: string): Feature {
        const geod = GeographicLib.Geodesic.WGS84

        let azi = 0
        if (this.TrueHeading < 511) {
            azi = this.TrueHeading
        } else if (this.COG < 360) {
            azi = this.COG
        }

        const lon = this.Longitude
        const lat = this.Latitude

        const a1 = geod.Direct(lat, lon, azi, d);
        const b1 = geod.Direct(lat, lon, azi - 90, d);
        const c1 = geod.Direct(lat, lon, azi - 180, d);
        const d1 = geod.Direct(lat, lon, azi + 90, d);

        let shapeCoordinates: Position[]

        if (direction === 'Stern') {
            shapeCoordinates = [
                // [a1.lon2, a1.lat2],
                [b1.lon2, b1.lat2],
                [c1.lon2, c1.lat2],
                [d1.lon2, d1.lat2]
            ];
        } else {
            shapeCoordinates = [
                [a1.lon2, a1.lat2],
                [b1.lon2, b1.lat2],
                // [c1.lon2, c1.lat2],
                [d1.lon2, d1.lat2]
            ];
        }

        return {
            'type': 'Feature',
            'geometry': {
                'type': 'Polygon',
                'coordinates': [ shapeCoordinates ]
            },
            'properties': this.featureProperties(direction, color)
        }
    }

    public featureProperties(direction: TPositionDirection, color: string): GeoJsonProperties {
        const properties: GeoJsonProperties = {
            'stroke': color,
            'fill': color,
            'stroke-width': 0,
            'stroke-opacity': 0,
            'fill-opacity': 0.7,
            'type': 'PositionFragment' + direction,
            'mmsi': this.MMSI,
            '_id': this._id
        }

        properties.description = this.toReport()
        properties.title = this.toReportHeader()

        return properties
    }

    public async toTrackFragment(d: number = 5, color: Color): Promise<Feature[]> {
        const track: Feature[] = []
        if (!this.previous) {
            return track
        }
        try {
            track.push({
                "type": "Feature",
                "geometry": {
                    "type": "LineString",
                    "coordinates": [
                        [this.previous.Longitude, this.previous.Latitude],
                        [this.Longitude, this.Latitude]
                    ]
                },
                "properties": this.trackFragmentProperties(color)
            })
            return track.concat(this.toFeature(d, color, this.previous))
        } catch (ex) {
            console.log(ex)
            return track
        }
    }

    public trackFragmentProperties(color: Color): GeoJsonProperties {
        return {
            'stroke': color.get(3),
            'stroke-width': 2,
            'stroke-opacity': 1,
            'type': 'TrackFragment',
            'mmsi': this.MMSI,
            '_id': this._id
        }
    }
}