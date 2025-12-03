import { Request, Response } from "express";
import mongoose from "mongoose";
import { Errors } from "../helper/helper.error";
import CryptoJS from "crypto-js";

export const isValidMongoId = (id: string, res?: Response): boolean => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        if (res) {
            res.status(400).send({
                message: "ID is invalid or malformed",
                success: false,
            });
        }
        return false;
    }
    return true;
};

export const handleApiError = (res: Response, error: unknown): void => {
    if (error instanceof Errors) {
        res.status(error.statusCode || 400).json({
            message: error.message || "Internal server error",
            status: error.statusCode || 400,
            success: false,
        });
    } else {
        res.status(500).json({
            message: error instanceof Error ? error.message : "Internal Server Error",
            success: false,
        });
    }
};

export const encrypt = (text: string, key: string) => {
    const keyHex = CryptoJS.enc.Hex.parse(key);
    const iv = CryptoJS.lib.WordArray.random(16);
    const encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(text), keyHex, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });
    return iv.toString(CryptoJS.enc.Base64) + ":" + encrypted.toString();
};

export const decrypt = (encryptedText: string, key: string) => {
    const [ivB64, cipherB64] = encryptedText.split(":");

    const keyHex = CryptoJS.enc.Hex.parse(key);
    const iv = CryptoJS.enc.Base64.parse(ivB64);

    const bytes = CryptoJS.AES.decrypt(cipherB64, keyHex, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });

    return bytes.toString(CryptoJS.enc.Utf8);
};

export const handlePaginationInfo = (req: Request) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};
