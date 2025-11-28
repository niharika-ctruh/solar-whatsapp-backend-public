import axios from "axios";
import { PHONE_NUMBER_ID, WHATSAPP_TOKEN } from "../../config/env";

export async function sendWhatsAppMessage(payload: any) {
    const url = `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`;

    const headers = {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
    };

    try {
        await axios.post(url, payload, { headers });
        console.log(`✅ WhatsApp message sent successfully`);
    } catch (error: any) {
        console.error("❌ WhatsApp API Error:", error.response?.data || error.message);
    }
}
