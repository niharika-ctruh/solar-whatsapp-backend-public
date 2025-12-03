import { Request, Response } from "express";
import { VisitRequestFilters } from "../types/visitRequest.type";
import { handleApiError, handlePaginationInfo, isValidMongoId } from "../../../shared/utils/utils";
import { IUserType } from "../../auth/types/user";
import {
    cancelVisitRequest,
    getVisitRequestById,
    getVisitRequestCounts,
    getVisitRequests,
    updateVisitRequestById,
} from "../service/visitRequest.service";

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

export const handleVisitRequestCancellation = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!isValidMongoId(id, res)) return;
        const visitRequest = await cancelVisitRequest(id);
        res.status(200).json({ message: "Request cancelled successfully", data: visitRequest });
    } catch (error) {
        handleApiError(res, error);
    }
};
