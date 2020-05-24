import { Logger, createLogger, transports, format } from 'winston'
import { default as DailyRotateFile } from 'winston-daily-rotate-file'
import { INmeaInfo } from '../models/AbstractNmea/INmea'
import { IMessageLogger, IMessageLoggerConfig, IMessage } from './Interfaces'

export class MessageLogger implements IMessageLogger {
    public logger: Logger
    public level: number

    constructor(config: IMessageLoggerConfig) {
        const conf = []
        if (config.filename) {
            conf.push(new DailyRotateFile({
                filename: config.filename,
                datePattern: 'YYYY-MM-DD-HH',
                zippedArchive: config.zippedArchive,
                maxSize: '20m',
                maxFiles: '14d'
            }))
        }

        if (config.custom) {
            conf.push(config.custom)
        }

        if (process.env.NODE_ENV === 'debug' || config.filename === '') {
            conf.push(new transports.Console())
        }

        this.logger = createLogger({
            level: config.level,
            format: format.combine(
                this.filter({ mmsi: config.filter }),
                format.timestamp(),
                format.json(),
                format.prettyPrint()
            ),
            transports: conf
        })

        this.level = this.logger.levels[this.logger.level]
    }

    private isNmeaInfo(data: INmeaInfo[]): data is INmeaInfo[] {
        if (data) {
            for (const info of data) {
                if (info.key !== undefined && info.val !== undefined && info.key === 'MMSI') {
                    return true
                    break
                }
            }
        }
        return false
    }

    private filter = format((info: any, opts: any) => {
        if (opts.mmsi
            && this.isNmeaInfo(info.data)
            && info.data.findIndex(((item: INmeaInfo) => item.key === 'MMSI' && Number(item.val) === opts.mmsi)) < 0) {
            return
        }
        return info
    })

    public error(message: string, data?: any): void {
        const msg: IMessage = { message }

        if (data) msg.data = data

        this.logger.error(msg)
    }

    public warn(message: string, data?: any): void {
        if (this.level < 1) {
            return
        }

        const msg: IMessage = { message }
        if (data) msg.data = data

        this.logger.warn(msg)
    }

    public info(message: string, data?: any): void {
        if (this.level > 2) {
            return
        }

        const msg: IMessage = { message }
        if (data) msg.data = data

        this.logger.info(msg)
    }

    public verbose(message: string, data?: any): void {
        if (this.level > 3 && this.level < 5) {
            const msg: IMessage = { message }
            if (data) msg.data = data

            this.logger.verbose(msg)
        }
    }

    public debug(message: string, data?: any): void {
        if (this.level > 4 && this.level < 6) {
            const msg: IMessage = { message }
            if (data) msg.data = data

            this.logger.debug(msg)
        }
    }

    public silly(message: string, data?: any): void {
        if (this.level > 5) {
            const msg: IMessage = { message }
            if (data) msg.data = data

            this.logger.silly(msg)
        }
    }
}