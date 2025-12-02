"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMailerObject = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../../config/env");
// returns Nodemailer transport object
const getMailerObject = () => {
    const transporter = nodemailer_1.default.createTransport({
        host: env_1.MAIL_HOST,
        port: env_1.MAIL_PORT,
        secureConnection: false,
        auth: {
            user: env_1.MAIL_USER,
            pass: env_1.MAIL_PASSWORD,
        },
        tls: {
            ciphers: "SSLv3",
        },
    });
    return transporter;
};
exports.getMailerObject = getMailerObject;
