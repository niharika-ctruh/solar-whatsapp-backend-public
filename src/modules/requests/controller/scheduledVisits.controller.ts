import { Request, Response } from "express";
import { handleApiError, handlePaginationInfo, isValidMongoId } from "../../../shared/utils/utils";
import { getScheduledVisitById, getScheduledVisits } from "../service/scheduledVisits.service";

export const handleGetScheduledVisits = async (req: Request, res: Response) => {
    try {
        const tab = typeof req.query.tab === "string" ? req.query.tab : "all";
        const status = typeof req.query.status === "string" ? req.query.status : "all";
        const search = typeof req.query.search === "string" ? req.query.search : undefined;

        const { page, limit, skip } = handlePaginationInfo(req);

        const result = await getScheduledVisits({
            tab,
            status,
            search,
            skip,
            limit,
        });

        return res.status(200).json({
            message: "Scheduled visits fetched successfully",
            data: result.data,
            counts: result.counts,
            currentPage: page,
            totalPages: result.totalPages,
        });
    } catch (error) {
        handleApiError(res, error);
    }
};

export const handleGetScheduledVisitById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!isValidMongoId(id, res)) return;
        const scheduledVisit = await getScheduledVisitById({ id });

        return res.status(200).json({
            message: "Scheduled visits fetched successfully",
            data: scheduledVisit,
        });
    } catch (error) {
        handleApiError(res, error);
    }
};
