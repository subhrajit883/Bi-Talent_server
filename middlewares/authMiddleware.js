import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import Client from "../models/Client.js";

export const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        let user = null;

        if (decoded.role === "admin") {
            user = await Admin.findById(decoded.id).select(
                "-password"
            );
        }

        if (decoded.role === "client") {
            user = await Client.findById(decoded.id).select(
                "-password"
            );
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User no longer exists",
            });
        }

        req.user = user;
        req.userRole = decoded.role;

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};

export const adminOnly = (req, res, next) => {
    if (
        !req.user ||
        req.userRole !== "admin"
    ) {
        return res.status(403).json({
            success: false,
            message: "Admin access required",
        });
    }

    next();
};

export const clientOnly = (req, res, next) => {
    if (
        !req.user ||
        req.userRole !== "client"
    ) {
        return res.status(403).json({
            success: false,
            message: "Client access required",
        });
    }

    next();
};