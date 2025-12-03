import mongoose from "mongoose";
import { getCollection } from "../../../shared/db/connect";
import agenda from "../../../shared/db/jobs";
import { sendWhatsappTemplate } from "../../whatsapp/apis/apis";
import { VisitRequest } from "../models/visitRequest.model";

// finialize host selection after buffer ends
const finalizeHostSelection = async (requestId: string) => {
    try {
        console.log(`Finalizing host selection for request: ${requestId}`);

        const hosts = await getCollection("hosts");

        // load hosts that received this request
        const hostsWithRequest = await hosts
            .find({
                "visitRequests.requestId": new mongoose.Types.ObjectId(requestId),
            })
            .toArray();

        // extract visit request status from each host
        const vrList = hostsWithRequest.map(h => ({
            host: h,
            vr: h.visitRequests.find((v: any) => v.requestId.toString() === requestId),
        }));

        // filter only "AVAILABLE" hosts (accepted the request)
        const acceptedHosts = vrList
            .filter(h => h.vr.status === "available")
            .sort((a, b) => new Date(a.vr.responseAt).getTime() - new Date(b.vr.responseAt).getTime());

        // if no host accepted → DO NOTHING
        if (acceptedHosts.length === 0) {
            console.log(`No hosts accepted request ${requestId}. Doing nothing.`);
            await agenda.cancel({ "data.requestId": requestId });
            return;
        }

        // select first host -> confirmed
        let winners: any = [];

        if (acceptedHosts.length === 1) {
            // only one accepted → one winner
            winners = [acceptedHosts[0].host];
        } else if (acceptedHosts.length >= 2) {
            // more than two accepted → pick first two
            winners = [acceptedHosts[0].host, acceptedHosts[1].host];
        }

        // all other accepted hosts → rejected list
        const lostRaceHosts = acceptedHosts
            .slice(winners.length) // everything after winners
            .map(h => h.host);

        await hosts.updateMany(
            {
                _id: { $in: winners.map((w: any) => w._id) },
                "visitRequests.requestId": new mongoose.Types.ObjectId(requestId),
            },
            { $set: { "visitRequests.$.status": "confirmed" } },
        );

        // update losers (only those who were ACCEPTED)
        if (lostRaceHosts.length > 0) {
            await hosts.updateMany(
                {
                    _id: { $in: lostRaceHosts.map(h => h._id) },
                    "visitRequests.requestId": new mongoose.Types.ObjectId(requestId),
                },
                { $set: { "visitRequests.$.status": "cancelled" } },
            );
        }

        // load request date and time
        const requestData = await VisitRequest.findById(requestId);
        const date = requestData?.date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
        const time = requestData?.timeSlot;

        for (const winner of winners) {
            await sendWhatsappTemplate({
                destination: winner.phone,
                templateId: "a7fb2819-29b6-4672-b2d4-0187fd2463ed",
                requestId: `${requestId}`,
                params: [winner.name, date, time],
                postBack: false,
            });
        }

        for (const host of lostRaceHosts) {
            await sendWhatsappTemplate({
                destination: host.phone,
                templateId: "5b4954d3-51b0-4dbc-81bb-384099de8f44",
                requestId,
                params: [host.name],
                postBack: false,
            });
        }

        // broadcast to every host expect winners
        const allHosts = vrList.map(h => h.host);
        const winnerIds = new Set(winners.map((w: any) => w._id.toString()));

        const broadcastTargets = allHosts.filter(h => !winnerIds.has(h._id.toString()));

        for (const host of broadcastTargets) {
            await sendWhatsappTemplate({
                destination: host.phone,
                templateId: "39344710-350b-410b-a592-56ca6f3f7ec4",
                requestId: `${requestId}`,
                params: [host.name],
                postBack: false,
            });
        }

        await VisitRequest.findByIdAndUpdate(requestId, {
            status: "visit_scheduled",
        });

        // cancel any pending jobs
        await agenda.cancel({ "data.requestId": requestId });

        console.log(`Completed finalizeHostSelection for ${requestId}`);
    } catch (error) {
        console.error(`Error finalizing ${requestId}`, error);
    }
};

// agenda job - run after 5 min
agenda.define("check-host-responses-5min", async (job: any) => {
    const { requestId } = job.attrs.data;
    console.log(`5-minute timer finished for request: ${requestId}`);
    await finalizeHostSelection(requestId);
});

// schedule 5 min check
export const scheduleFirstAcceptanceCheck = async (requestId: string) => {
    await agenda.schedule("in 5 minutes", "check-host-responses-5min", {
        requestId: requestId.toString(),
    });
    console.log(`Scheduled 5-minute buffer for request ${requestId}`);
};

export default agenda;
