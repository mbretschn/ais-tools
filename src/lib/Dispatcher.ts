import { EventEmitter } from 'events'
import { default as dgram } from 'dgram'
import { default as moment } from 'moment'
import { IAisMessage } from './Decoder'

export interface IDispatcher {
    on(event: 'status', listener: (status: any) => void): this;
    on(event: 'message', listener: (message: IAisMessage) => void): this;
    on(event: string, listener: () => void): this;
}

export class Dispatcher extends EventEmitter implements Dispatcher {
    private socket: dgram.Socket

    constructor () {
        super();

        this.socket = dgram.createSocket('udp4')
        this.socket.on('message', this.onMessage.bind(this))
        this.socket.on('listening', this.onListening.bind(this))
        this.socket.on('error', this.onError.bind(this))
    }

    public start (port: number) : void {
        this.emit('status', 'starting')
        this.socket.bind(port, () => this.emit('status', 'started'))
    }

    public stop () : void {
        this.emit('status', 'stopping')
        try {
            this.socket.close(() => this.emit('status', 'stopped'))
        } catch (ex) {
            this.emit('error', ex.message)
        }
    }

    private onMessage (buffer: Buffer) : void {
        const utc = moment().utc()
        const message = buffer.toString('ascii').replace(/(\r\n|\n|\r)/gm, '')

        const data: string[] = []
        for (let partial of message.split('!AIVDM')) {
            if (partial.length > 0) {
                partial = '!AIVDM' + partial

                const isValid = this.validate(partial)
                if (!isValid) return

                data.push(partial)
            }
        }

        this.emit('message', { utc, data });
    }

    private onListening () : void {
        const address = this.socket.address();
        this.emit('status', `listening on udp://${address.address}:${address.port}`);
    }

    private onError (error: any) : void {
        this.stop()
        this.emit('status', error)

        throw (error.stack)
    }

    private validate (raw: string) : boolean {
        const message = raw.substr(1, raw.length - 4)
        const chk = raw.substr(-2)

        let checksum = 0
        for (let i = 0; i < message.length; i++) {
            checksum = checksum ^ message.charCodeAt(i)
        }

        let result = checksum.toString(16)
        result = '00'.substr(result.length) + result

        return result.toUpperCase() === chk.toUpperCase()
    }
}
