"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePaginationInfo = exports.decrypt = exports.encrypt = exports.handleApiError = exports.isValidMongoId = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const helper_error_1 = require("../helper/helper.error");
const crypto_1 = __importDefault(require("crypto"));
const ALGO = "aes-256-cbc";
const IV_LENGTH = 16;
const isValidMongoId = (id, res) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
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
exports.isValidMongoId = isValidMongoId;
const handleApiError = (res, error) => {
    if (error instanceof helper_error_1.Errors) {
        res.status(error.statusCode || 400).json({
            message: error.message || "Internal server error",
            status: error.statusCode || 400,
            success: false,
        });
    }
    else {
        res.status(500).json({
            message: error instanceof Error ? error.message : "Internal Server Error",
            success: false,
        });
    }
};
exports.handleApiError = handleApiError;
const encrypt = (text, key) => {
    const iv = crypto_1.default.randomBytes(IV_LENGTH);
    const cipher = crypto_1.default.createCipheriv(ALGO, Buffer.from(key, "hex"), iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return iv.toString("hex") + ":" + encrypted;
};
exports.encrypt = encrypt;
const decrypt = (encryptedText, key) => {
    const [ivHex, encrypted] = encryptedText.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto_1.default.createDecipheriv(ALGO, Buffer.from(key, "hex"), iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
};
exports.decrypt = decrypt;
const handlePaginationInfo = (req) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};
exports.handlePaginationInfo = handlePaginationInfo;
