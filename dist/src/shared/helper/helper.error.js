"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Errors = void 0;
class Errors extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.name = this.constructor.name;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.Errors = Errors;
//# sourceMappingURL=helper.error.js.map