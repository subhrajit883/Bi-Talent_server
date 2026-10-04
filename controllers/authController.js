import Admin from "../models/Admin.js";
import Client from "../models/Client.js";
import generateToken from "../utils/generateToken.js";

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