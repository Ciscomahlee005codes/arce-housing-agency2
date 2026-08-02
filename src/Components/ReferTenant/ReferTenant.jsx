// src/pages/ReferTenant.jsx
import React, { useState } from "react";
import "./ReferTenant.css";
import { FaUserFriends, FaGift, FaShareAlt } from "react-icons/fa";
import BackButton from "../BackButton/BackButton";

const ReferTenant = () => {
  const [copied, setCopied] = useState(false);
  const referralLink = "https://arcehousing.com/ref/anthony123";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);

    // Reset back to "Copy" after 2 seconds
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="refer-container">
      <BackButton />
      <h2 className="refer-title">Refer a Tenant & Earn Rewards 🎉</h2>

      <p className="refer-intro">
        Invite your friends, classmates, or colleagues to rent their next home through{" "}
        <strong>ARCE Housing Agency</strong> and earn rewards when they successfully book.
      </p>

      <div className="refer-steps">
        <div className="step-card">
          <FaShareAlt className="icon" />
          <h3>1. Share Your Link</h3>
          <p>Get your unique referral link and share it with friends and classmates.</p>
        </div>
        <div className="step-card">
          <FaUserFriends className="icon" />
          <h3>2. They Rent a House</h3>
          <p>When your friend finds a house, lodge, or shared apartment, we track it.</p>
        </div>
        <div className="step-card">
          <FaGift className="icon" />
          <h3>3. You Earn</h3>
          <p>Once the rental is confirmed, you earn a cash reward instantly.</p>
        </div>
      </div>

      <div className="refer-box">
        <p>Your Referral Link:</p>
        <div className="refer-link">
          <input type="text" value={referralLink} readOnly />
          <button onClick={handleCopy}>
            {copied ? "Copied ✅" : "Copy"}
          </button>
        </div>
      </div>

      <div className="refer-footer">
        <p>Start referring today and make house hunting rewarding for you and your friends! 💰</p>
      </div>
    </div>
  );
};

export default ReferTenant;
