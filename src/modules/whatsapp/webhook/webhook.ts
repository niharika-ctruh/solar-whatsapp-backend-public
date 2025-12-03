import { Request, Response } from "express";
import { sendWhatsappTemplate } from "../apis/apis";
import { Host } from "../../requests/models/host.model";
import { VisitRequest } from "../../requests/models/visitRequest.model";
import { scheduleFirstAcceptanceCheck } from "../../requests/jobs/sendRequest.jobs";

export const whatsappWebHook = async (req: Request, res: Response) => {
    try {
        const entry = req.body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;
        const msg = value?.messages?.[0];

        if (!msg) return res.send("OK");

        const phone = msg.from;
        if (!phone) return res.send("OK");

        const host = await Host.findOne({ phone });
        if (!host) {
            console.log("Host not found for phone:", phone);
            return res.send("OK");
        }

        if (msg.type === "button" || msg.type === "quick_reply") {
            const payload = JSON.parse(msg.button.payload);
            const requestId = payload.requestId;
            const response = msg.button.text;

            console.log("Button Response:", response, "RequestID:", requestId);

            const visitRequest = await VisitRequest.findById(requestId);
            if (!visitRequest) return res.send("OK");

            if (["visit_scheduled", "cancelled", "completed"].includes(visitRequest.status)) {
                await sendWhatsappTemplate({
                    destination: phone,
                    templateId: "205b58e2-f22b-4dd2-827a-e70c2ab7cbca",
                    requestId,
                    params: [host.name],
                    postBack: false,
                });
                return res.send("OK");
            }

            const hostVisitRequest = host.visitRequests.find((vr: any) => vr.requestId.toString() === requestId);

            if (!hostVisitRequest) {
                console.log("Host visit request not found");
                return res.send("OK");
            }

            let newStatus: "available" | "rejected";
            if (response === "Available") newStatus = "available";
            else if (response === "Unavailable") newStatus = "rejected";
            else return res.send("OK");

            await Host.updateOne(
                { _id: host._id, "visitRequests.requestId": requestId },
                {
                    $set: {
                        "visitRequests.$.status": newStatus,
                        "visitRequests.$.responseAt": new Date(),
                    },
                },
            );

            if (newStatus === "available") {
                await sendWhatsappTemplate({
                    destination: phone,
                    templateId: "e8f646b2-6e49-4c73-b9cb-b1685e6549f0",
                    requestId,
                    params: [host.name],
                });

                console.log("Sent host available acknowledgment");

                // check again for count (fresh DB state)
                const updatedHosts = await Host.find({
                    "visitRequests.requestId": requestId,
                });

                const updatedAvailableCount = updatedHosts.filter(h =>
                    h.visitRequests.some((vr: any) => vr.requestId.toString() === requestId && vr.status === "available"),
                ).length;

                if (updatedAvailableCount === 1) {
                    await scheduleFirstAcceptanceCheck(requestId);
                    console.log("First accepted host — 5 min buffer started");
                }

                return res.send("OK");
            }

            if (newStatus === "rejected") {
                console.log("host marked unavailable");

                //  normal reject (not first accepted)
                await sendWhatsappTemplate({
                    destination: phone,
                    templateId: "7e6c5bb3-6e84-4e3d-a1d2-b9d49b5e08e7",
                    requestId,
                    params: [host.name],
                });

                return res.send("OK");
            }
        }

        return res.send("OK");
    } catch (err) {
        console.error(" Webhook Error:", err);
        return res.sendStatus(500);
    }
};
