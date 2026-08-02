// src/components/CustomerService.jsx
import React from 'react';
import './CustomerService.css';

const CustomerService = ({ onClose }) => {
  return (
    <div className="customer-modal-overlay">
      <div className="customer-modal">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>Need Help? We’re Here for You</h2>
        <p>Choose how you’d like to reach ARCE Support:</p>

        <div className="help-options">
          <a href="https://wa.me/2348121269433" target="_blank" rel="noreferrer" className="help-card">
            <span>💬</span>
            <div>
              <h4>WhatsApp Chat</h4>
              <p>Get instant help on WhatsApp</p>
            </div>
          </a>

          <a href="mailto:arcehousing@gmail.com" className="help-card">
            <span>📧</span>
            <div>
              <h4>Email Support</h4>
              <p id='help-email'>arcehousing@gmail.com</p>
            </div>
          </a>

          <a href="tel:+2348101234567" className="help-card">
            <span>📞</span>
            <div>
              <h4>Call Us</h4>
              <p>+234 810 123 4567</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default CustomerService;
