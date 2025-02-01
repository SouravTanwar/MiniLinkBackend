import {Router} from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    createLink,
    getUserLinks,
    redirectLink,
    updateLink,
    deleteLink
} from "../controllers/link.controller.js";
import { trackAnalytics } from "../controllers/analytics.controller.js";

const router = Router();


router.route("/create-link").post(verifyJWT, createLink)

router.route("/user-links").get(verifyJWT, getUserLinks)

router.route("/r/:shortLink").get(trackAnalytics, redirectLink)

router.route("/update/:id").patch(verifyJWT, updateLink)

router.route("/delete/:id").delete(verifyJWT, deleteLink)

export default router;
