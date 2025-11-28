import { Request, Response } from "express";
import { createUser, login, requestPasswordReset, resetPassword } from "../services/auth.service";
import { handleApiError } from "../../../shared/utils/utils";

export const handelRegister = async (req: Request, res: Response) => {
    try {
        const { body } = req;
        const user = await createUser(body);
        res.status(201).json({
            message: "User created successfully",
            _id: user._id,
            token: user.token,
        });
    } catch (error) {
        return handleApiError(res, error);
    }
};

export const handleLogin = async (req: Request, res: Response) => {
    try {
        const { body } = req;
        const user = await login(body);

        res.status(200).json({
            message: "Login successfully",
            _id: user._id,
            token: user.token,
        });
    } catch (error) {
        return handleApiError(res, error);
    }
};

export const handleRequestPasswordReset = async (req: Request, res: Response) => {
    try {
        const { body } = req;
        await requestPasswordReset(body?.email);

        res.status(200).json({
            message: "Password reset link sent",
        });
    } catch (error) {
        return handleApiError(res, error);
    }
};

export const handleResetPassword = async (req: Request, res: Response) => {
    try {
        const { body, query } = req;

        await resetPassword(body?.password, query.data as string);

        res.status(200).json({
            message: "Password has been reset",
        });
    } catch (error) {
        return handleApiError(res, error);
    }
};
