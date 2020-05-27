import { default as moment } from 'moment'
import { default as fetch } from 'node-fetch'
import { MessageLogger, Database, Decoder, NmeaShipdata, NmeaPosition } from '../index'
import { Bzip2 } from 'compressjs'
import { EventEmitter } from 'events'

export class HTTPDispatcherService extends EventEmitter {
    database: Database
    decoder: Decoder
    logger: MessageLogger

    startSecond: number = 0
    startMinute: number = 0
    timeout: number = 0
    url: string = ''

    closing: boolean = false
    started: boolean = false

    constructor(database: Database, logger: MessageLogger) {
        super()
        this.database = database
        this.logger = logger

        this.decoder = new Decoder(database, logger)

        let started: moment.Moment

        this.on('starting', () => {
            const regex = /username=([A-Z_0-9]+)/gm

            this.logger.info('HTTPDispatcherService', {
                loglevel: logger.level,
                host: this.url.replace(regex, 'username=********'),
                pid: process.pid,
                env: process.env.NODE_ENV
            })
        })

        this.on('started', () => {
            started = moment()
        })

        this.on('finished', () => {
            const now = moment()
            const duration = now.diff(started)
            this.logger.verbose(`Finished after ${(duration / 1000).toFixed(0)}s`)
        })

        this.on('closing', () => {
            this.logger.warn(`Signal caught, exiting!`)
        })
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
            this.logger.info(`Start immediately`)
        } else {
            this.logger.info(`Wait ${(wait / 1000).toFixed(0)}s`)
            await this.delay(wait)
            this.logger.info('Start')
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

    public async _run(): Promise<void> {
        this.started = true
        this.emit('started')

        const start = moment()
        const end = moment().add(this.timeout, 'seconds')

        this.logger.verbose(`Request ${start.format('hh:mm:ss')}`)

        try {
            await this.job()
            await this.cont(end)
        } catch (ex) {
            this.logger.error('run', { line: 99, msg: ex.message })
            await this.cont(end)
        }
    }

    public async cont(end: moment.Moment): Promise<void> {
        this.emit('finished')
        if (this.closing) {
            this.emit('closed')
        } else {
            const now = moment()
            const time = end.diff(now, 'milliseconds')
            if (time < 0) {
                await this._run()
            } else {
                await this.delay(time)
                await this._run()
            }
        }
    }

    public async run(url: string, config: any): Promise<void> {
        this.url = url
        this.startSecond = config.startSecond
        this.startMinute = config.startMinute
        this.timeout = config.timeout

        this.emit('starting')

        await this.wait(this.startSecond, this.startMinute)
        await this.database.connect()
        await this._run()
    }

    public async job(): Promise<void> {
        const res = await fetch(this.url)
        const buffer = await res.buffer()
        const decompressed = Bzip2.decompressFile(buffer);
        const str = Buffer.from(decompressed).toString('utf8');
        const json = JSON.parse(str)

        if (json[0].ERROR === false) {
            this.logger.verbose(`${json[0].RECORDS} received`)
            for (const data of json[1]) {
                const ship = await this.decodeShipdata(data)
                const position = await this.decodePosition(data)
                try {
                    await ship.create()
                    await position.create()
                } catch(ex) {
                    this.logger.error('onMessage', { line: 152, msg: ex.message })
                }
            }
        } else {
            this.logger.warn('job', { line: 156, msg: json[0].ERROR_MESSAGE })
        }
    }

    public async decodeShipdata(data: any): Promise<NmeaShipdata> {
        const now = moment()
        const nowDate = now.toDate()
        const eta = moment(data.ETA, 'MM-DD hh:mm')

        let etaf = ''
        if (eta.isValid()) {
            if (eta.isBefore(now)) {
                eta.add(1, 'year')
            }
            etaf = eta.format()
        }

        const ship = new NmeaShipdata(this.decoder.shipdataCollection)

        ship._id = this.decoder.shipdataCollection.database.createObjectID()
        ship.AIS = 5
        ship.Channel = 'A'
        ship.MMSI = data.MMSI
        ship.TimeStamp = nowDate

        ship.Data = {
            AISversion: 0,
            PositionType: 0,
            IMOnumber: data.IMO,
            CallSign: data.CALLSIGN,
            Name: data.NAME.trim(),
            ShipType: data.TYPE,
            DimA: data.A,
            DimB: data.B,
            DimC: data.C,
            DimD: data.D,
            Draught: data.DRAUGHT,
            ETA: etaf,
            Destination: data.DEST
        }

        ship.Sender = [{
            Name: this.decoder.shipdataCollection.Sender,
            TimeStamp: nowDate
        }]

        ship.CreatedAt = nowDate
        ship.CreatedBy = this.decoder.shipdataCollection.Sender
        ship.UpdatedAt = nowDate
        ship.UpdatedBy = this.decoder.shipdataCollection.Sender

        return ship
    }

    public async decodePosition(data: any): Promise<NmeaPosition> {
        const now = moment().utc()
        const nowDate = now.toDate()
        const date = moment.utc(data.TIME, 'YYYY-MM-DD hh:mm:ss GMT')

        const position = new NmeaPosition(this.decoder.positionCollection)

        position.chkDistance = [2, 2]

        position._id = this.decoder.positionCollection.database.createObjectID()
        position.AIS = 3
        position.Channel = 'A'
        position.MMSI = data.MMSI
        position.TimeStamp = date.toDate()

        position.Location = {
            type: "Point",
            coordinates: [ Number(data.LONGITUDE.toFixed(5)), Number(data.LATITUDE.toFixed(5)) ]
        }
        position.Data = {
            Longitude: Number(data.LONGITUDE.toFixed(5)),
            Latitude: Number(data.LATITUDE.toFixed(5)),
            ROT: data.ROT === 128 ? -128 : data.ROT,
            SOG: Number(data.SOG.toFixed(1)),
            COG: Number(data.COG.toFixed(1)),
            TrueHeading:  data.HEADING,
            NavigationStatus: data.NAVSTAT,
            PositionAccuracy: 1,
            TimeStampStatus: date.seconds()
        }

        position.Sender = [{
            Name: this.decoder.shipdataCollection.Sender,
            TimeStamp: nowDate
        }]

        position.CreatedAt = nowDate
        position.CreatedBy = this.decoder.shipdataCollection.Sender
        position.UpdatedAt = nowDate
        position.UpdatedBy = this.decoder.shipdataCollection.Sender

        return position
    }
}