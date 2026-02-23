const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");

const brandSchema = new mongoose.Schema({
    name: String,
    slug: {
        type: String,
        slug: "name",
        unique: true
    },
    logo: String,
    description: String,
    status: {
        type: String,
        default: "active"
    },
    position: Number,
    deleted: {
        type: Boolean,
        default: false
    },
    deletedAt: Date
}, { timestamps: true });

brandSchema.plugin(slug);

const Brand = mongoose.model("Brand", brandSchema);

module.exports = Brand;
