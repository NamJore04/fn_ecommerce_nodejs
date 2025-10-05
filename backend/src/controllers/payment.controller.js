const asyncHandler = require('../middleware/async');
const Order = require('../models/Order');
const vnpayService = require('../services/vnpayService');

/**
 * @desc    Create VNPay payment URL
 * @route   POST /api/payment/vnpay/create
 * @access  Public
 */
const createVnpayPayment = asyncHandler(async (req, res) => {
  const { orderId, amount, orderDescription, bankCode, language } = req.body;
  
  // Get client IP
  const ipAddr = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.ip ||
    '127.0.0.1';
  
  console.log('📦 Creating VNPay payment:', { orderId, amount, ipAddr });
  
  // Create payment URL
  const paymentUrl = vnpayService.createPaymentUrl({
    orderId,
    amount,
    orderDescription: orderDescription || `Thanh toan don hang ${orderId}`,
    bankCode,
    language: language || 'vn'
  }, ipAddr.split(',')[0]); // Get first IP if multiple
  
  console.log('✅ VNPay payment URL created');
  
  res.json({
    success: true,
    data: {
      paymentUrl
    }
  });
});

/**
 * @desc    VNPay return URL handler (redirect from VNPay)
 * @route   GET /api/payment/vnpay/return
 * @access  Public
 */
const vnpayReturn = asyncHandler(async (req, res) => {
  const vnpParams = req.query;
  
  console.log('📥 VNPay return:', vnpParams);
  
  // Verify the return data
  const result = vnpayService.verifyReturnUrl({ ...vnpParams });
  
  console.log('🔍 VNPay verification result:', result);
  
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  
  if (result.isValid) {
    if (result.responseCode === '00') {
      // Payment successful - redirect to frontend with success params
      // Frontend will create the order with pending data from localStorage
      console.log('✅ VNPay payment successful, redirecting to frontend');
      
      res.redirect(`${clientUrl}/payment/vnpay-return?payment=success&vnp_ResponseCode=${result.responseCode}&vnp_TransactionNo=${result.transactionNo || ''}`);
    } else {
      // Payment failed
      console.log('❌ VNPay payment failed:', result.message);
      
      res.redirect(`${clientUrl}/payment/vnpay-return?payment=failed&vnp_ResponseCode=${result.responseCode}&message=${encodeURIComponent(result.message)}`);
    }
  } else {
    console.log('❌ Invalid VNPay signature');
    res.redirect(`${clientUrl}/payment/vnpay-return?payment=failed&message=${encodeURIComponent('Chữ ký không hợp lệ')}`);
  }
});

/**
 * @desc    VNPay IPN (Instant Payment Notification) handler
 * @route   GET /api/payment/vnpay/ipn
 * @access  Public
 */
const vnpayIPN = asyncHandler(async (req, res) => {
  const vnpParams = req.query;
  
  console.log('📥 VNPay IPN:', vnpParams);
  
  // Verify the IPN data
  const result = vnpayService.verifyReturnUrl({ ...vnpParams });
  
  if (!result.isValid) {
    console.log('❌ Invalid VNPay IPN signature');
    return res.json({ RspCode: '97', Message: 'Invalid Checksum' });
  }
  
  // Find order
  const order = await Order.findOne({ orderNumber: result.orderId });
  
  if (!order) {
    console.log('❌ Order not found:', result.orderId);
    return res.json({ RspCode: '01', Message: 'Order not found' });
  }
  
  // Check amount
  if (order.total !== result.amount) {
    console.log('❌ Amount mismatch:', { orderTotal: order.total, vnpayAmount: result.amount });
    return res.json({ RspCode: '04', Message: 'Invalid amount' });
  }
  
  // Check if already processed
  if (order.paymentStatus === 'paid') {
    console.log('ℹ️ Order already paid:', result.orderId);
    return res.json({ RspCode: '02', Message: 'Order already confirmed' });
  }
  
  // Update order based on response code
  if (result.responseCode === '00') {
    order.paymentStatus = 'paid';
    order.status = 'confirmed';
    order.vnpayTransactionNo = result.transactionNo;
    order.vnpayBankCode = result.bankCode;
    order.paidAt = new Date();
    await order.save();
    
    console.log('✅ IPN: Order payment confirmed:', order.orderNumber);
    return res.json({ RspCode: '00', Message: 'Confirm Success' });
  } else {
    order.paymentStatus = 'failed';
    order.vnpayResponseCode = result.responseCode;
    await order.save();
    
    console.log('❌ IPN: Order payment failed:', order.orderNumber);
    return res.json({ RspCode: '00', Message: 'Confirm Success' });
  }
});

/**
 * @desc    Check payment status
 * @route   GET /api/payment/status/:orderId
 * @access  Public
 */
const checkPaymentStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  
  const order = await Order.findOne({ 
    $or: [
      { _id: orderId },
      { orderNumber: orderId }
    ]
  });
  
  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }
  
  res.json({
    success: true,
    data: {
      orderId: order._id,
      orderNumber: order.orderNumber,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      total: order.total,
      paidAt: order.paidAt,
      vnpayTransactionNo: order.vnpayTransactionNo
    }
  });
});

module.exports = {
  createVnpayPayment,
  vnpayReturn,
  vnpayIPN,
  checkPaymentStatus
};
