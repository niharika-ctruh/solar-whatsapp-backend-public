import mongoose, { Schema } from "mongoose";
import { IHost } from "../types/host.type";

const HostSchema = new Schema<IHost>(
    {
        hostSseId: {
            type: String,
            required: true,
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
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "VisitRequest",
                },
                status: {
                    type: String,
                    enum: ["pending", "accepted", "rejected", "confirmed", "cancelled", "completed"],
                    default: "pending",
                },
                responseAt: { type: Date, default: null },
            },
        ],
    },
    { timestamps: true },
);

// Index
HostSchema.index({ location: "2dsphere" });

// Model
export const Host = mongoose.model<IHost>("Host", HostSchema);
