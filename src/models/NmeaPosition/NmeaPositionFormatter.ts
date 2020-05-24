import { default as moment } from 'moment'
import { INmeaFormatter } from '../AbstractNmea/INmea'
import { AbstractNmeaFormatter } from '../AbstractNmea/AbstractNmeaFormatter'
import { INmeaPosition, INamePositionDataParsed } from './INmeaPosition'
import { NavigationStatusLookup, LongitudeLookup, LatitudeLookup, ROTLookup, SOGLookup, COGLookup, TrueHeadingLookup, PositionAccuracyLookup, TimeStampStatusLookup } from './NmeaPositionMetadata'

export class NmeaPositionFormatter<T extends INmeaPosition> extends AbstractNmeaFormatter<T> implements INmeaFormatter {
    constructor(model: T) {
        super(model)
    }

    public format(name: string, options?: any): string {
        options = options || 'MMMM Do YYYY, h:mm:ss a'
        switch (name) {
            case '_id':
                if (this.model._id) {
                    return String(this.model._id)
                }
                return 'is New'
                break
            case 'AIS':
                return String(this.model.AIS)
                break
            case 'Channel':
                return String(this.model.Channel)
                break
            case 'MMSI':
                return String(this.model.MMSI)
                break
            case 'TimeStamp':
                return moment(this.model.TimeStamp).format(options)
                break
            case 'CreatedAt':
                return moment(this.model.CreatedAt).format(options)
                break
            case 'CreatedBy':
                return this.model.CreatedBy
                break
            case 'UpdatedAt':
                return moment(this.model.UpdatedAt).format(options)
                break
            case 'UpdatedBy':
                return this.model.UpdatedBy
                break
            case 'Sender':
                const senders = []
                for (const sender of this.model.Sender) {
                    if (senders.indexOf(sender.Name) < 0) {
                        senders.push(sender.Name)
                    }
                }
                return senders.length > 0 && senders.join(', ') || 'undefined'
                break
            case 'Longitude':
                return String(this.lookup(this.model.Longitude, LongitudeLookup))
                break
            case 'Latitude':
                return String(this.lookup(this.model.Latitude, LatitudeLookup))
                break
            case 'ROT':
                return String(this.lookup(this.model.ROT, ROTLookup))
                break
            case 'SOG':
                return String(this.lookup(this.model.SOG, SOGLookup))
                break
            case 'COG':
                return String(this.lookup(this.model.COG, COGLookup))
                break
            case 'TrueHeading':
                return String(this.lookup(this.model.TrueHeading, TrueHeadingLookup))
                break
            case 'NavigationStatus':
                return String(this.lookup(this.model.NavigationStatus, NavigationStatusLookup))
                break
            case 'PositionAccuracy':
                return String(this.lookup(this.model.PositionAccuracy, PositionAccuracyLookup))
                break
            case 'TimeStampStatus':
                return String(this.lookup(this.model.TimeStampStatus, TimeStampStatusLookup))
                break
            case 'DistanceMoved':
                const previous = this.model.previous
                if (previous) {
                    const moved = this.model.calcDistanceMoved(previous)
                    if (moved > -1) {
                        return `${moved}m`
                    }
                }
                return 'unavailable'
                break
        }

        throw new Error(`Cannot format ${name} not found`)
    }
}
