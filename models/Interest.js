import mongoose from "mongoose";

const interestSchema = new mongoose.Schema(
    {
        client: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Client",
            required: true,
        },

        talent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Talent",
            required: true,
        },

        status: {
            type: String,
            enum: [
                "interested",
                "contacted",
                "shortlisted",
                "rejected",
                "closed",
            ],
            default: "interested",
        },
    },
    {
        timestamps: true,
    }
);

interestSchema.index(
    {
        client: 1,
        talent: 1,
    },
    {
        unique: true,
    }
);

const Interest = mongoose.model(
    "Interest",
    interestSchema
);

export default Interest;