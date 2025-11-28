import { Request, Response } from "express";
import { handleApiError } from "../../../shared/utils/utils";
import { sendRequest } from "../service/sendRequest.service";
import { IUserType } from "../../auth/types/user";

export const handleSendRequest = async (req: Request, res: Response) => {
    try {
        const { body, user } = req;
        const request = await sendRequest(body, user as IUserType);
        res.status(201).json({
            message: "Request send successfully",
            request,
        });
    } catch (error) {
        return handleApiError(res, error);
    }
};
