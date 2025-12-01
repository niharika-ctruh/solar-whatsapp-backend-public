import mongoose, { Schema } from "mongoose";
import { IVisitRequest } from "../types/visitRequest.type";

const VisitRequestSchema = new Schema<IVisitRequest>(
    {
        customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
        consultantId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        date: { type: Date, required: true },
        timeSlot: { type: String, required: true },
        status: {
            type: String,
            enum: ["pending", "completed", "cancelled", "visit_scheduled", "visit_rescheduled"],
            default: "pending",
        },
        notes: String,
        timeSlotUpdated: { type: Boolean, default: false },
    },
    { timestamps: true },
);

export const VisitRequest = mongoose.model<IVisitRequest>("VisitRequest", VisitRequestSchema);
