"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUpdateVisitRequest = void 0;
const zod_1 = __importDefault(require("zod"));
const utils_1 = require("../../../shared/utils/utils");
const sendRequest_middleware_1 = require("./sendRequest.middleware");
const scheduleFieldsSchema = sendRequest_middleware_1.customerSchema
    .pick({
    date: true,
    timeSlot: true,
})
    .partial();
const updateVisitRequestSchema = zod_1.default
    .object(Object.assign(Object.assign({}, scheduleFieldsSchema.shape), { status: zod_1.default.enum(["pending", "completed", "cancelled", "visit_scheduled", "visit_rescheduled"]).optional(), notes: zod_1.default.string().min(1, "Notes cannot be empty").optional() }))
    .strict();
const validateUpdateVisitRequest = (req, res, next) => {
    const { id } = req.params;
    if (!(0, utils_1.isValidMongoId)(id, res))
        return;
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
exports.validateUpdateVisitRequest = validateUpdateVisitRequest;
//# sourceMappingURL=visitRequest.middleware.js.map