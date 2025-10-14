import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Badge, Spinner } from 'react-bootstrap';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaCreditCard, FaUniversity, FaQrcode, FaCheckCircle, FaTimesCircle, FaShieldAlt, FaLock } from 'react-icons/fa';
import { formatPrice } from '../utils/format';

const VNPaySimulator = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState('ATM');
  const [selectedBank, setSelectedBank] = useState('');
  const [cardNumber, setCardNumber] = useState('9704198526191432198');
  const [cardHolder, setCardHolder] = useState('NGUYEN VAN A');
  const [expiryDate, setExpiryDate] = useState('07/15');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: Select method, 2: Enter card, 3: OTP, 4: Result
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  // Parse VNPay params from URL
  useEffect(() => {
    const amount = searchParams.get('vnp_Amount');
    const orderInfo = searchParams.get('vnp_OrderInfo');
    const txnRef = searchParams.get('vnp_TxnRef');
    const returnUrl = searchParams.get('vnp_ReturnUrl');

    if (amount && txnRef) {
      setPaymentInfo({
        amount: parseInt(amount) / 100, // VNPay amount is multiplied by 100
        orderInfo: decodeURIComponent(orderInfo || ''),
        txnRef,
        returnUrl: decodeURIComponent(returnUrl || '')
      });
    }
    setLoading(false);
  }, [searchParams]);

  const banks = [
    { code: 'NCB', name: 'Ngân hàng NCB', logo: '🏦' },
    { code: 'VIETCOMBANK', name: 'Vietcombank', logo: '🏦' },
    { code: 'VIETINBANK', name: 'VietinBank', logo: '🏦' },
    { code: 'BIDV', name: 'BIDV', logo: '🏦' },
    { code: 'AGRIBANK', name: 'Agribank', logo: '🏦' },
    { code: 'SACOMBANK', name: 'Sacombank', logo: '🏦' },
    { code: 'TECHCOMBANK', name: 'Techcombank', logo: '🏦' },
    { code: 'MBBANK', name: 'MB Bank', logo: '🏦' },
  ];

  const paymentMethods = [
    { id: 'ATM', name: 'Thẻ ATM nội địa', icon: <FaCreditCard />, desc: 'Thẻ ATM/Tài khoản ngân hàng' },
    { id: 'CREDIT', name: 'Thẻ quốc tế', icon: <FaCreditCard />, desc: 'Visa, MasterCard, JCB' },
    { id: 'QRCODE', name: 'QR Code', icon: <FaQrcode />, desc: 'Quét mã QR để thanh toán' },
  ];

  const handleSelectBank = (bankCode) => {
    setSelectedBank(bankCode);
    setStep(2);
  };

  const handleSubmitCard = (e) => {
    e.preventDefault();
    if (!cardNumber || !cardHolder || !expiryDate) {
      setError('Vui lòng điền đầy đủ thông tin thẻ');
      return;
    }
    setError('');
    setProcessing(true);
    
    // Simulate processing
    setTimeout(() => {
      setProcessing(false);
      setStep(3);
    }, 1500);
  };

  const handleSubmitOTP = (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setError('Vui lòng nhập mã OTP 6 số');
      return;
    }
    setError('');
    setProcessing(true);

    // Simulate OTP verification
    setTimeout(() => {
      setProcessing(false);
      setStep(4);
    }, 2000);
  };

  const handlePaymentResult = (success) => {
    if (!paymentInfo) return;

    // Build return URL with VNPay response params
    const params = new URLSearchParams();
    params.append('vnp_Amount', (paymentInfo.amount * 100).toString());
    params.append('vnp_BankCode', selectedBank || 'NCB');
    params.append('vnp_BankTranNo', `VNP${Date.now()}`);
    params.append('vnp_CardType', selectedMethod);
    params.append('vnp_OrderInfo', paymentInfo.orderInfo);
    params.append('vnp_PayDate', formatVNPayDate(new Date()));
    params.append('vnp_ResponseCode', success ? '00' : '24'); // 00 = success, 24 = cancelled
    params.append('vnp_TmnCode', 'CGXZLS0Z');
    params.append('vnp_TransactionNo', Math.floor(Math.random() * 100000000).toString());
    params.append('vnp_TransactionStatus', success ? '00' : '02');
    params.append('vnp_TxnRef', paymentInfo.txnRef);
    params.append('vnp_SecureHash', 'SIMULATED_HASH_' + Date.now());

    // Redirect to return URL
    const returnUrl = paymentInfo.returnUrl || 'http://localhost:5000/api/payment/vnpay/return';
    window.location.href = `${returnUrl}?${params.toString()}`;
  };

  const formatVNPayDate = (date) => {
    const pad = (n) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
  };

  const handleCancel = () => {
    handlePaymentResult(false);
  };

  // Show loading while parsing params
  if (loading) {
    return (
      <div style={{ backgroundColor: '#1a1a2e', minHeight: '100vh', paddingTop: '100px' }}>
        <Container className="text-center">
          <Spinner animation="border" variant="danger" size="lg" />
          <p className="text-white mt-3">Đang tải thông tin thanh toán...</p>
        </Container>
      </div>
    );
  }

  if (!paymentInfo) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <h4>Không tìm thấy thông tin thanh toán</h4>
          <p>Vui lòng thử lại từ trang thanh toán.</p>
          <Button variant="primary" onClick={() => navigate('/')}>
            Về trang chủ
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <div style={{ backgroundColor: '#1a1a2e', minHeight: '100vh', paddingTop: '20px' }}>
      <Container>
        {/* Header */}
        <div className="text-center mb-4">
          <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
            <img 
              src="https://vnpay.vn/s1/statics.vnpay.vn/2023/9/06ncktiwd6dc1694418196384.png" 
              alt="VNPAY" 
              style={{ height: '40px' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <h3 className="text-danger mb-0 fw-bold">VNPAY</h3>
            <Badge bg="warning" text="dark">SANDBOX</Badge>
          </div>
          <small className="text-muted">Cổng thanh toán giả lập</small>
        </div>

        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            {/* Order Info Card */}
            <Card className="mb-4 border-0" style={{ backgroundColor: '#16213e' }}>
              <Card.Body className="text-white">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted">Mã đơn hàng:</span>
                  <strong>{paymentInfo.txnRef}</strong>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted">Nội dung:</span>
                  <span className="text-truncate ms-2" style={{ maxWidth: '200px' }}>
                    {paymentInfo.orderInfo}
                  </span>
                </div>
                <hr className="border-secondary" />
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted">Số tiền:</span>
                  <h4 className="text-danger mb-0 fw-bold">{formatPrice(paymentInfo.amount)}</h4>
                </div>
              </Card.Body>
            </Card>

            {/* Step 1: Select Payment Method */}
            {step === 1 && (
              <Card className="border-0" style={{ backgroundColor: '#16213e' }}>
                <Card.Header className="border-0 bg-transparent text-white">
                  <h5 className="mb-0">Chọn phương thức thanh toán</h5>
                </Card.Header>
                <Card.Body>
                  <div className="mb-4">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className={`p-3 mb-2 rounded cursor-pointer ${selectedMethod === method.id ? 'border border-primary' : 'border border-secondary'}`}
                        style={{ 
                          backgroundColor: selectedMethod === method.id ? '#1f4068' : '#0f3460',
                          cursor: 'pointer'
                        }}
                        onClick={() => setSelectedMethod(method.id)}
                      >
                        <div className="d-flex align-items-center text-white">
                          <span className="me-3 fs-4">{method.icon}</span>
                          <div>
                            <div className="fw-bold">{method.name}</div>
                            <small className="text-muted">{method.desc}</small>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedMethod === 'ATM' && (
                    <>
                      <h6 className="text-white mb-3">Chọn ngân hàng</h6>
                      <Row>
                        {banks.map((bank) => (
                          <Col xs={6} md={4} key={bank.code} className="mb-2">
                            <div
                              className={`p-2 text-center rounded border ${selectedBank === bank.code ? 'border-primary bg-primary' : 'border-secondary'}`}
                              style={{ cursor: 'pointer', backgroundColor: selectedBank === bank.code ? '#1f4068' : '#0f3460' }}
                              onClick={() => handleSelectBank(bank.code)}
                            >
                              <div className="fs-4">{bank.logo}</div>
                              <small className="text-white">{bank.code}</small>
                            </div>
                          </Col>
                        ))}
                      </Row>
                    </>
                  )}

                  {selectedMethod === 'QRCODE' && (
                    <div className="text-center py-4">
                      <div className="bg-white p-4 d-inline-block rounded mb-3">
                        <FaQrcode size={150} className="text-dark" />
                      </div>
                      <p className="text-white">Quét mã QR bằng ứng dụng ngân hàng</p>
                      <Button variant="success" onClick={() => setStep(4)}>
                        Đã thanh toán xong
                      </Button>
                    </div>
                  )}

                  {selectedMethod === 'CREDIT' && (
                    <Button variant="primary" className="w-100" onClick={() => setStep(2)}>
                      Tiếp tục với thẻ quốc tế
                    </Button>
                  )}

                  <hr className="border-secondary my-4" />
                  <Button variant="outline-danger" className="w-100" onClick={handleCancel}>
                    Hủy thanh toán
                  </Button>
                </Card.Body>
              </Card>
            )}

            {/* Step 2: Enter Card Info */}
            {step === 2 && (
              <Card className="border-0" style={{ backgroundColor: '#16213e' }}>
                <Card.Header className="border-0 bg-transparent text-white d-flex align-items-center">
                  <Button variant="link" className="text-white p-0 me-3" onClick={() => setStep(1)}>
                    ← Quay lại
                  </Button>
                  <h5 className="mb-0">Nhập thông tin thẻ</h5>
                </Card.Header>
                <Card.Body>
                  {error && <Alert variant="danger">{error}</Alert>}
                  
                  <Alert variant="info" className="small">
                    <FaShieldAlt className="me-2" />
                    <strong>Thẻ test:</strong> 9704198526191432198 | NGUYEN VAN A | 07/15
                  </Alert>

                  <Form onSubmit={handleSubmitCard}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-white">Số thẻ</Form.Label>
                      <Form.Control
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="Nhập số thẻ"
                        maxLength={19}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="text-white">Tên chủ thẻ</Form.Label>
                      <Form.Control
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                        placeholder="NGUYEN VAN A"
                      />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label className="text-white">Ngày hết hạn</Form.Label>
                      <Form.Control
                        type="text"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        placeholder="MM/YY"
                        maxLength={5}
                      />
                    </Form.Group>

                    <Button 
                      type="submit" 
                      variant="danger" 
                      className="w-100"
                      disabled={processing}
                    >
                      {processing ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <FaLock className="me-2" />
                          Tiếp tục
                        </>
                      )}
                    </Button>
                  </Form>

                  <hr className="border-secondary my-4" />
                  <Button variant="outline-danger" className="w-100" onClick={handleCancel}>
                    Hủy thanh toán
                  </Button>
                </Card.Body>
              </Card>
            )}

            {/* Step 3: OTP */}
            {step === 3 && (
              <Card className="border-0" style={{ backgroundColor: '#16213e' }}>
                <Card.Header className="border-0 bg-transparent text-white">
                  <h5 className="mb-0">Xác thực OTP</h5>
                </Card.Header>
                <Card.Body>
                  {error && <Alert variant="danger">{error}</Alert>}
                  
                  <Alert variant="success">
                    Mã OTP đã được gửi đến số điện thoại ****5763
                  </Alert>

                  <Alert variant="info" className="small">
                    <strong>OTP test:</strong> Nhập bất kỳ 6 số nào (VD: 123456)
                  </Alert>

                  <Form onSubmit={handleSubmitOTP}>
                    <Form.Group className="mb-4">
                      <Form.Label className="text-white">Nhập mã OTP</Form.Label>
                      <Form.Control
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="Nhập 6 số"
                        maxLength={6}
                        className="text-center fs-4 letter-spacing-2"
                        style={{ letterSpacing: '0.5em' }}
                      />
                    </Form.Group>

                    <Button 
                      type="submit" 
                      variant="danger" 
                      className="w-100"
                      disabled={processing}
                    >
                      {processing ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Đang xác thực...
                        </>
                      ) : (
                        'Xác nhận thanh toán'
                      )}
                    </Button>
                  </Form>

                  <hr className="border-secondary my-4" />
                  <Button variant="outline-danger" className="w-100" onClick={handleCancel}>
                    Hủy thanh toán
                  </Button>
                </Card.Body>
              </Card>
            )}

            {/* Step 4: Result */}
            {step === 4 && (
              <Card className="border-0 text-center" style={{ backgroundColor: '#16213e' }}>
                <Card.Body className="py-5">
                  <div className="mb-4">
                    <FaCheckCircle size={80} className="text-success" />
                  </div>
                  <h4 className="text-success mb-3">Thanh toán thành công!</h4>
                  <p className="text-muted mb-4">
                    Giao dịch của bạn đã được xử lý thành công.
                  </p>
                  
                  <div className="bg-dark p-3 rounded mb-4">
                    <div className="d-flex justify-content-between text-white mb-2">
                      <span>Số tiền:</span>
                      <strong className="text-success">{formatPrice(paymentInfo.amount)}</strong>
                    </div>
                    <div className="d-flex justify-content-between text-white mb-2">
                      <span>Mã giao dịch:</span>
                      <strong>{paymentInfo.txnRef}</strong>
                    </div>
                    <div className="d-flex justify-content-between text-white">
                      <span>Ngân hàng:</span>
                      <strong>{selectedBank || 'NCB'}</strong>
                    </div>
                  </div>

                  <Button 
                    variant="success" 
                    size="lg" 
                    className="w-100"
                    onClick={() => handlePaymentResult(true)}
                  >
                    Hoàn tất
                  </Button>
                </Card.Body>
              </Card>
            )}

            {/* Security Footer */}
            <div className="text-center mt-4 pb-4">
              <div className="d-flex justify-content-center align-items-center gap-3 text-muted">
                <FaShieldAlt />
                <small>Bảo mật bởi VNPAY</small>
                <Badge bg="success">PCI DSS</Badge>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default VNPaySimulator;
