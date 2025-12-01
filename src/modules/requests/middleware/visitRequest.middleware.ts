import { NextFunction, Request, Response } from "express";
import z from "zod";
import { isValidMongoId } from "../../../shared/utils/utils";
import { customerSchema } from "./sendRequest.middleware";

const scheduleFieldsSchema = customerSchema
    .pick({
        date: true,
        timeSlot: true,
    })
    .partial();

const updateVisitRequestSchema = z
    .object({
        ...scheduleFieldsSchema.shape,
        status: z.enum(["pending", "completed", "cancelled", "visit_scheduled", "visit_rescheduled"]).optional(),
        notes: z.string().min(1, "Notes cannot be empty").optional(),
    })
    .strict();

export const validateUpdateVisitRequest = (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    if (!isValidMongoId(id, res)) return;

    const parsed = updateVisitRequestSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({
            message: "Validation failed",
            errors: parsed.error.flatten(),
        });
    }
    // Check if at least one key is present
    if (Object.keys(parsed.data).length === 0) {
        return res.status(400).json({
            message: "At least one field must be provided to update",
            success: false,
        });
    }

    req.body = parsed.data; // sanitized input
    next();
};
