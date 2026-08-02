import React from 'react';
import './Footer.css';
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container" id='big-footer'>

        <div className="footer-column brand-column">
          <h3>ARCE.</h3>
          <p className="footer-tagline">Find, verify, and rent homes across Nigeria — without the scams.</p>
          <div className="social-icons">
            <a href="#" aria-label="Facebook"><FaFacebookF /></a>
            <a href="#" aria-label="Instagram"><FaInstagram /></a>
            <a href="#" aria-label="Twitter"><FaTwitter /></a>
            <a href="#" aria-label="LinkedIn"><FaLinkedinIn /></a>
          </div>
        </div>

        <div className="footer-column">
          <h4>Company</h4>
          <ul>
            <li>About Us</li>
            <li>How It Works</li>
            <li>Contact</li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Explore</h4>
          <ul>
            <li>Browse Apartments</li>
            <li>Wallet & Rent Pay</li>
            <li>Post Property</li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Support</h4>
          <ul>
            <li>Help Center</li>
            <li>Terms of Service</li>
            <li>Privacy Policy</li>
          </ul>
        </div>

      </div>

      <div className="small-container">
        <h3 className="small-brand">ARCE.</h3>
        <div className="social-icons">
          <a href="#" aria-label="Facebook"><FaFacebookF /></a>
          <a href="#" aria-label="Instagram"><FaInstagram /></a>
          <a href="#" aria-label="Twitter"><FaTwitter /></a>
          <a href="#" aria-label="LinkedIn"><FaLinkedinIn /></a>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2025 ARCE Housing Agency. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;