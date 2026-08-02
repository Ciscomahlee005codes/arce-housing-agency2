import { useEffect, useState } from "react";
import { UserAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import "@tabler/icons-webfont/dist/tabler-icons.min.css";
import "./RentalHistory.css";

const NG_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo",
  "Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa",
  "Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba",
  "Yobe","Zamfara",
];

const BLANK_LISTING = {
  propertyName: "", address: "", state: "", city: "", type: "",
  bedrooms: "", bathrooms: "", rent: "", description: "", agentName: "",
  agentPhone: "", imageUrl: "",
};

// ── Safely capitalize a status string, falling back if missing ─────────────────
function capitalizeStatus(status, fallback = "Pending") {
  if (!status || typeof status !== "string") return fallback;
  return status.charAt(0).toUpperCase() + status.slice(1);
}

// ── Status badge ──────────────────────────────────────────────────────────────
function TourBadge({ status }) {
  const map = {
    Completed: { cls: "badge-success", label: "Completed" },
    Pending:   { cls: "badge-pending", label: "Pending" },
    Cancelled: { cls: "badge-danger",  label: "Cancelled" },
  };
  const { cls, label } = map[status] || { cls: "badge-pending", label: status };
  return <span className={`badge ${cls}`}>{label}</span>;
}

function RentalBadge({ status }) {
  if (status === "—" || !status) return <span className="badge-neutral">Awaiting outcome</span>;
  const map = {
    "Successful Rental": { cls: "badge-success", label: "Rented" },
    "Not Rented":        { cls: "badge-danger",  label: "Not Rented" },
  };
  const { cls, label } = map[status] || { cls: "badge-pending", label: status };
  return <span className={`badge ${cls}`}>{label}</span>;
}

// ── Star rating input ─────────────────────────────────────────────────────────
function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="star-row">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          className={`star ${i <= (hovered || value) ? "star-on" : ""}`}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(i)}
          aria-label={`${i} star`}
        >★</button>
      ))}
      {value > 0 && <span className="star-label">{value}/5</span>}
    </div>
  );
}

// ── Modal wrapper ─────────────────────────────────────────────────────────────
function Modal({ title, subtitle, onClose, children, size = "md" }) {
  return (
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`modal-box modal-${size}`} role="dialog" aria-modal="true">
        <div className="modal-header">
          <div>
            <span className="modal-title">{title}</span>
            {subtitle && <span className="modal-header-sub">{subtitle}</span>}
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

// ── Skeleton loading card ─────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rh-card rh-skeleton">
      <div className="sk-block sk-image" />
      <div className="sk-block sk-line" style={{ width: "55%" }} />
      <div className="sk-block sk-line" style={{ width: "35%" }} />
      <div className="sk-meta-row">
        <div className="sk-block sk-chip" />
        <div className="sk-block sk-chip" />
        <div className="sk-block sk-chip" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function RentalHistory() {
  const [filterStatus, setFilterStatus] = useState("All");
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const { user } = UserAuth();
  const [feedback,     setFeedback]     = useState({});
  const [submitted,    setSubmitted]    = useState({});
  const [feedbackOpen, setFeedbackOpen] = useState(null);
  const [reschedOpen,  setReschedOpen]  = useState(null);
  const [reschedData,  setReschedData]  = useState({});
  const [expandedIds,  setExpandedIds]  = useState(() => new Set());

  const [listing,      setListing]      = useState(BLANK_LISTING);
  const [listModalOpen, setListModalOpen] = useState(false);
  const [listSubmitting, setListSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // ── Summary stats ─────────────────────────────────────────────────────────
  const totalTours    = rentals.length;
  const completed     = rentals.filter(r => r.tourStatus === "Completed").length;
  const successful    = rentals.filter(r => r.rentalStatus === "Successful Rental").length;
  const pending        = rentals.filter(r => r.tourStatus === "Pending").length;

  const STATS = [
    { key: "total",     label: "Total tours",       value: totalTours, icon: "ti-calendar-event", tone: "" },
    { key: "completed", label: "Completed",          value: completed,  icon: "ti-circle-check",   tone: "stat-green" },
    { key: "rented",    label: "Successful rentals", value: successful, icon: "ti-key",             tone: "stat-blue" },
    { key: "pending",   label: "Pending tours",      value: pending,    icon: "ti-clock",            tone: "stat-amber" },
  ];

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = filterStatus === "All"
    ? rentals
    : rentals.filter(r => r.tourStatus === filterStatus);

  // ── Toast helper ──────────────────────────────────────────────────────────
  const showToast = (message, tone = "success") => {
    setToast({ message, tone });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Expand / collapse card details ────────────────────────────────────────
  const toggleExpand = (id) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Feedback handlers ─────────────────────────────────────────────────────
  const submitFeedback = (id) => {
    const fb = feedback[id] || {};
    if (!fb.rating) { showToast("Please select a star rating first.", "danger"); return; }
    setSubmitted(prev => ({ ...prev, [id]: true }));
    setFeedbackOpen(null);
    showToast("Thanks — your feedback was sent.");
  };

  // ── Reschedule handlers ───────────────────────────────────────────────────
  const openReschedule = (item) => {
    setReschedData(prev => ({
      ...prev,
      [item.id]: { date: item.date, time: item.time.replace(" AM","").replace(" PM","") },
    }));
    setReschedOpen(item.id);
  };

  const submitReschedule = (id) => {
    const d = reschedData[id];
    setRentals(prev => prev.map(r =>
      r.id === id ? { ...r, date: d.date, time: d.time } : r
    ));
    setReschedOpen(null);
    showToast("Tour rescheduled.");
  };

  // ── Cancel tour ───────────────────────────────────────────────────────────
  const cancelTour = (id) => {
    if (!window.confirm("Cancel this tour?")) return;
    setRentals(prev => prev.map(r =>
      r.id === id ? { ...r, tourStatus: "Cancelled" } : r
    ));
    showToast("Tour cancelled.");
  };

  // ── Listing form handlers ─────────────────────────────────────────────────
  const handleListingChange = (e) => {
    const { name, value } = e.target;
    setListing(prev => ({ ...prev, [name]: value }));
  };

  const closeListModal = () => {
    setListModalOpen(false);
    setListing(BLANK_LISTING);
  };

  const submitListing = (e) => {
    e.preventDefault();
    setListSubmitting(true);
    // Simulated submit — swap for the real request when the endpoint is ready.
    setTimeout(() => {
      setListSubmitting(false);
      setListModalOpen(false);
      setListing(BLANK_LISTING);
      showToast("Property listed — our team will review it shortly.");
    }, 600);
  };

  useEffect(() => {
    const fetchRentalHistory = async () => {
      if (!user) {
        setRentals([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setFetchError(null);

      try {
        const { data, error } = await supabase
          .from("property_tours")
          .select(`
            *,
            properties (
              id,
              title,
              location,
              state,
              price,
              images
            )
          `)
          .eq("tenant_id", user.id)
          .order("created_at", {
            ascending: false,
          });

        if (error) {
          throw error;
        }

        const formattedData = (data || []).map((tour) => ({
          id: tour.id,
          propertyName: tour.properties?.title || "Property",
          location: tour.properties?.location || "",
          state: tour.properties?.state || "",
          date: tour.tour_date,
          time: tour.tour_time,
          fullName: tour.full_name,
          phone: tour.phone,
          email: tour.email,
          message: tour.message,
          createdAt: tour.created_at,
          tourStatus: capitalizeStatus(tour.status),
          rentalStatus: tour.rental_status || "—",
          agent: tour.agent_name || "Agent",
          image: tour.properties?.images?.[0],
        }));

        setRentals(formattedData);
      } catch (error) {
        console.error("Rental history fetch error:", error);
        setRentals([]);
        setFetchError(
          error?.message || "Something went wrong loading your rental history."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRentalHistory();
  }, [user]);

  const activeItem  = feedbackOpen !== null ? rentals.find(r => r.id === feedbackOpen) : null;
  const reschedItem = reschedOpen  !== null ? rentals.find(r => r.id === reschedOpen)  : null;

  return (
    <div className="rh-page">

      {/* ── Page header ── */}
      <div className="rh-header">
        <div className="rh-header-text">
          <h1 className="rh-title">Rental history</h1>
          <p className="rh-subtitle">Every tour you've booked, and how it turned out.</p>
        </div>
        <button className="rh-list-btn" onClick={() => setListModalOpen(true)}>
          <i className="ti ti-plus" aria-hidden="true" />
          List a property
        </button>
      </div>

      {fetchError && (
        <div className="rh-error-banner">
          <i className="ti ti-alert-triangle" aria-hidden="true" />
          Couldn't load your rental history — {fetchError}
        </div>
      )}

      {/* Summary stats */}
      <div className="rh-stats">
        {STATS.map(s => (
          <div className="stat-card" key={s.key}>
            <div className={`stat-icon ${s.tone}`}>
              <i className={`ti ${s.icon}`} aria-hidden="true" />
            </div>
            <div className="stat-text">
              <span className="stat-value">{loading ? "—" : s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filter pills */}
      <div className="rh-filters">
        {["All", "Completed", "Pending", "Cancelled"].map(f => (
          <button
            key={f}
            className={`filter-pill ${filterStatus === f ? "filter-pill-active" : ""}`}
            onClick={() => setFilterStatus(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Cards / loading / empty */}
      {loading ? (
        <div className="rh-cards">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rh-empty">
          <div className="rh-empty-icon">
            <i className="ti ti-home-search" aria-hidden="true" />
          </div>
          <h3>No rental history yet</h3>
          <p>
            You haven't booked any property tours. Once you book a tour,
            it'll show up here.
          </p>
          <button
            className="rh-explore-btn"
            onClick={() => (window.location.href = "/viewhomes")}
          >
            Explore properties
          </button>
        </div>
      ) : (
        <div className="rh-cards">
          {filtered.map(item => {
            const isOpen = expandedIds.has(item.id);
            return (
              <div key={item.id} className="rh-card">
                {/* Image + floating status */}
                <div className="rh-card-image-wrap">
                  {item.image ? (
                    <img src={item.image} alt={item.propertyName} className="rh-property-image" />
                  ) : (
                    <div className="rh-property-image rh-property-image-placeholder">
                      <i className="ti ti-building-community" aria-hidden="true" />
                    </div>
                  )}
                  <div className="rh-image-scrim" />
                  <span className="rh-status-float">
                    <TourBadge status={item.tourStatus} />
                  </span>
                  <div className="rh-image-caption">
                    <span className="rh-property-name">{item.propertyName}</span>
                    <span className="rh-location">
                      <i className="ti ti-map-pin" aria-hidden="true" />
                      {item.location}
                    </span>
                  </div>
                </div>

                {/* Card body */}
                <div className="rh-card-body">
                  <div className="rh-card-meta">
                    <div className="rh-meta-item">
                      <i className="ti ti-calendar" aria-hidden="true"/>
                      <div className="rh-meta-block">
                        <span className="rh-meta-label">Date</span>
                        <span className="rh-meta-value">{item.date}</span>
                      </div>
                    </div>
                    <div className="rh-meta-item">
                      <i className="ti ti-clock" aria-hidden="true"/>
                      <div className="rh-meta-block">
                        <span className="rh-meta-label">Time</span>
                        <span className="rh-meta-value">{item.time}</span>
                      </div>
                    </div>
                    <div className="rh-meta-item">
                      <i className="ti ti-user" aria-hidden="true"/>
                      <div className="rh-meta-block">
                        <span className="rh-meta-label">Agent</span>
                        <span className="rh-meta-value">{item.agent}</span>
                      </div>
                    </div>
                    <div className="rh-meta-item">
                      <i className="ti ti-home" aria-hidden="true"/>
                      <div className="rh-meta-block">
                        <span className="rh-meta-label">Rental status</span>
                        <RentalBadge status={item.rentalStatus} />
                      </div>
                    </div>
                  </div>

                  <button className="rh-toggle-btn" onClick={() => toggleExpand(item.id)}>
                    <i className={`ti ti-chevron-${isOpen ? "up" : "down"}`} aria-hidden="true" />
                    {isOpen ? "Hide booking details" : "View booking details"}
                  </button>

                  {isOpen && (
                    <div className="rh-details-panel">
                      <div className="rh-booking-details">
                        <div className="rh-detail">
                          <span>Name</span>
                          <strong>{item.fullName}</strong>
                        </div>
                        <div className="rh-detail">
                          <span>Email</span>
                          <strong>{item.email}</strong>
                        </div>
                        <div className="rh-detail">
                          <span>Phone</span>
                          <strong>{item.phone}</strong>
                        </div>
                        <div className="rh-detail">
                          <span>Booked on</span>
                          <strong>{new Date(item.createdAt).toLocaleDateString()}</strong>
                        </div>
                      </div>

                      {item.message && (
                        <div className="rh-message">
                          <span>Message</span>
                          <p>{item.message}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="rh-card-actions">
                    {item.tourStatus === "Completed" && (
                      submitted[item.id]
                        ? <span className="action-done">
                            <i className="ti ti-check" aria-hidden="true"/> Feedback sent
                          </span>
                        : <button className="action-btn action-primary" onClick={() => setFeedbackOpen(item.id)}>
                            Leave feedback
                          </button>
                    )}
                    {item.tourStatus === "Pending" && (
                      <>
                        <button className="action-btn action-primary" onClick={() => openReschedule(item)}>
                          Reschedule
                        </button>
                        <button className="action-btn action-danger" onClick={() => cancelTour(item.id)}>
                          Cancel tour
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════════════════════════════
          FEEDBACK MODAL
      ══════════════════════════════════════ */}
      {feedbackOpen !== null && activeItem && (
        <Modal
          title="Leave feedback"
          subtitle={`${activeItem.agent} · ${activeItem.propertyName}`}
          onClose={() => setFeedbackOpen(null)}
        >
          <label className="modal-label">Your rating</label>
          <StarRating
            value={feedback[feedbackOpen]?.rating || 0}
            onChange={(v) => setFeedback(prev => ({ ...prev, [feedbackOpen]: { ...prev[feedbackOpen], rating: v } }))}
          />

          <label className="modal-label" style={{marginTop:"1rem"}}>Your review</label>
          <textarea
            className="modal-textarea"
            rows={4}
            placeholder="Tell us about your experience with this agent and property..."
            value={feedback[feedbackOpen]?.text || ""}
            onChange={(e) => setFeedback(prev => ({ ...prev, [feedbackOpen]: { ...prev[feedbackOpen], text: e.target.value } }))}
          />

          <div className="modal-footer">
            <button className="modal-btn-ghost" onClick={() => setFeedbackOpen(null)}>Cancel</button>
            <button className="modal-btn-primary" onClick={() => submitFeedback(feedbackOpen)}>Submit feedback</button>
          </div>
        </Modal>
      )}

      {/* ══════════════════════════════════════
          RESCHEDULE MODAL
      ══════════════════════════════════════ */}
      {reschedOpen !== null && reschedItem && (
        <Modal title="Reschedule tour" subtitle={reschedItem.propertyName} onClose={() => setReschedOpen(null)}>
          <label className="modal-label">New date</label>
          <input
            type="date"
            className="modal-input"
            value={reschedData[reschedOpen]?.date || ""}
            onChange={(e) => setReschedData(prev => ({ ...prev, [reschedOpen]: { ...prev[reschedOpen], date: e.target.value } }))}
          />

          <label className="modal-label">New time</label>
          <input
            type="time"
            className="modal-input"
            value={reschedData[reschedOpen]?.time || ""}
            onChange={(e) => setReschedData(prev => ({ ...prev, [reschedOpen]: { ...prev[reschedOpen], time: e.target.value } }))}
          />

          <div className="modal-footer">
            <button className="modal-btn-ghost" onClick={() => setReschedOpen(null)}>Cancel</button>
            <button className="modal-btn-primary" onClick={() => submitReschedule(reschedOpen)}>Confirm reschedule</button>
          </div>
        </Modal>
      )}

      {/* ══════════════════════════════════════
          LIST A PROPERTY MODAL
      ══════════════════════════════════════ */}
      {listModalOpen && (
        <Modal
          title="List your property"
          subtitle="Fill in the details below to make it visible on ARCE."
          onClose={closeListModal}
          size="lg"
        >
          <form className="list-form" onSubmit={submitListing}>

            <div className="form-section-label">Property details</div>

            <div className="form-row">
              <div className="form-group">
                <label>Property name</label>
                <input name="propertyName" type="text" placeholder="e.g. Green Park Apartments" value={listing.propertyName} onChange={handleListingChange} required />
              </div>
              <div className="form-group">
                <label>Property type</label>
                <select name="type" value={listing.type} onChange={handleListingChange} required>
                  <option value="">Select type</option>
                  <option value="hostel">Hostel</option>
                  <option value="self-contain">Self contain</option>
                  <option value="flat">Flat</option>
                  <option value="shared-apartment">Shared apartment</option>
                  <option value="duplex">Duplex</option>
                  <option value="bungalow">Bungalow</option>
                  <option value="mini-flat">Mini flat</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Street address</label>
              <input name="address" type="text" placeholder="e.g. 12 Adeola Odeku Street" value={listing.address} onChange={handleListingChange} required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>State</label>
                <select name="state" value={listing.state} onChange={handleListingChange} required>
                  <option value="">Select state</option>
                  {NG_STATES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>City / area</label>
                <input name="city" type="text" placeholder="e.g. Lekki" value={listing.city} onChange={handleListingChange} required />
              </div>
            </div>

            <div className="form-row form-row-3">
              <div className="form-group">
                <label>Bedrooms</label>
                <select name="bedrooms" value={listing.bedrooms} onChange={handleListingChange} required>
                  <option value="">Select</option>
                  {["Studio","1","2","3","4","5+"].map(n => <option key={n}>{n}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Bathrooms</label>
                <select name="bathrooms" value={listing.bathrooms} onChange={handleListingChange} required>
                  <option value="">Select</option>
                  {["1","2","3","4+"].map(n => <option key={n}>{n}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Annual rent (₦)</label>
                <input name="rent" type="number" placeholder="e.g. 500000" value={listing.rent} onChange={handleListingChange} required />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea name="description" rows={3} placeholder="Describe the property — amenities, facilities, nearby landmarks..." value={listing.description} onChange={handleListingChange} required />
            </div>

            <div className="form-group">
              <label>Image URL <span className="form-optional">(optional)</span></label>
              <input name="imageUrl" type="url" placeholder="https://..." value={listing.imageUrl} onChange={handleListingChange} />
            </div>

            <div className="form-section-label" style={{marginTop:"0.5rem"}}>Agent / contact details</div>

            <div className="form-row">
              <div className="form-group">
                <label>Agent name</label>
                <input name="agentName" type="text" placeholder="Full name" value={listing.agentName} onChange={handleListingChange} required />
              </div>
              <div className="form-group">
                <label>Agent phone</label>
                <input name="agentPhone" type="tel" placeholder="e.g. 0812 345 6789" value={listing.agentPhone} onChange={handleListingChange} required />
              </div>
            </div>

            <div className="modal-footer modal-footer-sticky">
              <button type="button" className="modal-btn-ghost" onClick={closeListModal}>Cancel</button>
              <button type="submit" className="modal-btn-primary" disabled={listSubmitting}>
                {listSubmitting ? "Submitting..." : "Submit listing"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={`rh-toast rh-toast-${toast.tone}`}>
          <i className={`ti ${toast.tone === "danger" ? "ti-alert-circle" : "ti-circle-check"}`} aria-hidden="true" />
          {toast.message}
        </div>
      )}
    </div>
  );
}