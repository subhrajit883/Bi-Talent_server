import nodemailer from "nodemailer";

const createTransporter = () => {
    const { EMAIL_USER, EMAIL_PASS, SMTP_HOST, SMTP_PORT, SMTP_SECURE } =
        process.env;

    if (!EMAIL_USER || !EMAIL_PASS) {
        throw new Error("EMAIL_USER and EMAIL_PASS must be configured");
    }

    if (!SMTP_HOST) {
        return nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: EMAIL_USER,
                pass: EMAIL_PASS,
            },
        });
    }

    const port = Number(SMTP_PORT || 587);

    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error("SMTP_PORT must be a valid TCP port");
    }

    return nodemailer.createTransport({
        host: SMTP_HOST,
        port,
        secure: SMTP_SECURE
            ? SMTP_SECURE.toLowerCase() === "true"
            : port === 465,
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS,
        },
    });
};

const createPasswordResetEmailSender = () => {
    const frontendUrl = process.env.FRONTEND_URL;

    if (!frontendUrl) {
        throw new Error("FRONTEND_URL must be configured");
    }

    const resetPageUrl = new URL("/reset-password", frontendUrl);
    const transporter = createTransporter();

    return async ({ email, name, role, token }) => {
        const resetUrl = new URL(resetPageUrl);
        resetUrl.searchParams.set("token", token);
        resetUrl.searchParams.set("role", role);

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Reset your password",
            text: [
                `Hello ${name},`,
                "",
                "Use the link below to reset your password. This link expires in 1 hour and can only be used once.",
                resetUrl.toString(),
                "",
                "If you did not request a password reset, you can ignore this email.",
            ].join("\n"),
        });
    };
};

export default createPasswordResetEmailSender;
