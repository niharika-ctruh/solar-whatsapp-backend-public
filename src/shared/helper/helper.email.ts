import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { MAIL_PORT, MAIL_HOST, MAIL_USER, MAIL_PASSWORD } from "../../config/env";

// returns Nodemailer transport object
export const getMailerObject = () => {
    const transporter = nodemailer.createTransport({
        host: MAIL_HOST,
        port: MAIL_PORT,
        secureConnection: false,
        auth: {
            user: MAIL_USER,
            pass: MAIL_PASSWORD,
        },
        tls: {
            ciphers: "SSLv3",
        },
    } as SMTPTransport.Options);
    return transporter;
};
