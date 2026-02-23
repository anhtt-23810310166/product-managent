const BaseService = require("./base.service");
const ProductCategory = require("../models/product-category.model");

class ProductCategoryService extends BaseService {
    constructor() {
        super(ProductCategory, "product-category", { searchField: "title", nameField: "title" });
    }
}

module.exports = new ProductCategoryService();
