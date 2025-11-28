import { Request, Response, NextFunction } from "express";
import { z } from "zod";

const passwordSchema = z
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

const emailSchema = z.string().email("Must be a valid email address");

const signupSchema = z.object({
    firstName: z
        .string()
        .min(3, { message: "First name must be at least 3 characters" })
        .max(50, { message: "First name must be at most 50 characters" }),
    lastName: z
        .string()
        .min(3, { message: "Last name must be at least 3 characters" })
        .max(50, { message: "Last name must be at most 50 characters" }),
    email: emailSchema,
    password: passwordSchema,
    role: z.enum(["consultant", "relationship_manager"], {
        message: "Invalid role selected",
    }),
});

const loginSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
});

const requestPasswordSchema = z.object({
    email: emailSchema,
});

const resetPasswordSchema = z.object({
    password: passwordSchema,
});

export const signupValidation = (req: Request, res: Response, next: NextFunction): void => {
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

export const loginValidation = (req: Request, res: Response, next: NextFunction): void => {
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

export const requestPasswordValidation = (req: Request, res: Response, next: NextFunction): void => {
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

export const resetPasswordValidation = (req: Request, res: Response, next: NextFunction): void => {
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
