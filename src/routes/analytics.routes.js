import {Router} from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    getLinkAnalytics,
    getDashboardAnalytics
} from "../controllers/analytics.controller.js";

const router = Router();

// NOT FUNCTIONAL ?????????????????????????????ChatGPT
// 🔹 Get analytics for a specific user's links (Protected Route, with pagination)
router.get("/", verifyJWT, getLinkAnalytics);

// 🔹 Get overall analytics for the user's dashboard
router.get("/dashboard", verifyJWT, getDashboardAnalytics);

export default router;
