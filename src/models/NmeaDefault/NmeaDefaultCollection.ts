import { TColNames, IMessageLogger, IDatabase } from '../../lib/Interfaces'
import { AbstractNmeaCollection } from '../AbstractNmea/AbstractNmeaCollection'
import { INmeaDefaultCollection, INmeaDefault } from './INmeaDefault'
import { NmeaDefault } from './NmeaDefault'

export class NmeaDefaultCollection extends AbstractNmeaCollection implements INmeaDefaultCollection {
    public collectionName: TColNames = 'defaults'

    public model(data: INmeaDefault): INmeaDefault {
        return new NmeaDefault(this, data)
    }

    // ***************************************
    // Storage
    // ***************************************

    public async create(current: INmeaDefault): Promise<INmeaDefault> {
        let res
        try {
            const data = await this.database.create(this.collectionName, current.toDB()) as INmeaDefault
            res = this.model(data)
        } catch (ex) {
            res = this.model(current)
        }
        this.info('NmeaDefault created', current)
        return res
    }

    // ***************************************
    // Reporting
    // ***************************************

    public warn(message: string, current?: INmeaDefault): void {
        if (this.logger.level < 1) {
            return
        }

        if (!current) {
            this.logger.warn(message)
            return
        }

        this.logger.warn(message, current && current.toInfo())
    }

    public info(message: string, current?: INmeaDefault): void {
        if (this.logger.level === 4) {
            this.logger.verbose(message, current && current.toInfo())
        }

        if (this.logger.level === 5) {
            this.logger.debug(message, current && current.toReport())
        }
    }
}