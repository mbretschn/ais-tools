import { Color } from '../../lib/Color'
import { INmeaPositionCollection } from '../NmeaPosition/INmeaPosition'

export interface INmeaPositionFeatureCollection extends INmeaPositionCollection {
    color: Color
}