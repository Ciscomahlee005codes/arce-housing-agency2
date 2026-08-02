import React, { useState } from "react";
import "./HelpSupport.css";

const HelpSupport = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "How do I update my profile?",
      answer:
        "Go to Settings > Profile, edit your information, and click 'Save Changes'. Your updates will be stored securely.",
    },
    {
      question: "How do I reset my password?",
      answer:
        "Navigate to Settings > Change Password. Enter your current password, then your new one, and confirm. If you forgot your password, use the 'Forgot Password' option on login.",
    },
    {
      question: "How do I contact my agent?",
      answer:
        "Visit the Rental History or Home Listing page. Click on the agent’s profile to see their contact details or use the in-app messaging feature.",
    },
    {
      question: "How do I report an issue with a rental?",
      answer:
        "Go to Help & Support > Report an Issue. Fill in the details of your problem and our support team will get back to you within 24 hours.",
    },
  ];

  return (
    <div className="help-container">
      <h2>Help & Support</h2>
      <p className="intro">
        Welcome to ARCE Support. Find answers to common questions, get help
        with issues, or contact us directly.
      </p>

      {/* FAQ Section */}
      <div className="faq-section">
        <h3>Frequently Asked Questions</h3>
        {faqs.map((faq, index) => (
          <div
            key={index}
            className={`faq-item ${activeIndex === index ? "active" : ""}`}
          >
            <button
              className="faq-question"
              onClick={() => toggleAccordion(index)}
            >
              {faq.question}
              <span>{activeIndex === index ? "−" : "+"}</span>
            </button>
            {activeIndex === index && (
              <div className="faq-answer">{faq.answer}</div>
            )}
          </div>
        ))}
      </div>

      {/* Contact Support */}
      <div className="contact-support">
        <h3>Contact Support</h3>
        <p>
          If you still need help, you can reach us through any of the channels
          below:
        </p>
        <ul>
          <li>
            📧 Email: <a href="mailto:support@arce.com">support@arce.com</a>
          </li>
          <li>📞 Phone: +234 800 123 4567</li>
          <li>💬 Live Chat: Available in the bottom-right corner</li>
        </ul>
      </div>

      {/* Report an Issue */}
      <div className="report-issue">
        <h3>Report an Issue</h3>
        <form>
          <label>Your Email</label>
          <input type="email" placeholder="Enter your email" required />

          <label>Issue</label>
          <textarea
            placeholder="Describe your issue in detail"
            rows="4"
            required
          ></textarea>

          <button type="submit" className="submit-btn">
            Submit Issue
          </button>
        </form>
      </div>
    </div>
  );
};

export default HelpSupport;
