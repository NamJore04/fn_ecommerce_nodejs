import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Badge, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaTrash, FaArrowLeft, FaPercent, FaGift, FaLock, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import CartItem from '../components/CartItem';
import LoadingSpinner from '../components/LoadingSpinner';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { formatPrice } from '../utils/format';
import { api } from '../services/api';

const Cart = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { 
    cart, 
    loading, 
    error, 
    applyDiscountCode, 
    removeDiscountCode, 
    applyLoyaltyPoints,
    getCartItems,
    getCartTotal,
    getCartSubtotal,
    getDiscountAmount,
    getLoyaltyPointsUsed,
    getShippingCost,
    getTaxAmount,
    isEmpty,
    loadCart
  } = useCart();
  
  const [discountCode, setDiscountCode] = useState('');
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [applyingDiscount, setApplyingDiscount] = useState(false);
  const [validatingDiscount, setValidatingDiscount] = useState(false);
  const [usingLoyalty, setUsingLoyalty] = useState(false);
  const [discountError, setDiscountError] = useState('');
  const [discountSuccess, setDiscountSuccess] = useState('');
  const [validationInfo, setValidationInfo] = useState(null);

  useEffect(() => {
    if (cart?.discountCode) {
      setDiscountCode(cart.discountCode);
    }
    if (cart?.loyaltyPointsUsed) {
      setLoyaltyPoints(cart.loyaltyPointsUsed);
    }
  }, [cart]);

  // Validate discount code before applying
  const handleValidateDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountError('Please enter a discount code');
      return;
    }

    try {
      setValidatingDiscount(true);
      setDiscountError('');
      setValidationInfo(null);

      const subtotal = getCartSubtotal();
      
      console.log('🎟️ Validating discount code:', { 
        code: discountCode.trim(), 
        userId: user?._id, 
        cartSubtotal: subtotal 
      });

      const response = await api.post('/discounts/validate', {
        code: discountCode.trim().toUpperCase(),
        userId: user?._id || null,
        cartSubtotal: subtotal
      });

      if (response.data.success) {
        setValidationInfo(response.data.data);
        setDiscountSuccess(`✅ Valid! You'll save ${formatPrice(response.data.data.discountAmount)}`);
        console.log('✅ Discount validation successful:', response.data.data);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Invalid discount code';
      setDiscountError(errorMsg);
      setValidationInfo(null);
      console.error('❌ Discount validation failed:', errorMsg);
    } finally {
      setValidatingDiscount(false);
    }
  };

  const handleApplyDiscount = async (e) => {
    e.preventDefault();
    
    // If not validated yet, validate first
    if (!validationInfo) {
      await handleValidateDiscount();
      return;
    }

    try {
      setApplyingDiscount(true);
      setDiscountError('');
      const result = await applyDiscountCode(discountCode.trim());
      
      if (result.success) {
        setDiscountSuccess('Discount code applied successfully!');
        setValidationInfo(null); // Clear validation after applying
      } else {
        setDiscountError(result.error || 'Failed to apply discount code');
      }
    } catch (error) {
      setDiscountError(error.message || 'Failed to apply discount code');
    } finally {
      setApplyingDiscount(false);
    }
  };

  const handleRemoveDiscount = async () => {
    try {
      await removeDiscountCode();
      setDiscountCode('');
    } catch (error) {
      console.error('Failed to remove discount:', error);
    }
  };

  const handleUseLoyaltyPoints = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || !user?.loyaltyPoints) return;

    try {
      setUsingLoyalty(true);
      await applyLoyaltyPoints(loyaltyPoints);
    } catch (error) {
      console.error('Failed to use loyalty points:', error);
    } finally {
      setUsingLoyalty(false);
    }
  };

  const handleCheckout = () => {
    // Allow both guest and authenticated users to checkout
    navigate('/multi-step-checkout');
  };

  const getMaxLoyaltyPoints = () => {
    if (!user?.loyaltyPoints) return 0;
    const subtotal = getCartSubtotal();
    // Formula: 100 points = 100,000 VND → max points = subtotal / 1000
    // But limited to 20% of subtotal value
    const maxPointsForSubtotal = Math.floor(subtotal / 1000);
    const maxPointsFor20Percent = Math.floor((subtotal * 0.2) / 1000); // 20% of subtotal in points
    return Math.min(user.loyaltyPoints, maxPointsFor20Percent);
  };

  if (loading) {
    return <LoadingSpinner message="Loading cart..." />;
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <h4>Error Loading Cart</h4>
          <p>{error}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </Alert>
      </Container>
    );
  }

  if (isEmpty()) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <FaShoppingCart size={64} className="text-muted mb-4" />
          <h2 className="text-muted mb-3">Your cart is empty</h2>
          <p className="text-muted mb-4">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Button as={Link} to="/products" variant="primary" size="lg">
            Start Shopping
          </Button>
        </div>
      </Container>
    );
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
      <div className="d-flex align-items-center mb-4">
        <Button 
          variant="outline-secondary" 
          onClick={() => navigate(-1)}
          className="me-3"
        >
          <FaArrowLeft className="me-2" />
          Back
        </Button>
        <h2 className="mb-0">
          <FaShoppingCart className="me-2" />
          Shopping Cart ({cartItems.length} items)
        </h2>
      </div>

      <Row>
        {/* Cart Items */}
        <Col lg={8}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Cart Items</h5>
            </Card.Header>
            <Card.Body>
              {cartItems.map((item) => (
                <CartItem
                  key={`${item.product._id}-${item.variant?._id || 'default'}`}
                  item={item}
                  onUpdate={loadCart}
                  onRemove={loadCart}
                />
              ))}
            </Card.Body>
          </Card>
        </Col>

        {/* Order Summary */}
        <Col lg={4}>
          <Card className="sticky-top" style={{ top: '20px' }}>
            <Card.Header>
              <h5 className="mb-0">Order Summary</h5>
            </Card.Header>
            <Card.Body>
              {/* Subtotal */}
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              {/* Discount Code */}
              <div className="mb-3">
                <Form onSubmit={handleApplyDiscount}>
                  <Form.Label className="small text-muted">
                    <FaPercent className="me-1" />
                    Discount Code
                  </Form.Label>
                  <div className="input-group">
                    <Form.Control
                      type="text"
                      placeholder="Enter discount code"
                      value={discountCode}
                      onChange={(e) => {
                        setDiscountCode(e.target.value.toUpperCase());
                        setDiscountError('');
                        setDiscountSuccess('');
                        setValidationInfo(null);
                      }}
                      disabled={applyingDiscount || !!cart?.discountCode}
                      maxLength={5}
                    />
                    {cart?.discountCode ? (
                      <Button 
                        variant="outline-danger" 
                        onClick={handleRemoveDiscount}
                        disabled={applyingDiscount}
                        title="Remove discount code"
                      >
                        <FaTrash />
                      </Button>
                    ) : validationInfo ? (
                      <Button 
                        type="submit" 
                        variant="success"
                        disabled={applyingDiscount}
                      >
                        {applyingDiscount ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-1" />
                            Applying...
                          </>
                        ) : (
                          <>
                            <FaCheckCircle className="me-1" />
                            Apply
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button 
                        type="button"
                        variant="outline-primary"
                        onClick={handleValidateDiscount}
                        disabled={validatingDiscount || !discountCode.trim()}
                      >
                        {validatingDiscount ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-1" />
                            Checking...
                          </>
                        ) : (
                          'Validate'
                        )}
                      </Button>
                    )}
                  </div>
                </Form>
                
                {/* Validation Success */}
                {discountSuccess && !cart?.discountCode && (
                  <Alert variant="success" className="mt-2 mb-0 py-2 small">
                    <FaCheckCircle className="me-1" />
                    {discountSuccess}
                    {validationInfo && (
                      <div className="mt-1">
                        <small className="text-muted">
                          Type: {validationInfo.discountType === 'percentage' 
                            ? `${validationInfo.discountValue}% off` 
                            : formatPrice(validationInfo.discountValue)}
                          {' | '}
                          Remaining uses: {validationInfo.remainingUses}/{validationInfo.maxUses}
                        </small>
                      </div>
                    )}
                  </Alert>
                )}
                
                {/* Validation Error */}
                {discountError && (
                  <Alert variant="danger" className="mt-2 mb-0 py-2 small">
                    <FaExclamationCircle className="me-1" />
                    {discountError}
                  </Alert>
                )}
                
                {/* Applied Discount Badge */}
                {cart?.discountCode && (
                  <div className="mt-2">
                    <Badge bg="success" className="p-2">
                      <FaPercent className="me-1" />
                      {cart.discountCode} applied
                    </Badge>
                  </div>
                )}
              </div>

              {/* Loyalty Points */}
              {isAuthenticated && user?.loyaltyPoints > 0 && (
                <div className="mb-3">
                  <Form onSubmit={handleUseLoyaltyPoints}>
                    <div className="input-group">
                      <Form.Control
                        type="number"
                        placeholder="Loyalty points"
                        value={loyaltyPoints}
                        onChange={(e) => setLoyaltyPoints(parseInt(e.target.value) || 0)}
                        min="0"
                        max={getMaxLoyaltyPoints()}
                        disabled={usingLoyalty}
                      />
                      <Button 
                        type="submit" 
                        variant="outline-primary"
                        disabled={usingLoyalty || loyaltyPoints <= 0}
                      >
                        {usingLoyalty ? 'Using...' : 'Use'}
                      </Button>
                    </div>
                    <small className="text-muted d-block">
                      Available: {user.loyaltyPoints} points (≈ {formatPrice(user.loyaltyPoints * 1000)})
                    </small>
                    <small className="text-muted d-block">
                      Max usable: {getMaxLoyaltyPoints()} points for this order
                    </small>
                  </Form>
                </div>
              )}

              {/* Applied Discount */}
              {discount > 0 && (
                <div className="d-flex justify-content-between mb-2 text-success">
                  <span>Discount:</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}

              {/* Applied Loyalty Points */}
              {loyaltyPointsUsed > 0 && (
                <div className="d-flex justify-content-between mb-2 text-success">
                  <span>Loyalty Points:</span>
                  <span>-{formatPrice(loyaltyPointsUsed)}</span>
                </div>
              )}

              {/* Shipping */}
              <div className="d-flex justify-content-between mb-2">
                <span>Shipping:</span>
                <span>{shipping > 0 ? formatPrice(shipping) : 'Free'}</span>
              </div>

              {/* Tax */}
              <div className="d-flex justify-content-between mb-2">
                <span>Tax:</span>
                <span>{formatPrice(tax)}</span>
              </div>

              <hr />

              {/* Total */}
              <div className="d-flex justify-content-between mb-4">
                <strong>Total:</strong>
                <strong className="text-primary">{formatPrice(total)}</strong>
              </div>

              {/* Checkout Button */}
              <Button 
                variant="primary" 
                size="lg" 
                className="w-100 mb-3"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </Button>
              
              {/* Guest Checkout Info */}
              {!isAuthenticated && (
                <Alert variant="info" className="mb-3 small">
                  <FaLock className="me-2" />
                  You can checkout as a <strong>guest</strong> without creating an account!
                </Alert>
              )}

              {/* Continue Shopping */}
              <Button 
                as={Link} 
                to="/products" 
                variant="outline-primary" 
                className="w-100"
              >
                Continue Shopping
              </Button>

              {/* Security Badge */}
              <div className="text-center mt-3">
                <small className="text-muted">
                  <FaGift className="me-1" />
                  Secure checkout • Free shipping on orders over 500,000₫
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Cart;
