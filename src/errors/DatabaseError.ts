export class DatabaseError extends Error {
    orig: any
    constructor (message: string, orig: any) {
        super(message)

        this.name = this.constructor.name
        this.orig = orig

        Error.captureStackTrace(this, this.constructor)
    }
}
