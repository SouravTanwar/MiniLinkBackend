import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Analytics } from "../models/analytics.model.js";
import { Link } from "../models/link.model.js";

// 📌 Middleware to capture analytics when a link is accessed
const trackAnalytics = asyncHandler(async (req, res, next) => {
    const { shortLink } = req.params;
    const ipAddress = req.ip || req.headers["x-forwarded-for"] || "unknown";
    let userAgent = req.get("User-Agent") || "unknown";
    // Update user agent with specific details
    if (/Android/i.test(userAgent)) {
        userAgent = 'Android';
    } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
        userAgent = 'iOS';
    } else if (/Chrome/i.test(userAgent)) {
        userAgent = 'Chrome';
    } else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) {
        userAgent = 'Safari';
    } else if (/Firefox/i.test(userAgent)) {
        userAgent = 'Firefox';
    } else if (/Edge/i.test(userAgent)) {
        userAgent = 'Edge';
    } else if (/MSIE|Trident/i.test(userAgent)) {
        userAgent = 'Internet Explorer';
    }
    const deviceType = req.device.type || "unknown";

    const link = await Link.findOne({ shortLink });

    if (!link) {
        throw new ApiError(404, "Short link not found");
    }

    // Save analytics data
    await Analytics.create({
        link: link._id,
        ipAddress,
        deviceType,
        userAgent,
    });

    next();
});

// 📌 Get analytics for a user's links with pagination
const getAnalytics = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user._id;

    // Fetch all links belonging to the user
    const userLinks = await Link.find({ user: userId }).select("_id shortLink originalLink");
    const linkIds = userLinks.map((link) => link._id);

    // Fetch analytics for these links
    const analyticsData = await Analytics.aggregate([
        { $match: { link: { $in: linkIds } } },
        { $lookup: {
            from: "links",
            localField: "link",
            foreignField: "_id",
            as: "linkDetails"
        }},
        { $unwind: "$linkDetails" },
        { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: parseInt(limit) },
        { $project: {
            _id: 1,
            ipAddress: 1,
            deviceType: 1,
            userAgent: 1,
            createdAt: 1,
            shortLink: "$linkDetails.shortLink",
            originalLink: "$linkDetails.originalLink"
        }}
    ]);

    return res.status(200).json(new ApiResponse(200, analyticsData, "Analytics retrieved successfully"));
});

// 📌 Get **date-wise cumulative total clicks** for all links
const getDateWiseClicks = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const userLinks = await Link.find({ user: userId }).select("_id");
    const linkIds = userLinks.map((link) => link._id);

    const dateWiseClicks = await Analytics.aggregate([
        { $match: { link: { $in: linkIds } } },
        { $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, 
            totalClicks: { $sum: 1 }
        }},
        { $sort: { _id: 1 } },
    ]);

    return res.status(200).json(new ApiResponse(200, dateWiseClicks, "Date-wise clicks retrieved successfully"));
});

// 📌 Get **device-wise total clicks** (Mobile, Desktop, Tablet)
const getDeviceWiseClicks = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const userLinks = await Link.find({ user: userId }).select("_id");
    const linkIds = userLinks.map((link) => link._id);

    const deviceClicks = await Analytics.aggregate([
        { $match: { link: { $in: linkIds } } },
        { $group: {
            _id: "$deviceType",
            totalClicks: { $sum: 1 }
        }},
        { $project: { deviceType: "$_id", totalClicks: 1, _id: 0 } }
    ]);

    return res.status(200).json(new ApiResponse(200, deviceClicks, "Device-wise clicks retrieved successfully"));
});

// 📌 Delete analytics when a link is deleted
const deleteAnalyticsByLink = asyncHandler(async (req, res) => {
    const { linkId } = req.params;

    const deletedAnalytics = await Analytics.deleteMany({ link: linkId });

    if (!deletedAnalytics.deletedCount) {
        throw new ApiError(404, "No analytics data found for this link");
    }

    return res.status(200).json(new ApiResponse(200, {}, "Analytics deleted successfully"));
});

export { 
    trackAnalytics, 
    getAnalytics, 
    getDateWiseClicks, 
    getDeviceWiseClicks, 
    deleteAnalyticsByLink 
};
