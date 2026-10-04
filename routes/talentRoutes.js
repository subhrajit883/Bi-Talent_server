import express from "express";

import {
    createTalent,
    getTalents,
    getTalentById,
    updateTalent,
    deleteTalent,
    getTalentsForAll,
    categoryWiseTalents,
    getRecommendedTalents,

} from "../controllers/talentController.js";

import {
    protect,
    adminOnly,
} from "../middlewares/authMiddleware.js";

import {
    talentUpload,
} from "../middlewares/uploadMiddleware.js";

const router = express.Router();

/*
 * Public
 */
// Optional search query matches talent name, talent ID, and category name.
router.get(
    "/",
    getTalents
);

router.get(
    "/category/:categoryId",
    categoryWiseTalents
);

router.get(
    "/category/:categoryId",
    categoryWiseTalents
);

router.get(
    "/recommended",
    getRecommendedTalents
);

router.get(
    "/forall",
    getTalentsForAll
);


router.get(
    "/:id",
    getTalentById
);

/*
 * Admin
 */
router.post(
    "/",
    protect,
    adminOnly,
    talentUpload,
    createTalent
);

router.put(
    "/:id",
    protect,
    adminOnly,
    talentUpload,
    updateTalent
);

router.delete(
    "/:id",
    protect,
    adminOnly,
    deleteTalent
);

export default router;