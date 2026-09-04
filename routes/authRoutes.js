import express from "express";

import {
    adminLogin,
    clientRegister,
    clientLogin,
    getMe,
    registerAdmin,
} from "../controllers/authController.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post(
    "/admin/register",
    registerAdmin
);

router.post(
    "/admin/login",
    adminLogin
);

router.post(
    "/client/register",
    clientRegister
);

router.post(
    "/client/login",
    clientLogin
);

router.get(
    "/me",
    protect,
    getMe
);

export default router;