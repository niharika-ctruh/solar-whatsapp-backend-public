import mongoose, { Schema } from "mongoose";
import { IVisitRequest } from "../types/host.type";

const VisitRequestSchema = new Schema<IVisitRequest>(
    {
        customerId: { type: String, required: true },
        consultantId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        date: { type: Date, required: true },
        timeSlot: { type: String, required: true },
        status: {
            type: String,
            enum: ["pending","completed", "cancelled", "visit_scheduled"],
            default: "pending",
        },
        notes: String,
    },
);

export const VisitRequest = mongoose.model<IVisitRequest>("VisitRequest", VisitRequestSchema);