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

        recommendTalent: {
            type: Boolean,
            default: false,
        },

        age: {
            type: Number,
            // required: true,
            min: 1,
        },

        bio: {
            type: String,
            trim: true,
        },

        height: {
            type: String,
            trim: true,
        },

        weight: {
            type: String,
            trim: true,
        },

        chestBust: {
            type: String,
            trim: true,
        },

        waist: {
            type: String,
            trim: true,
        },

        hips: {
            type: String,
            trim: true,
        },

        shoulder: {
            type: String,
            trim: true,
        },

        shoeSize: {
            type: String,
            trim: true,
        },

        dressSize: {
            type: String,
            trim: true,
        },

        clothingSize: {
            type: String,
            trim: true,
        },

        hairColour: {
            type: String,
            trim: true,
        },

        eyeColour: {
            type: String,
            trim: true,
        },

        skinTone: {
            type: String,
            trim: true,
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