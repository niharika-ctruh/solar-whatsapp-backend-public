import mongoose, { Schema } from "mongoose";
import { ICustomerDocument } from "../types/customer.type";

const CustomerSchema = new Schema<ICustomerDocument>(
    {
        customerId: { type: String, required: true, unique: true },
        name: { type: String, required: true },
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
        consultantId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        address: { type: String, required: true },
        requestId: { type: mongoose.Schema.Types.ObjectId, ref: "VisitRequest" },
    },
    { timestamps: true },
);

//  Index
CustomerSchema.index({ location: "2dsphere" });

// Model
export const Customer = mongoose.model<ICustomerDocument>("Customer", CustomerSchema);
