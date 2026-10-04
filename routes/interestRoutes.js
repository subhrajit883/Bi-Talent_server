import express from "express";

import {
    showInterest,
    removeInterest,
    getMyInterests,
    getAllInterests,
    updateInterestStatus,
} from "../controllers/interestController.js";

import {
    protect,
    clientOnly,
    adminOnly,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

/*
 * Client
 */

// Optional request body: { message: string }
router.post(
    "/:talentId",
    protect,
    clientOnly,
    showInterest
);

router.delete(
    "/:talentId",
    protect,
    clientOnly,
    removeInterest
);

router.get(
    "/my",
    protect,
    clientOnly,
    getMyInterests
);

/*
 * Admin
 */

router.get(
    "/",
    protect,
    adminOnly,
    getAllInterests
);

router.patch(
    "/:id/status",
    protect,
    adminOnly,
    updateInterestStatus
);

export default router;