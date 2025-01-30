import mongoose, {Schema} from "mongoose"

const analyticsSchema = new Schema(
    {
        link: {
            type: Schema.Types.ObjectId,
            ref: "Link",
            required: true,
        },
        ipAddress: {
            type: String,
            required: true,
        },
        deviceType: {
            type: String,
            enum: ["mobile", "desktop", "tablet", "unknown"],
            required: true,
        },
        userAgent: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

export const Analytics = mongoose.model("Analytics", analyticsSchema);
