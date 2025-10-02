const asyncHandler = require('../middleware/async');
const AppError = require('../middleware/errorResponse');
const DiscountCode = require('../models/DiscountCode');

// @desc    Get all discount codes
// @route   GET /api/discounts
// @access  Private/Admin
const getDiscounts = asyncHandler(async (req, res) => {
  const discounts = await DiscountCode.find().sort('-createdAt');

  res.status(200).json({
    success: true,
    count: discounts.length,
    data: discounts
  });
});

// @desc    Get single discount code
// @route   GET /api/discounts/:id
// @access  Private/Admin
const getDiscount = asyncHandler(async (req, res) => {
  const discount = await DiscountCode.findById(req.params.id);

  if (!discount) {
    return res.status(404).json({
      success: false,
      message: 'Discount code not found'
    });
  }

  res.status(200).json({
    success: true,
    data: discount
  });
});

// @desc    Create new discount code
// @route   POST /api/discounts
// @access  Private/Admin
const createDiscount = asyncHandler(async (req, res) => {
  const { code, discountType, discountValue, maxUses } = req.body;

  // Check if discount code already exists
  const existingDiscount = await DiscountCode.findOne({ code });
  if (existingDiscount) {
    return res.status(400).json({
      success: false,
      message: 'Discount code already exists'
    });
  }

  const discount = await DiscountCode.create({
    code,
    discountType,
    discountValue,
    maxUses: maxUses || 10
  });

  res.status(201).json({
    success: true,
    data: discount
  });
});

// @desc    Update discount code
// @route   PUT /api/discounts/:id
// @access  Private/Admin
const updateDiscount = asyncHandler(async (req, res) => {
  let discount = await DiscountCode.findById(req.params.id);

  if (!discount) {
    return res.status(404).json({
      success: false,
      message: 'Discount code not found'
    });
  }

  discount = await DiscountCode.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: discount
  });
});

// @desc    Delete discount code
// @route   DELETE /api/discounts/:id
// @access  Private/Admin
const deleteDiscount = asyncHandler(async (req, res) => {
  const discount = await DiscountCode.findById(req.params.id);

  if (!discount) {
    return res.status(404).json({
      success: false,
      message: 'Discount code not found'
    });
  }

  await discount.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Validate discount code (ENHANCED with comprehensive validation)
// @route   POST /api/discounts/validate
// @access  Public
const validateDiscount = asyncHandler(async (req, res) => {
  const { code, userId, cartSubtotal } = req.body;

  console.log('🎟️ Validating discount code:', { code, userId, cartSubtotal });

  // Find discount code (case-insensitive)
  const discount = await DiscountCode.findOne({ 
    code: code.toUpperCase(),
    isActive: true 
  });

  if (!discount) {
    console.log('❌ Discount code not found or inactive');
    return res.status(404).json({
      success: false,
      message: 'Invalid discount code'
    });
  }

  // Check if code has reached max uses
  if (discount.usedCount >= discount.maxUses) {
    console.log('❌ Discount code max uses reached:', discount.usedCount, '/', discount.maxUses);
    return res.status(400).json({
      success: false,
      message: `Discount code has been fully used (${discount.maxUses}/${discount.maxUses} times)`
    });
  }

  // Check minimum order amount (if specified)
  if (discount.minOrderAmount && cartSubtotal < discount.minOrderAmount) {
    console.log('❌ Cart subtotal below minimum:', cartSubtotal, '<', discount.minOrderAmount);
    return res.status(400).json({
      success: false,
      message: `Minimum order amount of ${discount.minOrderAmount.toLocaleString('vi-VN')} VND required`
    });
  }

  // Check user restrictions (if userId provided and code has user restrictions)
  if (userId && discount.applicableUsers.length > 0) {
    const isApplicable = discount.applicableUsers.some(
      uid => uid.toString() === userId.toString()
    );
    if (!isApplicable) {
      console.log('❌ User not in applicable users list');
      return res.status(403).json({
        success: false,
        message: 'This discount code is not available for your account'
      });
    }
  }

  // Check first-time-only restriction
  if (userId && discount.isFirstTimeOnly) {
    const hasUsedBefore = discount.usageHistory.some(
      usage => usage.user.toString() === userId.toString()
    );
    if (hasUsedBefore) {
      console.log('❌ User has already used this first-time-only code');
      return res.status(403).json({
        success: false,
        message: 'This discount code can only be used once per user'
      });
    }
  }

  // Calculate discount amount
  const discountAmount = discount.calculateDiscount(cartSubtotal || 0);

  console.log('✅ Discount code valid:', {
    code: discount.code,
    type: discount.discountType,
    value: discount.discountValue,
    discountAmount,
    remainingUses: discount.maxUses - discount.usedCount
  });

  res.status(200).json({
    success: true,
    message: 'Discount code is valid',
    data: {
      code: discount.code,
      description: discount.description,
      discountType: discount.discountType,
      discountValue: discount.discountValue,
      discountAmount: discountAmount,
      minOrderAmount: discount.minOrderAmount || 0,
      maxDiscountAmount: discount.maxDiscountAmount || null,
      remainingUses: discount.maxUses - discount.usedCount,
      usedCount: discount.usedCount,
      maxUses: discount.maxUses
    }
  });
});

module.exports = {
  getDiscounts,
  getDiscount,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  validateDiscount
};
