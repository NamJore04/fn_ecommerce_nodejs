import React from 'react';
import { FaShippingFast, FaCreditCard, FaCheckCircle } from 'react-icons/fa';
import './StepIndicator.css';

const StepIndicator = ({ currentStep }) => {
  const steps = [
    { number: 1, title: 'Shipping', icon: <FaShippingFast /> },
    { number: 2, title: 'Payment', icon: <FaCreditCard /> },
    { number: 3, title: 'Review', icon: <FaCheckCircle /> }
  ];

  return (
    <div className="step-indicator mb-4">
      <div className="steps-container">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <div className={`step-item ${currentStep >= step.number ? 'active' : ''} ${currentStep > step.number ? 'completed' : ''}`}>
              <div className="step-circle">
                {currentStep > step.number ? (
                  <FaCheckCircle className="step-check" />
                ) : (
                  <span className="step-icon">{step.icon}</span>
                )}
              </div>
              <div className="step-title">{step.title}</div>
            </div>
            {index < steps.length - 1 && (
              <div className={`step-line ${currentStep > step.number ? 'completed' : ''}`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default StepIndicator;
