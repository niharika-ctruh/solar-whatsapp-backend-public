"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendRequestValidation = exports.customerSchema = void 0;
const zod_1 = require("zod");
exports.customerSchema = zod_1.z.object({
    customerId: zod_1.z.string().min(1, { message: "Customer ID is required" }),
    name: zod_1.z.string().min(3, { message: "Name must be at least 3 characters" }).max(100, { message: "Name must be at most 100 characters" }),
    coordinates: zod_1.z.array(zod_1.z.number()).length(2, { message: "Coordinates must be an array of exactly 2 numbers [longitude, latitude]" }),
    address: zod_1.z
        .string()
        .min(5, { message: "Address must be at least 5 characters long" })
        .max(200, { message: "Address cannot exceed 200 characters" }),
    date: zod_1.z.iso.datetime({ message: "Date must be a valid ISO 8601 datetime string" }).refine(dateStr => {
        const requestDate = new Date(dateStr);
        const now = new Date();
        return requestDate > now;
    }, { message: "Date must be in the future" }),
    timeSlot: zod_1.z
        .string()
        .min(1, { message: "Time slot is required" })
        .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Time must be in 24-hour format HH:MM (e.g., 14:30)" }),
});
const sendRequestValidation = (req, res, next) => {
    const result = exports.customerSchema.safeParse(req.body);
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
exports.sendRequestValidation = sendRequestValidation;
//# sourceMappingURL=sendRequest.middleware.js.map