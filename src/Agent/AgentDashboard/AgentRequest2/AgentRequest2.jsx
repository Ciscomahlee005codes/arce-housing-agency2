import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../../../lib/supabase";
import { UserAuth } from "../../../context/AuthContext";
import {
  FiSearch,
  FiX,
  FiCalendar,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiMapPin,
  FiHome,
} from "react-icons/fi";
import toast from "react-hot-toast";
import "./AgentRequest2.css";

const STATUS_TABS = ["All", "pending", "approved", "rejected", "rescheduled"];

function getStatusClass(status) {
  const s = (status || "").toLowerCase();
  if (s.includes("approved")) return "status completed";
  if (s.includes("pending")) return "status pending";
  if (s.includes("rejected")) return "status rejected";
  if (s.includes("reschedul")) return "status rescheduled";
  return "status";
}

// Icon-only button with a small hover tooltip so the action is obvious.
function IconAction({ label, className, onClick, children }) {
  return (
    <button
      type="button"
      className={`icon-btn ${className}`}
      onClick={onClick}
      aria-label={label}
      data-tip={label}
    >
      {children}
    </button>
  );
}

function RequestDetailModal({ tour, onClose, onApprove, onReject, onOpenReschedule }) {
  if (!tour) return null;
  const status = (tour.status || "").toLowerCase();

  return (
    <div className="req-modal-backdrop" onClick={onClose}>
      <div className="req-modal" onClick={(e) => e.stopPropagation()}>
        {tour.properties?.images?.[0] && (
          <img src={tour.properties.images[0]} alt={tour.properties?.title} className="req-modal-image" />
        )}

        <div className="req-modal-header">
          <div>
            <h3>{tour.full_name}</h3>
            <p>{tour.email}{tour.phone ? ` · ${tour.phone}` : ""}</p>
          </div>
          <button className="req-modal-close" onClick={onClose} aria-label="Close">
            <FiX size={18} />
          </button>
        </div>

        <div className="req-modal-body">
          <div className="req-detail-grid">
            <div className="req-detail-item">
              <span>Property</span>
              <strong>{tour.properties?.title || "—"}</strong>
            </div>
            <div className="req-detail-item">
              <span>Location</span>
              <strong>{tour.properties?.location || "—"}</strong>
            </div>
            <div className="req-detail-item">
              <span>Tour date</span>
              <strong>{tour.tour_date || "—"}{tour.tour_time ? ` · ${tour.tour_time}` : ""}</strong>
            </div>
            <div className="req-detail-item">
              <span>Requested on</span>
              <strong>{tour.created_at ? new Date(tour.created_at).toLocaleDateString() : "—"}</strong>
            </div>
          </div>

          {tour.message && (
            <div className="req-message">
              <span>Message from tenant</span>
              <p>{tour.message}</p>
            </div>
          )}
        </div>

        <div className="req-modal-footer">
          <button className="req-btn req-btn-reschedule" onClick={() => onOpenReschedule(tour)}>
            <FiClock size={14} /> Reschedule
          </button>
          <button className="req-btn req-btn-reject" onClick={() => onReject(tour.id)}>
            <FiXCircle size={14} /> Reject
          </button>
          <button
            className="req-btn req-btn-approve"
            onClick={() => onApprove(tour.id)}
            disabled={status === "approved"}
          >
            <FiCheckCircle size={14} /> {status === "approved" ? "Approved" : "Approve"}
          </button>
        </div>
      </div>
    </div>
  );
}

function RescheduleModal({ tour, onClose, onConfirm }) {
  const [newDate, setNewDate] = useState(tour?.tour_date || "");

  if (!tour) return null;

  return (
    <div className="req-modal-backdrop" onClick={onClose}>
      <div className="req-modal req-modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="req-modal-header">
          <div>
            <h3>Reschedule tour</h3>
            <p>{tour.full_name}</p>
          </div>
          <button className="req-modal-close" onClick={onClose} aria-label="Close">
            <FiX size={18} />
          </button>
        </div>

        <div className="req-modal-body">
          <label className="req-label"><FiCalendar size={13} /> New tour date</label>
          <input
            type="date"
            className="req-input"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
          />
        </div>

        <div className="req-modal-footer">
          <button className="req-btn req-btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="req-btn req-btn-approve"
            onClick={() => {
              if (!newDate) { toast.error("Please pick a date"); return; }
              onConfirm(tour.id, newDate);
            }}
          >
            Confirm reschedule
          </button>
        </div>
      </div>
    </div>
  );
}

const AgentRequest2 = () => {
  const { user } = UserAuth();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedTour, setSelectedTour] = useState(null);
  const [rescheduleTour, setRescheduleTour] = useState(null);

  useEffect(() => {
    const fetchTours = async () => {
      if (!user) return;
      setLoading(true);

      const { data, error } = await supabase
        .from("property_tours")
        .select("*, properties(title, location, price, images)")
        .eq("agent_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        toast.error("Could not load tour requests");
      } else {
        setTours(data || []);
      }
      setLoading(false);
    };

    fetchTours();
  }, [user]);

  const updateTour = async (id, patch, successMessage) => {
    const { error } = await supabase.from("property_tours").update(patch).eq("id", id);
    if (error) {
      toast.error("Could not update this request");
      return;
    }
    setTours((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    if (successMessage) toast.success(successMessage);
    setSelectedTour(null);
    setRescheduleTour(null);
  };

  const handleApprove = (id) => updateTour(id, { status: "approved" }, "Tour approved");
  const handleReject = (id) => updateTour(id, { status: "rejected" }, "Tour rejected");
  const handleReschedule = (id, newDate) =>
    updateTour(id, { status: "rescheduled", tour_date: newDate }, "Tour rescheduled");

  const counts = useMemo(() => {
    const pending = tours.filter((t) => (t.status || "").toLowerCase() === "pending").length;
    const approved = tours.filter((t) => (t.status || "").toLowerCase() === "approved").length;
    return { total: tours.length, pending, approved };
  }, [tours]);

  const filteredRequests = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return tours.filter((t) => {
      const matchesSearch =
        !term ||
        t.full_name?.toLowerCase().includes(term) ||
        t.email?.toLowerCase().includes(term) ||
        t.properties?.title?.toLowerCase().includes(term) ||
        t.properties?.location?.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "All" || (t.status || "").toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [tours, searchTerm, statusFilter]);

  return (
    <div className="request2">
      <div className="request-container2">
        <div className="req-header">
          <div>
            <h2>Tour Requests</h2>
            <p className="req-subtitle">{counts.total} total · {counts.pending} pending · {counts.approved} approved</p>
          </div>
        </div>

        <div className="req-top">
          <div className="req-search">
            <FiSearch className="req-search-icon" />
            <input
              type="text"
              placeholder="Search tenant, email, or property…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="req-tabs">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                className={`req-tab ${statusFilter === tab ? "req-tab-active" : ""}`}
                onClick={() => setStatusFilter(tab)}
              >
                {tab === "All" ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="req-empty">Loading tour requests…</div>
        ) : filteredRequests.length === 0 ? (
          <div className="req-empty">No requests match your search.</div>
        ) : (
          <>
            {/* Desktop table */}
            <table className="request-table desktop-view">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Tenant</th>
                  <th>Tour Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((tour) => (
                  <tr key={tour.id} className="request-row" onClick={() => setSelectedTour(tour)}>
                    <td>
                      <div className="req-property-cell">
                        {tour.properties?.images?.[0] ? (
                          <img src={tour.properties.images[0]} alt="" className="req-thumb" />
                        ) : (
                          <div className="req-thumb req-thumb-placeholder"><FiHome size={16} /></div>
                        )}
                        <div>
                          <strong>{tour.properties?.title || "Property"}</strong>
                          <p className="req-location"><FiMapPin size={11} /> {tour.properties?.location || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <strong>{tour.full_name}</strong>
                      <p className="req-email">{tour.email}</p>
                    </td>
                    <td>{tour.tour_date || "—"}</td>
                    <td><span className={getStatusClass(tour.status)}>{tour.status || "—"}</span></td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="action-buttons">
                        {(tour.status || "").toLowerCase() !== "approved" && (
                          <IconAction label="Approve" className="icon-approve" onClick={() => handleApprove(tour.id)}>
                            <FiCheckCircle size={15} />
                          </IconAction>
                        )}
                        <IconAction label="Reject" className="icon-reject" onClick={() => handleReject(tour.id)}>
                          <FiXCircle size={15} />
                        </IconAction>
                        <IconAction label="Reschedule" className="icon-reschedule" onClick={() => setRescheduleTour(tour)}>
                          <FiClock size={15} />
                        </IconAction>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <div className="mobile-view">
              {filteredRequests.map((tour) => (
                <div key={tour.id} className="mobile-request-card" onClick={() => setSelectedTour(tour)}>
                  <div className="mobile-card-top">
                    {tour.properties?.images?.[0] ? (
                      <img src={tour.properties.images[0]} alt="" className="req-thumb" />
                    ) : (
                      <div className="req-thumb req-thumb-placeholder"><FiHome size={16} /></div>
                    )}
                    <div>
                      <strong>{tour.properties?.title || "Property"}</strong>
                      <p className="req-location"><FiMapPin size={11} /> {tour.properties?.location || "—"}</p>
                    </div>
                  </div>
                  <p><strong>Tenant:</strong> {tour.full_name}</p>
                  <p><strong>Date:</strong> {tour.tour_date || "—"}</p>
                  <p><strong>Status:</strong> <span className={getStatusClass(tour.status)}>{tour.status || "—"}</span></p>
                  <div className="action-buttons" onClick={(e) => e.stopPropagation()}>
                    {(tour.status || "").toLowerCase() !== "approved" && (
                      <button className="approve-btn" onClick={() => handleApprove(tour.id)}>Approve</button>
                    )}
                    <button className="reject-btn" onClick={() => handleReject(tour.id)}>Reject</button>
                    <button className="reschedule-btn" onClick={() => setRescheduleTour(tour)}>Reschedule</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {selectedTour && (
        <RequestDetailModal
          tour={selectedTour}
          onClose={() => setSelectedTour(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          onOpenReschedule={(tour) => {
            setSelectedTour(null);
            setRescheduleTour(tour);
          }}
        />
      )}

      {rescheduleTour && (
        <RescheduleModal
          tour={rescheduleTour}
          onClose={() => setRescheduleTour(null)}
          onConfirm={handleReschedule}
        />
      )}
    </div>
  );
};

export default AgentRequest2;