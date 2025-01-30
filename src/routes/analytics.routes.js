import {Router} from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { 
    trackAnalytics, 
    getAnalytics, 
    getDateWiseClicks, 
    getDeviceWiseClicks, 
    deleteAnalyticsByLink 
} from "../controllers/analytics.controller.js";

const router = Router();

// 📌 Track analytics when a short link is accessed (Middleware)
router.route("/track/:shortLink").get(trackAnalytics, (req, res) => {
    res.status(200).json({ message: "Analytics tracked successfully" });
});

// 📌 Get paginated analytics for a user’s links (Requires Authentication)
router.route("/link-analytics").get(verifyJWT, getAnalytics);

// 📌 Get date-wise total clicks for all links (Requires Authentication)
router.route("/date-wise-clicks").get(verifyJWT, getDateWiseClicks);

// 📌 Get device-wise total clicks (Mobile, Desktop, Tablet) (Requires Authentication)
router.route("/device-wise-clicks").get(verifyJWT, getDeviceWiseClicks);

// 📌 Delete analytics for a specific link when it is deleted (Requires Authentication)
router.route("/:linkId").delete(verifyJWT, deleteAnalyticsByLink);

export default router;