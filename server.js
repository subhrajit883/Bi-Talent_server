import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

import { connectDB } from "./config/db.js";

import Admin from "./models/Admin.js";

import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import talentRoutes from "./routes/talentRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import interestRoutes from "./routes/interestRoutes.js";

import {
    notFound,
    errorHandler,
} from "./middlewares/errorMiddleware.js";

dotenv.config({ quiet: true });

const app = express();

const PORT =
    process.env.PORT || 5000;

await connectDB();

app.use(
    cors({
        origin: true,
        credentials: true,
    })
);

app.use(
    express.json({
        limit: "10mb",
    })
);

app.use(
    express.urlencoded({
        extended: true,
    })
);

app.use(morgan("dev"));


app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Talent Portal API is running",
    });
});


app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/categories",
    categoryRoutes
);

app.use(
    "/api/talents",
    talentRoutes
);

app.use(
    "/api/clients",
    clientRoutes
);

app.use(
    "/api/interests",
    interestRoutes
);

app.use(notFound);
app.use(errorHandler);

// const createInitialAdmin = async () => {
//     try {
//         const adminExists =
//             await Admin.findOne();

//         if (adminExists) {
//             return;
//         }

//         if (
//             !process.env.ADMIN_EMAIL ||
//             !process.env.ADMIN_PASSWORD
//         ) {
//             console.log(
//                 "Admin credentials are not configured."
//             );

//             return;
//         }

//         const admin =
//             await Admin.create({
//                 name:
//                     process.env.ADMIN_NAME ||
//                     "Portal Admin",

//                 email:
//                     process.env.ADMIN_EMAIL.toLowerCase(),

//                 password:
//                     process.env.ADMIN_PASSWORD,
//             });

//         console.log(
//             `Initial admin created: ${admin.email}`
//         );
//     } catch (error) {
//         console.error(
//             "Initial admin creation failed:",
//             error.message
//         );
//     }
// };

/*
 * Start server
 */
app.listen(PORT, async () => {
    console.log(
        `Server running on port ${PORT}`
    );

    // await createInitialAdmin();
});