import mongoose from "mongoose";
import { VisitRequest } from "../models/visitRequest.model";

export const getScheduledVisits = async ({
    tab,
    status,
    search,
    skip,
    limit,
}: {
    tab: string;
    status: string;
    search?: string;
    skip: number;
    limit: number;
}) => {
    const now = new Date();
    const searchRegex = search ? new RegExp(search, "i") : null;

    // Paginated data match
    const matchData: any = {};
    if (tab === "upcoming") matchData.date = { $gte: now };
    if (tab === "past") matchData.date = { $lt: now };
    if (status !== "all") {
        if (status === "confirmed") matchData.status = { $in: ["visit_scheduled", "visit_rescheduled"] };
        else matchData.status = status;
    }

    // Paginated data pipeline
    const dataPipeline: any[] = [
        { $match: matchData },
        { $lookup: { from: "customers", localField: "customerId", foreignField: "_id", as: "customer" } },
        { $unwind: "$customer" },
        {
            $lookup: {
                from: "hosts",
                let: { reqId: "$_id" },
                pipeline: [{ $match: { $expr: { $in: ["$$reqId", "$visitRequests.requestId"] } } }, { $project: { name: 1, visitRequests: 1 } }],
                as: "hostArr",
            },
        },
        {
            $addFields: {
                acceptedHost: {
                    $cond: [
                        { $gt: [{ $size: "$hostArr" }, 0] },
                        {
                            name: { $arrayElemAt: ["$hostArr.name", 0] },
                            visitHostedCount: {
                                $cond: [
                                    { $eq: ["$status", "completed"] },
                                    {
                                        $size: {
                                            $filter: {
                                                input: { $arrayElemAt: ["$hostArr.visitRequests", 0] },
                                                as: "vr",
                                                cond: { $eq: ["$$vr.status", "completed"] },
                                            },
                                        },
                                    },
                                    "$$REMOVE",
                                ],
                            },
                        },
                        null,
                    ],
                },
            },
        },

        // Search filter on customer or host
        ...(search ? [{ $match: { $or: [{ "customer.name": searchRegex }, { "acceptedHost.name": searchRegex }] } }] : []),

        {
            $project: {
                _id: 1,
                date: 1,
                timeSlot: 1,
                status: 1,
                createdAt: 1,
                updatedAt: 1,
                timeSlotUpdated: 1,
                customer: { name: "$customer.name", address: "$customer.address" },
                acceptedHost: 1,
            },
        },
        { $sort: { date: 1 } },
        { $skip: skip },
        { $limit: limit },
    ];

    // Raw counts per status (tab-aware)
    const matchCountsRaw: any = {};
    if (tab === "upcoming") matchCountsRaw.date = { $gte: now };
    if (tab === "past") matchCountsRaw.date = { $lt: now };

    const countsRawPipeline = [
        { $match: matchCountsRaw },
        {
            $group: {
                _id: null,
                visit_scheduled: { $sum: { $cond: [{ $eq: ["$status", "visit_scheduled"] }, 1, 0] } },
                visit_rescheduled: { $sum: { $cond: [{ $eq: ["$status", "visit_rescheduled"] }, 1, 0] } },
                completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
                cancelled: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } },
                total: { $sum: 1 },
            },
        },
        {
            $project: {
                _id: 0,
                All: "$total",
                Confirmed: tab === "upcoming" || tab === "all" ? { $add: ["$visit_scheduled", "$visit_rescheduled"] } : undefined,
                Completed: tab === "past" || tab === "all" ? "$completed" : undefined,
                Cancelled: "$cancelled",
            },
        },
    ];

    // Filtered count for selected status/search
    let countsFilteredPipeline: any[] | null = null;
    if (status !== "all" || search) {
        const matchFiltered: any = {};
        if (tab === "upcoming") matchFiltered.date = { $gte: now };
        if (tab === "past") matchFiltered.date = { $lt: now };
        if (status !== "all") {
            if (status === "confirmed") matchFiltered.status = { $in: ["visit_scheduled", "visit_rescheduled"] };
            else matchFiltered.status = status;
        }

        countsFilteredPipeline = [
            { $match: matchFiltered },
            { $lookup: { from: "customers", localField: "customerId", foreignField: "_id", as: "customer" } },
            { $unwind: "$customer" },
            {
                $lookup: {
                    from: "hosts",
                    let: { reqId: "$_id" },
                    pipeline: [{ $match: { $expr: { $in: ["$$reqId", "$visitRequests.requestId"] } } }, { $project: { name: 1 } }],
                    as: "hostArr",
                },
            },
            { $addFields: { acceptedHost: { $arrayElemAt: ["$hostArr", 0] } } },
            ...(search ? [{ $match: { $or: [{ "customer.name": searchRegex }, { "acceptedHost.name": searchRegex }] } }] : []),
            { $group: { _id: null, total: { $sum: 1 } } },
        ];
    }

    // Execute all aggregations
    const [data, countsRawResult, countsFilteredResult] = await Promise.all([
        VisitRequest.aggregate(dataPipeline),
        VisitRequest.aggregate(countsRawPipeline),
        countsFilteredPipeline ? VisitRequest.aggregate(countsFilteredPipeline) : Promise.resolve([]),
    ]);

    const countsRaw = countsRawResult[0] || { All: 0, Confirmed: 0, Completed: 0, Cancelled: 0 };
    const countsFiltered = countsFilteredResult[0]?.total ?? 0;

    // Compose final counts
    const counts: Record<string, number> = {};
    counts.All = countsRaw.All;
    if (tab === "upcoming") {
        counts.Confirmed = countsRaw.Confirmed ?? 0;
        counts.Cancelled = countsRaw.Cancelled ?? 0;
    } else if (tab === "past") {
        counts.Completed = countsRaw.Completed ?? 0;
        counts.Cancelled = countsRaw.Cancelled ?? 0;
    } else {
        // all
        counts.Confirmed = countsRaw.Confirmed ?? 0;
        counts.Completed = countsRaw.Completed ?? 0;
        counts.Cancelled = countsRaw.Cancelled ?? 0;
    }

    // Apply filtered search/status only to the selected status
    if (status === "confirmed") counts.Confirmed = countsFiltered;
    else if (status === "completed") counts.Completed = countsFiltered;
    else if (status === "cancelled") counts.Cancelled = countsFiltered;
    else if (status === "all" && search) counts.All = countsFiltered;

    return {
        data,
        totalPages: Math.ceil(counts.All / limit),
        counts,
    };
};
export const getScheduledVisitById = async ({ id }: { id: string }) => {
    const objId = new mongoose.Types.ObjectId(id);

    const pipeline = [
        { $match: { _id: objId } },
        // Customer
        {
            $lookup: {
                from: "customers",
                localField: "customerId",
                foreignField: "_id",
                as: "customer",
            },
        },
        { $unwind: "$customer" },

        // SC
        {
            $lookup: {
                from: "users",
                localField: "consultantId",
                foreignField: "_id",
                as: "consultant",
            },
        },
        { $unwind: { path: "$consultant", preserveNullAndEmptyArrays: true } },

        // host that accepted
        {
            $lookup: {
                from: "hosts",
                let: { reqId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $in: ["$$reqId", "$visitRequests.requestId"] },
                        },
                    },
                    {
                        // only keep what we truly need
                        $project: {
                            name: 1,
                            hostSseId: 1,
                            visitRequests: 1, // needed temporarily for computing count
                        },
                    },
                ],
                as: "hostData",
            },
        },

        // extract host
        { $addFields: { hostTemp: { $arrayElemAt: ["$hostData", 0] } } },

        // visit hosted count
        {
            $addFields: {
                acceptedHost: {
                    name: "$hostTemp.name",
                    hostSseId: "$hostTemp.hostSseId",
                    visitHostedCount: {
                        $cond: [
                            { $eq: ["$status", "completed"] },
                            {
                                $size: {
                                    $filter: {
                                        input: "$hostTemp.visitRequests",
                                        as: "vr",
                                        cond: { $eq: ["$$vr.status", "completed"] },
                                    },
                                },
                            },
                            0,
                        ],
                    },
                },
            },
        },

        // final
        {
            $project: {
                _id: 1,
                date: 1,
                timeSlot: 1,
                status: 1,
                createdAt: 1,
                updatedAt: 1,

                customer: {
                    customerId: "$customer.customerId",
                    name: "$customer.name",
                    address: "$customer.address",
                },

                acceptedHost: 1,

                consultant: {
                    consultantId: "$consultant._id",
                    firstName: "$consultant.firstName",
                    lastName: "$consultant.lastName",
                },

                // temp fields removed automatically
            },
        },
    ];

    const result = await VisitRequest.aggregate(pipeline).allowDiskUse(true);
    return result[0] || null;
};
