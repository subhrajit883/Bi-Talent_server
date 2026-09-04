import Category from "../models/Category.js";
import Talent from "../models/Talent.js";
import createSlug from "../utils/slug.js";

export const createCategory = async (
    req,
    res,
    next
) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Category name is required",
            });
        }

        const slug = createSlug(name);

        const existing =
            await Category.findOne({
                slug,
            });

        if (existing) {
            return res.status(409).json({
                success: false,
                message:
                    "Category already exists",
            });
        }

        const category =
            await Category.create({
                name,
                slug,
            });

        res.status(201).json({
            success: true,
            message:
                "Category created successfully",
            category,
        });
    } catch (error) {
        next(error);
    }
};

export const getCategories = async (
    req,
    res,
    next
) => {
    try {
        const categories =
            await Category.find({
                isActive: true,
            }).sort({
                name: 1,
            });

        res.json({
            success: true,
            categories,
        });
    } catch (error) {
        next(error);
    }
};

export const updateCategory = async (
    req,
    res,
    next
) => {
    try {
        const { id } = req.params;
        const { name, isActive } = req.body;

        const category =
            await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        if (name) {
            category.name = name;
            category.slug = createSlug(name);
        }

        if (typeof isActive === "boolean") {
            category.isActive = isActive;
        }

        await category.save();

        res.json({
            success: true,
            message:
                "Category updated successfully",
            category,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteCategory = async (
    req,
    res,
    next
) => {
    try {
        const { id } = req.params;

        const usedByTalent =
            await Talent.exists({
                categories: id,
            });

        if (usedByTalent) {
            return res.status(400).json({
                success: false,
                message:
                    "Category is being used by talents. Deactivate it instead.",
            });
        }

        const category =
            await Category.findByIdAndDelete(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        res.json({
            success: true,
            message:
                "Category deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};