import express from "express";
import { sendRequestValidation } from "../middleware/sendRequest.middleware";
import { handleGetVisitRequestById, handleGetVisitRequests, handleSendRequest, handleUpdateVisitRequest } from "../controller/sendRequest.controller";
import { checkAuthorized } from "../../../shared/middleware/auth";
import { validateUpdateVisitRequest } from "../middleware/visitRequest.middleware";
import { validateRoleAndPermissions } from "../middleware/rolePermissions.middleware";

const sendRequestRouter = express.Router();

sendRequestRouter.use(checkAuthorized);
sendRequestRouter.get("/visit-requests", handleGetVisitRequests);
sendRequestRouter.get("/visit-request/:id", handleGetVisitRequestById);
sendRequestRouter.patch("/visit-request/:id", validateUpdateVisitRequest, validateRoleAndPermissions, handleUpdateVisitRequest);
sendRequestRouter.post("/send-request", sendRequestValidation, handleSendRequest);

export default sendRequestRouter;