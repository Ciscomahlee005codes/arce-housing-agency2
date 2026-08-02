import React, { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./OtpVerification.css";

const OtpVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = new URLSearchParams(location.search).get("email") || "your email";
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputs = useRef([]);

  const handleChange = (element, index) => {
    const value = element.value.replace(/\D/, ""); // only numbers
    if (!value) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input
    if (index < 5 && value) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handleSubmit = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      alert("Please enter the complete 6-digit OTP.");
      return;
    }
    alert(`OTP ${code} verified successfully!`);
    navigate("/login");
  };

  return (
    <div className="otp-container">
      {/* <div className="otp-left">
        <div className="logo">
          <img src="/logo.png" alt="ARCE Logo" />
          <h2>ARCE Housing Agency</h2>
        </div>
        <p className="side-text">“Secure access made simple.”</p>
        <img src="/House-4.jpg" alt="House" className="side-image" />
      </div> */}

      <div className="otp-right">
        <div className="otp-box">
          <h2>Verify Your Email</h2>
          <p>Enter the 6-digit code sent to <strong>{email}</strong></p>

          <div className="otp-inputs">
            {otp.map((digit, i) => (
              <input
                key={i}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e.target, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                ref={(el) => (inputs.current[i] = el)}
              />
            ))}
          </div>

          <button onClick={handleSubmit}>Verify OTP</button>

          <p className="resend">
            Didn’t get the code? <span>Resend OTP</span>
          </p>
          <p className="back-login" onClick={() => navigate("/login")}>
            ← Back to Login
          </p>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;
