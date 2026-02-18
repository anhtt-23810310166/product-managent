// [Middleware] Cart: truyền cartTotalQuantity cho header mọi trang
module.exports.cartMiddleware = (req, res, next) => {
    const cart = req.session.cart || [];
    const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
    res.locals.cartTotalQuantity = totalQuantity;
    next();
};
