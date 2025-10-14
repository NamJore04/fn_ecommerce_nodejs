import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Row, Col, ListGroup, Badge, Alert } from 'react-bootstrap';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FaCheckCircle, FaShoppingBag, FaHome, FaTruck, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { api } from '../services/api';
import { formatPrice, getImageUrl } from '../utils/format';

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId } = useParams();
  const { isAuthenticated } = useAuth();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        // First check if order data was passed via navigation state
        if (location.state?.orderData && location.state?.fromCheckout) {
          setOrder(location.state.orderData);
          setLoading(false);
          return;
        }

        // Otherwise fetch from API
        if (orderId) {
          const response = await api.get(`/orders/${orderId}`);
          setOrder(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        setError('Unable to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, location.state]);

  const getPaymentMethodName = (method) => {
    const methods = {
      cod: 'Cash on Delivery',
      credit_card: 'Credit/Debit Card',
      bank_transfer: 'Bank Transfer',
      vnpay: 'VNPay'
    };
    return methods[method] || method;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'warning', text: 'Pending' },
      confirmed: { bg: 'info', text: 'Confirmed' },
      processing: { bg: 'primary', text: 'Processing' },
      shipping: { bg: 'primary', text: 'Shipping' },
      delivered: { bg: 'success', text: 'Delivered' },
      cancelled: { bg: 'danger', text: 'Cancelled' },
      returned: { bg: 'secondary', text: 'Returned' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  if (loading) {
    return <LoadingSpinner message="Loading order details..." />;
  }

  if (error || !order) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center">
          <h4>{error || 'Order not found'}</h4>
          <Button variant="primary" onClick={() => navigate('/')}>
            Return to Home
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      {/* Success Header */}
      <div className="text-center mb-5">
        <div className="mb-4">
          <FaCheckCircle size={80} className="text-success mb-3 animate-pulse" />
          <h1 className="text-success mb-2">Order Placed Successfully!</h1>
          <p className="lead text-muted">
            Thank you for your purchase. Your order has been received and is being processed.
          </p>
        </div>

        {/* Order Number */}
        <Card className="mb-4 shadow-sm">
          <Card.Body className="py-4">
            <Row className="align-items-center">
              <Col md={6} className="text-md-start text-center mb-3 mb-md-0">
                <h5 className="mb-0">Order Number</h5>
                <h3 className="text-primary mb-0">{order.orderNumber}</h3>
              </Col>
              <Col md={6} className="text-md-end text-center">
                <p className="mb-1 text-muted">Status</p>
                <h4 className="mb-0">{getStatusBadge(order.status)}</h4>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Email Confirmation Notice */}
        <Alert variant="info">
          <FaEnvelope className="me-2" />
          A confirmation email has been sent to <strong>{order.shippingAddress?.email || order.user?.email || order.guestInfo?.email || 'your email'}</strong>
        </Alert>
      </div>

      <Row>
        {/* Order Details */}
        <Col lg={8}>
          {/* Order Items */}
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">
                <FaShoppingBag className="me-2" />
                Order Items
              </h5>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                {order.items?.map((item, index) => (
                  <ListGroup.Item key={index} className="px-0">
                    <Row className="align-items-center">
                      <Col xs={2} md={1}>
                        <img 
                          src={item.image 
                            ? getImageUrl(item.image)
                            : item.product?.images?.length > 0 
                              ? getImageUrl(item.product.images[0])
                              : '/placeholder.jpg'
                          }
                          alt={item.productName || item.product?.name || 'Product'}
                          className="img-fluid rounded"
                          style={{ maxHeight: '60px', width: '60px', objectFit: 'cover' }}
                          onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                        />
                      </Col>
                      <Col xs={6} md={7}>
                        <h6 className="mb-1">{item.productName || item.product?.name}</h6>
                        {(item.variantName || item.variant) && (
                          <Badge bg="secondary" className="me-2">{item.variantName || item.variant?.name}</Badge>
                        )}
                        <div className="small text-muted">
                          Quantity: {item.quantity}
                        </div>
                      </Col>
                      <Col xs={4} className="text-end">
                        <strong>{formatPrice(item.price * item.quantity)}</strong>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>

          {/* Shipping Information */}
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">
                <FaTruck className="me-2" />
                Shipping Information
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <strong>Delivery Address:</strong>
                <div className="mt-2">
                  <FaMapMarkerAlt className="text-primary me-2" />
                  {typeof order.shippingAddress === 'string' 
                    ? order.shippingAddress 
                    : order.shippingAddress && (
                        <>
                          {order.shippingAddress.fullName && <div className="fw-bold">{order.shippingAddress.fullName}</div>}
                          {order.shippingAddress.street && <div>{order.shippingAddress.street}</div>}
                          <div>
                            {[order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.zipCode]
                              .filter(Boolean).join(', ')}
                          </div>
                          {order.shippingAddress.country && <div>{order.shippingAddress.country}</div>}
                        </>
                      )
                  }
                </div>
              </div>
              
              <div className="mb-3">
                <strong>Contact Information:</strong>
                <div className="mt-2">
                  <div className="mb-1">
                    <FaEnvelope className="text-primary me-2" />
                    {order.shippingAddress?.email || order.user?.email || order.guestInfo?.email || 'N/A'}
                  </div>
                  {(order.shippingAddress?.phone || order.user?.phone || order.guestInfo?.phone) && (
                    <div>
                      <FaPhone className="text-primary me-2" />
                      {order.shippingAddress?.phone || order.user?.phone || order.guestInfo?.phone}
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-3">
                <strong>Need Help?</strong>
                <div className="mt-2">
                  <div className="mb-1">
                    <FaEnvelope className="text-success me-2" />
                    <a href="mailto:namhuynhfree@gmail.com" className="text-decoration-none">namhuynhfree@gmail.com</a>
                  </div>
                </div>
              </div>

              {order.notes && (
                <div>
                  <strong>Order Notes:</strong>
                  <div className="mt-2 p-3 bg-light rounded">
                    {order.notes}
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Order Summary */}
        <Col lg={4}>
          <Card className="mb-4 shadow-sm sticky-top" style={{ top: '100px' }}>
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Order Summary</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>

              {order.discount > 0 && (
                <div className="d-flex justify-content-between mb-2 text-success">
                  <span>Discount:</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}

              {order.loyaltyPointsUsed > 0 && (
                <div className="d-flex justify-content-between mb-2 text-success">
                  <span>Loyalty Points:</span>
                  <span>-{formatPrice(order.loyaltyPointsUsed)}</span>
                </div>
              )}

              <div className="d-flex justify-content-between mb-2">
                <span>Shipping:</span>
                <span>{order.shipping > 0 ? formatPrice(order.shipping) : 'Free'}</span>
              </div>

              <div className="d-flex justify-content-between mb-3">
                <span>Tax:</span>
                <span>{formatPrice(order.tax)}</span>
              </div>

              <hr />

              <div className="d-flex justify-content-between mb-3">
                <strong className="fs-5">Total:</strong>
                <strong className="text-primary fs-5">{formatPrice(order.total)}</strong>
              </div>

              <div className="mb-3">
                <strong>Payment Method:</strong>
                <div className="mt-2">
                  {order.paymentMethod === 'cod' && '💰'}
                  {order.paymentMethod === 'credit_card' && '💳'}
                  {order.paymentMethod === 'bank_transfer' && '🏦'}
                  {order.paymentMethod === 'vnpay' && '🇻🇳'}
                  <span className="ms-2">{getPaymentMethodName(order.paymentMethod)}</span>
                </div>
              </div>

              <hr />

              <div className="d-grid gap-2">
                <Button variant="primary" onClick={() => navigate('/products')}>
                  <FaShoppingBag className="me-2" />
                  Continue Shopping
                </Button>
                
                {isAuthenticated && (
                  <Button variant="outline-primary" onClick={() => navigate('/orders')}>
                    View My Orders
                  </Button>
                )}
                
                <Button variant="outline-secondary" onClick={() => navigate('/')}>
                  <FaHome className="me-2" />
                  Back to Home
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Estimated Delivery */}
          <Card className="shadow-sm">
            <Card.Body className="text-center">
              <FaTruck size={40} className="text-primary mb-3" />
              <h6>Estimated Delivery</h6>
              <p className="text-muted mb-0">
                {order.paymentMethod === 'cod' ? '3-5 business days' : '5-7 business days'}
              </p>
              <small className="text-muted">
                You will receive tracking information via email
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default OrderSuccess;
