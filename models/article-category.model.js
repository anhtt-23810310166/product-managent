const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");

const articleCategorySchema = new mongoose.Schema({
    title: String,
    parent_id: {
        type: String,
        default: ""
    },
    slug: {
        type: String,
        slug: "title",
        unique: true
    },
    description: String,
    thumbnail: String,
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

articleCategorySchema.plugin(slug);

const ArticleCategory = mongoose.model("ArticleCategory", articleCategorySchema);

module.exports = ArticleCategory;
