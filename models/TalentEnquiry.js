import mongoose from "mongoose";

const talentEnquirySchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
        },

        dateOfBirth: {
            type: Date,
            // required: true,
        },

        gender: {
            type: String,
            // required: true,
            trim: true,
        },

        contactNumber: {
            type: String,
            required: true,
            trim: true,
        },

        emailAddress: {
            type: String,
            // required: true,
            trim: true,
            lowercase: true,
        },

        address: {
            type: String,
            // required: true,
            trim: true,
        },

        interestedInCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            // required: true,
        },

        works: [
            {
                type: String,
                trim: true,
            },
        ],
    },
    {
        timestamps: true,
    }
);

const TalentEnquiry = mongoose.model(
    "TalentEnquiry",
    talentEnquirySchema
);

export default TalentEnquiry;
