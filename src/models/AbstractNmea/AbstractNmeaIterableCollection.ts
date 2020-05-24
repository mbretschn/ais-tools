import { IQuery } from '../../lib/Interfaces'
import { INmeaFetchConfig, INmeaModel, INmeaIterableCollection } from './INmea'
import { AbstractNmeaCollection } from './AbstractNmeaCollection'

export abstract class AbstractNmeaIterableCollection<T extends INmeaModel>
    extends AbstractNmeaCollection
    implements INmeaIterableCollection, Iterable<INmeaModel> {

    // ***************************************
    // Iterator
    // ***************************************

    _collection: T[] = []

    messages: any
    abstract isSubscription: boolean
    abstract typeSubscription: string

    public comperator(a: T, b: T): number {
        return b.TimeStamp.getTime() - a.TimeStamp.getTime()
    }

    public sort(): T[] {
        return this._collection.sort(this.comperator)
    }

    public get isEmpty(): boolean {
        return this._collection.length > 0 ? false : true
    }

    public get length(): number {
        return this._collection.length;
    }

    public get collection(): T[] {
        return this._collection;
    }

    public first(): T | undefined {
        if (!this.isEmpty) {
            return this._collection[0]
        }
    }

    public last(): T | undefined {
        if (this._collection.length) {
            return this._collection[this._collection.length - 1]
        }
    }

    cnt: number = 0
    public [Symbol.iterator](): Iterator<T> {
        this.cnt = 0
        return {
            next: () => {
                return {
                    done: this._collection.length === 0 || this.cnt === this._collection.length,
                    value: this._collection[this.cnt++]
                }
            }
        }
    }

    // ***************************************
    // Storage
    // ***************************************

    abstract fetch(filter: IQuery, limit: number, options?: INmeaFetchConfig): Promise<T[]>

    public async delay(delay: number = 1000): Promise<void> {
        return new Promise(resolve => {
            setTimeout(resolve, delay)
        })
    }

    abstract onSubscription(data: any): Promise<void>

    private _subscribe = async (data: any): Promise<void> => {
        await this.onSubscription(data)
    }

    public unsubscribe(): void {
        this.messages && this.messages.off('data', this._subscribe)
    }

    public async subscribe(): Promise<void> {
        this.isSubscription = true

        const tquery: IQuery = {
            'Type': this.typeSubscription,
            'TimeStamp': { $gte: Date.now() }
        }

        this.messages = this.database.tail('messages', tquery)
        this.messages.on('data', this._subscribe)
    }

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

        this.logger.warn(message, current && current.toInfo())
    }

    public info(message: string, current?: INmeaModel, previous?: INmeaModel): void {
        if (this.logger.level === 4) {
            this.logger.verbose(message, current && current.toInfo())
        }

        if (this.logger.level === 5) {
            this.logger.debug(message, current && current.toReport())
        }

        if (this.logger.level === 6) {
            if (previous) {
                this.logger.silly(message, current && current.toReportDiff(previous))
            } else {
                this.logger.silly(message, current && current.toReport())
            }
        }
    }
}
