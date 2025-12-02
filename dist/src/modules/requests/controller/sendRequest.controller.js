"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUpdateVisitRequest = exports.handleGetVisitRequestById = exports.handleGetVisitRequests = exports.handleSendRequest = void 0;
const utils_1 = require("../../../shared/utils/utils");
const sendRequest_service_1 = require("../service/sendRequest.service");
const handleSendRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { body, user } = req;
        const request = yield (0, sendRequest_service_1.sendRequest)(body, user);
        res.status(201).json({ message: "Request send successfully", request });
    }
    catch (error) {
        return (0, utils_1.handleApiError)(res, error);
    }
});
exports.handleSendRequest = handleSendRequest;
const handleGetVisitRequests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // query params
        const filters = {
            date: typeof req.query.date === "string" ? req.query.date : undefined,
            name: typeof req.query.name === "string" ? req.query.name : undefined,
            status: typeof req.query.status === "string" ? req.query.status : undefined,
        };
        const { page, limit, skip } = (0, utils_1.handlePaginationInfo)(req);
        const [{ requests, total }, counts] = yield Promise.all([(0, sendRequest_service_1.getVisitRequests)(filters, skip, limit), (0, sendRequest_service_1.getVisitRequestCounts)(filters)]);
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
});
exports.handleGetVisitRequests = handleGetVisitRequests;
const handleGetVisitRequestById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!(0, utils_1.isValidMongoId)(id, res))
            return;
        const request = yield (0, sendRequest_service_1.getVisitRequestById)({ id });
        res.status(200).json({ message: "Request fetched successfully", data: request });
    }
    catch (error) {
        (0, utils_1.handleApiError)(res, error);
    }
});
exports.handleGetVisitRequestById = handleGetVisitRequestById;
const handleUpdateVisitRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = req.user;
        const request = yield (0, sendRequest_service_1.updateVisitRequestById)({ id, body: req.body, user });
        res.status(200).json({ message: "Request updated successfully", data: request });
    }
    catch (error) {
        (0, utils_1.handleApiError)(res, error);
    }
});
exports.handleUpdateVisitRequest = handleUpdateVisitRequest;
//# sourceMappingURL=sendRequest.controller.js.map