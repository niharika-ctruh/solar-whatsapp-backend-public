"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCollection = exports.connectToDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("../../config/env");
const connectToDatabase = async () => {
    try {
        if (!env_1.MONGODB_URI) {
            throw new Error("mongoDbUrl is not defined");
        }
        await mongoose_1.default.connect(`${env_1.MONGODB_URI}/${env_1.DB_NAME}`);
        console.log("Connected to MongoDB");
    }
    catch (err) {
        console.error("Failed to connect to the MongoDB database", err);
        process.exit(1);
    }
};
exports.connectToDatabase = connectToDatabase;
const getCollection = async (collectionName) => {
    try {
        if (!mongoose_1.default.connection || mongoose_1.default.connection.readyState !== 1) {
            await connectToDatabase();
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
};
exports.getCollection = getCollection;
