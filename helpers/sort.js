module.exports = (query) => {
    let sort = {
        position: "desc",
        key: "position",
        value: "desc"
    };

    if(query.sortKey && query.sortValue) {
        sort.key = query.sortKey;
        sort.value = query.sortValue;
    }

    return sort;
}
