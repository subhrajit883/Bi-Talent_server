import mongoose from "mongoose";
import Talent from "../models/Talent.js";
import Category from "../models/Category.js";
import Interest from "../models/Interest.js";

import deleteFromCloudinary from "../utils/deleteFromCloudinary.js";

const getUploadedFiles = (files, fieldName) => {
    return files?.[fieldName] || [];
};

const getTalentSearchConditions = async (search) => {
    const searchTerm = search.trim();
    const matchingCategories = await Category.find({
        name: {
            $regex: searchTerm,
            $options: "i",
        },
    }).select("_id");

    return [
        {
            name: {
                $regex: searchTerm,
                $options: "i",
            },
        },
        {
            c_id: {
                $regex: searchTerm,
                $options: "i",
            },
        },
        ...(matchingCategories.length > 0
            ? [{
                categories: {
                    $in: matchingCategories.map(
                        (category) => category._id
                    ),
                },
            }]
            : []),
    ];
};

const createMediaArray = (
    files = []
) => {
    return files.map((file) => ({
        url: file.path,
        public_id: file.filename,
    }));
};

export const createTalent = async (
    req,
    res,
    next
) => {
    try {
        const {
            c_id,
            name,
            age,
            categories,
            address,
            phone,
            email,
            works,
            recommendTalent,
            bio,
            height,
            youtubeLink,
            weight,
            chestBust,
            waist,
            hips,
            shoulder,
            shoeSize,
            dressSize,
            clothingSize,
            hairColour,
            eyeColour,
            skinTone,
        } = req.body;

        if (
            !name ||
            !age ||
            !address ||
            !phone
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Name, age, address and phone are required",
            });
        }

        const profileImages =
            getUploadedFiles(
                req.files,
                "profileImage"
            );

        if (!profileImages.length) {
            return res.status(400).json({
                success: false,
                message:
                    "Profile image is required",
            });
        }

        let parsedCategories = categories;

        if (typeof categories === "string") {
            try {
                parsedCategories =
                    JSON.parse(categories);
            } catch {
                parsedCategories = [categories];
            }
        }

        if (
            !Array.isArray(parsedCategories) ||
            !parsedCategories.length
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "At least one category is required",
            });
        }

        const validCategories =
            await Category.find({
                _id: {
                    $in: parsedCategories,
                },
                isActive: true,
            });

        if (
            validCategories.length !==
            parsedCategories.length
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "One or more categories are invalid",
            });
        }

        let parsedWorks = works;

        if (typeof works === "string") {
            try {
                parsedWorks = JSON.parse(works);
            } catch {
                parsedWorks = [works];
            }
        }

        if (!Array.isArray(parsedWorks)) {
            parsedWorks = [];
        }

        // ================================
        // Parse Recommend Talent
        // ================================
        let parsedRecommendTalent = false;

        if (
            recommendTalent === true ||
            recommendTalent === "true"
        ) {
            parsedRecommendTalent = true;
        }

        // ================================
        // Portfolio Media
        // ================================
        const portfolioImages =
            createMediaArray(
                getUploadedFiles(
                    req.files,
                    "portfolioImages"
                )
            );

        const portfolioVideos =
            createMediaArray(
                getUploadedFiles(
                    req.files,
                    "portfolioVideos"
                )
            );

        // ================================
        // Create Talent
        // ================================
        const talent =
            await Talent.create({
                c_id,
                name,
                age,
                categories: parsedCategories,
                address,
                phone,
                email,
                works: parsedWorks,
                bio,
                height,
                weight,
                chestBust,
                waist,
                hips,
                shoulder,
                shoeSize,
                dressSize,
                clothingSize,
                hairColour,
                eyeColour,
                skinTone,
                youtubeLink,
                profileImage: {
                    url: profileImages[0].path,
                    public_id:
                        profileImages[0].filename,
                },

                portfolioImages,
                portfolioVideos,

                recommendTalent:
                    parsedRecommendTalent,
            });

        const populatedTalent =
            await Talent.findById(
                talent._id
            ).populate("categories");

        res.status(201).json({
            success: true,
            message:
                "Talent created successfully",
            talent: populatedTalent,
        });
    } catch (error) {
        next(error);
    }
};

export const getRecommendedTalents = async (
    req,
    res,
    next
) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 500;
        const { search } = req.query;

        const filter = {
            isActive: true,
            recommendTalent: true,
        };

        if (search?.trim()) {
            filter.$or =
                await getTalentSearchConditions(search);
        }

        const talents = await Talent.find(filter)
            .skip((page - 1) * limit)
            .limit(limit)
            .select("-phone -email")
            .populate("categories")
            .sort({
                createdAt: -1,
            });

        const total = await Talent.countDocuments(filter);

        res.json({
            success: true,
            count: talents.length,
            total,
            page,
            limit,
            talents,
        });
    } catch (error) {
        next(error);
    }
};


export const getTalents = async (
    req,
    res,
    next
) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 500;
        const { search } = req.query;
        const categoriesQuery = req.query.categories;

        const filter = {
            isActive: true,
        };

        if (categoriesQuery !== undefined) {
            const categoryValues = (
                Array.isArray(categoriesQuery)
                    ? categoriesQuery
                    : [categoriesQuery]
            );

            const categoryIds = categoryValues
                .flatMap((categoryId) =>
                    typeof categoryId === "string"
                        ? categoryId.split(",")
                        : []
                )
                .map((categoryId) => categoryId.trim())
                .filter(Boolean);

            if (
                categoryIds.length === 0 ||
                categoryValues.some(
                    (categoryId) => typeof categoryId !== "string"
                ) ||
                categoryIds.some(
                    (categoryId) =>
                        !mongoose.Types.ObjectId.isValid(categoryId)
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message: "One or more category IDs are invalid",
                });
            }

            filter.categories = {
                $in: categoryIds,
            };
        }

        if (search?.trim()) {
            filter.$or =
                await getTalentSearchConditions(search);
        }

        const talents = await Talent.find(filter)
            .skip((page - 1) * limit)
            .limit(limit)
            .populate("categories")
            .sort({
                createdAt: -1,
            });

        const total = await Talent.countDocuments(filter);

        res.json({
            success: true,
            count: talents.length,
            total,
            page,
            limit,
            talents,
        });
    } catch (error) {
        next(error);
    }
};

export const getTalentsForAll = async (
    req,
    res,
    next
) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 500;
        const { search } = req.query;

        const filter = {
            isActive: true,
        };

        if (search?.trim()) {
            filter.$or =
                await getTalentSearchConditions(search);
        }

        const talents = await Talent.find(filter)
            .skip((page - 1) * limit)
            .limit(limit)
            .select("-phone -email")
            .populate("categories")
            .sort({
                createdAt: -1,
            });

        const total = await Talent.countDocuments(filter);

        res.json({
            success: true,
            count: talents.length,
            total,
            page,
            limit,
            talents,
        });
    } catch (error) {
        next(error);
    }
};

export const categoryWiseTalents = async (
    req,
    res,
    next
) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 500;
        const { search } = req.query;
        const { categoryId } = req.params;

        const filter = {
            isActive: true,
            categories: categoryId,
        };

        if (search?.trim()) {
            filter.$or =
                await getTalentSearchConditions(search);
        }

        const talents = await Talent.find(filter)
            .skip((page - 1) * limit)
            .limit(limit)
            .select("-phone -email")
            .populate("categories")
            .sort({
                createdAt: -1,
            });

        const total = await Talent.countDocuments(filter);

        res.json({
            success: true,
            count: talents.length,
            total,
            page,
            limit,
            talents,
        });
    } catch (error) {
        next(error);
    }
}
export const getTalentById = async (
    req,
    res,
    next
) => {
    try {
        const talent =
            await Talent.findById(
                req.params.id
            ).populate("categories");

        if (!talent) {
            return res.status(404).json({
                success: false,
                message: "Talent not found",
            });
        }

        res.json({
            success: true,
            talent,
        });
    } catch (error) {
        next(error);
    }
};

export const updateTalent = async (
    req,
    res,
    next
) => {
    try {
        const { id } = req.params;

        const talent =
            await Talent.findById(id);

        if (!talent) {
            return res.status(404).json({
                success: false,
                message: "Talent not found",
            });
        }

        const {
            c_id,
            name,
            age,
            categories,
            address,
            phone,
            email,
            works,
            isActive,
            bio,
            height,
            youtubeLink,
            weight,
            chestBust,
            waist,
            hips,
            shoulder,
            shoeSize,
            dressSize,
            clothingSize,
            hairColour,
            eyeColour,
            skinTone,
        } = req.body;

        const profileFields = {
            bio,
            height,
            weight,
            chestBust,
            waist,
            hips,
            shoulder,
            shoeSize,
            dressSize,
            clothingSize,
            hairColour,
            eyeColour,
            skinTone,
        };

        for (const [field, value] of Object.entries(profileFields)) {
            if (value !== undefined) {
                talent[field] = value;
            }
        }

        if (youtubeLink !== undefined) {
            talent.youtubeLink = youtubeLink.trim();
        }

        if (c_id !== undefined) {
            talent.c_id = c_id;
        }

        if (name !== undefined) {
            talent.name = name;
        }

        if (age !== undefined) {
            talent.age = age;
        }

        if (address !== undefined) {
            talent.address = address;
        }

        if (phone !== undefined) {
            talent.phone = phone;
        }

        if (email !== undefined) {
            talent.email = email;
        }

        if (typeof isActive === "boolean") {
            talent.isActive = isActive;
        }

        if (categories !== undefined) {
            let parsedCategories =
                categories;

            if (typeof categories === "string") {
                try {
                    parsedCategories =
                        JSON.parse(categories);
                } catch {
                    parsedCategories = [
                        categories,
                    ];
                }
            }

            if (
                !Array.isArray(
                    parsedCategories
                ) ||
                !parsedCategories.length
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "At least one category is required",
                });
            }

            const validCategories =
                await Category.find({
                    _id: {
                        $in: parsedCategories,
                    },
                    isActive: true,
                });

            if (
                validCategories.length !==
                parsedCategories.length
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid category",
                });
            }

            talent.categories =
                parsedCategories;
        }

        if (works !== undefined) {
            let parsedWorks = works;

            if (typeof works === "string") {
                try {
                    parsedWorks =
                        JSON.parse(works);
                } catch {
                    parsedWorks = [works];
                }
            }

            talent.works =
                Array.isArray(parsedWorks)
                    ? parsedWorks
                    : [];
        }

        const oldProfileImageId =
            talent.profileImage?.public_id;

        const oldPortfolioImages =
            talent.portfolioImages;

        const oldPortfolioVideos =
            talent.portfolioVideos;

        const newProfileImages =
            getUploadedFiles(
                req.files,
                "profileImage"
            );

        const newPortfolioImages =
            getUploadedFiles(
                req.files,
                "portfolioImages"
            );

        const newPortfolioVideos =
            getUploadedFiles(
                req.files,
                "portfolioVideos"
            );

        /*
         * PROFILE IMAGE
         *
         * If a new profile image is uploaded,
         * replace the old one.
         */
        if (newProfileImages.length) {
            const newFile =
                newProfileImages[0];

            talent.profileImage = {
                url: newFile.path,
                public_id: newFile.filename,
            };
            talent.markModified("profileImage");
        }

        /*
         * PORTFOLIO IMAGES
         *
         * If new portfolio images are supplied,
         * replace the existing portfolio images.
         */
        if (newPortfolioImages.length) {
            talent.portfolioImages =
                createMediaArray(
                    newPortfolioImages
                );
        }

        /*
         * PORTFOLIO VIDEOS
         *
         * If new portfolio videos are supplied,
         * replace existing portfolio videos.
         */
        if (newPortfolioVideos.length) {
            talent.portfolioVideos =
                createMediaArray(
                    newPortfolioVideos
                );
        }

        await talent.save();

        const savedTalent =
            await Talent.findById(id).select(
                "profileImage"
            );

        if (
            newProfileImages.length &&
            savedTalent?.profileImage?.public_id !==
            newProfileImages[0].filename
        ) {
            return res.status(500).json({
                success: false,
                message:
                    "Profile image update was not saved",
            });
        }

        /*
         * Delete OLD profile image
         * after successful database update.
         */
        if (
            newProfileImages.length &&
            oldProfileImageId &&
            oldProfileImageId !==
            newProfileImages[0].filename
        ) {
            try {
                await deleteFromCloudinary(
                    oldProfileImageId,
                    "image"
                );
            } catch (cleanupError) {
                console.error(
                    "Old profile image cleanup failed:",
                    cleanupError.message
                );
            }
        }

        /*
         * Delete OLD portfolio images
         * if portfolio images were replaced.
         */
        if (newPortfolioImages.length) {
            for (
                const image
                of oldPortfolioImages
            ) {
                if (image.public_id) {
                    await deleteFromCloudinary(
                        image.public_id,
                        "image"
                    );
                }
            }
        }

        /*
         * Delete OLD portfolio videos
         * if portfolio videos were replaced.
         */
        if (newPortfolioVideos.length) {
            for (
                const video
                of oldPortfolioVideos
            ) {
                if (video.public_id) {
                    await deleteFromCloudinary(
                        video.public_id,
                        "video"
                    );
                }
            }
        }

        const updatedTalent =
            await Talent.findById(id)
                .populate("categories");

        res.json({
            success: true,
            message:
                "Talent updated successfully",
            talent: updatedTalent,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteTalent = async (
    req,
    res,
    next
) => {
    try {
        const { id } = req.params;

        const talent =
            await Talent.findById(id);

        if (!talent) {
            return res.status(404).json({
                success: false,
                message: "Talent not found",
            });
        }

        /*
         * Delete profile image
         */
        if (
            talent.profileImage?.public_id
        ) {
            await deleteFromCloudinary(
                talent.profileImage.public_id,
                "image"
            );
        }

        /*
         * Delete portfolio images
         */
        for (
            const image
            of talent.portfolioImages
        ) {
            if (image.public_id) {
                await deleteFromCloudinary(
                    image.public_id,
                    "image"
                );
            }
        }

        /*
         * Delete portfolio videos
         */
        for (
            const video
            of talent.portfolioVideos
        ) {
            if (video.public_id) {
                await deleteFromCloudinary(
                    video.public_id,
                    "video"
                );
            }
        }

        /*
         * Delete interest records
         * related to this talent.
         */
        await Interest.deleteMany({
            talent: talent._id,
        });

        await Talent.findByIdAndDelete(id);

        res.json({
            success: true,
            message:
                "Talent deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};