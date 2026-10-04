import mongoose from "mongoose";
import Category from "../models/Category.js";
import TalentEnquiry from "../models/TalentEnquiry.js";


export const createTalentEnquiry = async (req, res, next) => {
    try {
        const {
            fullName,
            dateOfBirth,
            gender,
            contactNumber,
            emailAddress,
            address,
            interestedInCategory,
            works,
        } = req.body;

        // Only fullName and contactNumber are required
        if (
            typeof fullName !== "string" ||
            !fullName.trim() ||
            typeof contactNumber !== "string" ||
            !contactNumber.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Full name and contact number are required",
            });
        }

        // Validate email only if provided
        if (
            emailAddress &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress.trim())
        ) {
            return res.status(400).json({
                success: false,
                message: "Email address is invalid",
            });
        }

        // Validate date of birth only if provided
        let parsedDateOfBirth;

        if (dateOfBirth) {
            parsedDateOfBirth = new Date(dateOfBirth);

            if (
                Number.isNaN(parsedDateOfBirth.getTime()) ||
                parsedDateOfBirth > new Date()
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Date of birth must be a valid date in the past",
                });
            }
        }

        // Validate category only if provided
        let categoryId;

        if (interestedInCategory) {
            if (!mongoose.Types.ObjectId.isValid(interestedInCategory)) {
                return res.status(400).json({
                    success: false,
                    message: "Interested category is invalid",
                });
            }

            const category = await Category.findOne({
                _id: interestedInCategory,
                isActive: true,
            });

            if (!category) {
                return res.status(400).json({
                    success: false,
                    message: "Interested category is invalid",
                });
            }

            categoryId = interestedInCategory;
        }

        // Parse and validate works
        let parsedWorks = works ?? [];

        if (typeof parsedWorks === "string") {
            try {
                parsedWorks = JSON.parse(parsedWorks);
            } catch {
                parsedWorks = [parsedWorks];
            }
        }

        if (
            !Array.isArray(parsedWorks) ||
            !parsedWorks.every((work) => typeof work === "string")
        ) {
            return res.status(400).json({
                success: false,
                message: "Works must be an array of strings",
            });
        }

        const enquiry = await TalentEnquiry.create({
            fullName: fullName.trim(),
            ...(parsedDateOfBirth && { dateOfBirth: parsedDateOfBirth }),
            ...(gender && { gender }),
            contactNumber: contactNumber.trim(),
            ...(emailAddress && { emailAddress: emailAddress.trim() }),
            ...(address && { address }),
            ...(categoryId && { interestedInCategory: categoryId }),
            works: parsedWorks,
        });

        const populatedEnquiry = await TalentEnquiry.findById(
            enquiry._id
        ).populate("interestedInCategory");

        res.status(201).json({
            success: true,
            message: "Talent enquiry submitted successfully",
            enquiry: populatedEnquiry,
        });

    } catch (error) {
        next(error);
    }
};



export const getTalentEnquiries = async (
    req,
    res,
    next
) => {
    try {
        const enquiries = await TalentEnquiry.find()
            .populate("interestedInCategory")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: enquiries.length,
            enquiries,
        });
    } catch (error) {
        next(error);
    }
};
