const BaseService = require("./base.service");
const Brand = require("../models/brand.model");

class BrandService extends BaseService {
    constructor() {
        super(Brand, "brands", { searchField: "name", nameField: "name" });
    }
}

module.exports = new BrandService();
