import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const role = new URLSearchParams(location.search).get("role") || "tenant";
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async () => {
    if (!email) {
      alert("Please enter your email address");
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API request (later connect to backend)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      alert(`Password reset link sent to ${email} for ${role} role`);
      navigate("/login");
    } catch (error) {
      alert("Failed to send reset link. Try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-container">
      {/* <div className="forgot-left">
        <div className="logo">
          <img src="/logo.png" alt="ARCE Logo" />
          <h2>ARCE Housing Agency</h2>
        </div>
        <p className="quote">
          “Your comfort is our priority. Let’s get you back into your account.”
        </p>
        <img src="/House-4.jpg" alt="House" className="side-image" />
      </div> */}

      <div className="forgot-right">
        <div className="forgot-box">
          <h2>Forgot Password</h2>
          <p>
            Enter your email to receive a password reset link for your{" "}
            <strong>{role}</strong> account.
          </p>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button onClick={handleReset} disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Reset Link"}
          </button>

          <p className="back-login" onClick={() => navigate("/login")}>
            ← Back to Login
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
