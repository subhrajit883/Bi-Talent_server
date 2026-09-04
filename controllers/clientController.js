import Client from "../models/Client.js";

export const getMyProfile = async (
    req,
    res,
    next
) => {
    try {
        const client =
            await Client.findById(
                req.user._id
            ).select("-password");

        res.json({
            success: true,
            client,
        });
    } catch (error) {
        next(error);
    }
};

export const updateMyProfile = async (
    req,
    res,
    next
) => {
    try {
        const client =
            await Client.findById(
                req.user._id
            );

        if (!client) {
            return res.status(404).json({
                success: false,
                message: "Client not found",
            });
        }

        const {
            companyName,
            name,
            phone,
            address,
        } = req.body;

        if (companyName !== undefined) {
            client.companyName =
                companyName;
        }

        if (name !== undefined) {
            client.name = name;
        }

        if (phone !== undefined) {
            client.phone = phone;
        }

        if (address !== undefined) {
            client.address = address;
        }

        await client.save();

        const safeClient =
            await Client.findById(
                client._id
            ).select("-password");

        res.json({
            success: true,
            message:
                "Profile updated successfully",
            client: safeClient,
        });
    } catch (error) {
        next(error);
    }
};

export const getAllClients = async (
    req,
    res,
    next
) => {
    try {
        const clients =
            await Client.find()
                .select("-password")
                .sort({
                    createdAt: -1,
                });

        res.json({
            success: true,
            count: clients.length,
            clients,
        });
    } catch (error) {
        next(error);
    }
};