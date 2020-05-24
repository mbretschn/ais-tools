import { TColNames, IMessageLogger, IDatabase } from '../../lib/Interfaces'
import { INmeaCollection, INmeaModel } from './INmea'
import { EventEmitter } from 'events'

export abstract class AbstractNmeaCollection extends EventEmitter implements INmeaCollection {
    public collectionName: TColNames = 'defaults'

    public logger: IMessageLogger
    public database: IDatabase
    public Sender: string = ''

    constructor(db: IDatabase, logger: IMessageLogger) {
        super()
        this.database = db
        this.Sender = db.sender
        this.logger = logger
    }

    abstract model(data: INmeaModel): INmeaModel
    abstract create(current: INmeaModel): Promise<INmeaModel>

    // ***************************************
    // Reporting
    // ***************************************

    public warn(message: string, current?: INmeaModel): void {
        if (this.logger.level < 1) {
            return
        }

        if (!current) {
            this.logger.warn(message)
            return
        }

        this.logger.warn(message, current.toInfo())
    }

    public info(message: string, current?: INmeaModel): void {
        if (this.logger.level < 4) {
            this.logger.info(message, current && current.toInfo())
        }
        if (this.logger.level > 3) {
            this.logger.verbose(message, current && current.toReport())
        }
    }
}