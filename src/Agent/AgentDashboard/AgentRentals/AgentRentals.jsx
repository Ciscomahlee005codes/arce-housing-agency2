import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../../../lib/supabase";
import { UserAuth } from "../../../context/AuthContext";
import {
  FiSearch,
  FiX,
  FiKey,
  FiRotateCcw,
  FiHome,
  FiPlus,
  FiAlertTriangle,
} from "react-icons/fi";
import toast from "react-hot-toast";
import "./AgentRentals.css";

const RENTED = "Successful Rental";

function formatCurrency(value) {
  if (value === null || value === undefined || value === "") return "—";
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  return `₦${n.toLocaleString()}`;
}

function PropertyThumb({ src, className = "" }) {
  if (src) return <img src={src} alt="" className={`rent-thumb ${className}`} />;
  return (
    <div className={`rent-thumb rent-thumb-placeholder ${className}`}>
      <FiHome size={16} />
    </div>
  );
}

function Modal({ title, subtitle, onClose, children, size = "md", image }) {
  return (
    <div className="rent-modal-backdrop" onClick={onClose}>
      <div className={`rent-modal rent-modal-${size}`} onClick={(e) => e.stopPropagation()}>
        {image && <img src={image} alt="" className="rent-modal-image" />}
        <div className="rent-modal-header">
          <div>
            <h3>{title}</h3>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button className="rent-modal-close" onClick={onClose} aria-label="Close">
            <FiX size={18} />
          </button>
        </div>
        <div className="rent-modal-body">{children}</div>
      </div>
    </div>
  );
}

// View a rental's full details, with the option to revert it.
function RentalDetailModal({ tour, onClose, onRevert }) {
  if (!tour) return null;
  return (
    <Modal
      title={tour.full_name}
      subtitle={tour.email}
      onClose={onClose}
      image={tour.properties?.images?.[0]}
    >
      <div className="rent-detail-grid">
        <div className="rent-detail-item"><span>Property</span><strong>{tour.properties?.title || "—"}</strong></div>
        <div className="rent-detail-item"><span>Location</span><strong>{tour.properties?.location || "—"}</strong></div>
        <div className="rent-detail-item"><span>Rent</span><strong>{formatCurrency(tour.properties?.price)}</strong></div>
        <div className="rent-detail-item"><span>Phone</span><strong>{tour.phone || "—"}</strong></div>
        <div className="rent-detail-item"><span>Tour completed</span><strong>{tour.tour_date || "—"}</strong></div>
      </div>
      <div className="rent-modal-footer">
        <button className="rent-btn rent-btn-ghost" onClick={() => onRevert(tour.id)}>
          <FiRotateCcw size={14} /> Revert to not rented
        </button>
      </div>
    </Modal>
  );
}

// Step 1 of adding a rental: pick which approved tour actually turned into one.
function PickTourModal({ eligibleTours, onClose, onPick }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return eligibleTours;
    return eligibleTours.filter(
      (t) =>
        t.full_name?.toLowerCase().includes(term) ||
        t.properties?.title?.toLowerCase().includes(term)
    );
  }, [eligibleTours, search]);

  return (
    <Modal title="Add a rental" subtitle="Pick the approved tour that turned into a signed lease" onClose={onClose}>
      <div className="rent-pick-search">
        <FiSearch size={14} />
        <input
          type="text"
          placeholder="Search approved tenants or properties…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rent-pick-empty">
          {eligibleTours.length === 0
            ? "No approved tours are waiting to be converted yet."
            : "No matches for that search."}
        </div>
      ) : (
        <div className="rent-pick-list">
          {filtered.map((t) => (
            <button key={t.id} className="rent-pick-row" onClick={() => onPick(t)}>
              <PropertyThumb src={t.properties?.images?.[0]} className="rent-pick-thumb" />
              <div className="rent-pick-info">
                <strong>{t.full_name}</strong>
                <p>{t.properties?.title || "Property"} · {t.properties?.location || "—"}</p>
              </div>
              <span className="rent-pick-price">{formatCurrency(t.properties?.price)}</span>
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}

// Step 2: confirm before writing rental_status to Supabase.
function ConfirmRentModal({ tour, onClose, onConfirm, submitting }) {
  if (!tour) return null;
  return (
    <Modal title="Confirm completed rental" onClose={submitting ? () => {} : onClose} size="sm">
      <div className="confirm-rent-icon"><FiKey size={22} /></div>
      <p className="confirm-rent-copy">
        You're about to mark this as a <strong>completed rental</strong>.
      </p>
      <div className="confirm-rent-summary">
        <div className="confirm-rent-row"><span>Tenant</span><strong>{tour.full_name}</strong></div>
        <div className="confirm-rent-row"><span>Property</span><strong>{tour.properties?.title || "—"}</strong></div>
        <div className="confirm-rent-row"><span>Rent</span><strong>{formatCurrency(tour.properties?.price)}</strong></div>
      </div>
      <div className="confirm-rent-warning">
        <FiAlertTriangle size={13} /> Only confirm once the lease is actually signed.
      </div>
      <div className="rent-modal-footer">
        <button className="rent-btn rent-btn-ghost" onClick={onClose} disabled={submitting}>Cancel</button>
        <button className="rent-btn rent-btn-primary" onClick={onConfirm} disabled={submitting}>
          <FiKey size={14} /> {submitting ? "Confirming…" : "Yes, mark as rented"}
        </button>
      </div>
    </Modal>
  );
}

const AgentRentals = () => {
  const { user } = UserAuth();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [selectedTour, setSelectedTour] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [confirmTour, setConfirmTour] = useState(null);
  const [confirming, setConfirming] = useState(false);

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
        toast.error("Could not load rentals");
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
      toast.error("Could not update this record");
      return false;
    }
    setTours((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    if (successMessage) toast.success(successMessage);
    return true;
  };

  const rentedTours = useMemo(() => tours.filter((t) => t.rental_status === RENTED), [tours]);

  const eligibleTours = useMemo(
    () =>
      tours.filter(
        (t) => (t.status || "").toLowerCase() === "approved" && t.rental_status !== RENTED
      ),
    [tours]
  );

  const filteredRentals = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rentedTours;
    return rentedTours.filter(
      (t) =>
        t.full_name?.toLowerCase().includes(term) ||
        t.properties?.title?.toLowerCase().includes(term)
    );
  }, [rentedTours, search]);

  const totalValue = useMemo(
    () => rentedTours.reduce((sum, t) => sum + (Number(t.properties?.price) || 0), 0),
    [rentedTours]
  );

  const pickTour = (tour) => {
    setPickerOpen(false);
    setConfirmTour(tour);
  };

  const confirmMarkRented = async () => {
    if (!confirmTour) return;
    setConfirming(true);
    const ok = await updateTour(confirmTour.id, { rental_status: RENTED }, "Marked as a completed rental 🎉");
    setConfirming(false);
    if (ok) setConfirmTour(null);
  };

  const handleRevert = async (id) => {
    if (!window.confirm("Revert this back to not rented?")) return;
    const ok = await updateTour(id, { rental_status: "Not Rented" }, "Reverted — no longer marked as rented");
    if (ok) setSelectedTour(null);
  };

  if (loading) {
    return <div className="rent-loading">Loading rentals…</div>;
  }

  return (
    <div className="rentals2">
      <div className="rentals-container2">
        <div className="rent-header">
          <div>
            <h2>Rentals</h2>
            <p className="rent-subtitle">
              {rentedTours.length} completed{rentedTours.length !== 1 ? "" : ""}
              {totalValue > 0 && <> · {formatCurrency(totalValue)} total value</>}
            </p>
          </div>
          <button className="rent-add-btn" onClick={() => setPickerOpen(true)}>
            <FiPlus size={15} /> Add rental
          </button>
        </div>

        <div className="rent-search">
          <FiSearch className="rent-search-icon" />
          <input
            type="text"
            placeholder="Search rented tenant or property…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filteredRentals.length === 0 ? (
          <div className="rent-empty">
            <FiHome size={22} />
            <p>
              {rentedTours.length === 0
                ? "No completed rentals yet — add one once an approved tour turns into a signed lease."
                : "No rentals match your search."}
            </p>
          </div>
        ) : (
          <>
            <table className="rentals-table desktop-view">
              <thead>
                <tr>
                  <th>Tenant</th>
                  <th>Property</th>
                  <th>Rent</th>
                  <th>Tour Completed</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRentals.map((tour) => (
                  <tr key={tour.id} className="rentals-row" onClick={() => setSelectedTour(tour)}>
                    <td>
                      <strong>{tour.full_name}</strong>
                      <p className="rent-email">{tour.email}</p>
                    </td>
                    <td>
                      <div className="rent-property-cell">
                        <PropertyThumb src={tour.properties?.images?.[0]} />
                        <div>
                          <strong>{tour.properties?.title || "—"}</strong>
                          <p className="rent-email">{tour.properties?.location || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td>{formatCurrency(tour.properties?.price)}</td>
                    <td>{tour.tour_date || "—"}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <button className="rent-revert-btn" onClick={() => handleRevert(tour.id)}>
                        <FiRotateCcw size={13} /> Revert
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mobile-view">
              {filteredRentals.map((tour) => (
                <div key={tour.id} className="rental-card" onClick={() => setSelectedTour(tour)}>
                  <div className="rental-card-top">
                    <PropertyThumb src={tour.properties?.images?.[0]} />
                    <div>
                      <strong>{tour.full_name}</strong>
                      <p className="rent-email">{tour.properties?.title || "Property"}</p>
                    </div>
                    <span className="rented-pill">Rented</span>
                  </div>
                  <p><strong>Rent:</strong> {formatCurrency(tour.properties?.price)}</p>
                  <div onClick={(e) => e.stopPropagation()}>
                    <button className="rent-revert-btn" onClick={() => handleRevert(tour.id)}>
                      <FiRotateCcw size={13} /> Revert
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {selectedTour && (
        <RentalDetailModal tour={selectedTour} onClose={() => setSelectedTour(null)} onRevert={handleRevert} />
      )}

      {pickerOpen && (
        <PickTourModal eligibleTours={eligibleTours} onClose={() => setPickerOpen(false)} onPick={pickTour} />
      )}

      {confirmTour && (
        <ConfirmRentModal
          tour={confirmTour}
          onClose={() => setConfirmTour(null)}
          onConfirm={confirmMarkRented}
          submitting={confirming}
        />
      )}
    </div>
  );
};

export default AgentRentals;