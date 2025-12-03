import mongoose from "mongoose";
import { VisitRequest } from "../models/visitRequest.model";
import { IVisitRequest, VisitRequestFilters } from "../types/visitRequest.type";
import { Errors } from "../../../shared/helper/helper.error";
import { IUserType } from "../../auth/types/user";
import { Customer } from "../models/customer.model";
import { Host } from "../models/host.model";

const STATUS_GROUPS = {
    open: ["pending", "visit_scheduled", "visit_rescheduled"],
    past: ["completed", "cancelled"],
};

const buildGroupStage = () => ({
    _id: null,
    all: { $sum: 1 },
    open: { $sum: { $cond: [{ $in: ["$status", STATUS_GROUPS.open] }, 1, 0] } },
    past: { $sum: { $cond: [{ $in: ["$status", STATUS_GROUPS.past] }, 1, 0] } },
    cancelled: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } },
});

const buildBaseMatch = (filters: VisitRequestFilters) => {
    const matchStage: any = {};

    // Date filter
    if (filters.date) {
        const parsedDate = new Date(filters.date);
        if (isNaN(parsedDate.getTime())) throw new Error("Invalid date format");

        const start = new Date(parsedDate);
        start.setHours(0, 0, 0, 0);

        const end = new Date(parsedDate);
        end.setHours(23, 59, 59, 999);

        matchStage.date = { $gte: start, $lte: end };
    }

    // Status filter
    if (filters.status) {
        if (filters.status === "open") {
            matchStage.status = { $in: ["pending", "visit_scheduled", "visit_rescheduled"] };
        } else if (filters.status === "past") {
            matchStage.status = { $in: ["completed", "cancelled"] };
        } else if (filters.status === "scheduled") {
            matchStage.status = { $in: ["visit_scheduled", "visit_rescheduled"] };
        } else {
            matchStage.status = filters.status;
        }
    }

    return matchStage;
};
const buildFullPipeline = (match: any, filters: VisitRequestFilters) => {
    const pipeline: any[] = [
        { $match: match },
        {
            $lookup: {
                from: "customers",
                localField: "customerId",
                foreignField: "_id",
                as: "customer",
            },
        },
        { $unwind: "$customer" },
    ];

    // Name filter
    if (filters.name) {
        pipeline.push({
            $match: { "customer.name": { $regex: filters.name, $options: "i" } },
        });
    }

    return pipeline;
};
export const getVisitRequests = async (filters: VisitRequestFilters, skip: number, limit: number) => {
    const match = buildBaseMatch(filters);
    const basePipeline = buildFullPipeline(match, filters);

    const countResult = await VisitRequest.aggregate([...basePipeline, { $count: "total" }]);
    const total = countResult[0]?.total || 0;

    const listPipeline = [
        ...basePipeline,
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
            $project: {
                customerId: 0,
                consultantId: 0,
                __v: 0,
                "customer.createdAt": 0,
                "customer.updatedAt": 0,
                "customer.__v": 0,
                "customer.requestId": 0,
                "customer.location": 0,
                "customer._id": 0,
            },
        },
    ];

    const requests = await VisitRequest.aggregate(listPipeline);
    return { requests, total };
};

export const getVisitRequestCounts = async (filters: VisitRequestFilters) => {
    // Global counts (always unfiltered)
    const globalCountsPromise = VisitRequest.aggregate([{ $group: buildGroupStage() }, { $project: { _id: 0 } }]);

    // Build match only for active bucket
    let bucketFilters: VisitRequestFilters = {};

    if (filters.status) {
        // status alone, or status + date, or status + name, or all three
        bucketFilters = { ...filters };
    } else if (!filters.status && (filters.date || filters.name)) {
        // only date or name → affects ONLY the "all" bucket
        bucketFilters = { date: filters.date, name: filters.name };
    }

    const bucketMatch = buildBaseMatch(bucketFilters);
    const bucketPipeline: any[] = [{ $match: bucketMatch }];

    // Name filter (matches customer)
    if (bucketFilters.name) {
        bucketPipeline.push(
            {
                $lookup: {
                    from: "customers",
                    localField: "customerId",
                    foreignField: "_id",
                    as: "customer",
                },
            },
            { $unwind: "$customer" },
            {
                $match: {
                    "customer.name": { $regex: bucketFilters.name, $options: "i" },
                },
            },
        );
    }

    bucketPipeline.push({ $group: buildGroupStage() }, { $project: { _id: 0 } });

    const filteredCountsPromise = VisitRequest.aggregate(bucketPipeline);

    const [globalData, filteredData] = await Promise.all([globalCountsPromise, filteredCountsPromise]);

    const g = globalData[0] || { all: 0, open: 0, past: 0, cancelled: 0 };
    const f = filteredData[0] || { all: 0, open: 0, past: 0, cancelled: 0 };

    // Merge: replace ONLY the target bucket
    return {
        all: !filters.status && (filters.date || filters.name) ? f.all : g.all,
        open: filters.status === "open" ? f.open : g.open,
        past: filters.status === "past" ? f.past : g.past,
        cancelled: filters.status === "cancelled" ? f.cancelled : g.cancelled,
    };
};

export const getVisitRequestById = async ({ id }: { id: string }) => {
    const pipeline = [
        {
            $match: { _id: new mongoose.Types.ObjectId(id) },
        },
        {
            $lookup: {
                from: "customers",
                localField: "customerId",
                foreignField: "_id",
                as: "customer",
            },
        },
        { $unwind: "$customer" },
        // Lookup the accepted host and visit hosted count
        {
            $lookup: {
                from: "hosts",
                let: { requestId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $in: ["$$requestId", "$visitRequests.requestId"],
                            },
                        },
                    },
                    {
                        $addFields: {
                            acceptedRequest: {
                                $filter: {
                                    input: "$visitRequests",
                                    as: "vr",
                                    cond: {
                                        $and: [{ $eq: ["$$vr.requestId", "$$requestId"] }, { $eq: ["$$vr.status", "accepted"] }],
                                    },
                                },
                            },
                            visitHostedCount: {
                                $size: {
                                    $filter: {
                                        input: "$visitRequests",
                                        as: "vr",
                                        cond: { $eq: ["$$vr.status", "completed"] },
                                    },
                                },
                            },
                        },
                    },
                    { $match: { "acceptedRequest.0": { $exists: true } } }, // only keep hosts who accepted
                    { $project: { name: 1, hostSseId: 1, address: 1, _id: 0, visitHostedCount: 1 } },
                ],
                as: "acceptedHost",
            },
        },
        { $unwind: { path: "$acceptedHost", preserveNullAndEmptyArrays: true } },
        {
            $project: {
                customerId: 0,
                consultantId: 0,
                __v: 0,
                "customer.createdAt": 0,
                "customer.updatedAt": 0,
                "customer.__v": 0,
                "customer.requestId": 0,
                "customer.location": 0,
                "customer._id": 0,
            },
        },
    ];
    const result = await VisitRequest.aggregate(pipeline);
    if (!result.length) throw new Errors("Request not found", 404);
    return result[0];
};

export const updateVisitRequestById = async ({
    id,
    body,
    user,
}: {
    id: string;
    body: Partial<IVisitRequest>;
    user: { _id: IUserType["_id"]; role: IUserType["role"] };
}) => {
    const existingRequest = await VisitRequest.findById(id);
    if (!existingRequest) throw new Errors("Request not found", 404);

    const { date, timeSlot, status, notes } = body;

    const updatedRequest: Partial<IVisitRequest> = {};

    // date + timeSlot (one-time allowed)
    const wantsScheduleChange = date !== undefined || timeSlot !== undefined;

    if (wantsScheduleChange) {
        if (existingRequest.timeSlotUpdated && user.role === "consultant") {
            throw new Errors("Visit cannot be rescheduled more than once", 409);
        }

        if (existingRequest.status !== "visit_scheduled") {
            throw new Errors("Visit must be scheduled first to be rescheduled", 409);
        }

        if (date !== undefined) updatedRequest.date = date;
        if (timeSlot !== undefined) updatedRequest.timeSlot = timeSlot;

        updatedRequest.timeSlotUpdated = true;
        updatedRequest.status = "visit_rescheduled";
    }

    // fields that can always be updated
    if (status !== undefined) updatedRequest.status = status;
    if (notes !== undefined) updatedRequest.notes = notes;

    const updated = await VisitRequest.findByIdAndUpdate(id, updatedRequest, { new: true });

    return updated;
};

export const cancelVisitRequest = async (requestId: string) => {
    // Cancel the main VisitRequest document
    const visit = await VisitRequest.findByIdAndUpdate(requestId, { status: "cancelled" }, { new: true });

    if (!visit) {
        throw new Error("Visit request not found");
    }

    // Remove requestId from Customer
    await Customer.updateOne({ requestId }, { $unset: { requestId: "" } });

    // Update Host visitRequests statuses
    await Host.updateMany(
        { "visitRequests.requestId": requestId },
        {
            $set: {
                "visitRequests.$[elem].status": "cancelled",
            },
        },
        {
            arrayFilters: [{ "elem.requestId": new mongoose.Types.ObjectId(requestId) }],
        },
    );

    return visit;
};
