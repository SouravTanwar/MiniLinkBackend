import {Router} from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { 
    trackAnalytics, 
    getAnalytics, 
    getDateWiseClicks, 
    getDeviceWiseClicks
} from "../controllers/analytics.controller.js";

const router = Router();


router.route("/track/:shortLink").get(trackAnalytics, (req, res) => {
    res.status(200).json({ message: "Analytics tracked successfully" });
});

router.route("/link-analytics").get(verifyJWT, getAnalytics);

router.route("/date-wise-clicks").get(verifyJWT, getDateWiseClicks);

router.route("/device-wise-clicks").get(verifyJWT, getDeviceWiseClicks);


export default router;