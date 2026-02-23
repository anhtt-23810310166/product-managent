const BaseService = require("./base.service");
const Product = require("../models/product.model");

class ProductService extends BaseService {
    constructor() {
        super(Product, "products", { searchField: "title", nameField: "title" });
    }
}

module.exports = new ProductService();
