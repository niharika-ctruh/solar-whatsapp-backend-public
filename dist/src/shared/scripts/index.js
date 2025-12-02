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
exports.importHosts = importHosts;
const mongoose_1 = __importDefault(require("mongoose"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const host_model_1 = require("../../modules/requests/models/host.model");
// MongoDB URI
const MONGO_URI = "mongodb://localhost:27017/solar-square";
function connectDB() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield mongoose_1.default.connect(MONGO_URI);
            console.log("✅ Connected to MongoDB");
        }
        catch (error) {
            console.error("❌ MongoDB connection error:", error);
            process.exit(1);
        }
    });
}
function readCSV(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];
        fs_1.default.createReadStream(filePath)
            .pipe((0, csv_parser_1.default)())
            .on("data", data => results.push(data))
            .on("end", () => resolve(results))
            .on("error", reject);
    });
}
// Convert a single row into Host schema format
function mapToHost(row) {
    const [latStr, lonStr] = row["Lat Lon"] ? row["Lat Lon"].split(",").map((x) => x.trim()) : [null, null];
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
        visitRequests: []
    };
}
function importHosts() {
    return __awaiter(this, void 0, void 0, function* () {
        yield connectDB();
        const filePath = path_1.default.resolve(__dirname, "host.csv"); // update filename if needed
        console.log("filePath", filePath);
        const rows = yield readCSV(filePath);
        console.log(`📋 Found ${rows.length} hosts in CSV file`);
        const hosts = rows.map(mapToHost);
        try {
            const result = yield host_model_1.Host.insertMany(hosts, { ordered: false });
            console.log(`✅ Successfully inserted ${result.length} hosts`);
        }
        catch (err) {
            console.error("⚠️ Error inserting data:", err.message);
        }
        finally {
            yield mongoose_1.default.disconnect();
            console.log("🔌 Disconnected from MongoDB");
        }
    });
}
importHosts();
//# sourceMappingURL=index.js.map