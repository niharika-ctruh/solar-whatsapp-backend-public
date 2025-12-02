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
exports.getCollection = exports.connectToDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("../../config/env");
const connectToDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!env_1.MONGODB_URI) {
            throw new Error("mongoDbUrl is not defined");
        }
        yield mongoose_1.default.connect(`${env_1.MONGODB_URI}/${env_1.DB_NAME}`);
        console.log("Connected to MongoDB");
    }
    catch (err) {
        console.error("Failed to connect to the MongoDB database", err);
        process.exit(1);
    }
});
exports.connectToDatabase = connectToDatabase;
const getCollection = (collectionName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!mongoose_1.default.connection || mongoose_1.default.connection.readyState !== 1) {
            yield connectToDatabase();
        }
        if (!mongoose_1.default.connection.db) {
            throw new Error("Database connection not established");
        }
        const collection = mongoose_1.default.connection.db.collection(collectionName);
        if (!collection) {
            throw new Error(`Collection ${collectionName} not found`);
        }
        return collection;
    }
    catch (error) {
        console.error(`Error retrieving collection ${collectionName}:`, error);
        throw error;
    }
});
exports.getCollection = getCollection;
//# sourceMappingURL=connect.js.map