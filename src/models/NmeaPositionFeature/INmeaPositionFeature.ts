import { INmeaPositionCollection } from '../NmeaPosition/INmeaPosition'
import { Feature } from 'geojson'
import { INmeaPosition } from '../NmeaPosition/INmeaPosition'
import { NmeaPositionFeature } from './NmeaPositionFeature'
import { Color } from '../../lib/Color'

export interface INmeaPositionFeatureCollection extends INmeaPositionCollection {
    model(data: INmeaPosition): NmeaPositionFeature
    toTrack(d: number, color: Color): Promise<Feature[]>
    toFeatureCollection(d: number, color: Color): Promise<Feature[]>
}