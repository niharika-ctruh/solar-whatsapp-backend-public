import express from "express";
import { whatsappWebHook } from "../webhook/webhook";

const whatsappRouter = express.Router();

whatsappRouter.post("/webhook", whatsappWebHook);

export default whatsappRouter;
