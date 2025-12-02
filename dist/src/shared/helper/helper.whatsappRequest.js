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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWhatsAppMessage = sendWhatsAppMessage;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../../config/env");
function sendWhatsAppMessage(payload) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const url = `https://graph.facebook.com/v22.0/${env_1.PHONE_NUMBER_ID}/messages`;
        const headers = {
            Authorization: `Bearer ${env_1.WHATSAPP_TOKEN}`,
            "Content-Type": "application/json",
        };
        try {
            yield axios_1.default.post(url, payload, { headers });
            console.log(`✅ WhatsApp message sent successfully`);
        }
        catch (error) {
            console.error("❌ WhatsApp API Error:", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        }
    });
}
//# sourceMappingURL=helper.whatsappRequest.js.map