const BaseService = require("./base.service");
const Account = require("../models/account.model");
const searchHelper = require("../helpers/search");

class AccountService extends BaseService {
    constructor() {
        super(Account, "accounts", { searchField: "fullName", nameField: "fullName" });
    }

    /**
     * Override list() để search trên cả fullName và email (dùng $or).
     */
    async list(query, options = {}) {
        const filterStatusHelper = require("../helpers/filterStatus");
        const paginationHelper = require("../helpers/pagination");
        const sortHelper = require("../helpers/sort");

        const filterStatus = filterStatusHelper(query);
        const find = { deleted: false, ...(options.extraFind || {}) };

        if (query.status) {
            find.status = query.status;
        }

        // Search trên cả fullName và email
        const objectSearch = searchHelper(query);
        if (objectSearch.regex) {
            find.$or = [
                { fullName: objectSearch.regex },
                { email: objectSearch.regex }
            ];
        }

        const totalItems = await this.Model.countDocuments(find);
        const objectPagination = paginationHelper(query, totalItems, options.limit || 20);
        const objectSort = sortHelper(query, options.sortOptions);

        const items = await this.Model
            .find(find)
            .select("-password -token")
            .sort(objectSort.sortObject)
            .skip(objectPagination.skip)
            .limit(objectPagination.limitItems);

        return {
            items,
            filterStatus,
            keyword: objectSearch.keyword,
            sortOptions: objectSort.sortOptions,
            pagination: objectPagination
        };
    }
}

module.exports = new AccountService();
