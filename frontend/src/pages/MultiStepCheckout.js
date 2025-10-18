import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { api } from '../services/api';
import { validateForm, orderValidationRules } from '../utils/validation';

// Step Components
import StepIndicator from '../components/checkout/StepIndicator';
import ShippingStep from '../components/checkout/ShippingStep';
import PaymentStep from '../components/checkout/PaymentStep';
import ReviewStep from '../components/checkout/ReviewStep';

const MultiStepCheckout = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { 
    cart, 
    getCartItems, 
    getCartTotal, 
    getCartSubtotal,
    getDiscountAmount,
    getLoyaltyPointsUsed,
    getShippingCost,
    getTaxAmount,
    clearCart
  } = useCart();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Prevent double submit
  
  // Form data
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    phone: '',
    shippingAddress: '',
    paymentMethod: 'cod',
    notes: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Check if cart is empty
    if (!cart || getCartItems().length === 0) {
      navigate('/cart');
      return;
    }
    
    // Pre-fill user info if authenticated
    if (isAuthenticated && user) {
      // Find the default address or fall back to first address
      const defaultAddress = user.addresses?.find(addr => addr.isDefault) || user.addresses?.[0];
      const fullAddress = defaultAddress 
        ? `${defaultAddress.street}, ${defaultAddress.city}, ${defaultAddress.state} ${defaultAddress.zipCode}, ${defaultAddress.country}`.replace(/, ,/g, ',')
        : '';
      
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
        fullName: user.fullName || '',
        phone: user.phone || defaultAddress?.phone || '',
        shippingAddress: fullAddress
      }));
    }
  }, [isAuthenticated, user, cart, navigate, getCartItems]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleNextStep = () => {
    // Validate current step
    if (currentStep === 1) {
      const validation = validateForm(formData, orderValidationRules);
      if (!validation.isValid) {
        setErrors(validation.errors);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }
    
    setCurrentStep(prev => Math.min(prev + 1, 3));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitOrder = async () => {
    // Prevent double submission
    if (isSubmitting || loading) {
      console.log('Order submission already in progress, ignoring...');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setLoading(true);
      setError('');
      
      const orderData = {
        items: getCartItems(),
        shippingAddress: formData.shippingAddress,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
        total: getCartTotal(),
        subtotal: getCartSubtotal(),
        discount: getDiscountAmount(),
        loyaltyPointsUsed: getLoyaltyPointsUsed(),
        shipping: getShippingCost(),
        tax: getTaxAmount()
      };

      // Add guest info if not authenticated
      if (!isAuthenticated) {
        orderData.guestInfo = {
          email: formData.email,
          fullName: formData.fullName,
          phone: formData.phone
        };
      }

      // If payment method is VNPay, save order data and redirect to VNPay FIRST
      // Order will be created AFTER successful payment
      if (formData.paymentMethod === 'vnpay') {
        try {
          // Save pending order data to localStorage (will be used after VNPay callback)
          localStorage.setItem('pendingVnpayOrder', JSON.stringify(orderData));
          
          // Create VNPay payment URL with temporary order ID
          const tempOrderId = `TEMP-${Date.now()}`;
          const vnpayResponse = await api.post('/payment/vnpay/create', {
            orderId: tempOrderId,
            amount: getCartTotal(),
            orderDescription: `Thanh toan don hang TechStore`
          });
          
          if (vnpayResponse.data.success && vnpayResponse.data.data.paymentUrl) {
            // Redirect to VNPay - order will be created on successful callback
            window.location.href = vnpayResponse.data.data.paymentUrl;
            return;
          } else {
            throw new Error('Failed to create VNPay payment URL');
          }
        } catch (vnpayError) {
          console.error('VNPay payment creation failed:', vnpayError);
          localStorage.removeItem('pendingVnpayOrder');
          setError('Không thể tạo thanh toán VNPay. Vui lòng thử lại hoặc chọn phương thức khác.');
          return;
        }
      }

      // For COD, create order immediately
      const response = await api.post('/orders', orderData);
      
      // Clear cart
      await clearCart();
      
      // Clear guest session ID to prevent cart merge on next login
      localStorage.removeItem('guestSessionId');
      
      // Get order from response - backend returns { data: { order } }
      const createdOrder = response.data.data.order || response.data.data;
      const orderId = createdOrder._id || createdOrder.id;
      
      // Navigate to success page
      navigate(`/order-success/${orderId}`, { 
        state: { 
          orderData: createdOrder,
          fromCheckout: true 
        }
      });
      
    } catch (error) {
      console.error('Checkout failed:', error);
      setError(error.response?.data?.message || 'Failed to place order. Please try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Processing your order..." />;
  }

  const cartItems = getCartItems();
  const subtotal = getCartSubtotal();
  const discount = getDiscountAmount();
  const loyaltyPointsUsed = getLoyaltyPointsUsed();
  const shipping = getShippingCost();
  const tax = getTaxAmount();
  const total = getCartTotal();

  return (
    <Container className="py-4">
      <h2 className="text-center mb-4">Checkout</h2>
      
      {/* Step Indicator */}
      <StepIndicator currentStep={currentStep} />

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Step Content */}
      <Row>
        <Col lg={12}>
          <Card>
            <Card.Body className="p-4">
              {currentStep === 1 && (
                <ShippingStep
                  formData={formData}
                  errors={errors}
                  handleChange={handleChange}
                  handleNext={handleNextStep}
                  isAuthenticated={isAuthenticated}
                />
              )}

              {currentStep === 2 && (
                <PaymentStep
                  formData={formData}
                  handleChange={handleChange}
                  handleNext={handleNextStep}
                  handleBack={handlePreviousStep}
                />
              )}

              {currentStep === 3 && (
                <ReviewStep
                  formData={formData}
                  cartItems={cartItems}
                  subtotal={subtotal}
                  discount={discount}
                  loyaltyPointsUsed={loyaltyPointsUsed}
                  shipping={shipping}
                  tax={tax}
                  total={total}
                  cart={cart}
                  handleBack={handlePreviousStep}
                  handleSubmit={handleSubmitOrder}
                  loading={loading}
                />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default MultiStepCheckout;
