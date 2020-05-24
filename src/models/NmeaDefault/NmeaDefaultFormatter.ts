import { default as moment } from 'moment'
import { INmeaFormatter } from '../AbstractNmea/INmea'
import { AbstractNmeaFormatter } from '../AbstractNmea/AbstractNmeaFormatter'
import { INmeaDefault } from './INmeaDefault'

export class NmeaDefaultFormatter<T extends INmeaDefault> extends AbstractNmeaFormatter<T> implements INmeaFormatter {
    constructor(model: T) {
        super(model)
    }

    public format(name: keyof INmeaDefault): string {
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
                return moment(this.model.TimeStamp).format('MMMM Do YYYY, h:mm:ss a')
                break
            case 'CreatedAt':
                return moment(this.model.CreatedAt).format('MMMM Do YYYY, h:mm:ss a')
                break
            case 'CreatedBy':
                return this.model.CreatedBy
                break
            case 'UpdatedAt':
                return moment(this.model.UpdatedAt).format('MMMM Do YYYY, h:mm:ss a')
                break
            case 'UpdatedBy':
                return this.model.UpdatedBy
                break
            case 'Sender':
                return JSON.stringify(this.model.Sender)
                // if (this.model.Sender.length > 1) {
                //     return this.model.Sender.join(', ')
                // } else if (this.model.Sender.length > 0) {
                //     return this.model.Sender[0]
                // }
                return 'undefined'
                break
        }

        throw new Error(`Cannot format ${name} not found`)
    }
}
