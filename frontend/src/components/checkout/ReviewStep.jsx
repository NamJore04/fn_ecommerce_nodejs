import React from 'react';
import { Card, Button, Row, Col, ListGroup, Badge, Alert } from 'react-bootstrap';
import { FaArrowLeft, FaShippingFast, FaCreditCard, FaLock, FaCheckCircle } from 'react-icons/fa';
import { formatPrice, getImageUrl } from '../../utils/format';

const ReviewStep = ({ 
  formData, 
  cartItems, 
  subtotal, 
  discount, 
  loyaltyPointsUsed, 
  shipping, 
  tax, 
  total,
  cart,
  handleBack, 
  handleSubmit,
  loading 
}) => {
  const paymentMethodNames = {
    cod: 'Cash on Delivery',
    credit_card: 'Credit/Debit Card',
    bank_transfer: 'Bank Transfer',
    vnpay: 'VNPay'
  };

  return (
    <div>
      <div className="mb-4">
        <h4 className="mb-3">Review Your Order</h4>
        
        <Alert variant="warning" className="mb-3">
          <FaCheckCircle className="me-2" />
          Please review your order carefully before confirming. Once placed, you can track your order status in your account.
        </Alert>
      </div>

      <Row>
        <Col lg={8}>
          {/* Order Items */}
          <Card className="mb-3">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Order Items ({cartItems.length})</h5>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                {cartItems.map((item) => (
                  <ListGroup.Item key={`${item.product._id}-${item.variant?._id || 'default'}`}>
                    <div className="d-flex">
                      {item.product.images && item.product.images.length > 0 && (
                        <img 
                          src={getImageUrl(item.product.images[0])}
                          alt={item.product.name}
                          style={{ 
                            width: '80px', 
                            height: '80px', 
                            objectFit: 'cover',
                            borderRadius: '8px'
                          }}
                          className="me-3"
                        />
                      )}
                      <div className="flex-grow-1">
                        <h6 className="mb-1">{item.product.name}</h6>
                        {item.variant && (
                          <Badge bg="secondary" className="mb-1">{item.variant.name}</Badge>
                        )}
                        <div className="text-muted small">
                          Quantity: {item.quantity} × {formatPrice(item.product.basePrice + (item.variant?.additionalPrice || 0))}
                        </div>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold fs-5">
                          {formatPrice((item.product.basePrice + (item.variant?.additionalPrice || 0)) * item.quantity)}
                        </div>
                      </div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>

          {/* Shipping Information */}
          <Card className="mb-3">
            <Card.Header className="bg-light">
              <h5 className="mb-0">
                <FaShippingFast className="me-2" />
                Shipping Information
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-2">
                <strong>Name:</strong> {formData.fullName}
              </div>
              <div className="mb-2">
                <strong>Email:</strong> {formData.email}
              </div>
              {formData.phone && (
                <div className="mb-2">
                  <strong>Phone:</strong> {formData.phone}
                </div>
              )}
              <div className="mb-2">
                <strong>Address:</strong> {formData.shippingAddress}
              </div>
              {formData.notes && (
                <div className="mt-3 p-2 bg-light rounded">
                  <small className="text-muted">
                    <strong>Order Notes:</strong> {formData.notes}
                  </small>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Payment Method */}
          <Card className="mb-3">
            <Card.Header className="bg-light">
              <h5 className="mb-0">
                <FaCreditCard className="me-2" />
                Payment Method
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="fs-5 me-3">
                  {formData.paymentMethod === 'cod' && '💰'}
                  {formData.paymentMethod === 'credit_card' && '💳'}
                  {formData.paymentMethod === 'bank_transfer' && '🏦'}
                  {formData.paymentMethod === 'vnpay' && '🇻🇳'}
                </div>
                <div>
                  <strong>{paymentMethodNames[formData.paymentMethod]}</strong>
                  {formData.paymentMethod === 'cod' && (
                    <div className="small text-muted">Pay when you receive your order</div>
                  )}
                  {formData.paymentMethod === 'vnpay' && (
                    <div className="small text-muted">Pay via VNPay (ATM/Visa/MasterCard/QR Code)</div>
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Order Summary */}
        <Col lg={4}>
          <Card className="sticky-top" style={{ top: '100px' }}>
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Order Summary</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span className="fw-bold">{formatPrice(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="d-flex justify-content-between mb-2 text-success">
                  <span>
                    Discount
                    {cart?.discountCode && (
                      <Badge bg="success" className="ms-2">{cart.discountCode}</Badge>
                    )}
                  </span>
                  <span className="fw-bold">-{formatPrice(discount)}</span>
                </div>
              )}

              {loyaltyPointsUsed > 0 && (
                <div className="d-flex justify-content-between mb-2 text-success">
                  <span>
                    Loyalty Points
                    <Badge bg="info" className="ms-2">{loyaltyPointsUsed} pts</Badge>
                  </span>
                  <span className="fw-bold">-{formatPrice(loyaltyPointsUsed)}</span>
                </div>
              )}

              <div className="d-flex justify-content-between mb-2">
                <span>Shipping:</span>
                <span className="fw-bold">{shipping > 0 ? formatPrice(shipping) : 'Free'}</span>
              </div>

              <div className="d-flex justify-content-between mb-3">
                <span>Tax:</span>
                <span className="fw-bold">{formatPrice(tax)}</span>
              </div>

              <hr />

              <div className="d-flex justify-content-between mb-4">
                <strong className="fs-4">Total:</strong>
                <strong className="text-primary fs-4">{formatPrice(total)}</strong>
              </div>

              <div className="d-grid gap-2">
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Confirm Order'}
                </Button>
                
                <Button 
                  variant="outline-secondary"
                  onClick={handleBack}
                  disabled={loading}
                >
                  <FaArrowLeft className="me-2" /> Back to Payment
                </Button>
              </div>

              {/* Security Badge */}
              <div className="text-center mt-3">
                <small className="text-muted">
                  <FaLock className="me-1" />
                  Secure checkout • SSL encrypted
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ReviewStep;
