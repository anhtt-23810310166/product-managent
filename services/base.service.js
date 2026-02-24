const filterStatusHelper = require("../helpers/filterStatus");
const searchHelper = require("../helpers/search");
const sortHelper = require("../helpers/sort");
const paginationHelper = require("../helpers/pagination");

/**
 * BaseService — Chứa logic CRUD chung cho tất cả entity.
 * Các entity service kế thừa class này và chỉ override khi cần logic riêng.
 */
class BaseService {
    /**
     * @param {mongoose.Model} Model - Mongoose model
     * @param {string} moduleName - Tên module dùng cho logging (e.g. "products", "brands")
     * @param {Object} options
     * @param {string} options.searchField - Field dùng cho search regex (default: "title")
     * @param {string} options.nameField - Field hiển thị tên entity (default: "title")
     */
    constructor(Model, moduleName, options = {}) {
        this.Model = Model;
        this.moduleName = moduleName;
        this.searchField = options.searchField || "title";
        this.nameField = options.nameField || "title";
    }

    /**
     * Lấy danh sách items với filter, search, sort, pagination.
     * @param {Object} query - req.query
     * @param {Object} options
     * @param {Array} options.sortOptions - Custom sort options
     * @param {number} options.limit - Items per page
     * @param {Object} options.extraFind - Extra find conditions
     * @returns {{ items, filterStatus, keyword, sortOptions, pagination }}
     */
    async list(query, options = {}) {
        // Filter status
        const filterStatus = filterStatusHelper(query);
        const find = { deleted: false, ...(options.extraFind || {}) };

        if (query.status) {
            find.status = query.status;
        }

        // Search
        const objectSearch = searchHelper(query);
        if (objectSearch.regex) {
            find[this.searchField] = objectSearch.regex;
        }

        // Pagination
        const totalItems = await this.Model.countDocuments(find);
        const objectPagination = paginationHelper(query, totalItems, options.limit);

        // Sort
        const objectSort = sortHelper(query, options.sortOptions);
        const sort = Object.keys(objectSort.sortObject).length > 0
            ? objectSort.sortObject
            : { createdAt: -1 };

        // Query
        const items = await this.Model
            .find(find)
            .sort(sort)
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

    /**
     * Đổi trạng thái 1 item.
     * @returns {{ modified: boolean }}
     */
    async changeStatus(id, status) {
        const result = await this.Model.updateOne({ _id: id }, { status });
        return { modified: result.modifiedCount > 0 };
    }

    /**
     * Thao tác hàng loạt: active, inactive, delete, change-position.
     * @returns {{ count: number }}
     */
    async changeMulti(ids, type) {
        let count = 0;

        switch (type) {
            case "active":
            case "inactive": {
                const result = await this.Model.updateMany(
                    { _id: { $in: ids } },
                    { status: type }
                );
                count = result.modifiedCount;
                break;
            }
            case "delete": {
                const result = await this.Model.updateMany(
                    { _id: { $in: ids } },
                    { deleted: true, deletedAt: new Date() }
                );
                count = result.modifiedCount;
                break;
            }
            case "change-position": {
                for (const item of ids) {
                    const result = await this.Model.updateOne(
                        { _id: item.id },
                        { position: parseInt(item.position) }
                    );
                    count += result.modifiedCount;
                }
                break;
            }
            default:
                throw new Error("INVALID_ACTION");
        }

        return { count };
    }

    /**
     * Soft delete 1 item.
     * @returns {{ modified: boolean }}
     */
    async softDelete(id) {
        const result = await this.Model.updateOne(
            { _id: id },
            { deleted: true, deletedAt: new Date() }
        );
        return { modified: result.modifiedCount > 0 };
    }

    /**
     * Tự động tính position nếu không được nhập.
     * @param {string|number|undefined} position - Giá trị position từ form
     * @returns {number}
     */
    async autoPosition(position) {
        if (position === "" || position === undefined || position === null) {
            const count = await this.Model.countDocuments({ deleted: false });
            return count + 1;
        }
        return parseInt(position);
    }

    /**
     * Tìm 1 item theo ID (chưa bị xoá).
     * @returns {Object|null}
     */
    async findById(id) {
        return this.Model.findOne({ _id: id, deleted: false });
    }
}

module.exports = BaseService;
