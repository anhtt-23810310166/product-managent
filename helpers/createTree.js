// Chuyển danh sách phẳng thành cấu trúc cây dựa trên parent_id
const createTree = (categories, parentId = "") => {
    const tree = [];

    categories.forEach(item => {
        if (item.parent_id === parentId) {
            const children = createTree(categories, item._id.toString());
            const node = {
                ...item.toObject ? item.toObject() : item,
                children: children
            };
            tree.push(node);
        }
    });

    return tree;
};

module.exports = createTree;
