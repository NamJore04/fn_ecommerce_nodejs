import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Table } from 'react-bootstrap';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaHome, FaListAlt, FaShoppingCart } from 'react-icons/fa';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const PaymentComplete = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [orderCreated, setOrderCreated] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [error, setError] = useState('');
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    const createOrder = async () => {
      const { state } = location;
      
      if (!state || !state.success || !state.orderData) {
        const pendingOrder = localStorage.getItem('pendingVNPayOrder');
        if (!pendingOrder) {
          setError('Không tìm thấy thông tin đơn hàng');
          setLoading(false);
          return;
        }
        navigate('/checkout');
        return;
      }

      try {
        const orderData = state.orderData;
        
        const apiOrderData = {
          items: orderData.items,
          shippingAddress: orderData.shippingAddress,
          paymentMethod: 'bank_transfer',
          notes: orderData.notes || '',
          total: orderData.totals?.total || orderData.total,
          subtotal: orderData.totals?.subtotal || orderData.subtotal,
          discount: orderData.totals?.discount || 0,
          loyaltyPointsUsed: orderData.totals?.loyaltyPointsUsed || 0,
          shipping: orderData.totals?.shipping || 0,
          tax: orderData.totals?.tax || 0,
          transactionId: state.transactionId,
          bankName: state.bankName
        };

        if (!user && orderData.guestInfo) {
          apiOrderData.guestInfo = orderData.guestInfo;
        }

        const response = await api.post('/orders', apiOrderData);
        
        if (response.data && response.data.data) {
          setOrderNumber(response.data.data.orderNumber || response.data.data._id);
          setOrderDetails(response.data.data);
          setOrderCreated(true);
          
          localStorage.removeItem('pendingVNPayOrder');
          localStorage.removeItem('cart');
          
          window.dispatchEvent(new Event('cartUpdated'));
        }
      } catch (err) {
        console.error('Error creating order:', err);
        setError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn hàng');
      } finally {
        setLoading(false);
      }
    };

    createOrder();
  }, [location, navigate, user]);

  if (loading) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="shadow text-center py-5">
              <Card.Body>
                <Spinner animation="border" variant="primary" style={{ width: '4rem', height: '4rem' }} />
                <h4 className="mt-4">Đang tạo đơn hàng...</h4>
                <p className="text-muted">Vui lòng đợi trong giây lát</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="shadow text-center py-5">
              <Card.Body>
                <FaTimesCircle className="text-danger" style={{ fontSize: '5rem' }} />
                <h3 className="mt-4 text-danger">Đặt hàng thất bại</h3>
                <Alert variant="danger" className="mt-3">{error}</Alert>
                <div className="mt-4">
                  <Button variant="primary" onClick={() => navigate('/checkout')} className="me-2">
                    <FaShoppingCart className="me-2" />
                    Thử lại
                  </Button>
                  <Button variant="outline-secondary" onClick={() => navigate('/')}>
                    <FaHome className="me-2" />
                    Về trang chủ
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="shadow">
            <Card.Body className="text-center py-5">
              <FaCheckCircle className="text-success" style={{ fontSize: '5rem' }} />
              <h2 className="mt-4 text-success">Đặt hàng thành công!</h2>
              <p className="lead text-muted">
                Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được xác nhận.
              </p>
              
              <Alert variant="success" className="mt-4">
                <strong>Mã đơn hàng:</strong> #{orderNumber}
              </Alert>

              {orderDetails && (
                <Card className="mt-4 text-start">
                  <Card.Header className="bg-light">
                    <h5 className="mb-0">Chi tiết đơn hàng</h5>
                  </Card.Header>
                  <Card.Body>
                    <Table responsive>
                      <tbody>
                        <tr>
                          <td><strong>Phương thức thanh toán:</strong></td>
                          <td>Chuyển khoản ngân hàng</td>
                        </tr>
                        <tr>
                          <td><strong>Trạng thái thanh toán:</strong></td>
                          <td><span className="badge bg-success">Đã thanh toán</span></td>
                        </tr>
                        <tr>
                          <td><strong>Địa chỉ giao hàng:</strong></td>
                          <td>{orderDetails.shippingAddress}</td>
                        </tr>
                        <tr>
                          <td><strong>Tổng tiền:</strong></td>
                          <td className="text-danger fs-5 fw-bold">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(orderDetails.total)}
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              )}

              <div className="mt-4 d-flex justify-content-center gap-3 flex-wrap">
                <Button 
                  variant="primary" 
                  size="lg"
                  as={Link}
                  to={user ? '/orders' : '/'}
                >
                  <FaListAlt className="me-2" />
                  {user ? 'Xem đơn hàng của tôi' : 'Tiếp tục mua sắm'}
                </Button>
                <Button 
                  variant="outline-primary" 
                  size="lg"
                  as={Link}
                  to="/"
                >
                  <FaHome className="me-2" />
                  Về trang chủ
                </Button>
              </div>

              <Alert variant="info" className="mt-4 text-start">
                <strong>Lưu ý:</strong>
                <ul className="mb-0 mt-2">
                  <li>Email xác nhận đơn hàng đã được gửi đến địa chỉ email của bạn</li>
                  <li>Bạn có thể theo dõi trạng thái đơn hàng trong mục "Đơn hàng của tôi"</li>
                  <li>Thời gian giao hàng dự kiến: 3-5 ngày làm việc</li>
                </ul>
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PaymentComplete;
