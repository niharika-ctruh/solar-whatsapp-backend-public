import { Request, Response, NextFunction } from "express";
import { z } from "zod";

export const customerSchema = z.object({
    customerId: z.string().min(1, { message: "Customer ID is required" }),

    name: z.string().min(3, { message: "Name must be at least 3 characters" }).max(100, { message: "Name must be at most 100 characters" }),

    coordinates: z.array(z.number()).length(2, { message: "Coordinates must be an array of exactly 2 numbers [longitude, latitude]" }),

    address: z
        .string()
        .min(5, { message: "Address must be at least 5 characters long" })
        .max(200, { message: "Address cannot exceed 200 characters" }),

    date: z.iso.datetime({ message: "Date must be a valid ISO 8601 datetime string" }).refine(
        (dateStr: string) => {
            const requestDate = new Date(dateStr);
            const now = new Date();
            return requestDate > now;
        },
        { message: "Date must be in the future" },
    ),
    timeSlot: z
        .string()
        .min(1, { message: "Time slot is required" })
        .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Time must be in 24-hour format HH:MM (e.g., 14:30)" }),
});

export const sendRequestValidation = (req: Request, res: Response, next: NextFunction): void => {
    const result = customerSchema.safeParse(req.body);

    if (!result.success) {
        const firstError = result.error.issues[0];
        res.status(400).json({
            success: false,
            message: firstError.message,
            field: firstError.path.join("."),
        });
        return;
    }

    next();
};
