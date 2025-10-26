import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUniversity, FaMobileAlt, FaLock, FaArrowLeft, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const banks = [
  { id: 'vcb', name: 'Vietcombank', logo: '', color: '#006B3D' },
  { id: 'tcb', name: 'Techcombank', logo: '', color: '#EE0033' },
  { id: 'bidv', name: 'BIDV', logo: '', color: '#1A4D8F' },
  { id: 'mb', name: 'MB Bank', logo: '', color: '#00509E' },
  { id: 'acb', name: 'ACB', logo: '', color: '#1BA8E0' },
  { id: 'tpb', name: 'TPBank', logo: '', color: '#6B3FA0' },
  { id: 'vpb', name: 'VPBank', logo: '', color: '#00965E' },
  { id: 'vtb', name: 'VietinBank', logo: '', color: '#004A9C' }
];

const PaymentSimulation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState(1);
  const [selectedBank, setSelectedBank] = useState(null);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [paymentResult, setPaymentResult] = useState(null);
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    const pendingOrder = localStorage.getItem('pendingVNPayOrder');
    if (pendingOrder) {
      setOrderData(JSON.parse(pendingOrder));
    } else {
      navigate('/checkout');
    }
  }, [navigate]);

  useEffect(() => {
    let timer;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleBankSelect = (bank) => {
    setSelectedBank(bank);
    setError('');
  };

  const handleProceedToOTP = () => {
    if (!selectedBank) {
      setError('Vui lòng chọn ngân hàng');
      return;
    }
    setStep(2);
    setCountdown(60);
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();

    if (!otp || otp.length < 6) {
      setError('Vui lòng nhập mã OTP 6 số');
      return;
    }

    setStep(3);
    setError('');

    await new Promise(resolve => setTimeout(resolve, 2000));

    if (otp === '123456' || otp === '111111') {
      setPaymentResult({
        success: true,
        message: 'Thanh toán thành công!',
        transactionId: 'TXN' + Date.now(),
        bankName: selectedBank.name
      });
      setStep(4);

      setTimeout(() => {
        navigate('/payment/complete', {
          state: {
            success: true,
            orderData,
            transactionId: 'TXN' + Date.now(),
            bankName: selectedBank.name
          }
        });
      }, 2000);
    } else if (otp === '000000') {
      setPaymentResult({
        success: false,
        message: 'Thanh toán thất bại! Số dư không đủ.'
      });
      setStep(4);
    } else {
      setPaymentResult({
        success: false,
        message: 'Mã OTP không chính xác. Vui lòng thử lại.'
      });
      setStep(2);
      setOtp('');
      setError('Mã OTP không chính xác');
    }
  };

  const handleResendOTP = () => {
    setCountdown(60);
    setOtp('');
    setError('');
    alert('Mã OTP mới đã được gửi đến số điện thoại của bạn');
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setOtp('');
      setError('');
    } else if (step === 1) {
      navigate('/checkout');
    }
  };

  const handleRetry = () => {
    setStep(1);
    setSelectedBank(null);
    setOtp('');
    setError('');
    setPaymentResult(null);
  };

  const renderBankSelection = () => (
    <>
      <Card.Header className="bg-primary text-white">
        <h4 className="mb-0">
          <FaUniversity className="me-2" />
          Chọn ngân hàng thanh toán
        </h4>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <Row className="g-3">
          {banks.map(bank => (
            <Col key={bank.id} xs={6} md={3}>
              <Card
                className={`h-100 cursor-pointer ${selectedBank?.id === bank.id ? 'border-primary border-2' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => handleBankSelect(bank)}
              >
                <Card.Body className="text-center p-3">
                  <div style={{ fontSize: '2rem' }}>{bank.logo}</div>
                  <div className="fw-bold mt-2" style={{ fontSize: '0.85rem' }}>{bank.name}</div>
                  {selectedBank?.id === bank.id && (
                    <FaCheckCircle className="text-primary mt-2" />
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {orderData && (
          <div className="mt-4 p-3 bg-light rounded">
            <h6>Thông tin thanh toán:</h6>
            <p className="mb-1">
              <strong>Số tiền:</strong>{' '}
              <span className="text-danger fs-5">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(orderData.totals?.total || orderData.total || 0)}
              </span>
            </p>
          </div>
        )}

        <div className="d-flex justify-content-between mt-4">
          <Button variant="outline-secondary" onClick={handleBack}>
            <FaArrowLeft className="me-2" />
            Quay lại
          </Button>
          <Button
            variant="primary"
            onClick={handleProceedToOTP}
            disabled={!selectedBank}
          >
            Tiếp tục
          </Button>
        </div>
      </Card.Body>
    </>
  );

  const renderOTPInput = () => (
    <>
      <Card.Header className="bg-primary text-white">
        <h4 className="mb-0">
          <FaMobileAlt className="me-2" />
          Xác thực OTP
        </h4>
      </Card.Header>
      <Card.Body>
        <Alert variant="info">
          <FaLock className="me-2" />
          Mã OTP đã được gửi đến số điện thoại đăng ký với ngân hàng {selectedBank?.name}
        </Alert>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleOTPSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Nhập mã OTP (6 số)</Form.Label>
            <InputGroup>
              <Form.Control
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="Nhập mã OTP"
                className="text-center fs-4 letter-spacing-2"
                autoFocus
              />
            </InputGroup>
            <Form.Text className="text-muted">
              Mã OTP hết hạn sau: <strong className={countdown < 30 ? 'text-danger' : ''}>{countdown}s</strong>
            </Form.Text>
          </Form.Group>

          <Alert variant="warning" className="small">
            <strong>Demo:</strong> Nhập <code>123456</code> hoặc <code>111111</code> để thanh toán thành công,
            <code>000000</code> để giả lập thất bại.
          </Alert>

          <div className="d-flex justify-content-between align-items-center">
            <Button variant="outline-secondary" onClick={handleBack}>
              <FaArrowLeft className="me-2" />
              Quay lại
            </Button>
            <div>
              <Button
                variant="link"
                onClick={handleResendOTP}
                disabled={countdown > 0}
                className="me-2"
              >
                Gửi lại OTP
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={otp.length < 6}
              >
                Xác nhận
              </Button>
            </div>
          </div>
        </Form>
      </Card.Body>
    </>
  );

  const renderProcessing = () => (
    <>
      <Card.Body className="text-center py-5">
        <Spinner animation="border" variant="primary" style={{ width: '4rem', height: '4rem' }} />
        <h4 className="mt-4">Đang xử lý thanh toán...</h4>
        <p className="text-muted">Vui lòng không đóng trang này</p>
      </Card.Body>
    </>
  );

  const renderResult = () => (
    <>
      <Card.Body className="text-center py-5">
        {paymentResult?.success ? (
          <>
            <FaCheckCircle className="text-success" style={{ fontSize: '5rem' }} />
            <h3 className="mt-4 text-success">Thanh toán thành công!</h3>
            <p className="text-muted">Đang chuyển đến trang xác nhận đơn hàng...</p>
            <Spinner animation="border" size="sm" className="mt-2" />
          </>
        ) : (
          <>
            <FaTimesCircle className="text-danger" style={{ fontSize: '5rem' }} />
            <h3 className="mt-4 text-danger">{paymentResult?.message}</h3>
            <div className="mt-4">
              <Button variant="primary" onClick={handleRetry} className="me-2">
                Thử lại
              </Button>
              <Button variant="outline-secondary" onClick={() => navigate('/checkout')}>
                Quay về giỏ hàng
              </Button>
            </div>
          </>
        )}
      </Card.Body>
    </>
  );

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow">
            {step === 1 && renderBankSelection()}
            {step === 2 && renderOTPInput()}
            {step === 3 && renderProcessing()}
            {step === 4 && renderResult()}
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PaymentSimulation;
