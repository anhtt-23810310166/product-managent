const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");

const articleSchema = new mongoose.Schema({
    title: String,
    article_category_id: {
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
    featured: {
        type: Boolean,
        default: false
    },
    deleted: {
        type: Boolean,
        default: false
    },
    deletedAt: Date
}, { timestamps: true });

articleSchema.plugin(slug);

const Article = mongoose.model("Article", articleSchema);

module.exports = Article;
