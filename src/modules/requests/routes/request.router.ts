import express from "express";
import { sendRequestValidation } from "../middleware/sendRequest.middleware";
import { handleSendRequest } from "../controller/sendRequest.controller";
import { checkAuthorized } from "../../../shared/middleware/auth";

const sendRequestRouter = express.Router();

sendRequestRouter.use(checkAuthorized);
sendRequestRouter.post("/send-request", sendRequestValidation, handleSendRequest);

export default sendRequestRouter;