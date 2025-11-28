import mongoose, { Schema } from "mongoose";
import { IUserType } from "../types/user";

const UserSchema = new Schema<IUserType>(
    {
        firstName: {
            type: String,
            required: true,
            minlength: 3,
            maxlength: 50,
            trim: true,
        },
        lastName: {
            type: String,
            required: true,
            minlength: 3,
            maxlength: 50,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            default: null,
        },
        role: {
            type: String,
            enum: ["consultant", "relationship_manager"],
            default: "consultant",
        },
    },
    {
        timestamps: true,
    },
);

const UserModel = mongoose.model<IUserType>("User", UserSchema);

export default UserModel;
