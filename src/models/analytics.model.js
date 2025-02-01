import mongoose, {Schema} from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

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
            enum: ["phone", "desktop", "tablet", "unknown"],
            required: true,
        },
        userAgent: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

analyticsSchema.plugin(mongooseAggregatePaginate)

export const Analytics = mongoose.model("Analytics", analyticsSchema);
