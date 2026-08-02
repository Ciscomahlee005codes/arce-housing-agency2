import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiMinus, FiSearch } from "react-icons/fi";
import { MdHome, MdPeople, MdBusiness } from "react-icons/md";
import "./FAQ.css";

// ── FAQ data ──────────────────────────────────────────────────────────────────
const FAQ_DATA = [
  {
    category: "Tenants & Renters",
    icon: <MdPeople size={18} />,
    color: "#13118a",
    bg: "#eef0fb",
    questions: [
      {
        q: "What is ARCE Housing Agency?",
        a: "ARCE is a real estate platform designed to simplify how people find and rent homes in Nigeria. We connect renters directly with landlords or our verified agents — without the scams, inflated fees, or unreliable listings.",
      },
      {
        q: "Do I have to pay any fees to use ARCE?",
        a: "Yes — we charge a small, transparent 10% service fee. This helps us cover property inspections, platform maintenance, and staff wages. We never charge ridiculous agency fees or hidden costs.",
      },
      {
        q: "Are the listings on ARCE verified?",
        a: "Absolutely. Before any property is listed, our team conducts a physical inspection to confirm the location, condition, and authenticity. We only publish genuine, up-to-date listings with real images.",
      },
      {
        q: "Can I pay my rent monthly instead of yearly?",
        a: "Yes. ARCE supports flexible payment options like monthly, quarterly, or yearly rent — depending on what the landlord offers. We're working to make housing more affordable and accessible.",
      },
      {
        q: "What happens if a property turns out different from the listing?",
        a: "No worries — all listings on ARCE are verified by our inspection team. If anything goes wrong, you can report it immediately through our platform, and we'll take action to protect your money and ensure accountability.",
      },
    ],
  },
  {
    category: "Students",
    icon: <MdHome size={18} />,
    color: "#3230b0",
    bg: "#eef0fb",
    questions: [
      {
        q: "How do I find student accommodation near my school?",
        a: "Simply filter listings by your school name or preferred location on our platform. We have a dedicated 'Featured For Students' section with lodges, hostels, and shared apartments close to major universities.",
      },
      {
        q: "Can I view a property before paying?",
        a: "Yes. You can book either a physical visit or a virtual tour directly from any property listing. We encourage you to always inspect a property before committing to any payment.",
      },
      {
        q: "Are there shared apartment options for students?",
        a: "Absolutely. ARCE lists shared apartments, single rooms, hostels, and full lodges. You can filter by accommodation type to find exactly what fits your budget and preference.",
      },
    ],
  },
  {
    category: "Landlords & Agents",
    icon: <MdBusiness size={18} />,
    color: "#4d4ac2",
    bg: "#eef0fb",
    questions: [
      {
        q: "How do I list my property on ARCE?",
        a: "To list your property, you'll need to submit a request for inspection. Once verified by our team, we'll create a trusted listing for you. This ensures only real, scam-free properties make it onto the platform.",
      },
      {
        q: "Why do I need to verify my property before it gets listed?",
        a: "Verification helps us build trust and safety on ARCE. It proves your property is legit, helps attract serious renters, and protects both your name and our platform from fraud or fake listings.",
      },
      {
        q: "How long does the verification process take?",
        a: "Our team typically completes property inspection and verification within 2–5 business days. You'll be notified via email and in-app once your listing is live.",
      },
      {
        q: "Can I manage multiple properties on ARCE?",
        a: "Yes. As a verified landlord or agent, your dashboard allows you to manage multiple listings, track tour requests, respond to inquiries, and update property details anytime.",
      },
    ],
  },
];

// ── Single accordion item ──────────────────────────────────────────────────────
const AccordionItem = ({ item, index, openIndex, setOpenIndex, accentColor }) => {
  const isOpen = openIndex === index;

  return (
    <div
      className={`faq-item ${isOpen ? "faq-item-open" : ""}`}
      style={{ "--faq-accent": accentColor }}
    >
      <button
        className="faq-question"
        onClick={() => setOpenIndex(isOpen ? null : index)}
        aria-expanded={isOpen}
      >
        <span className="faq-q-text">{item.q}</span>
        <span className={`faq-icon ${isOpen ? "open" : ""}`}>
          {isOpen ? <FiMinus size={16} /> : <FiPlus size={16} />}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            className="faq-answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
          >
            <p>{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────
const FAQ = () => {
  const [activeCategory, setActiveCategory] = useState(0);
  const [openIndex,      setOpenIndex]      = useState(null);
  const [search,         setSearch]         = useState("");

  const handleCategoryChange = (i) => {
    setActiveCategory(i);
    setOpenIndex(null);
    setSearch("");
  };

  const currentCat = FAQ_DATA[activeCategory];



  return (
    <section className="faq-section">

      {/* ── Hero ── */}
      <div className="faq-hero">
        <h2 className="faq-heading">Frequently Asked Questions</h2>
        <p className="faq-subtext">
          Everything you need to know about ARCE — renting, listing, payments and more.
        </p>
      </div>

      <div className="faq-body">

          <>
            {/* Category tabs */}
            <div className="faq-tabs">
              {FAQ_DATA.map((cat, i) => (
                <button
                  key={i}
                  className={`faq-tab ${activeCategory === i ? "active" : ""}`}
                  style={activeCategory === i ? { "--tab-color": cat.color, "--tab-bg": cat.bg } : {}}
                  onClick={() => handleCategoryChange(i)}
                >
                  <span className="faq-tab-icon" style={{ color: activeCategory === i ? cat.color : "#9599b8" }}>
                    {cat.icon}
                  </span>
                  {cat.category}
                  <span
                    className="faq-tab-count"
                    style={activeCategory === i
                      ? { background: cat.color, color: "#fff" }
                      : { background: "#eef0f8", color: "#9599b8" }
                    }
                  >
                    {cat.questions.length}
                  </span>
                </button>
              ))}
            </div>

            {/* Accordion */}
            <div className="faq-accordion">
              {currentCat.questions.map((item, i) => (
                <AccordionItem
                  key={i}
                  item={item}
                  index={i}
                  openIndex={openIndex}
                  setOpenIndex={setOpenIndex}
                  accentColor={currentCat.color}
                />
              ))}
            </div>
          </>
      </div>

      {/* ── Bottom CTA ── */}
      <div className="faq-cta">
        <p>Still have questions?</p>
        <a href="/contactus" className="faq-cta-btn">Contact our team →</a>
      </div>

    </section>
  );
};

export default FAQ;