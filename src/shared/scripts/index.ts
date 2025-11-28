import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { Host } from "../../modules/requests/models/host.model";

// MongoDB URI
const MONGO_URI = "mongodb://localhost:27017/solar-square";

async function connectDB() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected to MongoDB");
    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
        process.exit(1);
    }
}

function readCSV(filePath: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
        const results: any[] = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", data => results.push(data))
            .on("end", () => resolve(results))
            .on("error", reject);
    });
}

// Convert a single row into Host schema format
function mapToHost(row: any) {
    const [latStr, lonStr] = row["Lat Lon"] ? row["Lat Lon"].split(",").map((x: string) => x.trim()) : [null, null];

    return {
        hostSseId: row["Host SSE ID"],
        name: row["Host Name"],
        phone: row["Contact Numbers"],
        location: {
            type: "Point",
            coordinates: [parseFloat(latStr), parseFloat(lonStr)],
        },
        address: {
            cluster: row["Cluster"] || "Unknown",
            fullAddress: row["Address"] || "",
        },
        available: true,
        visitRequests:[]
    };
}

export async function importHosts() {
    await connectDB();

    const filePath = path.resolve(__dirname, "host.csv"); // update filename if needed
    console.log("filePath", filePath);
    const rows = await readCSV(filePath);

    console.log(`📋 Found ${rows.length} hosts in CSV file`);

    const hosts = rows.map(mapToHost);

    try {
        const result = await Host.insertMany(hosts, { ordered: false });
        console.log(`✅ Successfully inserted ${result.length} hosts`);
    } catch (err: any) {
        console.error("⚠️ Error inserting data:", err.message);
    } finally {
        await mongoose.disconnect();
        console.log("🔌 Disconnected from MongoDB");
    }
}

importHosts();