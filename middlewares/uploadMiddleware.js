import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
    cloudinary,

    params: async (req, file) => {
        if (file.fieldname === "profileImage") {
            return {
                folder: "talent-portal/profile",
                resource_type: "image",
                allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
            };
        }

        if (file.fieldname === "portfolioImages") {
            return {
                folder: "talent-portal/portfolio/images",
                resource_type: "image",
                allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
            };
        }

        if (file.fieldname === "portfolioVideos") {
            return {
                folder: "talent-portal/portfolio/videos",
                resource_type: "video",
                allowed_formats: ["mp4", "mov", "avi", "mkv", "webm"],
            };
        }

        return {
            folder: "talent-portal/misc",
            resource_type: "auto",
        };
    },
});

const fileFilter = (req, file, cb) => {
    const isImage =
        file.mimetype.startsWith("image/");

    const isVideo =
        file.mimetype.startsWith("video/");

    if (
        file.fieldname === "profileImage" &&
        !isImage
    ) {
        return cb(
            new Error(
                "Profile image must be an image"
            ),
            false
        );
    }

    if (
        file.fieldname === "portfolioImages" &&
        !isImage
    ) {
        return cb(
            new Error(
                "Portfolio images must be images"
            ),
            false
        );
    }

    if (
        file.fieldname === "portfolioVideos" &&
        !isVideo
    ) {
        return cb(
            new Error(
                "Portfolio videos must be videos"
            ),
            false
        );
    }

    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,

    limits: {
        fileSize: 100 * 1024 * 1024,
    },
});

export const talentUpload = upload.fields([
    {
        name: "profileImage",
        maxCount: 1,
    },
    {
        name: "portfolioImages",
        maxCount: 20,
    },
    {
        name: "portfolioVideos",
        maxCount: 10,
    },
]);