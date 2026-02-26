const crypto = require("crypto");
const querystring = require("qs");

/**
 * Tạo URL thanh toán VNPay
 */
module.exports.createPaymentUrl = (orderId, amount, ipAddr, bankCode) => {
    const tmnCode = process.env.VNPAY_TMN_CODE;
    const secretKey = process.env.VNPAY_HASH_SECRET;
    const vnpUrl = process.env.VNPAY_URL;
    const returnUrl = process.env.VNPAY_RETURN_URL;

    const date = new Date();
    const createDate = date.getFullYear().toString() +
        String(date.getMonth() + 1).padStart(2, "0") +
        String(date.getDate()).padStart(2, "0") +
        String(date.getHours()).padStart(2, "0") +
        String(date.getMinutes()).padStart(2, "0") +
        String(date.getSeconds()).padStart(2, "0");

    const txnRef = orderId + "_" + Date.now();

    let vnpParams = {
        vnp_Version: "2.1.0",
        vnp_Command: "pay",
        vnp_TmnCode: tmnCode,
        vnp_Locale: "vn",
        vnp_CurrCode: "VND",
        vnp_TxnRef: txnRef,
        vnp_OrderInfo: "Thanh toan don hang " + orderId,
        vnp_OrderType: "other",
        vnp_Amount: amount * 100, // VNPay yêu cầu nhân 100
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: createDate
    };

    if (bankCode) {
        vnpParams.vnp_BankCode = bankCode;
    }

    // Sắp xếp params theo alphabet
    const sortedParams = sortObject(vnpParams);
    const signData = querystring.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    sortedParams.vnp_SecureHash = signed;

    const paymentUrl = vnpUrl + "?" + querystring.stringify(sortedParams, { encode: false });

    return { paymentUrl, txnRef };
};

/**
 * Verify checksum từ VNPay return URL
 */
module.exports.verifyReturnUrl = (vnpParams) => {
    const secretKey = process.env.VNPAY_HASH_SECRET;

    const secureHash = vnpParams.vnp_SecureHash;

    // Xóa hash fields
    delete vnpParams.vnp_SecureHash;
    delete vnpParams.vnp_SecureHashType;

    const sortedParams = sortObject(vnpParams);
    const signData = querystring.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    return secureHash === signed;
};

/**
 * Sort object keys theo alphabet
 */
function sortObject(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    for (const key of keys) {
        sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, "+");
    }
    return sorted;
}
