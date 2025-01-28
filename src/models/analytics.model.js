import mongoose, {Schema} from "mongoose"

const analyticsSchema = new Schema(
    {
        link: {
            type: Schema.Types.ObjectId,
            ref: "Link",
            required: true,
        },
        originalUrl: {
            type: String,
            required: true,
        },
        shortUrl: {
            type: String,
            required: true,
        },
        ipAddress: {
            type: String,
            required: true,
        },
        userAgent: {
            type: String,
            required: true,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

export const Link = mongoose.model("Analytics", analyticsSchema);