import React, { useEffect, useState } from 'react';
import { Container, Card, Alert, Button, Spinner } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaHome, FaListAlt } from 'react-icons/fa';
import { api } from '../services/api';
import { useCart } from '../contexts/CartContext';

const VNPayReturn = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('');
  const [orderId, setOrderId] = useState(null);
  const { clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const processPaymentResult = async () => {
      // Prevent double processing
      if (isProcessing) return;
      setIsProcessing(true);
      
      const payment = searchParams.get('payment');
      const errorMessage = searchParams.get('message');
      const vnpResponseCode = searchParams.get('vnp_ResponseCode');
      const vnpTransactionNo = searchParams.get('vnp_TransactionNo');
      
      if (payment === 'success' || vnpResponseCode === '00') {
        // Get pending order data from localStorage
        const pendingOrderData = localStorage.getItem('pendingVnpayOrder');
        
        // Check if order was already created (prevent duplicate)
        const orderCreated = localStorage.getItem('vnpayOrderCreated');
        if (orderCreated === vnpTransactionNo) {
          setStatus('success');
          setMessage('Đơn hàng đã được tạo thành công!');
          return;
        }
        
        if (pendingOrderData) {
          try {
            const orderData = JSON.parse(pendingOrderData);
            
            // Add VNPay transaction info
            orderData.vnpayTransactionNo = vnpTransactionNo;
            orderData.paymentStatus = 'paid';
            
            // Mark as creating to prevent duplicates
            localStorage.setItem('vnpayOrderCreated', vnpTransactionNo);
            
            // Create order now that payment is successful
            const response = await api.post('/orders', orderData);
            const createdOrder = response.data.data.order || response.data.data;
            
            // Clear pending order data and cart
            localStorage.removeItem('pendingVnpayOrder');
            await clearCart();
            localStorage.removeItem('guestSessionId');
            
            setOrderId(createdOrder._id || createdOrder.id);
            setStatus('success');
            setMessage('Thanh toán thành công! Đơn hàng của bạn đã được tạo và xác nhận.');
          } catch (error) {
            console.error('Failed to create order after VNPay success:', error);
            // Check if it's a duplicate error (order already exists)
            if (error.response?.status === 400 || error.response?.data?.message?.includes('duplicate')) {
              setStatus('success');
              setMessage('Đơn hàng đã được tạo trước đó.');
            } else {
              setStatus('failed');
              setMessage('Thanh toán thành công nhưng không thể tạo đơn hàng. Vui lòng liên hệ hỗ trợ.');
            }
          }
        } else {
          setStatus('success');
          setMessage('Thanh toán thành công!');
        }
      } else if (payment === 'failed' || (vnpResponseCode && vnpResponseCode !== '00')) {
        // Payment failed - remove pending order data
        localStorage.removeItem('pendingVnpayOrder');
        localStorage.removeItem('vnpayOrderCreated');
        setStatus('failed');
        setMessage(errorMessage || 'Thanh toán không thành công. Vui lòng thử lại.');
      } else {
        setStatus('unknown');
        setMessage('Không thể xác định trạng thái thanh toán.');
      }
    };
    
    processPaymentResult();
  }, [searchParams, clearCart, isProcessing]);

  if (status === 'processing') {
    return (
      <Container className="py-5">
        <Card className="text-center p-5">
          <Card.Body>
            <Spinner animation="border" variant="primary" className="mb-3" />
            <h4>Đang xử lý kết quả thanh toán...</h4>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Card className="text-center p-5">
        <Card.Body>
          {status === 'success' ? (
            <>
              <FaCheckCircle size={80} className="text-success mb-4" />
              <h2 className="text-success mb-3">Thanh Toán Thành Công!</h2>
              <Alert variant="success">
                {message}
              </Alert>
            </>
          ) : (
            <>
              <FaTimesCircle size={80} className="text-danger mb-4" />
              <h2 className="text-danger mb-3">Thanh Toán Thất Bại</h2>
              <Alert variant="danger">
                {message}
              </Alert>
            </>
          )}
          
          <div className="d-flex justify-content-center gap-3 mt-4">
            <Button variant="primary" onClick={() => navigate('/')}>
              <FaHome className="me-2" /> Về Trang Chủ
            </Button>
            {status === 'success' && orderId ? (
              <Button variant="outline-primary" onClick={() => navigate(`/order-success/${orderId}`)}>
                <FaListAlt className="me-2" /> Xem Chi Tiết Đơn Hàng
              </Button>
            ) : (
              <Button variant="outline-primary" onClick={() => navigate('/cart')}>
                <FaListAlt className="me-2" /> Quay Lại Giỏ Hàng
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default VNPayReturn;
