import { IUserType } from "../../auth/types/user";
import { Customer } from "../models/customer.model";
import { getCollection } from "../../../shared/db/connect";
import { Errors } from "../../../shared/helper/helper.error";
import { VisitRequest } from "../models/visitRequest.model";
import mongoose from "mongoose";
import { IHost } from "../types/host.type";

export const sendRequest = async (body: any, user: IUserType) => {
    try {
        const { customerId, name, coordinates, address, date, timeSlot } = body;
        const maxHostSearch = 10;

        const customer = new Customer({
            customerId,
            name,
            location: {
                type: "Point",
                coordinates: coordinates,
            },
            address,
            consultantId: user._id,
        });

        const newCustomer = await customer.save();

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

        const request = new VisitRequest({
            customerId: newCustomer._id,
            consultantId: user._id,
            date,
            timeSlot,
            status: "pending",
            notes: "",
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
                    },
                } as mongoose.UpdateQuery<IHost>,
            },
        );
        const updatedCustomer = await Customer.findByIdAndUpdate(newCustomer._id, { requestId: savedRequest._id }, { new: true });

        return {
            customer: updatedCustomer,
            request: savedRequest,
            hostsNotified: hostIds.length,
        };
    } catch (error) {
        throw error;
    }
};
