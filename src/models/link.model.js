import mongoose, {Schema} from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const linkSchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        originalLink: { type: String, required: true },
        shortLink: { type: String, required: true, unique: true },
        remarks: { type: String, trim: true },
        clicks: { type: Number, default: 0 },
        expirationDate: { type: Date }, 
        status: { type: String, enum: ["active", "inactive"], default: "active" },
    },
    { timestamps: true }
);

linkSchema.pre("save", function (next) {
    if (this.expirationDate && new Date() > this.expirationDate) {
        this.status = "inactive";
    }
    next();
});



linkSchema.plugin(mongooseAggregatePaginate)

export const Link = mongoose.model("Link", linkSchema);
