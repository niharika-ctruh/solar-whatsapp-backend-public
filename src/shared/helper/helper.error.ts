export class Errors extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.name = this.constructor.name;

        Object.setPrototypeOf(this, new.target.prototype);
    }
}
