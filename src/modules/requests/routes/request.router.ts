import express from "express";
import { sendRequestValidation } from "../middleware/sendRequest.middleware";
import { handleSendRequest } from "../controller/sendRequest.controller";
import { checkAuthorized } from "../../../shared/middleware/auth";
import { validateUpdateVisitRequest } from "../middleware/visitRequest.middleware";
import { validateRoleAndPermissions } from "../middleware/rolePermissions.middleware";
import {
    handleGetVisitRequestById,
    handleGetVisitRequests,
    handleUpdateVisitRequest,
    handleVisitRequestCancellation,
} from "../controller/visitRequest.controller";
import { handleGetScheduledVisitById, handleGetScheduledVisits } from "../controller/scheduledVisits.controller";

const sendRequestRouter = express.Router();

sendRequestRouter.use(checkAuthorized);
sendRequestRouter.get("/visit-requests", handleGetVisitRequests);
sendRequestRouter.get("/scheduled-visit-requests", handleGetScheduledVisits);
sendRequestRouter.get("/scheduled-visit-request/:id", handleGetScheduledVisitById);
sendRequestRouter.get("/visit-request/:id", handleGetVisitRequestById);
sendRequestRouter.patch("/visit-request/:id", validateUpdateVisitRequest, validateRoleAndPermissions, handleUpdateVisitRequest);
sendRequestRouter.post("/cancel-visit-request/:id", handleVisitRequestCancellation);
sendRequestRouter.post("/send-request", sendRequestValidation, handleSendRequest);

export default sendRequestRouter;
