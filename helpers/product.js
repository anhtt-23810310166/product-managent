// Helper: tính giá sau giảm (làm tròn đến hàng nghìn)
module.exports.getDiscountedPrice = (product) => {
    if (product.discountPercentage && product.discountPercentage > 0) {
        return Math.round(product.price * (1 - product.discountPercentage / 100) / 1000) * 1000;
    }
    return product.price;
};

// Helper: tính tổng số lượng cart
module.exports.getCartTotalQuantity = (cart) => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
};

// Helper: tính tổng tiền giỏ hàng
module.exports.calculateCartTotal = (cart, products) => {
    let total = 0;
    for (const cartItem of cart) {
        const product = products.find(p => p.id === cartItem.productId);
        if (product) {
            total += module.exports.getDiscountedPrice(product) * cartItem.quantity;
        }
    }
    return total;
};
