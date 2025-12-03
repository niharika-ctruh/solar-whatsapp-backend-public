import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { getCollection } from "../db/connect";
import { IUserType } from "../../modules/auth/types/user";
import { ObjectId } from "mongodb";
import { JWT_SECRET } from "../../config/env";
import { AuthRequest } from "../types/types";

export const checkAuthorized = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const headerToken = req.get("authorization");
    if (!headerToken) return res.status(401).json({ success: false, message: "Unauthorized: JWT token not provided" });

    try {
        if (!JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined in environment variables");
        }

        const decoded = jwt.verify(headerToken as string, JWT_SECRET);
        if (!decoded || typeof decoded !== "object" || !("id" in decoded)) {
            throw new Error("Invalid token payload");
        }

        const userCollection = await getCollection("users");
        if (!userCollection) return res.status(404).json({ success: false, message: "User collection not found!" });

        const user = (await userCollection.findOne({ _id: new ObjectId(decoded.id) }, { projection: { password: 0 } })) as unknown as IUserType;
        if (!user) return res.status(404).json({ message: "User not found" });

        req.user = user;
        next();
    } catch (err) {
        return res.status(403).json({ success: false, message: "Forbidden: Invalid JWT token" });
    }
};
