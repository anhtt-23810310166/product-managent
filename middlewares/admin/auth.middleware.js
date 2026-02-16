const Account = require("../../models/account.model");

module.exports.requireAuth = async (req, res, next) => {
    if (!req.session.token) {
        return res.redirect(`${req.app.locals.prefixAdmin}/auth/login`);
    }

    try {
        const user = await Account.findOne({
            token: req.session.token,
            status: "active",
            deleted: false
        }).select("-password");

        if (!user) {
            req.session.token = null;
            return res.redirect(`${req.app.locals.prefixAdmin}/auth/login`);
        }

        res.locals.user = user;
        next();
    } catch (error) {
        console.log(error);
        req.session.token = null;
        res.redirect(`${req.app.locals.prefixAdmin}/auth/login`);
    }
};
