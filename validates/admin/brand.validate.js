const validate = require("../../middlewares/validate.middleware");

const brandRules = [
    { field: "name", label: "Tên thương hiệu", required: true, minLength: 2, maxLength: 100 }
];

module.exports.createPost = validate(brandRules);
module.exports.editPatch = validate(brandRules);
