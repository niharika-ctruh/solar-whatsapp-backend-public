"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateVisitRequestById = exports.getVisitRequestById = exports.getVisitRequests = exports.getVisitRequestCounts = exports.sendRequest = void 0;
const customer_model_1 = require("../models/customer.model");
const connect_1 = require("../../../shared/db/connect");
const helper_error_1 = require("../../../shared/helper/helper.error");
const visitRequest_model_1 = require("../models/visitRequest.model");
const mongoose_1 = __importDefault(require("mongoose"));
const sendRequest = async (body, user) => {
    try {
        const { customerId, name, coordinates, address, date, timeSlot } = body;
        const maxHostSearch = 10;
        const hosts = await (0, connect_1.getCollection)("hosts");
        if (!hosts) {
            throw new helper_error_1.Errors("Host collection not found!", 500);
        }
        const [lng, lat] = coordinates;
        // search for 3 km
        let nearbyHosts = await hosts
            .find({
            location: {
                $near: {
                    $geometry: { type: "Point", coordinates: [lng, lat] },
                    $maxDistance: 3000,
                },
            },
        })
            .limit(maxHostSearch)
            .toArray();
        // search for 6 km
        if (nearbyHosts.length === 0) {
            nearbyHosts = await hosts
                .find({
                location: {
                    $near: {
                        $geometry: { type: "Point", coordinates: [lng, lat] },
                        $maxDistance: 6000,
                    },
                },
            })
                .limit(maxHostSearch)
                .toArray();
        }
        if (nearbyHosts.length === 0) {
            throw new helper_error_1.Errors("No host found within 6 km range", 404);
        }
        const customer = new customer_model_1.Customer({
            customerId,
            name,
            location: {
                type: "Point",
                coordinates: coordinates,
            },
            address,
            consultantId: user._id,
        });
        const newCustomer = await customer.save();
        const request = new visitRequest_model_1.VisitRequest({
            customerId: newCustomer._id,
            consultantId: user._id,
            date,
            timeSlot,
        });
        const savedRequest = await request.save();
        const hostIds = nearbyHosts.map(host => host._id);
        await hosts.updateMany({ _id: { $in: hostIds } }, {
            $push: {
                visitRequests: {
                    requestId: savedRequest._id,
                    status: "pending",
                },
            },
        });
        const updatedCustomer = await customer_model_1.Customer.findByIdAndUpdate(newCustomer._id, { requestId: savedRequest._id }, { new: true });
        return {
            customer: updatedCustomer,
            request: savedRequest,
            hostsNotified: hostIds.length,
        };
    }
    catch (error) {
        throw error;
    }
};
exports.sendRequest = sendRequest;
const buildBaseMatch = (filters) => {
    const matchStage = {};
    // Date filter
    if (filters.date) {
        const parsedDate = new Date(filters.date);
        if (isNaN(parsedDate.getTime()))
            throw new Error("Invalid date format");
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
        }
        else if (filters.status === "past") {
            matchStage.status = { $in: ["completed", "cancelled"] };
        }
        else {
            matchStage.status = filters.status;
        }
    }
    return matchStage;
};
const buildFullPipeline = (match, filters) => {
    const pipeline = [
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
const getVisitRequestCounts = async (filters) => {
    // Global counts (always unfiltered)
    const globalCountsPromise = visitRequest_model_1.VisitRequest.aggregate([{ $group: buildGroupStage() }, { $project: { _id: 0 } }]);
    // Build match only for active bucket
    let bucketFilters = {};
    if (filters.status) {
        // status alone, or status + date, or status + name, or all three
        bucketFilters = Object.assign({}, filters);
    }
    else if (!filters.status && (filters.date || filters.name)) {
        // only date or name → affects ONLY the "all" bucket
        bucketFilters = { date: filters.date, name: filters.name };
    }
    const bucketMatch = buildBaseMatch(bucketFilters);
    const bucketPipeline = [{ $match: bucketMatch }];
    // Name filter (matches customer)
    if (bucketFilters.name) {
        bucketPipeline.push({
            $lookup: {
                from: "customers",
                localField: "customerId",
                foreignField: "_id",
                as: "customer",
            },
        }, { $unwind: "$customer" }, {
            $match: {
                "customer.name": { $regex: bucketFilters.name, $options: "i" },
            },
        });
    }
    bucketPipeline.push({ $group: buildGroupStage() }, { $project: { _id: 0 } });
    const filteredCountsPromise = visitRequest_model_1.VisitRequest.aggregate(bucketPipeline);
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
exports.getVisitRequestCounts = getVisitRequestCounts;
const getVisitRequests = async (filters, skip, limit) => {
    var _a;
    const match = buildBaseMatch(filters);
    const basePipeline = buildFullPipeline(match, filters);
    const countResult = await visitRequest_model_1.VisitRequest.aggregate([...basePipeline, { $count: "total" }]);
    const total = ((_a = countResult[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
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
    const requests = await visitRequest_model_1.VisitRequest.aggregate(listPipeline);
    return { requests, total };
};
exports.getVisitRequests = getVisitRequests;
const getVisitRequestById = async ({ id }) => {
    const pipeline = [
        {
            $match: { _id: new mongoose_1.default.Types.ObjectId(id) },
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
    const result = await visitRequest_model_1.VisitRequest.aggregate(pipeline);
    if (!result.length)
        throw new helper_error_1.Errors("Request not found", 404);
    return result[0];
};
exports.getVisitRequestById = getVisitRequestById;
const updateVisitRequestById = async ({ id, body, user, }) => {
    const existingRequest = await visitRequest_model_1.VisitRequest.findById(id);
    if (!existingRequest)
        throw new helper_error_1.Errors("Request not found", 404);
    const { date, timeSlot, status, notes } = body;
    const updatedRequest = {};
    // date + timeSlot (one-time allowed)
    const wantsScheduleChange = date !== undefined || timeSlot !== undefined;
    if (wantsScheduleChange) {
        if (existingRequest.timeSlotUpdated && user.role === "consultant") {
            throw new helper_error_1.Errors("Visit cannot be rescheduled more than once", 409);
        }
        if (existingRequest.status !== "visit_scheduled") {
            throw new helper_error_1.Errors("Visit must be scheduled first to be rescheduled", 409);
        }
        if (date !== undefined)
            updatedRequest.date = date;
        if (timeSlot !== undefined)
            updatedRequest.timeSlot = timeSlot;
        updatedRequest.timeSlotUpdated = true;
        updatedRequest.status = "visit_rescheduled";
    }
    // fields that can always be updated
    if (status !== undefined)
        updatedRequest.status = status;
    if (notes !== undefined)
        updatedRequest.notes = notes;
    const updated = await visitRequest_model_1.VisitRequest.findByIdAndUpdate(id, updatedRequest, { new: true });
    return updated;
};
exports.updateVisitRequestById = updateVisitRequestById;
