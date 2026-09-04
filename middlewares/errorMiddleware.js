export const notFound = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.originalUrl}`,
    });
};

export const errorHandler = (
    err,
    req,
    res,
    next
) => {
    console.error("--- ERROR DETAILS ---");
    console.error("Name   :", err.name);
    console.error("Message:", err.message);
    console.error("HTTP   :", err.http_code);
    console.error("Stack  :", err.stack);

    /*
     * Unwrap nested Cloudinary / multer-storage-cloudinary errors.
     * The library wraps the real Cloudinary error inside err.message
     * but also exposes err.http_code for the upstream status.
     */
    const cloudinaryHttpCode = err.http_code;

    const statusCode =
        cloudinaryHttpCode ||
        (res.statusCode >= 400 ? res.statusCode : 500);

    /*
     * Build a human-readable message.
     * multer errors expose err.code, e.g. "LIMIT_FILE_SIZE"
     */
    let message = err.message || "Something went wrong";

    if (err.code === "LIMIT_FILE_SIZE") {
        message = "File too large. Maximum size is 100MB.";
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV !== "production" && {
            errorCode: err.code,
            cloudinaryHttpCode,
        }),
    });
};