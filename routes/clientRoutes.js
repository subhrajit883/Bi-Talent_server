import express from "express";

import {
    getMyProfile,
    updateMyProfile,
    getAllClients,
} from "../controllers/clientController.js";

import {
    protect,
    clientOnly,
    adminOnly,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get(
    "/me",
    protect,
    clientOnly,
    getMyProfile
);

router.put(
    "/me",
    protect,
    clientOnly,
    updateMyProfile
);

/*
 * Admin can see all registered clients.
 */
router.get(
    "/",
    protect,
    adminOnly,
    getAllClients
);

export default router;