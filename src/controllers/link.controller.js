import crypto from "crypto";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Link } from "../models/link.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Analytics } from "../models/analytics.model.js"; 


const generateShortLink = async (originalLink, userId) => {
    const randomComponent = crypto.randomBytes(3).toString("hex");
    const uniqueString = `${originalLink}-${userId}-${randomComponent}-${Date.now()}`;
    const hash = crypto.createHash("sha256").update(uniqueString).digest("hex");

    return parseInt(hash.slice(0, 10), 16).toString(36).substring(0, 8);
};


const createLink = asyncHandler(async (req, res) => {
    const { originalLink, remarks, expirationDate } = req.body;
    const userId = req.user._id;

    if (!originalLink) {
        throw new ApiError(400, "Original link is required");
    }

    let shortLink;
    do {
        shortLink = await generateShortLink(originalLink, userId);
    } while (await Link.exists({ shortLink }));

    const newLink = new Link({
        user: userId,
        originalLink,
        shortLink,
        remarks,
        expirationDate,
        status: expirationDate && new Date(expirationDate) < new Date() ? "inactive" : "active",
    });

    await newLink.save();
    return res.status(201).json(new ApiResponse(201, { shortLink }, "Link created successfully"));
});


const getUserLinks = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user._id;

    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { createdAt: -1 },
    };

    const links = await Link.aggregatePaginate(
        Link.aggregate([{ $match: { user: userId } }]),
        options
    );

    return res.status(200).json(new ApiResponse(200, links, "Links retrieved successfully"));
});


const redirectLink = asyncHandler(async (req, res) => {
    const link = await Link.findOne({ shortLink: req.params.shortLink });

    if (!link) {
        throw new ApiError(404, "Link not found");
    }
    if (link.status === "inactive") {
        throw new ApiError(403, "Link is inactive and cannot be redirected");
    }


    link.clicks += 1;
    await link.save();

    return res.redirect(link.originalLink);
});


const updateLink = asyncHandler(async (req, res) => {
    const { originalLink, remarks, expirationDate, status } = req.body;
    const userId = req.user._id;

    const updatedData = { originalLink, remarks, expirationDate, status };

    if (expirationDate) {
        updatedData.status = new Date(expirationDate) < new Date() ? "inactive" : "active";
    }

    const updatedLink = await Link.findOneAndUpdate(
        { _id: req.params.id, user: userId }, 
        updatedData, 
        { new: true }
    );

    if (!updatedLink) {
        throw new ApiError(404, "Link not found or unauthorized");
    }

    return res.status(200).json(new ApiResponse(200, updatedLink, "Link updated successfully"));
});


const deleteLink = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const deletedLink = await Link.findOneAndDelete({ _id: req.params.id, user: userId });

    if (!deletedLink) {
        throw new ApiError(404, "Link not found or unauthorized");
    }


    await Analytics.deleteMany({ link: deletedLink._id });

    return res.status(200).json(new ApiResponse(200, {}, "Link and associated analytics deleted successfully"));
});

export { createLink, getUserLinks, redirectLink, updateLink, deleteLink };
