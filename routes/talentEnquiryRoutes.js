import express from "express";
import {
    createTalentEnquiry,
    getTalentEnquiries,
} from "../controllers/talentEnquiryController.js";
import {
    adminOnly,
    protect,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post(
    "/",
    createTalentEnquiry
);

router.get(
    "/",
    protect,
    adminOnly,
    getTalentEnquiries
);

export default router;
