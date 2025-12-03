import { IUserType } from "../../auth/types/user";
import { Customer } from "../models/customer.model";
import { getCollection } from "../../../shared/db/connect";
import { Errors } from "../../../shared/helper/helper.error";
import { VisitRequest } from "../models/visitRequest.model";
import mongoose from "mongoose";
import { IHost } from "../types/host.type";
import { sendWhatsappTemplate } from "../../whatsapp/apis/apis";

export const sendRequest = async (body: any, user: IUserType) => {
    try {
        const { customerId, name, coordinates, address, date, timeSlot } = body;
        const maxHostSearch = 10;

        const hosts = await getCollection("hosts");

        if (!hosts) {
            throw new Errors("Host collection not found!", 500);
        }

        const [lng, lat] = coordinates;

        // search for 3 km
        let nearbyHosts = await hosts
            .find({
                location: {
                    $near: {
                        $geometry: { type: "Point", coordinates: [lng, lat] },
                        $maxDistance: 3000,
                    },
                },
            })
            .limit(maxHostSearch)
            .toArray();

        // search for 6 km
        if (nearbyHosts.length === 0) {
            nearbyHosts = await hosts
                .find({
                    location: {
                        $near: {
                            $geometry: { type: "Point", coordinates: [lng, lat] },
                            $maxDistance: 6000,
                        },
                    },
                })
                .limit(maxHostSearch)
                .toArray();
        }

        if (nearbyHosts.length === 0) {
            throw new Errors("No host found within 6 km range", 404);
        }

        // check if customer already exists
        let customer = await Customer.findOne({ customerId });

        if (!customer) {
            // Create new customer
            customer = new Customer({
                customerId,
                name,
                location: {
                    type: "Point",
                    coordinates,
                },
                address,
                consultantId: user._id,
            });
            customer = await customer.save();
        }

        // create a new visit request
        const request = new VisitRequest({
            customerId: customer._id,
            consultantId: user._id,
            date,
            timeSlot,
        });

        const savedRequest = await request.save();

        const hostIds = nearbyHosts.map(host => host._id);

        await hosts.updateMany(
            { _id: { $in: hostIds } },
            {
                $push: {
                    visitRequests: {
                        requestId: savedRequest._id,
                        status: "pending",
                        responseAt: null,
                    },
                } as mongoose.UpdateQuery<IHost>,
            },
        );

        for (const host of nearbyHosts) {
            await sendWhatsappTemplate({
                destination: host.phone,
                templateId: "f88a5ad7-ab18-45f7-9f61-439f2172e111",
                requestId: `${savedRequest._id}`,
                params: [
                    host.name,
                    savedRequest.date.toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                    }),
                    savedRequest.timeSlot,
                ],
            });
        }

        const updatedCustomer = await Customer.findByIdAndUpdate(
            customer._id,
            {
                requestId: savedRequest._id,
                name,
                address,
                location: {
                    type: "Point",
                    coordinates,
                },
                consultantId: user._id,
            },
            { new: true },
        );

        return {
            customer: updatedCustomer,
            request: savedRequest,
            hostsNotified: hostIds.length,
        };
    } catch (error) {
        throw error;
    }
};
