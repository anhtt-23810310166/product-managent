const validate = require("../../middlewares/validate.middleware");

const articleRules = [
    { field: "title", label: "Tiêu đề bài viết", required: true, minLength: 5, maxLength: 200 }
];

module.exports.createPost = validate(articleRules);
module.exports.editPatch = validate(articleRules);
