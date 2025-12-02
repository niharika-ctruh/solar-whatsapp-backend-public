"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordValidation = exports.requestPasswordValidation = exports.loginValidation = exports.signupValidation = void 0;
const zod_1 = require("zod");
const passwordSchema = zod_1.z
    .string()
    .min(1, { message: "Password is required" })
    .regex(/[A-Z]/, {
    message: "Password must contain at least one uppercase letter",
})
    .regex(/[a-z]/, {
    message: "Password must contain at least one lowercase letter",
})
    .regex(/\d/, { message: "Password must contain at least one number" })
    .regex(/[@$!%*?&#]/, {
    message: "Password must contain at least one special character",
})
    .regex(/^\S*$/, { message: "Password can't contain spaces" })
    .min(6, { message: "Password must be at least 6 characters" })
    .max(20, { message: "Password cannot exceed 20 characters" })
    .trim();
const emailSchema = zod_1.z.string().email("Must be a valid email address");
const signupSchema = zod_1.z.object({
    firstName: zod_1.z
        .string()
        .min(3, { message: "First name must be at least 3 characters" })
        .max(50, { message: "First name must be at most 50 characters" }),
    lastName: zod_1.z
        .string()
        .min(3, { message: "Last name must be at least 3 characters" })
        .max(50, { message: "Last name must be at most 50 characters" }),
    email: emailSchema,
    password: passwordSchema,
    role: zod_1.z.enum(["consultant", "relationship_manager"], {
        message: "Invalid role selected",
    }),
});
const loginSchema = zod_1.z.object({
    email: emailSchema,
    password: passwordSchema,
});
const requestPasswordSchema = zod_1.z.object({
    email: emailSchema,
});
const resetPasswordSchema = zod_1.z.object({
    password: passwordSchema,
});
const signupValidation = (req, res, next) => {
    const result = signupSchema.safeParse(req.body);
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
exports.signupValidation = signupValidation;
const loginValidation = (req, res, next) => {
    const result = loginSchema.safeParse(req.body);
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
exports.loginValidation = loginValidation;
const requestPasswordValidation = (req, res, next) => {
    const result = requestPasswordSchema.safeParse(req.body);
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
exports.requestPasswordValidation = requestPasswordValidation;
const resetPasswordValidation = (req, res, next) => {
    const result = resetPasswordSchema.safeParse(req.body);
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
exports.resetPasswordValidation = resetPasswordValidation;
//# sourceMappingURL=auth.middleware.js.map