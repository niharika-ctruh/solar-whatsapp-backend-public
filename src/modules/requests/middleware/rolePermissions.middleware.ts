import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { IUserType } from "../../auth/types/user";
import { IVisitRequest } from "../types/visitRequest.type";
import { JWT_SECRET } from "../../../config/env";

// Define which roles can update which fields
const rolePermissions: Record<IUserType["role"], (keyof IVisitRequest)[]> = {
    consultant: ["date", "timeSlot", "status", "notes"], // consultant can update date/time once
    relationship_manager: ["date", "timeSlot", "status", "notes"], // RM can update more freely
};

export const validateRoleAndPermissions = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.get("authorization");
        if (!token) return res.status(401).json({ success: false, message: "Unauthorized: JWT token not provided" });

        if (!JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined in environment variables");
        }
        const decoded = jwt.verify(token, JWT_SECRET) as IUserType;
        req.user = decoded; // attach user to request

        const allowedFields = rolePermissions[decoded.role];
        const invalidFields = Object.keys(req.body).filter(field => !allowedFields.includes(field as keyof IVisitRequest));

        if (invalidFields.length) {
            return res.status(403).json({
                success: false,
                message: `You are not allowed to update fields: [${invalidFields.join(", ")}]`,
            });
        }

        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Forbidden: Invalid JWT token" });
    }
};
