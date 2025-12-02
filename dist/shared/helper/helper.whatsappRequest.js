"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWhatsAppMessage = sendWhatsAppMessage;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../../config/env");
async function sendWhatsAppMessage(payload) {
    var _a;
    const url = `https://graph.facebook.com/v22.0/${env_1.PHONE_NUMBER_ID}/messages`;
    const headers = {
        Authorization: `Bearer ${env_1.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
    };
    try {
        await axios_1.default.post(url, payload, { headers });
        console.log(`✅ WhatsApp message sent successfully`);
    }
    catch (error) {
        console.error("❌ WhatsApp API Error:", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
    }
}
