const express = require('express');
const router = express.Router();
const {
  createVnpayPayment,
  vnpayReturn,
  vnpayIPN,
  checkPaymentStatus
} = require('../controllers/payment.controller');

// VNPay routes
router.post('/vnpay/create', createVnpayPayment);
router.get('/vnpay/return', vnpayReturn);
router.get('/vnpay/ipn', vnpayIPN);

// Payment status
router.get('/status/:orderId', checkPaymentStatus);

module.exports = router;
