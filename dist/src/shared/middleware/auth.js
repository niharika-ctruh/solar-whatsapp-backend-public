"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAuthorized = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const connect_1 = require("../db/connect");
const mongodb_1 = require("mongodb");
const env_1 = require("../../config/env");
const checkAuthorized = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const headerToken = req.get("authorization");
    if (!headerToken) {
        res.status(401).json({ success: false, message: "Unauthorized: JWT token not provided" });
    }
    try {
        if (!env_1.JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined in environment variables");
        }
        const decoded = jsonwebtoken_1.default.verify(headerToken, env_1.JWT_SECRET);
        if (!decoded || typeof decoded !== "object" || !("id" in decoded)) {
            throw new Error("Invalid token payload");
        }
        const userCollection = yield (0, connect_1.getCollection)("users");
        if (!userCollection) {
            res.status(404).json({ success: false, message: "User collection not found!" });
            return;
        }
        const user = (yield userCollection.findOne({ _id: new mongodb_1.ObjectId(decoded.id) }, { projection: { password: 0 } }));
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        req.user = user;
        next();
    }
    catch (err) {
        res.status(403).json({ success: false, message: "Forbidden: Invalid JWT token" });
    }
});
exports.checkAuthorized = checkAuthorized;
//# sourceMappingURL=auth.js.map