const BaseService = require("./base.service");
const Article = require("../models/article.model");

class ArticleService extends BaseService {
    constructor() {
        super(Article, "articles", { searchField: "title", nameField: "title" });
    }
}

module.exports = new ArticleService();
