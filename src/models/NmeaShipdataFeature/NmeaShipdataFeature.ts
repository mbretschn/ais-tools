import { Feature, Position, GeoJsonProperties } from 'geojson'
import { default as GeographicLib } from 'geographiclib'

import { NmeaPositionFeature } from '../NmeaPositionFeature/NmeaPositionFeature'
import { NmeaShipdata } from '../NmeaShipdata/NmeaShipdata'

export class NmeaShipdataFeature extends NmeaShipdata {
    public toFeature(position: NmeaPositionFeature): Feature[] {
        const features: Feature[] = this.toShipFeature(position)

        features.push(this.toMarker(position))

        return features
    }

    public toShipFeature(position: NmeaPositionFeature): Feature[] {
        if (!(position.SOG < 1 && position.TrueHeading === 511)
            && this.DimC < 63 && this.DimD < 63
            && this.DimA + this.DimB > 0 && this.DimC + this.DimD > 0) {

            const a = this.DimA
            const b = this.DimB
            const c = this.DimC
            const d = this.DimD

            const geod = GeographicLib.Geodesic.WGS84

            let azi = 0
            if (position.TrueHeading < 511) {
                azi = position.TrueHeading
            } else if (position.COG < 360) {
                azi = position.COG
            }

            const lon0 = position.Longitude
            const lat0 = position.Latitude

            const w = c + d
            const h = w / 2
            const l = Math.sqrt(2 * Math.pow(h, 2))

            let m
            let lon1 = lon0
            let lat1 = lat0

            if (d > c) {
                m = geod.Direct(lat0, lon0, azi + 90, (d - c) / 2);
                lon1 = m.lon2;
                lat1 = m.lat2;
            }

            if (c > d) {
                m = geod.Direct(lat0, lon0, azi - 90, (c - d) / 2);
                lon1 = m.lon2;
                lat1 = m.lat2;
            }

            const ax = a - h;

            const a1 = geod.Direct(lat1, lon1, azi, a);
            const c1 = geod.Direct(a1.lat2, a1.lon2, azi - 135, l);
            const a2 = geod.Direct(c1.lat2, c1.lon2, azi - 180, ax);
            const d1 = geod.Direct(a1.lat2, a1.lon2, azi + 135, l);
            const a3 = geod.Direct(d1.lat2, d1.lon2, azi + 180, ax);
            const b1 = geod.Direct(a2.lat2, a2.lon2, azi + 180, b);
            const b2 = geod.Direct(a3.lat2, a3.lon2, azi + 180, b);

            const shapeCoordinates: Position[] = [
                [a1.lon2, a1.lat2],
                [c1.lon2, c1.lat2],
                [b1.lon2, b1.lat2],
                [b2.lon2, b2.lat2],
                [d1.lon2, d1.lat2],
                [a1.lon2, a1.lat2]
            ];

            return [{
                'type': 'Feature',
                'geometry': {
                    'type': 'Polygon',
                    'coordinates': [shapeCoordinates]
                },
                'properties': this.featureProperties()
            }]
        } else {
            const features: Feature[] = []

            features.push(position.toFeatureFragment('Bow',   6, '#9AA400'))
            features.push(position.toFeatureFragment('Stern', 6, '#FFEB73'))

            for (const feature of features) {
                if (feature.properties) {
                    feature.properties._id = this._id
                }
            }

            return features
        }
    }

    public featureProperties(): GeoJsonProperties {
        const properties: GeoJsonProperties = {
            'stroke': '#9AA400',
            'fill': '#FFEB73',
            'stroke-width': 2,
            'stroke-opacity': 1,
            'fill-opacity': 0.7,
            'type': 'Ship',
            'mmsi': this.MMSI,
            '_id': this._id
        }

        return properties
    }

    public toMarker(position: NmeaPositionFeature): Feature {
        return {
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': [position.Longitude, position.Latitude]
            },
            'properties': this.markerProperties(position)
        }
    }

    public markerProperties(position: NmeaPositionFeature): GeoJsonProperties {
        return {
            'stroke': '#FF0000',
            'stroke-width': 0,
            'stroke-opacity': 0,
            'fill': '#FF0000',
            'fill-opacity': 0.5,
            'type': 'ShipMarker',
            'mmsi': this.MMSI,
            '_id': this._id
        }
    }
}
