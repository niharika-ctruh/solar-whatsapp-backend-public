import mongoose from "mongoose";
import { ICustomerDocument } from "./customer.type";

export interface VisitRequestFilters {
    date?: string;
    name?: string;
    status?: "pending" | "completed" | "cancelled" | "visit_scheduled" | "visit_rescheduled" | "open" | "past" | "scheduled";
}

// Visit Request Schema
export interface IVisitRequest {
    customerId: mongoose.Schema.Types.ObjectId | ICustomerDocument;
    consultantId: mongoose.Schema.Types.ObjectId;
    date: Date;
    timeSlot: string;
    status: "pending" | "completed" | "cancelled" | "visit_scheduled" | "visit_rescheduled";
    notes?: string;
    requestId: string;
    timeSlotUpdated: boolean;
}
