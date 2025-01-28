import mongoose, {Schema} from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const linkSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        originalUrl: {
            type: String,
            required: true,
        },
        shortUrl: {
            type: String,
            required: true,
            unique: true,
        },
        remarks: {
            type: String,
            trim: true,
        },
        expirationDate: {
            type: Date,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        totalClicks: {
            type: Number,
            default: 0,
        },
        deviceClicks: {
            type: Map, 
            of: Number,
            default: {},
        },
    },
    { timestamps: true }
);

linkSchema.plugin(mongooseAggregatePaginate)

export const Link = mongoose.model("Link", linkSchema);
