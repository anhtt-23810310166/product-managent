module.exports = (query) => {
    const sortOptions = [
        { value: "position-desc", label: "Vị trí giảm dần" },
        { value: "position-asc", label: "Vị trí tăng dần" },
        { value: "price-desc", label: "Giá giảm dần" },
        { value: "price-asc", label: "Giá tăng dần" },
        { value: "title-asc", label: "Tiêu đề A - Z" },
        { value: "title-desc", label: "Tiêu đề Z - A" }
    ];

    const sortObject = {};

    if(query.sortKey && query.sortValue) {
        sortObject[query.sortKey] = query.sortValue === "desc" ? -1 : 1;
    } else {
        sortObject.position = -1;
    }

    return {
        sortObject: sortObject,
        sortOptions: sortOptions
    };
}
