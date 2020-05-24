import { default as moment } from 'moment'
import { MessageLogger, Database, Decoder, Dispatcher, IAisMessage } from '../index'
import { EventEmitter } from 'events'

export class UDPDispatcherService extends EventEmitter {
    database: Database
    decoder: Decoder
    dispatcher: Dispatcher
    logger: MessageLogger
    udpPort: number = 0

    closing: boolean = false
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

    public async wait(seconds: number, minutes: number = 0): Promise<void> {
        const now = moment()
        const start = moment()
        if (minutes) {
            start.add(minutes, 'minute')
        }
        start.seconds(seconds)
        const wait = start.diff(now)
        if (wait < 0) {
            this.logger.info('Start immediately')
        } else {
            this.logger.info(`Wait ${(wait / 1000).toFixed(0)}s`)
            await this.delay(wait)
        }
    }

    public async close(): Promise<void> {
        this.emit('closing')
        return new Promise(resolve => {
            if (!this.started) {
                this.emit('closed')
                return resolve()
            }
            this.on('closed', () => resolve())
            this.closing = true
        })
    }

    private async doClose(): Promise<void> {
        return new Promise(resolve => {
            this.dispatcher.removeAllListeners()
            this.dispatcher.on('status', (status: string)=> {
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

        this.dispatcher.on('status', (status: string)=> this.onStatus(status))
        this.dispatcher.on('message', async (message: IAisMessage) => this.onMessage(message))

        this.started = true

        this.dispatcher.start(udpPort)
    }

    private async onMessage(message: IAisMessage): Promise<void> {
        try {
            const decoded = await this.decoder.decode(message)
            try {
                await decoded.create()
            } catch(ex) {
                this.logger.warn(decoded.collection.typeSubscription)
                this.logger.warn(ex.message)
            }
            if (this.closing) {
                await this.doClose()
            }
        } catch (ex) {
            if (ex.message.indexOf('Invalid Position') !== 0) {
                this.logger.warn(ex.message)
            }
        }
    }

    private onStatus(status: string): void {
        switch (status) {
            case 'starting':
                this.logger.info('UDPDispatcherService', {
                    loglevel: this.logger.level,
                    host: 'http://0.0.0.0:' + this.udpPort,
                    env: process.env.NODE_ENV
                })
            break
            case 'closing':
                this.logger.info('Signal caught, exiting!')
            break
        }
    }
}