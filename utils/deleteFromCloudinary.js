import cloudinary from "../config/cloudinary.js";

const deleteFromCloudinary = async (
    publicId,
    resourceType = "image"
) => {
    if (!publicId) {
        return;
    }

    try {
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
            invalidate: true,
        });

        console.log(
            `Cloudinary deleted: ${publicId}`,
            result.result
        );

        return result;
    } catch (error) {
        console.error(
            `Cloudinary delete failed for ${publicId}:`,
            error.message
        );

        throw error;
    }
};

export default deleteFromCloudinary;