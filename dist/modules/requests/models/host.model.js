"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Host = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const HostSchema = new mongoose_1.Schema({
    hostSseId: { type: String, required: true,
        // unique: true // NOTE: undo this after developement
    },
    name: { type: String, required: true },
    phone: {
        type: String,
        required: true,
        // unique: true // NOTE: undo this after developement
    },
    email: String,
    location: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point",
            required: true,
        },
        coordinates: {
            type: [Number],
            required: true,
        },
    },
    address: {
        cluster: { type: String, required: true },
        fullAddress: { type: String, required: true },
    },
    available: { type: Boolean, default: false },
    visitRequests: [
        {
            requestId: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: "VisitRequest",
            },
            status: {
                type: String,
                enum: ["pending", "accepted", "rejected", "cancelled", "completed"],
                default: "pending",
            },
        },
    ],
}, { timestamps: true });
// Index
HostSchema.index({ location: "2dsphere" });
// Model
exports.Host = mongoose_1.default.model("Host", HostSchema);
