import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
            minlength: 6,
        },

        resetPasswordToken: {
            type: String,
            select: false,
        },

        resetPasswordExpires: {
            type: Date,
            select: false,
        },

        role: {
            type: String,
            default: "admin",
            immutable: true,
        },
    },
    {
        timestamps: true,
    }
);

adminSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }

    const salt = await bcrypt.genSalt(10);

    this.password = await bcrypt.hash(
        this.password,
        salt
    );

});

adminSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;