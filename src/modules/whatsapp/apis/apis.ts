import axios from "axios";
import { GUPSHUP_API_KEY, GUPSHUP_APP_NAME, GUPSHUP_MOBILE_NUMBER } from "../../../config/env";

export async function sendWhatsappTemplate({
    destination,
    templateId,
    requestId,
    params,
    imageUrl = null,
    postBack = true,
}: {
    destination: string;
    templateId: string;
    requestId: string;
    params?: string[];
    imageUrl?: string | null;
    postBack?: boolean;
}) {
    try {
        const payload = new URLSearchParams();

        payload.append("channel", "whatsapp");
        payload.append("source", `${GUPSHUP_MOBILE_NUMBER}`);
        payload.append("destination", destination);
        payload.append("src.name", `${GUPSHUP_APP_NAME}`);

        payload.append(
            "template",
            JSON.stringify({
                id: templateId,
                params: params,
            }),
        );

        if (postBack) {
            payload.append(
                "postbackTexts",
                JSON.stringify([
                    {
                        index: 0,
                        text: JSON.stringify({
                            requestId: requestId,
                            templateId: templateId,
                        }),
                    },
                    {
                        index: 1,
                        text: JSON.stringify({
                            requestId: requestId,
                            templateId: templateId,
                        }),
                    },
                ]),
            );
        }

        if (imageUrl) {
            payload.append(
                "message",
                JSON.stringify({
                    type: "image",
                    image: { link: imageUrl },
                }),
            );
        }

        const res = await axios.post("https://api.gupshup.io/wa/api/v1/template/msg", payload, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                apikey: `${GUPSHUP_API_KEY}`,
            },
        });
        const messageId = res.data.messageId;

        console.log("Message sent:", messageId);

        return { success: true, messageId, raw: res.data };
    } catch (err: any) {
        console.error("Send message error:", err.response?.data || err.message);
        return { success: false, error: err };
    }
}
