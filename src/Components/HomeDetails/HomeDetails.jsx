import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchApprovedProperties } from "../../lib/fetchProperties";
import BackButton from "../BackButton/BackButton";
import { UserAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import "./HomeDetails.css";

const StarRating = ({ rating }) => {
  const full = Math.floor(rating);
  const stars = Array.from({ length: 5 }, (_, i) => (i < full ? "★" : "☆")).join("");
  return (
    <span className="details-rating">
      <span className="stars">{stars}</span>
      <span style={{ fontSize: "0.9rem", color: "#fff", marginLeft: 4 }}>{rating}/5</span>
    </span>
  );
};

const TOTAL_STEPS = 4;

const StepDots = ({ step, tourType }) => {
  const steps = tourType === "virtual" ? 2 : TOTAL_STEPS;
  return (
    <div className="step-dots">
      {Array.from({ length: steps + 1 }, (_, i) => (
        <span key={i} className={`step-dot ${i <= step ? "active" : ""}`} />
      ))}
    </div>
  );
};

const HomeDetails = () => {
  const { user } = UserAuth();
  const { id } = useParams();
  const [house, setHouse] = useState(null);

  useEffect(() => {
    const loadProperties = async () => {
      const properties = await fetchApprovedProperties();
      const foundHouse = properties.find((h) => h.id.toString() === id);
      setHouse(foundHouse);
    };
    loadProperties();
  }, [id]);

  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  // ── Toast state ──
  const [toast, setToast] = useState({ show: false, message: "" });
  const toastTimerRef = useRef(null);

  const showToast = (message) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, message });
    toastTimerRef.current = setTimeout(() => {
      setToast({ show: false, message: "" });
    }, 4500);
  };

  const dismissToast = () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: false, message: "" });
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const [formData, setFormData] = useState({
    tourType: "",
    date: "",
    time: "",
    landmark: "",
    phone: "",
    name: "",
    paymentMethod: "",
    platform: "",
    virtualContact: "",
  });

  if (!house) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div className="loader" />
      </div>
    );
  }

  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => setStep((prev) => prev - 1);
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      setChatMessages([...chatMessages, { text: chatInput, sender: "user" }]);
      setChatInput("");
    }
  };

  const handleChatKeyDown = (e) => {
    if (e.key === "Enter") handleSendMessage();
  };

  // Gate: booking
  const openBookingModal = () => {
    if (!user) {
      showToast("Please sign up or sign in to book a tour.");
      return;
    }
    setShowModal(true);
  };

  // Gate: chat
  const openChat = () => {
    if (!user) {
      showToast("Please sign up or sign in to chat with an agent.");
      return;
    }
    setShowChat((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setShowModal(false);
      showToast("Please sign up or sign in to book a tour.");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("property_tours")
      .insert({
        property_id: house.id,
        tenant_id: user.id,

        // Agent who owns listing
        agent_id: house.agent_id,

        tour_type: formData.tourType,

        tour_date: formData.date,
        tour_time: formData.time,

        landmark: formData.landmark,
        phone: formData.phone,
        full_name: formData.name,

        platform: formData.platform,
        virtual_contact: formData.virtualContact,

        payment_method: formData.paymentMethod,

        status: "pending",
      });
    setLoading(false);
    if (error) {
      console.log(error);
      alert("Failed to book tour");
      return;
    }

    alert("Tour booked successfully!");
  };

  const closeModal = () => {
    setShowModal(false);
    setStep(0);
  };

  return (
    <div className="details-container">
      <BackButton />

      {/* ── Hero Image ── */}
      <div className="details-image-wrapper">
        <img
          src={house.images?.[0] || "/placeholder.jpg"}
          alt={house.title}
          className="details-image"
        />
        <span className="details-image-badge">Available</span>
      </div>

      {/* ── Info Card ── */}
      <div className="details-info">
        <h2>{house.title}</h2>
        <div className="details-meta-grid">
          <div className="details-meta-item">
            <span className="meta-label">State</span>
            <span className="meta-value">{house.state}</span>
          </div>
          <div className="details-meta-item">
            <span className="meta-label">Location</span>
            <span className="meta-value">{house.location}</span>
          </div>
          <div className="details-meta-item">
            <span className="meta-label">Rating</span>
            <span className="meta-value"><StarRating rating={house.rating} /></span>
          </div>
          <div className="details-meta-item price-item">
            <span className="meta-label">Annual Rent</span>
            <span className="meta-value">₦{house.price?.toLocaleString()}</span>
          </div>
        </div>
        <p className="details-description">{house.description}</p>
      </div>

      {/* ── Amenities ── */}
      <div className="amenities">
        <h3>Amenities</h3>
        <ul className="amenities-list">
          {house.amenities?.map((amenity, index) => (
            <li key={index} className="amenity-item">{amenity}</li>
          ))}
        </ul>
      </div>

      {/* ── CTA Buttons ── */}
      <div className="btn-container">
        <button className="btn-primary" onClick={openBookingModal}>
          Book a House Tour
        </button>
        <button className="btn-secondary" onClick={openChat}>
          Chat with an Agent
        </button>
      </div>

      {/* ── Toast ── */}
      {toast.show && (
        <div className="auth-toast" role="alert">
          <div className="auth-toast-icon">🔒</div>
          <div className="auth-toast-body">
            <p className="auth-toast-message">{toast.message}</p>
            <div className="auth-toast-actions">
              <Link to="/login" className="auth-toast-link">Sign Up</Link>
              <span className="auth-toast-sep">·</span>
              <Link to="/login" className="auth-toast-link">Sign In</Link>
            </div>
          </div>
          <button className="auth-toast-close" onClick={dismissToast} aria-label="Dismiss">×</button>
        </div>
      )}

      {/* ── Booking Modal ── */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal-content">
            <button className="close-btn" onClick={closeModal}>×</button>
            <h3>Book a Tour</h3>
            <p className="property-name">
              Property: <span>{house.title}</span>
            </p>

            {step > 0 && <StepDots step={step} tourType={formData.tourType} />}

            {loading ? (
              <div className="spinner-wrapper">
                <div className="loader" />
                <p className="loading-text">Processing your booking…</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>

                {/* Step 0 — Tour Type */}
                {step === 0 && (
                  <div className="modal-step">
                    <label>
                      Select Tour Type
                      <select name="tourType" value={formData.tourType} onChange={handleChange} required>
                        <option value="">— Choose an option —</option>
                        <option value="physical">Physical Visit</option>
                        <option value="virtual">Virtual Tour</option>
                      </select>
                    </label>
                  </div>
                )}

                {/* PHYSICAL FLOW */}
                {formData.tourType === "physical" && (
                  <>
                    {step === 1 && (
                      <div className="modal-step">
                        <label>
                          Select Date
                          <input type="date" name="date" value={formData.date} onChange={handleChange} required />
                        </label>
                        <label>
                          Preferred Time
                          <input type="time" name="time" value={formData.time} onChange={handleChange} required />
                        </label>
                      </div>
                    )}
                    {step === 2 && (
                      <div className="modal-step">
                        <label>
                          Nearest Landmark / Bus Stop
                          <input
                            type="text"
                            name="landmark"
                            value={formData.landmark}
                            onChange={handleChange}
                            placeholder="e.g. near XYZ Junction"
                            required
                          />
                        </label>
                      </div>
                    )}
                    {step === 3 && (
                      <div className="modal-step">
                        <label>
                          Full Name
                          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                        </label>
                        <label>
                          Phone Number
                          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
                        </label>
                      </div>
                    )}
                  </>
                )}

                {/* VIRTUAL FLOW */}
                {formData.tourType === "virtual" && step === 1 && (
                  <div className="modal-step">
                    <label>
                      Preferred Platform
                      <select name="platform" value={formData.platform} onChange={handleChange} required>
                        <option value="">— Choose Platform —</option>
                        <option value="Zoom">Zoom</option>
                        <option value="Google Meet">Google Meet</option>
                        <option value="WhatsApp">WhatsApp</option>
                      </select>
                    </label>
                    <label>
                      Your Email / Phone
                      <input type="text" name="virtualContact" value={formData.virtualContact} onChange={handleChange} required />
                    </label>
                    <label>
                      Date
                      <input type="date" name="date" value={formData.date} onChange={handleChange} required />
                    </label>
                    <label>
                      Time
                      <input type="time" name="time" value={formData.time} onChange={handleChange} required />
                    </label>
                  </div>
                )}

                {/* SUMMARY */}
                {step === 4 && (
                  <div className="modal-step">
                    <div className="summary-card">
                      <div className="summary-row">
                        <span className="s-label">Tour Type</span>
                        <span className="s-value" style={{ textTransform: "capitalize" }}>{formData.tourType}</span>
                      </div>
                      <div className="summary-row">
                        <span className="s-label">Date</span>
                        <span className="s-value">{formData.date}</span>
                      </div>
                      <div className="summary-row">
                        <span className="s-label">Time</span>
                        <span className="s-value">{formData.time}</span>
                      </div>
                      {formData.tourType === "physical" ? (
                        <>
                          <div className="summary-row">
                            <span className="s-label">Landmark</span>
                            <span className="s-value">{formData.landmark}</span>
                          </div>
                          <div className="summary-row">
                            <span className="s-label">Name</span>
                            <span className="s-value">{formData.name}</span>
                          </div>
                          <div className="summary-row">
                            <span className="s-label">Phone</span>
                            <span className="s-value">{formData.phone}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="summary-row">
                            <span className="s-label">Platform</span>
                            <span className="s-value">{formData.platform}</span>
                          </div>
                          <div className="summary-row">
                            <span className="s-label">Contact</span>
                            <span className="s-value">{formData.virtualContact}</span>
                          </div>
                        </>
                      )}
                      <div className="summary-row price-row">
                        <span className="s-label">Tour Fee</span>
                        <span className="s-value">₦2,500</span>
                      </div>
                    </div>

                    <label>
                      Payment Method
                      <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} required>
                        <option value="">— Select Option —</option>
                        <option value="transfer">Bank Transfer</option>
                        <option value="card">Debit Card</option>
                        {formData.tourType === "physical" && <option value="cash">Cash on Arrival</option>}
                      </select>
                    </label>

                    <p className="summary-note">
                      {formData.tourType === "physical"
                        ? "Ensure all details are correct before confirming."
                        : "A virtual invite link will be sent to you before your scheduled time."}
                    </p>
                  </div>
                )}

                <div className="modal-actions">
                  {step > 0 && (
                    <button type="button" className="btn-back" onClick={handleBack}>← Back</button>
                  )}
                  {step < 4 && (
                    <button type="button" className="btn-next" onClick={handleNext}>Continue →</button>
                  )}
                  {step === 4 && (
                    <button type="submit" className="btn-confirm">
                      Confirm & {formData.tourType === "physical" ? "Pay" : "Book"}
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── Chat Box ── */}
      {showChat && user && (
        <div className="chat-box">
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-avatar">A</div>
              <div className="chat-header-text">
                <p>Agent Support</p>
                <span>Typically replies instantly</span>
              </div>
            </div>
            <button onClick={() => setShowChat(false)} className="close-chat">×</button>
          </div>

          <div className="chat-messages">
            {chatMessages.length === 0 && (
              <p className="chat-empty">
                👋 Hi there! Ask me anything about this property.
              </p>
            )}
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
          </div>

          <div className="chat-input-area">
            <input
              type="text"
              placeholder="Type your message…"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={handleChatKeyDown}
            />
            <button onClick={handleSendMessage} aria-label="Send">➤</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeDetails;