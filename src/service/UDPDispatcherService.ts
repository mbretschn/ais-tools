import { MessageLogger, Database, Decoder, Dispatcher, IAisMessage } from '../index'
import { EventEmitter } from 'events'

export class UDPDispatcherService extends EventEmitter {
    database: Database
    decoder: Decoder
    dispatcher: Dispatcher
    logger: MessageLogger
    udpPort: number = 0
 
    started: boolean = false

    constructor(database: Database, logger: MessageLogger) {
        super()
        this.database = database
        this.logger = logger

        this.decoder = new Decoder(database, logger);
        this.dispatcher = new Dispatcher()
    }

    public async delay(delay: number = 1000): Promise<void> {
        return new Promise(resolve => {
            setTimeout(resolve, delay)
        })
    }

    public async close(): Promise<void> {
        this.emit('closing')
        return new Promise(async (resolve) => {
            if (!this.started) {
                this.emit('closed')
                return resolve()
            }

            this.dispatcher.off('status', this.onStatus)
            this.dispatcher.off('message', this.onMessage)

            await this.doClose()
            resolve()
        })
    }

    private async doClose(): Promise<void> {
        return new Promise(resolve => {
            this.dispatcher.on('status', (status: string) => {
                if (status === 'stopped') {
                    this.emit('closed')
                }
            })
            this.dispatcher.stop()
        })
    }

    public async run(udpPort: number): Promise<void> {
        this.udpPort = udpPort

        this.emit('starting')

        await this.database.connect()

        this.dispatcher.on('status', this.onStatus)
        this.dispatcher.on('message', this.onMessage)

        this.started = true

        this.dispatcher.start(udpPort)

        this.logger.info('Start')
    }

    private onMessage = async (message: IAisMessage): Promise<void> => {
        try {
            const decoded = await this.decoder.decode(message)
            try {
                await decoded.create()
            } catch(ex) {
                this.logger.error('onMessage', { line: 91, type: decoded.collection.collectionName, msg: ex.message })
            }
        } catch (ex) {
            if (ex.message.indexOf('Invalid Position') !== 0) {
                this.logger.warn('onMessage', { line: 98, msg: ex.message })
            }
        }
    }

    private onStatus = (status: string): void => {
        switch (status) {
            case 'starting':
                this.logger.info('UDPDispatcherService', {
                    loglevel: this.logger.level,
                    host: 'http://0.0.0.0:' + this.udpPort,
                    pid: process.pid,
                    env: process.env.NODE_ENV
                })
            break
            case 'closing':
                this.logger.warn('Signal caught, exiting!')
            break
        }
    }
}