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

// 🔹 Create a new short link (Protected Route)
router.route("/create-link").post(verifyJWT, createLink)

// 🔹 Get all links for the logged-in user (Pagination supported)
router.route("/user-links").get(verifyJWT, getUserLinks)

// 🔹 Redirect to the original link (Also tracks analytics)
router.route("/r/:shortLink").get(trackAnalytics, redirectLink)

// 🔹 Update an existing link (Protected Route)
router.route("/update/:id").patch(verifyJWT, updateLink)

// 🔹 Delete a link (Protected Route, also removes analytics)
router.route("/delete/:id").delete(verifyJWT, deleteLink)

export default router;
