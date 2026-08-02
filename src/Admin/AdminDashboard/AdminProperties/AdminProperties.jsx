import React, { useState, useRef, useEffect } from "react";
import "./AdminProperties.css";
import { supabase } from "../../../lib/supabase"
import {
  FiSearch, FiFilter, FiPlus, FiX, FiCheck,
  FiEye, FiEdit2, FiTrash2, FiMapPin, FiHome,
  FiChevronDown, FiUploadCloud, FiAlertTriangle,
  FiCheckCircle, FiClock, FiSlash,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

// ── Enrich house_List with admin-relevant fields ──────────────────────────────


const STATUS_TABS  = ["All", "Approved", "Pending", "Rejected", "Flagged"];
const TYPE_OPTIONS = ["All Types", "Apartment", "Self-Contain", "Duplex", "Lodge", "Hostel"];

// ── Status badge ───────────────────────────────────────────────────────────────
function StatusBadge({ status, flagged }) {
  if (flagged) return (
    <span className="ap2-badge ap2-badge-flagged">
      <FiAlertTriangle size={10} /> Flagged
    </span>
  );
  const map = {
    Approved: "ap2-badge-approved",
    Pending:  "ap2-badge-pending",
    Rejected: "ap2-badge-rejected",
  };
  return <span className={`ap2-badge ${map[status] || ""}`}>{status}</span>;
}

// ── Confirm dialog ─────────────────────────────────────────────────────────────
function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    
    <div className="ap2-confirm-backdrop" onClick={onCancel}>
      <div className="ap2-confirm" onClick={e => e.stopPropagation()}>
        <FiAlertTriangle size={28} className="ap2-confirm-icon" />
        <p>{message}</p>
        <div className="ap2-confirm-actions">
          <button className="ap2-btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="ap2-btn-danger" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

// ── Property detail modal ──────────────────────────────────────────────────────
function DetailModal({ property, onClose, onApprove, onReject, onFlag }) {
  return (

    <div className="ap2-modal-backdrop" onClick={onClose}>
      <motion.div
        className="ap2-detail-modal"
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0,  scale: 1    }}
        exit={{    opacity: 0, y: 30, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="ap2-detail-header">
          <div>
            <h3 className="ap2-detail-title">{property.name}</h3>
            <p className="ap2-detail-sub">Listed by {property.agent} · {property.listedOn}</p>
          </div>
          <button className="ap2-icon-btn" onClick={onClose} aria-label="Close">
            <FiX size={17} />
          </button>
        </div>

        {/* Image */}
        <div className="ap2-detail-img-wrap">
          <img src={property.image} alt={property.name} className="ap2-detail-img" />
          <div className="ap2-detail-img-overlay">
            <StatusBadge status={property.status} flagged={property.flagged} />
          </div>
        </div>

        {/* Info grid */}
         <div className="ap2-detail-grid">
  <div className="ap2-detail-section-title">
    Property Information
  </div>
          {[
            ["Type",     property.type],
            ["State",    property.state],
            ["Location", property.location],
            ["Price",    property.price],
            ["Agent",    property.agent],
            ["Listed",   property.listedOn],
          ].map(([k, v]) => (
            <div key={k} className="ap2-detail-row">
              <span>{k}</span><strong>{v}</strong>
            </div>
          ))}
          <div className="ap2-detail-section">
  <h4>Description</h4>
  <p>{property.description || "No description available"}</p>
</div>

<div className="ap2-detail-section">
  <h4>Amenities</h4>

  {property.amenities?.length > 0 ? (
    <div className="ap2-amenities-grid">
      {property.amenities.map((item, index) => (
        <span key={index} className="ap2-amenity-pill">
          {item}
        </span>
      ))}
    </div>
  ) : (
    <p>No amenities available</p>
  )}
</div>

{property.listing_category === "featured_student" && (
  <div className="ap2-detail-section ap2-school-card">
    <h4>School Information</h4>
    <p>{property.school || "No school specified"}</p>
  </div>
)}
        </div>

        {/* Actions */}
        <div className="ap2-detail-footer">
          {property.status !== "Approved" && (
            <button className="ap2-btn-approve" onClick={() => onApprove(property.id)}>
              <FiCheckCircle size={14} /> Approve
            </button>
          )}
          {property.status !== "Rejected" && (
            <button className="ap2-btn-reject" onClick={() => onReject(property.id)}>
              <FiSlash size={14} /> Reject
            </button>
          )}
          <button className="ap2-btn-flag" onClick={() => onFlag(property.id)}>
            <FiAlertTriangle size={14} /> {property.flagged ? "Unflag" : "Flag"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Add property modal ─────────────────────────────────────────────────────────
function AddModal({ onClose }) {
  const fileRef = useRef(null);
  const [images, setImages] = useState([]);
  const [form, setForm] = useState({
    name: "", state: "", location: "", type: "", price: "", agent: "", description: "",
  });

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleFiles = e => {
    const files = Array.from(e.target.files).slice(0, 8 - images.length);
    const previews = files.map(f => ({ url: URL.createObjectURL(f), name: f.name }));
    setImages(p => [...p, ...previews]);
  };

  const handleSubmit = e => {
    e.preventDefault();
    alert("Property submitted for review!");
    onClose();
  };

  return (
    <div className="ap2-modal-backdrop" onClick={onClose}>
      <motion.div
        className="ap2-add-modal"
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0,  scale: 1    }}
        exit={{    opacity: 0, y: 30, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="ap2-add-header">
          <div>
            <h3>Add New Property</h3>
            <p>Fill in the details to list a property</p>
          </div>
          <button className="ap2-icon-btn" onClick={onClose}><FiX size={17} /></button>
        </div>

        <div className="ap2-add-body">
          <form onSubmit={handleSubmit}>
            <div className="ap2-form-grid">
              <div className="ap2-field ap2-full">
                <label>Property Name *</label>
                <input name="name" placeholder="e.g. Luxury 2 Bedroom Apartment"
                  value={form.name} onChange={handleChange} required />
              </div>
              <div className="ap2-field">
                <label>Type</label>
                <select name="type" value={form.type} onChange={handleChange} required>
                  <option value="">Select type</option>
                  {["Apartment","Self-Contain","Lodge","Duplex","Hostel","Bungalow"].map(t => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="ap2-field">
                <label>Price (₦)</label>
                <input name="price" placeholder="e.g. 500,000"
                  value={form.price} onChange={handleChange} required />
              </div>
              <div className="ap2-field">
                <label>State</label>
                <input name="state" placeholder="e.g. Lagos"
                  value={form.state} onChange={handleChange} required />
              </div>
              <div className="ap2-field">
                <label>Location / Area</label>
                <input name="location" placeholder="e.g. Lekki Phase 1"
                  value={form.location} onChange={handleChange} required />
              </div>
              <div className="ap2-field ap2-full">
                <label>Agent Name</label>
                <input name="agent" placeholder="Listing agent full name"
                  value={form.agent} onChange={handleChange} />
              </div>
              <div className="ap2-field ap2-full">
                <label>Description</label>
                <textarea name="description" rows={3}
                  placeholder="Describe the property…"
                  value={form.description} onChange={handleChange} />
              </div>
            </div>

            {/* Image upload */}
            <div className="ap2-dropzone" onClick={() => fileRef.current?.click()}>
              <input ref={fileRef} type="file" multiple accept="image/*"
                hidden onChange={handleFiles} />
              <FiUploadCloud size={26} />
              <p>Click to upload photos <span>· Max 8 images</span></p>
            </div>

            {images.length > 0 && (
              <div className="ap2-img-preview">
                {images.map((img, i) => (
                  <div key={i} className="ap2-preview-thumb">
                    <img src={img.url} alt={img.name} />
                    <button type="button" onClick={() =>
                      setImages(p => p.filter((_, j) => j !== i))}>
                      <FiX size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="ap2-add-footer">
              <button type="button" className="ap2-btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="ap2-btn-primary">Submit listing</button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
function PropertyActionModal({
  type,
  property,
  onClose,
  onConfirm,
}) {
  const [reason, setReason] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!reason.trim()) {
      return setError("Please enter a reason.");
    }

    if (password !== "admin@123") {
      return setError("Invalid admin password.");
    }

    onConfirm(reason);
  };

  return (
    <div
      className="ap2-confirm-backdrop"
      onClick={onClose}
    >
      <div
        className="ap2-action-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>
          {type === "approve"
            ? "Approve Property"
            : "Reject Property"}
        </h3>

        <p>
          You are about to{" "}
          <strong>{type}</strong>{" "}
          <strong>{property?.name}</strong>
        </p>

        <div className="ap2-field">
          <label>
            {type === "approve"
              ? "Approval Note"
              : "Reason For Rejection"}
          </label>

          <textarea
            rows="4"
            value={reason}
            onChange={(e) =>
              setReason(e.target.value)
            }
            placeholder={
              type === "approve"
                ? "Property verified and approved..."
                : "Explain why property was rejected..."
            }
          />
        </div>

        <div className="ap2-field">
          <label>Admin Password</label>

          <input
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            placeholder="Enter admin password"
          />
        </div>

        {error && (
          <span className="ap2-error">
            {error}
          </span>
        )}

        <div className="ap2-confirm-actions">
          <button
            className="ap2-btn-ghost"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className={
              type === "approve"
                ? "ap2-btn-approve"
                : "ap2-btn-reject"
            }
            onClick={handleSubmit}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
export default function AdminProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusTab,   setStatusTab]   = useState("All");
  const [typeFilter,  setTypeFilter]  = useState("All Types");
  const [search,      setSearch]      = useState("");
  const [viewProp,    setViewProp]    = useState(null);
  const [showAdd,     setShowAdd]     = useState(false);
  const [confirm,     setConfirm]     = useState(null); // { message, onConfirm }
  const [categoryFilter, setCategoryFilter] = useState("All Categories");

  const CATEGORY_OPTIONS = [
  { label: "All Categories", value: "all" },
  { label: "Featured Homes", value: "featured_home" },
  { label: "Featured Students", value: "featured_student" },
];
  
 const fetchProperties = async () => {
  try {
    setLoading(true);

    // Step 1: fetch properties only
    const { data: propsData, error: propsError } = await supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false });

    if (propsError) throw propsError;

    // Step 2: get unique agent_ids (filter out nulls)
    const agentIds = [...new Set(
      propsData.map(p => p.agent_id).filter(Boolean)
    )];

    // Step 3: fetch matching profiles
let profilesMap = {};
if (agentIds.length > 0) {
  const { data: profilesData, error: profilesError } = await supabase
    .from("profiles")
    .select("id, full_name, email")   // ← removed avatar_url
    .in("id", agentIds);

  if (profilesError) throw profilesError;

  profilesData.forEach(p => { profilesMap[p.id] = p; });
}

    // Step 4: merge and format
    const formattedProperties = (propsData || []).map((item) => {
      const profile = profilesMap[item.agent_id] || null;

      return {
        id: item.id,
        name: item.title || "Untitled Property",
        image: item.images?.[0] || "/placeholder.jpg",
        location: item.location || "No location",
        state: item.state || "No state",
        type: item.type || "Apartment",
        description: item.description || "",
        amenities: item.amenities || [],
        school: item.school || "",
        listing_category: item.listing_category || "featured_home",
        price: item.price ? `₦${Number(item.price).toLocaleString()}` : "₦0",
        status:
          item.status === "approved" ? "Approved" :
          item.status === "rejected" ? "Rejected" : "Pending",
        flagged: item.flagged || false,
        agent: profile?.full_name || "Unknown Agent",
        agentEmail: profile?.email || "",
        agentAvatar:
          profile?.avatar_url ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || "Agent")}`,
        listedOn: new Date(item.created_at).toLocaleDateString(),
      };
    });

    setProperties(formattedProperties);

  } catch (error) {
    console.error("FETCH ERROR:", error);
    console.error("MESSAGE:", error.message);
    console.error("DETAILS:", error.details);
    console.error("HINT:", error.hint);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
  fetchProperties();
}, []);

  const handleApprove = async (id) => {
  try {
    const { error } = await supabase
      .from("properties")
      .update({
        status: "approved",
      })
      .eq("id", id);

    if (error) throw error;

    fetchProperties();
    setViewProp(null);

  } catch (error) {
    console.log(error);
  }
};

  const handleReject = async (id) => {
  try {
    const { error } = await supabase
      .from("properties")
      .update({
        status: "rejected",
      })
      .eq("id", id);

    if (error) throw error;

    fetchProperties();
    setViewProp(null);

  } catch (error) {
    console.log(error);
  }
};

  const handleFlag = async (id) => {
  try {

    const currentProperty = properties.find(p => p.id === id);

    const { error } = await supabase
      .from("properties")
      .update({
        flagged: !currentProperty.flagged,
      })
      .eq("id", id);

    if (error) throw error;

    fetchProperties();
    setViewProp(null);

  } catch (error) {
    console.log(error);
  }
};
     

  const handleDelete = (id) => {
  setConfirm({
    message: "Permanently delete this property? This cannot be undone.",

    onConfirm: async () => {
      try {
        const { error } = await supabase
          .from("properties")
          .delete()
          .eq("id", id);

        if (error) throw error;

        fetchProperties();
        setConfirm(null);

      } catch (error) {
        console.log(error);
      }
    },
  });
};

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = properties.filter((h) => {
  const q = search.toLowerCase();

  const matchSearch =
    !q ||
    h.name.toLowerCase().includes(q) ||
    h.location?.toLowerCase().includes(q) ||
    h.agent?.toLowerCase().includes(q);

  const matchType =
    typeFilter === "All Types" ||
    h.type === typeFilter;

  const matchStatus =
    statusTab === "All"
      ? true
      : statusTab === "Flagged"
      ? h.flagged
      : h.status === statusTab;

  const matchCategory =
    categoryFilter === "All Categories" ||
    h.listing_category === categoryFilter;

  return (
    matchSearch &&
    matchType &&
    matchStatus &&
    matchCategory
  );
});

  const featuredHomes = filtered.filter(
  property => property.listing_category === "Featured Homes"
);

const featuredStudents = filtered.filter(
  property => property.listing_category === "Featured Students"
);
  // ── Tab counts ────────────────────────────────────────────────────────────
  const tabCount = tab =>
    tab === "All"     ? properties.length :
    tab === "Flagged" ? properties.filter(h => h.flagged).length :
    properties.filter(h => h.status === tab).length;

    const renderPropertyCard = (house) => (
  <div
    key={house.id}
    className={`ap2-card ${
      house.flagged ? "ap2-card-flagged" : ""
    }`}
  >
    <div className="ap2-card-img-wrap">
      <img
        src={house.image}
        alt={house.name}
        className="ap2-card-img"
      />

      <div className="ap2-card-badges">
        <StatusBadge
          status={house.status}
          flagged={house.flagged}
        />
      </div>
    </div>

    <div className="ap2-card-body">
      <div className="ap2-agent">
        <img
          src={house.agentAvatar}
          alt={house.agent}
          className="ap2-agent-avatar"
        />

        <div>
          <span>Listed By</span>
          <strong>{house.agent}</strong>
        </div>
      </div>

      <h3 className="ap2-card-name">{house.name}</h3>

      <div className="ap2-card-meta">
        <span>
          <FiMapPin size={11} />
          {house.location}
        </span>

        <span>
          <FiHome size={11} />
          {house.type}
        </span>
      </div>

      <span className="ap2-category-badge">
        {house.listing_category}
      </span>
    </div>
  </div>
);
  return (
    <div className="ap2-page">
      {/* ── Page header ── */}
      <div className="ap2-page-header">
        <div>
          <h1 className="ap2-title">Properties</h1>
          <p className="ap2-sub">Review, approve and manage all listed properties</p>
        </div>
        <button className="ap2-btn-primary" onClick={() => setShowAdd(true)}>
          <FiPlus size={15} /> Add Property
        </button>
      </div>

      {/* ── Status tabs ── */}
      <div className="ap2-status-tabs">
        {STATUS_TABS.map(tab => (
          <button
            key={tab}
            className={`ap2-status-tab ${statusTab === tab ? "ap2-status-tab-active" : ""}`}
            onClick={() => setStatusTab(tab)}
          >
            {tab === "Approved" && <FiCheckCircle size={13} />}
            {tab === "Pending"  && <FiClock size={13} />}
            {tab === "Rejected" && <FiSlash size={13} />}
            {tab === "Flagged"  && <FiAlertTriangle size={13} />}
            {tab}
            <span className="ap2-tab-count">{tabCount(tab)}</span>
          </button>
        ))}
      </div>

      {/* ── Controls ── */}
      <div className="ap2-controls">
        <div className="ap2-type-select">
  <FiHome size={13} />

  <select
  value={categoryFilter}
  onChange={(e) => setCategoryFilter(e.target.value)}
>
  {CATEGORY_OPTIONS.map((category) => (
    <option
      key={category.value}
      value={category.value}
    >
      {category.label}
    </option>
  ))}
</select>
</div>
        <div className="ap2-search">
          <FiSearch size={14} className="ap2-search-icon" />
          <input
            type="text"
            placeholder="Search by name, location or agent…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="ap2-type-select">
          <FiFilter size={13} className="ap2-filter-icon" />
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            {TYPE_OPTIONS.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Results count ── */}
      <p className="ap2-result-count">
        {filtered.length} propert{filtered.length !== 1 ? "ies" : "y"} found
      </p>

      {/* ── Property grid ── */}
      {loading ? (

  <div className="ap2-loading">
    <div className="ap2-spinner"></div>
    <p>Loading properties...</p>
  </div>

) : filtered.length === 0 ? (

  <div className="ap2-empty">
    <FiHome size={36} />
    <p>No properties found.</p>
  </div>

) : (
        <div className="ap2-grid">
          {filtered.map(house => (
            <div key={house.id} className={`ap2-card ${house.flagged ? "ap2-card-flagged" : ""}`}>
              {/* Image */}
              <div className="ap2-card-img-wrap">
                <img src={house.image} alt={house.name} className="ap2-card-img" />
                <div className="ap2-card-badges">
                  <StatusBadge status={house.status} flagged={house.flagged} />
                </div>
              </div>

              {/* Body */}
              <div className="ap2-card-body">

  {/* Category */}
  <span className="ap2-category-badge">
    {house.listing_category}
  </span>

  {/* Property Name */}
  <h3 className="ap2-card-name">
    {house.name}
  </h3>

  {/* Price */}
  <div className="ap2-card-price">
    {house.price}
  </div>

  {/* Location */}
  <div className="ap2-card-location">
    <FiMapPin />
    <span>
      {house.location}, {house.state}
    </span>
  </div>

  {/* Property Type */}
  <div className="ap2-card-type">
    <FiHome />
    <span>{house.type}</span>
  </div>

  {/* Agent */}
  <div className="ap2-agent">
    <img
      src={house.agentAvatar}
      alt={house.agent}
      className="ap2-agent-avatar"
    />

    <div>
      <small>Listed By</small>
      <strong>{house.agent}</strong>
    </div>
  </div>

</div>

              {/* Actions */}
               <div className="ap2-card-actions">

  <button
    className="ap2-icon-btn ap2-view-btn"
    onClick={() => setViewProp(house)}
  >
    <FiEye />
  </button>

  {house.status !== "Approved" && (
    <button
      className="ap2-btn-approve"
      onClick={() => handleApprove(house.id)}
    >
      Approve
    </button>
  )}

  {house.status !== "Rejected" && (
    <button
      className="ap2-btn-reject"
      onClick={() => handleReject(house.id)}
    >
      Reject
    </button>
  )}

  <button
    className="ap2-icon-btn ap2-del-btn"
    onClick={() => handleDelete(house.id)}
  >
    <FiTrash2 />
  </button>

</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modals ── */}
      <AnimatePresence>
        {viewProp && (
          <DetailModal
            key="detail"
            property={viewProp}
            onClose={() => setViewProp(null)}
            onApprove={handleApprove}
            onReject={handleReject}
            onFlag={handleFlag}
          />
        )}
        {showAdd && (
          <AddModal key="add" onClose={() => setShowAdd(false)} />
        )}
      </AnimatePresence>

      {/* ── Confirm dialog ── */}
      {confirm && (
        <ConfirmModal
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}