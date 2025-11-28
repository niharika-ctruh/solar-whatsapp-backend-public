import { Response } from "express";
import mongoose from "mongoose";
import { Errors } from "../helper/helper.error";
import crypto from "crypto";

const ALGO = "aes-256-cbc";
const IV_LENGTH = 16;

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
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGO, Buffer.from(key, "hex"), iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return iv.toString("hex") + ":" + encrypted;
};

export const decrypt = (encryptedText: string, key: string) => {
    const [ivHex, encrypted] = encryptedText.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv(ALGO, Buffer.from(key, "hex"), iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
};
