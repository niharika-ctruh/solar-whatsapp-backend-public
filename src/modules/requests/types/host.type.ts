import mongoose, { Document } from "mongoose";

// Visit Request Schema
export interface IVisitRequest {
    customerId: string;
    consultantId: mongoose.Schema.Types.ObjectId;
    date: Date;
    timeSlot: string;
    status: "pending" | "accepted" | "rejected" | "cancelled" | "completed";
    notes?: string;
    requestId: string;
}

export interface IHost extends Document {
    hostSseId: string;
    name: string;
    phone: string;
    email?: string;
    location: {
        type: "Point";
        coordinates: [number, number]; // [longitude, latitude]
    };
    address: {
        cluster: string;
        fullAddress: string;
    };
    available: boolean;
    visitRequests: Array<{  // Changed to Array
        requestId: mongoose.Schema.Types.ObjectId;
        status: "pending" | "accepted" | "rejected" | "cancelled" | "completed";
    }>;
    status: "active" | "inactive";
    createdAt: Date;
    updatedAt: Date;
}