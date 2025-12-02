"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sendRequest_middleware_1 = require("../middleware/sendRequest.middleware");
const sendRequest_controller_1 = require("../controller/sendRequest.controller");
const auth_1 = require("../../../shared/middleware/auth");
const visitRequest_middleware_1 = require("../middleware/visitRequest.middleware");
const rolePermissions_middleware_1 = require("../middleware/rolePermissions.middleware");
const sendRequestRouter = express_1.default.Router();
sendRequestRouter.use(auth_1.checkAuthorized);
sendRequestRouter.get("/visit-requests", sendRequest_controller_1.handleGetVisitRequests);
sendRequestRouter.get("/visit-request/:id", sendRequest_controller_1.handleGetVisitRequestById);
sendRequestRouter.patch("/visit-request/:id", visitRequest_middleware_1.validateUpdateVisitRequest, rolePermissions_middleware_1.validateRoleAndPermissions, sendRequest_controller_1.handleUpdateVisitRequest);
sendRequestRouter.post("/send-request", sendRequest_middleware_1.sendRequestValidation, sendRequest_controller_1.handleSendRequest);
exports.default = sendRequestRouter;
//# sourceMappingURL=request.router.js.map