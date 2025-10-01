import React from 'react';
import { Form, Button, Row, Col, Alert, Badge } from 'react-bootstrap';
import { FaArrowRight, FaLock } from 'react-icons/fa';

const ShippingStep = ({ formData, errors, handleChange, handleNext, isAuthenticated }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    handleNext();
  };

  return (
    <Form onSubmit={handleSubmit}>
      <div className="mb-4">
        <h4 className="mb-3">Shipping Information</h4>
        
        {/* Guest Checkout Alert */}
        {!isAuthenticated && (
          <Alert variant="info" className="mb-3">
            <FaLock className="me-2" />
            You're checking out as a <strong>guest</strong>. Create an account during checkout or after to track your orders!
          </Alert>
        )}

        {/* Guest User Fields */}
        {!isAuthenticated && (
          <>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email Address <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    isInvalid={!!errors.email}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    We'll send order confirmation to this email
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone Number <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0912345678"
                    isInvalid={!!errors.phone}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.phone}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Full Name <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Nguyen Van A"
                isInvalid={!!errors.fullName}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.fullName}
              </Form.Control.Feedback>
            </Form.Group>
          </>
        )}

        {/* Authenticated User Info Display */}
        {isAuthenticated && (
          <Alert variant="success" className="mb-3">
            <strong>Shipping to:</strong> {formData.fullName || 'N/A'}
            <br />
            <strong>Contact:</strong> {formData.email} • {formData.phone || 'N/A'}
          </Alert>
        )}

        {/* Shipping Address */}
        <Form.Group className="mb-3">
          <Form.Label>Shipping Address <span className="text-danger">*</span></Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            name="shippingAddress"
            value={formData.shippingAddress}
            onChange={handleChange}
            placeholder="Enter your complete shipping address&#10;Example: 123 Nguyen Hue Street, District 1, Ho Chi Minh City"
            isInvalid={!!errors.shippingAddress}
            required
          />
          <Form.Control.Feedback type="invalid">
            {errors.shippingAddress}
          </Form.Control.Feedback>
          <Form.Text className="text-muted">
            Include street, ward, district, and city for accurate delivery
          </Form.Text>
        </Form.Group>

        {/* Order Notes (Optional) */}
        <Form.Group className="mb-4">
          <Form.Label>Order Notes <Badge bg="secondary">Optional</Badge></Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any special instructions for your order (delivery time, gift wrapping, etc.)"
          />
        </Form.Group>
      </div>

      <div className="d-flex justify-content-end">
        <Button type="submit" variant="primary" size="lg">
          Continue to Payment <FaArrowRight className="ms-2" />
        </Button>
      </div>
    </Form>
  );
};

export default ShippingStep;
