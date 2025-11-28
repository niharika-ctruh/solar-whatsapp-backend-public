import { Schema } from "mongoose";

export interface IUserType {
    _id?: Schema.Types.ObjectId;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: "consultant" | "relationship_manager";
}
