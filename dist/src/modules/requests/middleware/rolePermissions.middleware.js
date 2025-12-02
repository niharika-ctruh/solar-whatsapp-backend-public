"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRoleAndPermissions = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../../config/env");
// Define which roles can update which fields
const rolePermissions = {
    consultant: ["date", "timeSlot", "status", "notes"], // consultant can update date/time once
    relationship_manager: ["date", "timeSlot", "status", "notes"], // RM can update more freely
};
const validateRoleAndPermissions = (req, res, next) => {
    try {
        const token = req.get("authorization");
        if (!token)
            return res.status(401).json({ success: false, message: "Unauthorized: JWT token not provided" });
        if (!env_1.JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined in environment variables");
        }
        const decoded = jsonwebtoken_1.default.verify(token, env_1.JWT_SECRET);
        req.user = decoded; // attach user to request
        const allowedFields = rolePermissions[decoded.role];
        const invalidFields = Object.keys(req.body).filter(field => !allowedFields.includes(field));
        if (invalidFields.length) {
            return res.status(403).json({
                success: false,
                message: `You are not allowed to update fields: [${invalidFields.join(", ")}]`,
            });
        }
        next();
    }
    catch (error) {
        return res.status(401).json({ success: false, message: "Forbidden: Invalid JWT token" });
    }
};
exports.validateRoleAndPermissions = validateRoleAndPermissions;
//# sourceMappingURL=rolePermissions.middleware.js.map