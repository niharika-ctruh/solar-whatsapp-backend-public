"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUpdateVisitRequest = exports.handleGetVisitRequestById = exports.handleGetVisitRequests = exports.handleSendRequest = void 0;
const utils_1 = require("../../../shared/utils/utils");
const sendRequest_service_1 = require("../service/sendRequest.service");
const handleSendRequest = async (req, res) => {
    try {
        const { body, user } = req;
        const request = await (0, sendRequest_service_1.sendRequest)(body, user);
        res.status(201).json({ message: "Request send successfully", request });
    }
    catch (error) {
        return (0, utils_1.handleApiError)(res, error);
    }
};
exports.handleSendRequest = handleSendRequest;
const handleGetVisitRequests = async (req, res) => {
    try {
        // query params
        const filters = {
            date: typeof req.query.date === "string" ? req.query.date : undefined,
            name: typeof req.query.name === "string" ? req.query.name : undefined,
            status: typeof req.query.status === "string" ? req.query.status : undefined,
        };
        const { page, limit, skip } = (0, utils_1.handlePaginationInfo)(req);
        const [{ requests, total }, counts] = await Promise.all([(0, sendRequest_service_1.getVisitRequests)(filters, skip, limit), (0, sendRequest_service_1.getVisitRequestCounts)(filters)]);
        res.status(200).json({
            message: "Requests fetched successfully",
            data: requests,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            counts,
        });
    }
    catch (error) {
        (0, utils_1.handleApiError)(res, error);
    }
};
exports.handleGetVisitRequests = handleGetVisitRequests;
const handleGetVisitRequestById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!(0, utils_1.isValidMongoId)(id, res))
            return;
        const request = await (0, sendRequest_service_1.getVisitRequestById)({ id });
        res.status(200).json({ message: "Request fetched successfully", data: request });
    }
    catch (error) {
        (0, utils_1.handleApiError)(res, error);
    }
};
exports.handleGetVisitRequestById = handleGetVisitRequestById;
const handleUpdateVisitRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const request = await (0, sendRequest_service_1.updateVisitRequestById)({ id, body: req.body, user });
        res.status(200).json({ message: "Request updated successfully", data: request });
    }
    catch (error) {
        (0, utils_1.handleApiError)(res, error);
    }
};
exports.handleUpdateVisitRequest = handleUpdateVisitRequest;
