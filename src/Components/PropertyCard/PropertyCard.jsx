import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "./PropertyCard.css";
import {
  FiMapPin, FiHome, FiBookOpen, FiWifi, FiTv, FiDroplet, FiGrid,
  FiDollarSign, FiShield, FiZap, FiCoffee, FiTruck, FiCamera,
  FiChevronRight, FiCheckCircle, FiAlertCircle, FiX, FiStar,
  FiMessageCircle, FiClock, FiAward,
} from "react-icons/fi";
import { MdOutlineLocalParking, MdOutlinePool } from "react-icons/md";
import { FaHeart, FaRegHeart, FaStar } from "react-icons/fa";
import { TbAirConditioning } from "react-icons/tb";
import { GiWashingMachine } from "react-icons/gi";
import { useNavigate } from "react-router-dom";
import { UserAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

// ── Amenity icon map ──────────────────────────────────────────────────────────
const AMENITY_MAP = {
  wifi:               { icon: <FiWifi size={13} />,                 label: "WiFi"         },
  "smart tv":         { icon: <FiTv size={13} />,                  label: "Smart TV"     },
  tv:                 { icon: <FiTv size={13} />,                  label: "TV"           },
  "water supply":     { icon: <FiDroplet size={13} />,             label: "Water"        },
  water:              { icon: <FiDroplet size={13} />,             label: "Water"        },
  "pop ceiling":      { icon: <FiGrid size={13} />,                label: "POP Ceiling"  },
  pop:                { icon: <FiGrid size={13} />,                label: "POP Ceiling"  },
  "flexible payment": { icon: <FiDollarSign size={13} />,          label: "Flex Payment" },
  payment:            { icon: <FiDollarSign size={13} />,          label: "Flex Payment" },
  security:           { icon: <FiShield size={13} />,              label: "Security"     },
  generator:          { icon: <FiZap size={13} />,                 label: "Generator"    },
  gen:                { icon: <FiZap size={13} />,                 label: "Generator"    },
  parking:            { icon: <MdOutlineLocalParking size={13} />, label: "Parking"      },
  "parking space":    { icon: <MdOutlineLocalParking size={13} />, label: "Parking"      },
  pool:               { icon: <MdOutlinePool size={13} />,         label: "Pool"         },
  ac:                 { icon: <TbAirConditioning size={13} />,     label: "AC"           },
  "air conditioning": { icon: <TbAirConditioning size={13} />,     label: "AC"           },
  laundry:            { icon: <GiWashingMachine size={13} />,      label: "Laundry"      },
  "washing machine":  { icon: <GiWashingMachine size={13} />,      label: "Laundry"      },
  cafeteria:          { icon: <FiCoffee size={13} />,              label: "Cafeteria"    },
  cctv:               { icon: <FiCamera size={13} />,              label: "CCTV"         },
  shuttle:            { icon: <FiTruck size={13} />,               label: "Shuttle"      },
};

function getAmenity(raw) {
  const key = (raw || "").toLowerCase().trim();
  return AMENITY_MAP[key] || { icon: <FiGrid size={13} />, label: raw };
}

// ── Category config ───────────────────────────────────────────────────────────
const CATEGORIES = {
  featured_home:     { label: "Featured Home",    accent: "#1a18a8", icon: <FiHome size={12} />     },
  featured_homes:    { label: "Featured Home",    accent: "#1a18a8", icon: <FiHome size={12} />     },
  featured_students: { label: "Student Housing",  accent: "#6366f1", icon: <FiBookOpen size={12} /> },
  featured_student:  { label: "Student Housing",  accent: "#6366f1", icon: <FiBookOpen size={12} /> },
  student:           { label: "Student Housing",  accent: "#6366f1", icon: <FiBookOpen size={12} /> },
};

function getCat(key) {
  return (
    CATEGORIES[(key || "").toLowerCase()] ||
    { label: key || "Property", accent: "#64748b", icon: <FiHome size={12} /> }
  );
}

// ── Toast icon per type ────────────────────────────────────────────────────────
const TOAST_ICON = {
  success: <FiCheckCircle size={16} />,
  error:   <FiAlertCircle size={16} />,
  info:    <FiAlertCircle size={16} />,
};

// ── Agent detail bottom sheet ───────────────────────────────────────────────────
// NOTE: rating, review count, response time, and join date are placeholder
// values — there's no confirmed schema field for these yet. Only the
// "other listings" count below is a real live Supabase query. Swap the
// placeholders out once real agent-rating data exists.
function AgentDetailModal({ agent, open, onClose, onMessage }) {
  const [otherListingsCount, setOtherListingsCount] = useState(null);
  const [loadingCount, setLoadingCount] = useState(true);

  useEffect(() => {
    if (!open || !agent?.id) return;

    const fetchOtherListings = async () => {
      setLoadingCount(true);
      const { count, error } = await supabase
        .from("properties")
        .select("id", { count: "exact", head: true })
        .eq("agent_id", agent.id);

      if (!error) setOtherListingsCount(count || 0);
      setLoadingCount(false);
    };

    fetchOtherListings();
  }, [open, agent?.id]);

  if (!open) return null;

  const agentName    = agent?.full_name || "Unknown Agent";
  const agentInitial = agentName.charAt(0).toUpperCase();
  const agencyName   = agent?.agency_name || "Property Agent";
  const joinedYear   = agent?.created_at
    ? new Date(agent.created_at).getFullYear()
    : "—";
  const responseHint = agent?.agency_name
    ? "Ready to answer questions about this property."
    : "This chat will connect you with the agent who listed this property.";

  return (
    <div className="am-backdrop" onClick={onClose}>
      <div className="am-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="am-handle" />

        <button className="am-close" onClick={onClose} aria-label="Close">
          <FiX size={18} />
        </button>

        <div className="am-header">
          <div className="am-avatar">
            {agent?.avatar_url ? (
              <img src={agent.avatar_url} alt={agentName} />
            ) : (
              <span>{agentInitial}</span>
            )}
          </div>

          <div className="am-header-text">
            <h3>{agentName}</h3>
            {agencyName && <p className="am-agency-name">{agencyName}</p>}
          </div>
        </div>

        <div className="am-stats-row">
          <div className="am-stat">
            <FiHome size={16} className="am-stat-icon" />
            <span className="am-stat-value">
              {loadingCount ? "—" : otherListingsCount}
            </span>
            <span className="am-stat-label">Listings</span>
          </div>
          <div className="am-stat">
            <FiAward size={16} className="am-stat-icon" />
            <span className="am-stat-value">{joinedYear}</span>
            <span className="am-stat-label">Joined</span>
          </div>
          <div className="am-stat">
            <FiClock size={16} className="am-stat-icon" />
            <span className="am-stat-value">Live</span>
            <span className="am-stat-label">Chat</span>
          </div>
        </div>

        <p className="am-response-hint">{responseHint}</p>

        <div className="am-actions">
          <button className="am-action-btn am-action-message" onClick={onMessage}>
            <FiMessageCircle size={16} /> Message {agentName.split(" ")[0]}
          </button>
        </div>

        <p className="am-disclaimer">
          This opens a real chat with the agent who listed this property.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function PropertyCard({ property, onViewDetails, className = "" }) {
  const { user } = UserAuth();
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [toast,    setToast]    = useState(null); // { message, type }
  const [agentModalOpen, setAgentModalOpen] = useState(false);
  const [agentProfile, setAgentProfile] = useState(property?.profiles || null);
  const toastTimer = useRef(null);
  const openingModalRef = useRef(false); // guards against a click firing the open handler more than once

  // ── Toast helpers ─────────────────────────────────────────────────────────
  const showToast = (message, type = "info") => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  };

  const dismissToast = () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(null);
  };

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!agentModalOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
      openingModalRef.current = false;
    };
  }, [agentModalOpen]);

  useEffect(() => {
    if (property?.profiles) {
      setAgentProfile(property.profiles);
      return;
    }

    if (!property?.agent_id) {
      setAgentProfile(null);
      return;
    }

    let isMounted = true;

    const loadAgentProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", property.agent_id)
        .maybeSingle();

      if (!isMounted || error) return;
      setAgentProfile(data);
    };

    loadAgentProfile();

    return () => {
      isMounted = false;
    };
  }, [property?.agent_id, property?.profiles]);

  const cat       = getCat(property.listing_category);
  const amenities = (property.amenities || []).slice(0, 4);

  // ── Check if already saved ────────────────────────────────────────────────
  useEffect(() => {
    const checkSaved = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("saved_properties")
        .select("*")
        .eq("user_id",     user.id)
        .eq("property_id", property.id)
        .maybeSingle();
      setSaved(!!data);
    };
    checkSaved();
  }, [user, property.id]);

  // ── Toggle save ───────────────────────────────────────────────────────────
  const toggleSave = async () => {
    if (!user) {
      showToast("Please log in to save properties.", "info");
      return;
    }
    if (saved) {
      const { error } = await supabase
        .from("saved_properties")
        .delete()
        .eq("user_id",     user.id)
        .eq("property_id", property.id);
      if (!error) {
        setSaved(false);
        showToast("Removed from saved properties.", "success");
      } else {
        showToast("Couldn't remove property. Try again.", "error");
      }
    } else {
      const { error } = await supabase
        .from("saved_properties")
        .insert({ user_id: user.id, property_id: property.id });
      if (!error) {
        setSaved(true);
        showToast("Saved to your list.", "success");
      } else {
        showToast("Couldn't save property. Try again.", "error");
      }
    }
  };

  const price       = property.price
    ? `₦${Number(property.price).toLocaleString()}`
    : "Price on request";

  const agentName    = agentProfile?.full_name || property.profiles?.full_name || "Unknown Agent";
  const agentInitial = agentName.charAt(0).toUpperCase();

  const description = property.description
    ? property.description.length > 100
      ? property.description.slice(0, 100) + "…"
      : property.description
    : null;

  const agentForModal = agentProfile
    ? { ...agentProfile, id: property.agent_id }
    : property.profiles
      ? { ...property.profiles, id: property.agent_id }
      : null;

// ── Open the agent sheet, guarded so a double tap can't open it twice ──
const handleOpenAgentModal = (e) => {
  e.preventDefault();
  e.stopPropagation();

  if (e.detail > 1) return;
  if (agentModalOpen || openingModalRef.current) return;

  openingModalRef.current = true;
  setAgentModalOpen(true);
};

const handleCloseAgentModal = () => {
  openingModalRef.current = false;
  setAgentModalOpen(false);
};

// ── Message button: go straight to the chat with this agent pre-selected ──
const handleMessageAgent = () => {
  if (!agentForModal?.id) return;
  openingModalRef.current = false;
  setAgentModalOpen(false);
  navigate("/userchats", { replace: true, state: { agentId: agentForModal.id } });
};

  return (
    <article className={["pc-card", className].filter(Boolean).join(" ")}>

      {/* ── Toast ── */}
      {toast && (
        <div className={`pc-toast pc-toast-${toast.type}`} role="status">
          <span className="pc-toast-icon">{TOAST_ICON[toast.type]}</span>
          <span className="pc-toast-msg">{toast.message}</span>
          <button
            className="pc-toast-close"
            onClick={dismissToast}
            aria-label="Dismiss notification"
          >
            <FiX size={14} />
          </button>
        </div>
      )}

      {/* ── Image ── */}
      <div className="pc-img-wrap">
        <img
          src={
            (!imgError && property.images?.[0]) ||
            "https://placehold.co/600x400/f1f5f9/94a3b8?text=No+Image"
          }
          alt={property.title}
          className="pc-img"
          onError={() => setImgError(true)}
        />

        <span className="pc-cat-chip" style={{ background: `${cat.accent}e0` }}>
          {cat.icon} {cat.label}
        </span>

        <span className="pc-type-badge">{property.type}</span>

        <button
          className="pc-save-btn"
          onClick={toggleSave}
          aria-label={saved ? "Remove from saved" : "Save property"}
          title={saved ? "Remove from saved" : "Save property"}
        >
          {saved
            ? <FaHeart    className="pc-heart-filled" />
            : <FaRegHeart className="pc-heart-empty"  />
          }
        </button>
      </div>

      {/* ── Body ── */}
      <div className="pc-body">
        <h3 className="pc-title">{property.title}</h3>

        <div className="pc-meta">
          <span className="pc-meta-item">
            <FiMapPin size={12} /> {property.location}
          </span>
          <span className="pc-meta-item">
            <FiHome size={12} /> {property.state}
          </span>
          {property.school && (
            <span className="pc-meta-item">
              <FiBookOpen size={12} /> {property.school}
            </span>
          )}
        </div>

        {description && <p className="pc-description">{description}</p>}

        {amenities.length > 0 && (
          <div className="pc-amenities">
            {amenities.map((raw, i) => {
              const a = getAmenity(raw);
              return (
                <span key={i} className="pc-amenity">
                  {a.icon} {a.label}
                </span>
              );
            })}
            {(property.amenities?.length || 0) > 4 && (
              <span className="pc-amenity pc-amenity-more">
                +{property.amenities.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="pc-footer">

        {/* Agent — clickable, guarded against double-open */}
        <button
          type="button"
          className="pc-agent-row pc-agent-row-clickable"
          onClick={handleOpenAgentModal}
          aria-label={`View ${agentName}'s profile`}
        >
          <div className="pc-agent-avatar">
            {agentProfile?.avatar_url || property.profiles?.avatar_url ? (
              <img src={agentProfile?.avatar_url || property.profiles?.avatar_url} alt={agentName} />
            ) : (
              <span>{agentInitial}</span>
            )}
          </div>
          <span className="pc-agent-name">{agentName}</span>
          <FiChevronRight size={13} className="pc-agent-chevron" />
        </button>

        {/* Price + CTA */}
        <div className="pc-price-row">
          <div>
            <span className="pc-price">{price}</span>
            <span className="pc-price-period">/yr</span>
          </div>
          <button
            className="pc-btn"
            onClick={() => onViewDetails?.(property.id)}
            aria-label={`View details for ${property.title}`}
          >
            View <FiChevronRight size={14} />
          </button>
        </div>

      </div>

      {typeof document !== "undefined" &&
        createPortal(
          <AgentDetailModal
            agent={agentForModal}
            open={agentModalOpen}
            onClose={handleCloseAgentModal}
            onMessage={handleMessageAgent}
          />,
          document.body
        )}
    </article>
  );
}