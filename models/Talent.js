import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
    {
        url: {
            type: String,
            required: true,
        },

        public_id: {
            type: String,
            required: true,
        },
    },
    {
        _id: true,
    }
);

const talentSchema = new mongoose.Schema(
    {
        c_id: {
            type: String,
            unique: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        age: {
            type: Number,
            // required: true,
            min: 1,
        },

        categories: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Category",
                required: true,
            },
        ],

        address: {
            type: String,
            // required: true,
            trim: true,
        },

        phone: {
            type: Number,
            // required: true,
            trim: true,

        },

        email: {
            type: String,
            trim: true,
            lowercase: true,
        },

        works: [
            {
                type: String,
                trim: true,
            },
        ],

        profileImage: {
            url: {
                type: String,
                required: true,
            },

            public_id: {
                type: String,
                required: true,
            },
        },

        portfolioImages: [mediaSchema],

        portfolioVideos: [mediaSchema],

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const Talent = mongoose.model(
    "Talent",
    talentSchema
);

export default Talent;