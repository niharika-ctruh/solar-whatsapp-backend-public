import { Request, Response } from "express";
import { handleApiError, handlePaginationInfo, isValidMongoId } from "../../../shared/utils/utils";
import { getVisitRequestById, getVisitRequestCounts, getVisitRequests, sendRequest, updateVisitRequestById } from "../service/sendRequest.service";
import { IUserType } from "../../auth/types/user";
import { VisitRequestFilters } from "../types/visitRequest.type";

export const handleSendRequest = async (req: Request, res: Response) => {
    try {
        const { body, user } = req;
        const request = await sendRequest(body, user as IUserType);
        res.status(201).json({ message: "Request send successfully", request });
    } catch (error) {
        return handleApiError(res, error);
    }
};

export const handleGetVisitRequests = async (req: Request, res: Response) => {
    try {
        // query params
        const filters: VisitRequestFilters = {
            date: typeof req.query.date === "string" ? req.query.date : undefined,
            name: typeof req.query.name === "string" ? req.query.name : undefined,
            status: typeof req.query.status === "string" ? (req.query.status as VisitRequestFilters["status"]) : undefined,
        };

        const { page, limit, skip } = handlePaginationInfo(req);

        const [{ requests, total }, counts] = await Promise.all([getVisitRequests(filters, skip, limit), getVisitRequestCounts(filters)]);

        res.status(200).json({
            message: "Requests fetched successfully",
            data: requests,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            counts,
        });
    } catch (error) {
        handleApiError(res, error);
    }
};

export const handleGetVisitRequestById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!isValidMongoId(id, res)) return;
        const request = await getVisitRequestById({ id });
        res.status(200).json({ message: "Request fetched successfully", data: request });
    } catch (error) {
        handleApiError(res, error);
    }
};

export const handleUpdateVisitRequest = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = req.user as { _id: IUserType["_id"]; role: IUserType["role"] };
        const request = await updateVisitRequestById({ id, body: req.body, user });
        res.status(200).json({ message: "Request updated successfully", data: request });
    } catch (error) {
        handleApiError(res, error);
    }
};
