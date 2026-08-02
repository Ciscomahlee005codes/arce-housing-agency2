import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiArrowRight, FiArrowLeft, FiCheckCircle, FiHome, FiUser, FiPhone, FiMail, FiMapPin, FiDollarSign, FiFileText } from "react-icons/fi";
import { MdOutlineSearchOff } from "react-icons/md";
import "./FindMySpace.css";

const STEPS = ["Contact", "Preferences", "Budget"];

const NG_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo",
  "Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa",
  "Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba",
  "Yobe","Zamfara",
];

const BLANK = {
  name: "", email: "", phone: "",
  type: "Home", state: "", location: "",
  budget: "", notes: "",
};

const FindMySpace = () => {
  const [isOpen,   setIsOpen]   = useState(false);
  const [step,     setStep]     = useState(1);
  const [formData, setFormData] = useState(BLANK);
  const [done,     setDone]     = useState(false);

  const open  = () => { setIsOpen(true); setStep(1); setDone(false); };
  const close = () => { setIsOpen(false); setTimeout(() => { setStep(1); setDone(false); setFormData(BLANK); }, 300); };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("FindMySpace submitted:", formData);
    setDone(true);
  };

  const handleReset = () => { setDone(false); setFormData(BLANK); setStep(1); close(); };

  const PROPERTY_TYPES = [
    { value: "Home",             label: "🏠 Home"             },
    { value: "Lodge",            label: "🏘️ Lodge"            },
    { value: "Shared Apartment", label: "🤝 Shared Apartment" },
    { value: "Hostel",           label: "🏫 Hostel"           },
  ];

  return (
    <>
      {/* ── Banner section ── */}
      <div className="fms-banner">
        <div className="fms-banner-content">
          <div className="fms-banner-icon"><MdOutlineSearchOff size={28} /></div>
          <div className="fms-banner-text">
            <h3>Can't find what you're looking for?</h3>
            <p>Tell us your preferences — <strong>home, lodge, hostel, or shared apartment</strong> — and our agents will find the perfect space for you.</p>
          </div>
        </div>
        <button className="fms-open-btn" onClick={open}>
          Find My Space <FiArrowRight size={16} />
        </button>
      </div>

      {/* ── Modal ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fms-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          >
            <motion.div
              className="fms-modal"
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0,  scale: 1    }}
              exit={{    opacity: 0, y: 40, scale: 0.96 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              onClick={e => e.stopPropagation()}
            >
              {/* Close */}
              <button className="fms-close" onClick={close} aria-label="Close">
                <FiX size={18} />
              </button>

              {!done ? (
                <>
                  {/* Header */}
                  <div className="fms-modal-head">
                    <div className="fms-modal-icon">🏡</div>
                    <h2>Find My Space</h2>
                    <p>Let us scout the perfect property for you</p>
                  </div>

                  {/* Step progress */}
                  <div className="fms-progress">
                    {STEPS.map((label, i) => (
                      <React.Fragment key={label}>
                        <div className="fms-step-wrap">
                          <div className={`fms-step-dot ${step > i + 1 ? "done" : step === i + 1 ? "active" : ""}`}>
                            {step > i + 1 ? <FiCheckCircle size={13} /> : i + 1}
                          </div>
                          <span className={`fms-step-label ${step === i + 1 ? "active" : ""}`}>{label}</span>
                        </div>
                        {i < STEPS.length - 1 && (
                          <div className={`fms-step-line ${step > i + 1 ? "done" : ""}`} />
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Form */}
                  <form className="fms-form" onSubmit={handleSubmit}>

                    {/* ── STEP 1: Contact ── */}
                    {step === 1 && (
                      <div className="fms-fields">
                        <div className="fms-field">
                          <label><FiUser size={13} /> Full Name</label>
                          <input name="name" type="text" placeholder="e.g. Emeka Okafor"
                            value={formData.name} onChange={handleChange} required />
                        </div>
                        <div className="fms-field">
                          <label><FiMail size={13} /> Email Address</label>
                          <input name="email" type="email" placeholder="you@email.com"
                            value={formData.email} onChange={handleChange} required />
                        </div>
                        <div className="fms-field">
                          <label><FiPhone size={13} /> Phone Number</label>
                          <input name="phone" type="tel" placeholder="080XXXXXXXX"
                            value={formData.phone} onChange={handleChange} required />
                        </div>
                      </div>
                    )}

                    {/* ── STEP 2: Preferences ── */}
                    {step === 2 && (
                      <div className="fms-fields">
                        <div className="fms-field">
                          <label><FiHome size={13} /> Property Type</label>
                          <div className="fms-type-grid">
                            {PROPERTY_TYPES.map(pt => (
                              <button
                                key={pt.value}
                                type="button"
                                className={`fms-type-btn ${formData.type === pt.value ? "selected" : ""}`}
                                onClick={() => setFormData(p => ({ ...p, type: pt.value }))}
                              >
                                {pt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="fms-field">
                          <label><FiMapPin size={13} /> Preferred State</label>
                          <select name="state" value={formData.state} onChange={handleChange} required>
                            <option value="">Select a state</option>
                            {NG_STATES.map(s => <option key={s}>{s}</option>)}
                          </select>
                        </div>
                        <div className="fms-field">
                          <label><FiMapPin size={13} /> Preferred Location / Area</label>
                          <input name="location" type="text" placeholder="e.g. Lekki, Yaba, Ikeja"
                            value={formData.location} onChange={handleChange} required />
                        </div>
                      </div>
                    )}

                    {/* ── STEP 3: Budget & Notes ── */}
                    {step === 3 && (
                      <div className="fms-fields">
                        <div className="fms-field">
                          <label><FiDollarSign size={13} /> Your Budget (Annual, ₦)</label>
                          <input name="budget" type="text" placeholder="e.g. 500,000"
                            value={formData.budget} onChange={handleChange} required />
                        </div>
                        <div className="fms-field">
                          <label><FiFileText size={13} /> Additional Notes <span className="fms-optional">(optional)</span></label>
                          <textarea name="notes" rows={4}
                            placeholder="Any special requirements? e.g. furnished, near campus, quiet area…"
                            value={formData.notes} onChange={handleChange} />
                        </div>
                      </div>
                    )}

                    {/* Navigation */}
                    <div className="fms-nav">
                      {step > 1 ? (
                        <button type="button" className="fms-back-btn"
                          onClick={() => setStep(s => s - 1)}>
                          <FiArrowLeft size={15} /> Back
                        </button>
                      ) : <div />}

                      {step < 3 ? (
                        <button type="button" className="fms-next-btn"
                          onClick={() => setStep(s => s + 1)}>
                          Continue <FiArrowRight size={15} />
                        </button>
                      ) : (
                        <button type="submit" className="fms-submit-btn">
                          <FiCheckCircle size={15} /> Submit Request
                        </button>
                      )}
                    </div>
                  </form>
                </>
              ) : (
                /* ── Success screen ── */
                <div className="fms-success">
                  <div className="fms-success-icon">✅</div>
                  <h3>Request Submitted!</h3>
                  <p>Our agents will review your preferences and reach out to you at <strong>{formData.email}</strong> or <strong>{formData.phone}</strong> shortly.</p>
                  <button className="fms-submit-btn" onClick={handleReset} style={{ marginTop: "1.5rem" }}>
                    Done
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FindMySpace;