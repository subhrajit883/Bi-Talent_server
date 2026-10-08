import { createHash, randomBytes } from "node:crypto";
import Admin from "../models/Admin.js";
import Client from "../models/Client.js";
import generateToken from "../utils/generateToken.js";
import createPasswordResetEmailSender from "../utils/sendPasswordResetEmail.js";

const PASSWORD_RESET_EXPIRY_MS = 60 * 60 * 1000;
const PASSWORD_RESET_MESSAGE =
    "If an account with that email exists, a password reset link has been sent.";

const hashResetToken = (token) =>
    createHash("sha256").update(token).digest("hex");

export const registerAdmin = async (req, res) => {
    try {

        const { name, email, password } = req.body;

        // if (!name || !email || !password) {
        //     return res.status(400).json({
        //         message: "All fields are required"
        //     });
        // }

        const existingUser = await Admin.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "Admin already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = await Admin.create({
            name,
            email,
            password: hashedPassword,
        });

        res.status(201).json({
            success: true,
            admin,
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }
};

export const adminLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const admin = await Admin.findOne({
            email: email.toLowerCase(),
        });

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        const isMatch =
            await admin.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        const token = generateToken(
            admin._id,
            "admin"
        );

        res.json({
            success: true,
            message: "Admin login successful",

            token,

            user: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const clientRegister = async (
    req,
    res,
    next
) => {
    try {
        const {
            companyName,
            name,
            phone,
            email,
            address,
            password,
        } = req.body;

        if (
            !companyName ||
            !name ||
            !phone ||
            !email ||
            !address ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "All fields are required",
            });
        }

        const existingClient =
            await Client.findOne({
                email: email.toLowerCase(),
            });

        if (existingClient) {
            return res.status(409).json({
                success: false,
                message:
                    "Client with this email already exists",
            });
        }

        const client = await Client.create({
            companyName,
            name,
            phone,
            email: email.toLowerCase(),
            address,
            password,
        });

        const token = generateToken(
            client._id,
            "client"
        );

        res.status(201).json({
            success: true,
            message: "Client registration successful",

            token,

            client: {
                id: client._id,
                companyName: client.companyName,
                name: client.name,
                phone: client.phone,
                email: client.email,
                address: client.address,
                role: client.role,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const clientLogin = async (
    req,
    res,
    next
) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message:
                    "Email and password are required",
            });
        }

        const client = await Client.findOne({
            email: email.toLowerCase(),
        });

        if (!client) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        const isMatch =
            await client.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        if (!client.isActive) {
            return res.status(403).json({
                success: false,
                message: "Client account is inactive",
            });
        }

        const token = generateToken(
            client._id,
            "client"
        );

        res.json({
            success: true,
            message: "login successful",

            token,

            client: {
                id: client._id,
                companyName: client.companyName,
                name: client.name,
                phone: client.phone,
                email: client.email,
                address: client.address,
                role: client.role,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const forgotPassword = async (req, res, next) => {
    try {
        const email =
            typeof req.body.email === "string"
                ? req.body.email.trim().toLowerCase()
                : "";

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                success: false,
                message: "A valid email address is required",
            });
        }

        const sendResetEmail = createPasswordResetEmailSender();
        const [admin, client] = await Promise.all([
            Admin.findOne({ email }),
            Client.findOne({ email }),
        ]);
        const accounts = [admin, client].filter(Boolean);

        if (accounts.length === 0) {
            return res.json({
                success: true,
                message: PASSWORD_RESET_MESSAGE,
            });
        }

        const resetLinks = [];

        for (const account of accounts) {
            const token = randomBytes(32).toString("hex");
            account.resetPasswordToken = hashResetToken(token);
            account.resetPasswordExpires = new Date(
                Date.now() + PASSWORD_RESET_EXPIRY_MS
            );
            await account.save();

            resetLinks.push({
                account,
                token,
                role: account instanceof Admin ? "admin" : "client",
            });
        }

        try {
            for (const { account, token, role } of resetLinks) {
                await sendResetEmail({
                    email: account.email,
                    name: account.name,
                    role,
                    token,
                });
            }
        } catch (error) {
            for (const { account } of resetLinks) {
                account.resetPasswordToken = undefined;
                account.resetPasswordExpires = undefined;
                await account.save();
            }
            throw error;
        }

        return res.json({
            success: true,
            message: PASSWORD_RESET_MESSAGE,
        });
    } catch (error) {
        next(error);
    }
};

export const resetPassword = async (req, res, next) => {
    try {
        const { token, password } = req.body;

        if (
            typeof token !== "string" ||
            !token ||
            typeof password !== "string" ||
            password.length < 6
        ) {
            return res.status(400).json({
                success: false,
                message: "A valid token and a password of at least 6 characters are required",
            });
        }

        const resetPasswordToken = hashResetToken(token);
        const tokenFilter = {
            resetPasswordToken,
            resetPasswordExpires: { $gt: new Date() },
        };
        const account =
            (await Admin.findOne(tokenFilter).select(
                "+resetPasswordToken +resetPasswordExpires"
            )) ||
            (await Client.findOne(tokenFilter).select(
                "+resetPasswordToken +resetPasswordExpires"
            ));

        if (!account) {
            return res.status(400).json({
                success: false,
                message: "Password reset token is invalid or expired",
            });
        }

        account.password = password;
        account.resetPasswordToken = undefined;
        account.resetPasswordExpires = undefined;
        await account.save();

        return res.json({
            success: true,
            message: "Password has been reset successfully",
        });
    } catch (error) {
        next(error);
    }
};

export const getMe = async (
    req,
    res,
    next
) => {
    try {
        res.json({
            success: true,
            user: req.user,
            role: req.userRole,
        });
    } catch (error) {
        next(error);
    }
};