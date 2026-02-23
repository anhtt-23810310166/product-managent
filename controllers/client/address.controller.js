const User = require("../../models/user.model");

// [GET] /user/address
module.exports.index = async (req, res) => {
    // Lấy user từ res.locals.clientUser đã được gán bởi authMiddleware
    const user = res.locals.clientUser;
    
    // Sort địa chỉ: Cái nào isDefault = true thì văng lên trên cùng
    const addresses = user.addresses ? [...user.addresses].sort((a, b) => (b.isDefault === true) - (a.isDefault === true)) : [];

    res.render("client/pages/user/address", {
        pageTitle: "Sổ địa chỉ",
        addresses: addresses,
        req: req
    });
};

// [GET] /user/address/create
module.exports.create = async (req, res) => {
    res.render("client/pages/user/address-create", {
        pageTitle: "Thêm địa chỉ mới",
        req: req
    });
};

// [POST] /user/address/create
module.exports.createPost = async (req, res) => {
    try {
        const userId = res.locals.clientUser.id;
        const { fullName, phone, address, isDefault } = req.body;

        const user = await User.findById(userId);
        
        // Nếu là địa chỉ đầu tiên, hoặc user tick chọn isDefault -> Đặt nó làm mặc định
        const isFirstAddress = !user.addresses || user.addresses.length === 0;
        const shouldBeDefault = isFirstAddress || isDefault === "true";

        // Nếu mới này là mặc định, gỡ mặc định của tất cả địa chỉ cũ
        if (shouldBeDefault && user.addresses) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }

        const newAddress = {
            fullName: fullName,
            phone: phone,
            address: address,
            isDefault: shouldBeDefault
        };

        user.addresses.push(newAddress);
        await user.save();

        const addedAddress = user.addresses[user.addresses.length - 1];

        req.flash("success", "Thêm địa chỉ thành công!");
        const redirectUrl = req.query.redirect === "checkout" ? `/cart/checkout?addressId=${addedAddress._id}` : "/user/address";
        res.redirect(redirectUrl);
    } catch (error) {
        console.log(error);
        req.flash("error", "Lỗi thêm địa chỉ!");
        res.redirect("back");
    }
};

// [POST] /user/address/set-default/:addressId
module.exports.setDefault = async (req, res) => {
    try {
        const userId = res.locals.clientUser.id;
        const addressId = req.params.addressId;

        const user = await User.findById(userId);
        
        let found = false;
        // Gỡ cờ mặc định toàn bộ và set true cho cái được chọn
        user.addresses.forEach(addr => {
            if (addr._id.toString() === addressId) {
                addr.isDefault = true;
                found = true;
            } else {
                addr.isDefault = false;
            }
        });

        if (found) {
            await user.save();
            req.flash("success", "Đã cập nhật địa chỉ mặc định!");
        } else {
            req.flash("error", "Không tìm thấy địa chỉ!");
        }

    } catch (error) {
        console.log(error);
        req.flash("error", "Đã có lỗi xảy ra!");
    }
    
    // Nếu gọi từ trang checkout thì redirect về checkout, nếu từ sổ địa chỉ thì về sổ địa chỉ
    const redirectUrl = req.query.redirect === "checkout" ? "/cart/checkout" : "back";
    res.redirect(redirectUrl);
};

// [GET] /user/address/edit/:addressId
module.exports.edit = async (req, res) => {
    try {
        const userId = res.locals.clientUser.id;
        const addressId = req.params.addressId;

        const user = await User.findById(userId);
        const address = user.addresses.find(addr => addr._id.toString() === addressId);

        if (!address) {
            req.flash("error", "Không tìm thấy địa chỉ!");
            const redirectUrl = req.query.redirect === "checkout" ? "/user/address?redirect=checkout" : "/user/address";
            return res.redirect(redirectUrl);
        }

        res.render("client/pages/user/address-edit", {
            pageTitle: "Chỉnh sửa địa chỉ",
            address: address,
            req: req
        });
    } catch (error) {
        console.log(error);
        res.redirect("back");
    }
};

// [POST] /user/address/edit/:addressId
module.exports.editPost = async (req, res) => {
    try {
        const userId = res.locals.clientUser.id;
        const addressId = req.params.addressId;
        const { fullName, phone, address, isDefault } = req.body;

        const user = await User.findById(userId);
        const addrIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);

        if (addrIndex === -1) {
            req.flash("error", "Không tìm thấy địa chỉ!");
            return res.redirect("back");
        }

        const shouldBeDefault = isDefault === "true";

        if (shouldBeDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }

        // Cập nhật giá trị
        user.addresses[addrIndex].fullName = fullName;
        user.addresses[addrIndex].phone = phone;
        user.addresses[addrIndex].address = address;
        
        // Nếu user tick mặc định MẶC DÙ cái này đã là mặc định, hoặc nó đc tick mới
        // Tuy nhiên, nếu user bỏ tick mặc định mà nó BÂY GIỜ đang là mặc định thì KHÔNG ĐƯỢC PHÉP, bắt buộc phải có 1 cái mặc định (trừ khi xoá)
        if (shouldBeDefault) {
            user.addresses[addrIndex].isDefault = true;
        } else if (user.addresses[addrIndex].isDefault && user.addresses.length > 1) {
             // Không cho phép tắt cờ mặc định nếu đang là duy nhất
             // Nếu user thích thì đi tick cái khác, ko cho tắt tay
             user.addresses[addrIndex].isDefault = true;
        }

        await user.save();
        req.flash("success", "Cập nhật địa chỉ thành công!");

        const redirectUrl = req.query.redirect === "checkout" ? `/cart/checkout?addressId=${addressId}` : "/user/address";
        res.redirect(redirectUrl);
    } catch (error) {
        console.log(error);
        req.flash("error", "Đã có lỗi xảy ra!");
        res.redirect("back");
    }
};

// [POST] /user/address/delete/:addressId
module.exports.delete = async (req, res) => {
    try {
        const userId = res.locals.clientUser.id;
        const addressId = req.params.addressId;

        const user = await User.findById(userId);
        
        // Tìm địa chỉ định xoá
        const addressToDelete = user.addresses.find(addr => addr._id.toString() === addressId);
        
        if (!addressToDelete) {
            req.flash("error", "Không tìm thấy địa chỉ!");
            return res.redirect("back");
        }
        
        // Cấm xoá nếu đang là Mặc Định duy nhất (Ngừa trường hợp tạo lỗi đơn hàng thiếu địa chỉ)
        if (addressToDelete.isDefault && user.addresses.length > 1) {
            req.flash("error", "Hãy chọn 1 địa chỉ Mặc định khác trước khi xoá địa chỉ này!");
            return res.redirect("back");
        }

        // Lọc bỏ địa chỉ đó
        user.addresses = user.addresses.filter(addr => addr._id.toString() !== addressId);
        await user.save();
        
        req.flash("success", "Đã xoá địa chỉ!");
    } catch (error) {
        console.log(error);
        req.flash("error", "Có lỗi xảy ra!");
    }
    res.redirect("back");
};
