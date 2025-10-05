const crypto = require('crypto');
const querystring = require('qs');

// VNPay Configuration - Use test/sandbox credentials
const vnpayConfig = {
  vnp_TmnCode: process.env.VNPAY_TMN_CODE || 'CGXZLS0Z',
  vnp_HashSecret: process.env.VNPAY_HASH_SECRET || 'RAOEXHYVSDDIIENYWSLDIIZTANXUXZFJ',
  vnp_Url: process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  vnp_ReturnUrl: process.env.VNPAY_RETURN_URL || 'http://localhost:5000/api/payment/vnpay/return',
  vnp_Api: process.env.VNPAY_API || 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction',
  // Set to true to use local simulator instead of VNPay sandbox
  useSimulator: process.env.VNPAY_USE_SIMULATOR === 'true' || true
};

/**
 * Sort object keys alphabetically (theo đúng sample code VNPay)
 */
function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(key);
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = obj[str[key]];
  }
  return sorted;
}

/**
 * Format date as YYYYMMDDHHmmss
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

/**
 * Create VNPay payment URL
 * @param {Object} orderInfo - Order information
 * @param {string} orderInfo.orderId - Order ID
 * @param {number} orderInfo.amount - Amount in VND
 * @param {string} orderInfo.orderDescription - Order description
 * @param {string} orderInfo.bankCode - Bank code (optional)
 * @param {string} orderInfo.language - Language (vn/en)
 * @param {string} ipAddr - Client IP address
 * @returns {string} VNPay payment URL
 */
function createPaymentUrl(orderInfo, ipAddr) {
  process.env.TZ = 'Asia/Ho_Chi_Minh';
  
  const date = new Date();
  const createDate = formatDate(date);
  
  const orderId = orderInfo.orderId || formatDate(date);
  const amount = Math.round(orderInfo.amount);
  
  // Clean order description
  const orderDescription = (orderInfo.orderDescription || `Thanh toan don hang ${orderId}`)
    .substring(0, 255);
  
  console.log('📦 Creating VNPay payment:', { 
    orderId, 
    amount, 
    ipAddr,
    tmnCode: vnpayConfig.vnp_TmnCode
  });

  let vnp_Params = {};
  vnp_Params['vnp_Version'] = '2.1.0';
  vnp_Params['vnp_Command'] = 'pay';
  vnp_Params['vnp_TmnCode'] = vnpayConfig.vnp_TmnCode;
  vnp_Params['vnp_Locale'] = orderInfo.language || 'vn';
  vnp_Params['vnp_CurrCode'] = 'VND';
  vnp_Params['vnp_TxnRef'] = orderId;
  vnp_Params['vnp_OrderInfo'] = orderDescription;
  vnp_Params['vnp_OrderType'] = 'other';
  vnp_Params['vnp_Amount'] = amount * 100;
  vnp_Params['vnp_ReturnUrl'] = vnpayConfig.vnp_ReturnUrl;
  vnp_Params['vnp_IpAddr'] = ipAddr || '127.0.0.1';
  vnp_Params['vnp_CreateDate'] = createDate;
  
  // Add bank code if specified
  if (orderInfo.bankCode && orderInfo.bankCode !== '') {
    vnp_Params['vnp_BankCode'] = orderInfo.bankCode;
  }
  
  // Sort parameters alphabetically
  vnp_Params = sortObject(vnp_Params);
  
  // Create sign data string - KHÔNG encode, dùng querystring với encode: false
  const signData = querystring.stringify(vnp_Params, { encode: false });
  
  console.log('🔐 Sign data:', signData);
  
  // Create HMAC SHA512 signature
  const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  
  console.log('🔑 Secure hash:', signed);
  
  // Add secure hash to params
  vnp_Params['vnp_SecureHash'] = signed;
  
  // Check if using simulator
  if (vnpayConfig.useSimulator) {
    // Redirect to local simulator
    const simulatorUrl = (process.env.CLIENT_URL || 'http://localhost:3000') + '/payment/vnpay-simulator';
    const simulatorParams = querystring.stringify(vnp_Params, { encode: true });
    console.log('🎮 Using VNPay Simulator');
    return simulatorUrl + '?' + simulatorParams;
  }
  
  // Build final URL - KHÔNG encode để giữ nguyên giá trị
  const paymentUrl = vnpayConfig.vnp_Url + '?' + querystring.stringify(vnp_Params, { encode: false });
  
  console.log('✅ VNPay payment URL created');
  
  return paymentUrl;
}

/**
 * Verify VNPay return/IPN data
 * @param {Object} vnpParams - Parameters from VNPay
 * @returns {Object} Verification result
 */
function verifyReturnUrl(vnpParams) {
  const secureHash = vnpParams['vnp_SecureHash'];
  
  // Check if this is from simulator (simulated hash starts with SIMULATED_)
  const isFromSimulator = secureHash && secureHash.startsWith('SIMULATED_HASH_');
  
  // Clone params and remove hash fields
  let params = { ...vnpParams };
  delete params['vnp_SecureHash'];
  delete params['vnp_SecureHashType'];
  
  let isValid = false;
  
  if (isFromSimulator) {
    // Trust simulator responses
    isValid = true;
    console.log('🎮 Simulator response detected - auto-validating');
  } else {
    // Sort parameters
    params = sortObject(params);
    
    // Create signature string - dùng querystring với encode: false
    const signData = querystring.stringify(params, { encode: false });
    
    const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    
    // Compare signatures (case-insensitive)
    isValid = secureHash.toLowerCase() === signed.toLowerCase();
  }
  
  console.log('📥 VNPay Return verification:', {
    orderId: vnpParams['vnp_TxnRef'],
    responseCode: vnpParams['vnp_ResponseCode'],
    isValid,
    isFromSimulator
  });
  
  return {
    isValid,
    orderId: vnpParams['vnp_TxnRef'],
    amount: parseInt(vnpParams['vnp_Amount']) / 100,
    responseCode: vnpParams['vnp_ResponseCode'],
    transactionNo: vnpParams['vnp_TransactionNo'],
    bankCode: vnpParams['vnp_BankCode'],
    payDate: vnpParams['vnp_PayDate'],
    message: getResponseMessage(vnpParams['vnp_ResponseCode'])
  };
}

/**
 * Get response message based on response code
 */
function getResponseMessage(responseCode) {
  const messages = {
    '00': 'Giao dịch thành công',
    '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
    '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
    '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
    '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
    '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
    '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).',
    '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
    '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
    '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
    '75': 'Ngân hàng thanh toán đang bảo trì.',
    '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.',
    '99': 'Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)'
  };
  return messages[responseCode] || 'Lỗi không xác định';
}

module.exports = {
  createPaymentUrl,
  verifyReturnUrl,
  getResponseMessage,
  vnpayConfig
};
