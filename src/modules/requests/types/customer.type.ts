import mongoose, { Document, Double } from "mongoose";

export interface ICustomerDocument extends Document {
    customerId: string;
    name: string;
    location: {
        type: "Point";
        coordinates: [number, number]; // [longitude, latitude]
    };
    consultantId: mongoose.Schema.Types.ObjectId;
    address: string;
    createdAt?: Date;
    updatedAt?: Date;
    requestId: mongoose.Schema.Types.ObjectId;
}

export interface IRequestBody {
    customerId: mongoose.Schema.Types.ObjectId;
    name: string;
    coordinates: [Double];
    address: String;
    date: Date;
    timeSlot: string;
}
