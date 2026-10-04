import Interest from "../models/Interest.js";
import Talent from "../models/Talent.js";

export const showInterest = async (
    req,
    res,
    next
) => {
    try {
        const { talentId } = req.params;
        const { message } = req.body ?? {};

        if (
            message !== undefined &&
            typeof message !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Message must be a string",
            });
        }

        const talent =
            await Talent.findById(
                talentId
            );

        if (!talent) {
            return res.status(404).json({
                success: false,
                message: "Talent not found",
            });
        }

        const existing =
            await Interest.findOne({
                client: req.user._id,
                talent: talentId,
            });

        if (existing) {
            return res.status(409).json({
                success: false,
                message:
                    "You have already shown interest in this talent",
                interest: existing,
            });
        }

        const interest =
            await Interest.create({
                client: req.user._id,
                talent: talentId,
                ...(message !== undefined && {
                    message: message.trim(),
                }),
            });

        const populatedInterest =
            await Interest.findById(
                interest._id
            )
                .populate(
                    "client",
                    "-password"
                )
                .populate("talent");

        res.status(201).json({
            success: true,
            message:
                "Interest submitted successfully",
            interest: populatedInterest,
        });
    } catch (error) {
        next(error);
    }
};

export const removeInterest = async (
    req,
    res,
    next
) => {
    try {
        const { talentId } = req.params;

        const interest =
            await Interest.findOneAndDelete({
                client: req.user._id,
                talent: talentId,
            });

        if (!interest) {
            return res.status(404).json({
                success: false,
                message:
                    "Interest record not found",
            });
        }

        res.json({
            success: true,
            message:
                "Interest removed successfully",
        });
    } catch (error) {
        next(error);
    }
};

export const getMyInterests = async (
    req,
    res,
    next
) => {
    try {
        const interests =
            await Interest.find({
                client: req.user._id,
            })
                .populate("talent")
                .sort({
                    createdAt: -1,
                });

        res.json({
            success: true,
            count: interests.length,
            interests,
        });
    } catch (error) {
        next(error);
    }
};

export const getAllInterests = async (
    req,
    res,
    next
) => {
    try {
        const interests =
            await Interest.find()
                .populate(
                    "client",
                    "-password"
                )
                .populate({
                    path: "talent",
                    populate: {
                        path: "categories",
                    },
                })
                .sort({
                    createdAt: -1,
                });

        res.json({
            success: true,
            count: interests.length,
            interests,
        });
    } catch (error) {
        next(error);
    }
};

export const updateInterestStatus = async (
    req,
    res,
    next
) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowedStatuses = [
            "interested",
            "contacted",
            "shortlisted",
            "rejected",
            "closed",
        ];

        if (
            !allowedStatuses.includes(status)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid interest status",
            });
        }

        const interest =
            await Interest.findById(id);

        if (!interest) {
            return res.status(404).json({
                success: false,
                message:
                    "Interest record not found",
            });
        }

        interest.status = status;

        await interest.save();

        const updatedInterest =
            await Interest.findById(id)
                .populate(
                    "client",
                    "-password"
                )
                .populate("talent");

        res.json({
            success: true,
            message:
                "Interest status updated",
            interest: updatedInterest,
        });
    } catch (error) {
        next(error);
    }
};