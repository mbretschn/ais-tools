import { default as moment } from 'moment'
import { INmeaFormatter } from '../AbstractNmea/INmea'
import { INmeaShipdata } from './INmeaShipdata'
import { AISversionLookup, IMOnumberLookup, PositionTypeLookup, ShipTypeLookup, DraughtLookup } from './NmeaShipdataMetadata'
import { AbstractNmeaFormatter } from '../AbstractNmea/AbstractNmeaFormatter'

export class NmeaShipdataFormatter<T extends INmeaShipdata> extends AbstractNmeaFormatter<T> implements INmeaFormatter {
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
            case 'AISversion':
                return String(this.lookup(this.model.AISversion, AISversionLookup))
                break
            case 'IMOnumber':
                return String(this.lookup(this.model.IMOnumber, IMOnumberLookup))
                break
            case 'CallSign':
                return this.model.CallSign || 'unavailable'
                break
            case 'Name':
                return this.model.Name
                break
            case 'DimA':
                return `${this.model.DimA}m`
                break
            case 'DimB':
                return `${this.model.DimB}m`
                break
            case 'DimC':
                return `${this.model.DimC}m`
                break
            case 'DimD':
                return `${this.model.DimD}m`
                break
            case 'PositionType':
                return String(this.lookup(this.model.PositionType, PositionTypeLookup))
                break
            case 'ShipType':
                return String(this.lookup(this.model.ShipType, ShipTypeLookup))
                break
            case 'Draught':
                return String(this.lookup(this.model.Draught, DraughtLookup))
                break
            case 'Destination':
                return this.model.Destination || 'unavailable'
                break
            case 'ETA':
                return this.model.ETA && moment(this.model.ETA).format(options) || 'unavailable'
                break
            case 'Dimensions':
                return `${this.model.DimA + this.model.DimB}m / ${this.model.DimC + this.model.DimD}m`
                break
        }

        throw new Error(`Cannot format ${name} not found`)
    }
}
