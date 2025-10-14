import React from 'react';
import { Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { FaArrowLeft, FaArrowRight, FaMoneyBillWave, FaCheckCircle } from 'react-icons/fa';

// VNPay Logo component
const VNPayLogo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="4" fill="#0066B3"/>
    <text x="5" y="21" fill="white" fontSize="10" fontWeight="bold">VN</text>
  </svg>
);

const PaymentStep = ({ formData, handleChange, handleNext, handleBack }) => {
  const paymentMethods = [
    { 
      id: 'cod', 
      name: 'Thanh toán khi nhận hàng (COD)', 
      icon: <FaMoneyBillWave size={32} className="text-success" />,
      description: 'Thanh toán bằng tiền mặt khi nhận hàng',
      recommended: true
    },
    { 
      id: 'vnpay', 
      name: 'Thanh toán qua VNPay', 
      icon: <VNPayLogo />,
      description: 'Thanh toán qua cổng VNPay (ATM/Visa/MasterCard/QR Code)',
      recommended: false
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    handleNext();
  };

  return (
    <Form onSubmit={handleSubmit}>
      <div className="mb-4">
        <h4 className="mb-3">Payment Method</h4>
        
        <Alert variant="info" className="mb-3">
          <strong>Note:</strong> Your payment information is secure and encrypted. We support multiple payment methods for your convenience.
        </Alert>

        <Row className="g-3">
          {paymentMethods.map((method) => (
            <Col md={12} key={method.id}>
              <Card 
                className={`payment-method-card ${formData.paymentMethod === method.id ? 'selected' : ''}`}
                style={{ 
                  cursor: 'pointer',
                  border: formData.paymentMethod === method.id ? '2px solid #0d6efd' : '1px solid #dee2e6',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => handleChange({ target: { name: 'paymentMethod', value: method.id } })}
              >
                <Card.Body className="p-3">
                  <div className="d-flex align-items-center">
                    <Form.Check
                      type="radio"
                      id={method.id}
                      name="paymentMethod"
                      value={method.id}
                      checked={formData.paymentMethod === method.id}
                      onChange={handleChange}
                      className="me-3"
                    />
                    
                    <div className="payment-icon text-primary me-3">
                      {method.icon}
                    </div>
                    
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center">
                        <strong className="me-2">{method.name}</strong>
                        {method.recommended && (
                          <span className="badge bg-success">Recommended</span>
                        )}
                      </div>
                      <small className="text-muted">{method.description}</small>
                    </div>
                    
                    {formData.paymentMethod === method.id && (
                      <FaCheckCircle className="text-primary" size={24} />
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Payment Method Details */}
        {formData.paymentMethod === 'cod' && (
          <Alert variant="success" className="mt-3">
            <strong>Thanh toán khi nhận hàng:</strong> Bạn sẽ thanh toán bằng tiền mặt khi nhận được hàng. Vui lòng chuẩn bị tiền đúng số tiền nếu có thể.
          </Alert>
        )}

        {formData.paymentMethod === 'vnpay' && (
          <Alert variant="info" className="mt-3">
            <strong>Thanh toán VNPay:</strong> Sau khi xác nhận đơn hàng, bạn sẽ được chuyển đến cổng thanh toán VNPay để hoàn tất giao dịch. Hỗ trợ ATM nội địa, Visa, MasterCard, JCB và QR Code.
          </Alert>
        )}
      </div>

      <div className="d-flex justify-content-between">
        <Button variant="outline-secondary" size="lg" onClick={handleBack}>
          <FaArrowLeft className="me-2" /> Back to Shipping
        </Button>
        <Button type="submit" variant="primary" size="lg">
          Review Order <FaArrowRight className="ms-2" />
        </Button>
      </div>
    </Form>
  );
};

export default PaymentStep;
