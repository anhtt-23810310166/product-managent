module.exports = (query, totalItems, limitItems = 4) => {
    const pagination = {
        currentPage: 1,
        limitItems: limitItems,
        skip: 0,
        totalPage: 1,
        totalItems: totalItems
    };

    // Current page
    if (query.page) {
        pagination.currentPage = parseInt(query.page) || 1;
    }

    // Total pages
    pagination.totalPage = Math.ceil(totalItems / pagination.limitItems);

    // Ensure currentPage is within valid range
    if (pagination.currentPage < 1) {
        pagination.currentPage = 1;
    }
    if (pagination.currentPage > pagination.totalPage && pagination.totalPage > 0) {
        pagination.currentPage = pagination.totalPage;
    }

    // Skip
    pagination.skip = (pagination.currentPage - 1) * pagination.limitItems;

    return pagination;
}
