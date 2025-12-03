import mongoose from "mongoose";
import { DB_NAME, MONGODB_URI } from "../../config/env";

const connectToDatabase = async () => {
    try {
        if (!MONGODB_URI) {
            throw new Error("mongoDbUrl is not defined");
        }
        await mongoose.connect(`${MONGODB_URI}/${DB_NAME}`);
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("Failed to connect to the MongoDB database", err);
        process.exit(1);
    }
};

const getCollection = async (collectionName: string) => {
    try {
        if (!mongoose.connection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        if (!mongoose.connection.db) {
            throw new Error("Database connection not established");
        }

        const collection = mongoose.connection.db.collection(collectionName);

        if (!collection) {
            throw new Error(`Collection ${collectionName} not found`);
        }

        return collection;
    } catch (error) {
        console.error(`Error retrieving collection ${collectionName}:`, error);
        throw error;
    }
};

export { connectToDatabase, getCollection };
