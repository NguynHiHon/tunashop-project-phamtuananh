const crypto = require('crypto');
const qs = require('qs');

const VNP_TMN_CODE = process.env.VNP_TMN_CODE;
const VNP_HASH_SECRET = process.env.VNP_HASH_SECRET;
const VNP_URL = process.env.VNP_URL;
const VNP_RETURN_URL = process.env.VNP_RETURN_URL;

// Sắp xếp object theo key tăng dần - QUAN TRỌNG cho checksum VNPay
function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

// Tạo URL thanh toán VNPay từ thông tin đơn hàng
function createPaymentUrl(order, ipAddr) {
    const date = new Date();

    // Format: yyyyMMddHHmmss theo múi giờ Việt Nam (UTC+7)
    const vnDate = new Date(date.getTime() + 7 * 60 * 60 * 1000);
    const pad = (n) => String(n).padStart(2, '0');
    const createDate =
        vnDate.getUTCFullYear().toString() +
        pad(vnDate.getUTCMonth() + 1) +
        pad(vnDate.getUTCDate()) +
        pad(vnDate.getUTCHours()) +
        pad(vnDate.getUTCMinutes()) +
        pad(vnDate.getUTCSeconds());

    // Dùng orderCode làm TxnRef (duy nhất, tối đa 100 ký tự, chỉ chứa a-z A-Z 0-9)
    const txnRef = order.orderCode;

    // Số tiền nhân 100 (VNPay không dùng số thập phân)
    const amount = Math.round(order.total) * 100;

    // Mô tả không dấu, không ký tự đặc biệt
    const orderInfo = `Thanh toan don hang ${txnRef}`;

    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = VNP_TMN_CODE;
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = txnRef;
    vnp_Params['vnp_OrderInfo'] = orderInfo;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount;
    vnp_Params['vnp_ReturnUrl'] = VNP_RETURN_URL;
    vnp_Params['vnp_IpAddr'] = ipAddr || '127.0.0.1';
    vnp_Params['vnp_CreateDate'] = createDate;

    // Sắp xếp params theo key tăng dần trước khi tạo chữ ký
    vnp_Params = sortObject(vnp_Params);

    // Tạo chuỗi ký: stringify KHÔNG encode (theo tài liệu VNPay NodeJS)
    const signData = qs.stringify(vnp_Params, { encode: false });

    // Ký HMAC-SHA512
    const hmac = crypto.createHmac('sha512', VNP_HASH_SECRET);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    vnp_Params['vnp_SecureHash'] = signed;

    // Build URL cuối cùng (encode: false theo chuẩn demo VNPay)
    const paymentUrl = VNP_URL + '?' + qs.stringify(vnp_Params, { encode: false });

    console.log('[VNPay] TmnCode:', VNP_TMN_CODE);
    console.log('[VNPay] OrderCode:', txnRef, '| Amount:', amount);
    console.log('[VNPay] SignData:', signData.substring(0, 100) + '...');
    console.log('[VNPay] Signed:', signed.substring(0, 20) + '...');

    return paymentUrl;
}

// Xác thực dữ liệu trả về từ VNPay (Return URL hoặc IPN)
function verifyReturnData(query) {
    const vnp_SecureHash = query['vnp_SecureHash'];

    // Lấy các params vnp_, bỏ vnp_SecureHash và vnp_SecureHashType
    const inputData = {};
    Object.keys(query).forEach((key) => {
        if (key.startsWith('vnp_') && key !== 'vnp_SecureHash' && key !== 'vnp_SecureHashType') {
            inputData[key] = query[key];
        }
    });

    // Sắp xếp và ký lại để so sánh
    const sortedData = sortObject(inputData);
    const signData = qs.stringify(sortedData, { encode: false });

    const hmac = crypto.createHmac('sha512', VNP_HASH_SECRET);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    const isValid = signed === vnp_SecureHash;
    const isSuccess = query['vnp_ResponseCode'] === '00';

    console.log('[VNPay Return] ResponseCode:', query['vnp_ResponseCode'], '| IsValid:', isValid);

    return {
        isValid,
        isSuccess,
        responseCode: query['vnp_ResponseCode'],
        txnRef: query['vnp_TxnRef'],
        amount: parseInt(query['vnp_Amount']) / 100,
        bankCode: query['vnp_BankCode'],
        transactionNo: query['vnp_TransactionNo'],
        payDate: query['vnp_PayDate'],
        orderInfo: query['vnp_OrderInfo'],
    };
}

module.exports = {
    createPaymentUrl,
    verifyReturnData,
};
