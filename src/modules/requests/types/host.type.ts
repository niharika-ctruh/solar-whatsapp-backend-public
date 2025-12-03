import mongoose, { Document } from "mongoose";

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
    visitRequests: Array<{
        // Changed to Array
        requestId: mongoose.Schema.Types.ObjectId;
        status: "pending" | "accepted" | "rejected" | "cancelled" | "completed";
        responseAt: Date | null;
    }>;
    status: "active" | "inactive";
    createdAt: Date;
    updatedAt: Date;
}
