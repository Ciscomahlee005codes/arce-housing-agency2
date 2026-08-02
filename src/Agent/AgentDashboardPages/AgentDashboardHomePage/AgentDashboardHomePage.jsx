import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../../../lib/supabase";
import { UserAuth } from "../../../context/AuthContext";
import {
  FiClock,
  FiCheckCircle,
  FiKey,
  FiHome,
  FiDollarSign,
  FiArrowRight,
  FiInbox,
} from "react-icons/fi";
import "./AgentDashboardHomePage.css";
import AgentSideBar from "../../AgentDashboard/AgentSideBar/AgentSideBar";
import AgentPropertiesPage from "../AgentPropertiesPage/AgentPropertiesPage";
import AgentDashboardTop from "../../AgentDashboard/AgentDashboardTop/AgentDashboardTop";

const RENTED = "Successful Rental";

function formatCurrency(value) {
  if (!value) return "₦0";
  return `₦${Number(value).toLocaleString()}`;
}

function timeAgo(dateStr) {
  if (!dateStr) return "—";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function statusPillClass(status) {
  const s = (status || "").toLowerCase();
  if (s === "approved") return "dash-pill dash-pill-approved";
  if (s === "pending") return "dash-pill dash-pill-pending";
  if (s === "rejected") return "dash-pill dash-pill-rejected";
  if (s.includes("reschedul")) return "dash-pill dash-pill-rescheduled";
  return "dash-pill";
}

const AgentDashboardHomePage = () => {
  const { user } = UserAuth();
  const [tours, setTours] = useState([]);
  const [propertyCount, setPropertyCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);

      const [toursRes, propertiesRes] = await Promise.all([
        supabase
          .from("property_tours")
          .select("*, properties(title, location, price)")
          .eq("agent_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("properties")
          .select("id", { count: "exact", head: true })
          .eq("agent_id", user.id),
      ]);

      if (toursRes.error) console.error(toursRes.error);
      else setTours(toursRes.data || []);

      if (propertiesRes.error) console.error(propertiesRes.error);
      else setPropertyCount(propertiesRes.count || 0);

      setLoading(false);
    };

    fetchData();
  }, [user]);

  const stats = useMemo(() => {
    const pending = tours.filter((t) => (t.status || "").toLowerCase() === "pending").length;
    const approved = tours.filter((t) => (t.status || "").toLowerCase() === "approved").length;
    const rented = tours.filter((t) => t.rental_status === RENTED);
    const totalValue = rented.reduce((sum, t) => sum + (Number(t.properties?.price) || 0), 0);
    return {
      pending,
      approved,
      rentedCount: rented.length,
      totalValue,
      properties: propertyCount,
    };
  }, [tours, propertyCount]);

  const recentTours = useMemo(() => tours.slice(0, 5), [tours]);

  const STAT_CARDS = [
    {
      key: "pending",
      label: "Pending requests",
      value: stats.pending,
      icon: <FiClock size={18} />,
      tone: "amber",
      hint: "Waiting on you",
    },
    {
      key: "approved",
      label: "Approved tours",
      value: stats.approved,
      icon: <FiCheckCircle size={18} />,
      tone: "blue",
      hint: "Upcoming",
    },
    {
      key: "rented",
      label: "Completed rentals",
      value: stats.rentedCount,
      icon: <FiKey size={18} />,
      tone: "purple",
      hint: "Closed deals",
    },
    {
      key: "value",
      label: "Total rental value",
      value: formatCurrency(stats.totalValue),
      icon: <FiDollarSign size={18} />,
      tone: "green",
      hint: "From closed rentals",
    },
    {
      key: "properties",
      label: "Listed properties",
      value: stats.properties,
      icon: <FiHome size={18} />,
      tone: "navy",
      hint: "Live on ARCE",
    },
  ];

  const QUICK_ACTIONS = [
    { label: "View tour requests", href: "/agentdashboard/request", icon: <FiInbox size={15} /> },
    { label: "View rentals", href: "/agentdashboard/rentalpage", icon: <FiKey size={15} /> },
    { label: "Manage properties", href: "/agentdashboard/property", icon: <FiHome size={15} /> },
  ];

  if (loading) {
    return <div className="dash-loading">Loading your dashboard…</div>;
  }

  return (
    <div className="dashboard2 msg-layout">
      <AgentSideBar />
      <div className="msg-content">
         <div className="dashboard-container2">
        <AgentDashboardTop />
        <div className="dash-header">
          <h2>Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(" ")[0]}` : ""}</h2>
          <p className="dash-subtitle">
            {new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        {/* Stat cards */}
        <div className="dash-stats">
          {STAT_CARDS.map((s) => (
            <div className="dash-stat-card" key={s.key}>
              <div className={`dash-stat-icon dash-tone-${s.tone}`}>{s.icon}</div>
              <div className="dash-stat-text">
                <span className="dash-stat-value">{s.value}</span>
                <span className="dash-stat-label">{s.label}</span>
                <span className="dash-stat-hint">{s.hint}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="dash-actions">
          {QUICK_ACTIONS.map((a) => (
            <button key={a.label} className="dash-action-btn" onClick={() => (window.location.href = a.href)}>
              {a.icon} {a.label} <FiArrowRight size={13} className="dash-action-arrow" />
            </button>
          ))}
        </div>

        {/* Recent activity */}
        <div className="dash-recent">
          <div className="dash-recent-header">
            <h3>Recent tour requests</h3>
            {tours.length > 0 && (
              <button className="dash-see-all" onClick={() => (window.location.href = "/agentdashboard/request")}>
                See all <FiArrowRight size={12} />
              </button>
            )}
          </div>

          {recentTours.length === 0 ? (
            <div className="dash-recent-empty">No tour requests yet — new ones will show up here.</div>
          ) : (
            <div className="dash-recent-list">
              {recentTours.map((t) => (
                <div className="dash-recent-row" key={t.id}>
                  <div className="dash-recent-main">
                    <strong>{t.full_name}</strong>
                    <span className="dash-recent-sub">{t.properties?.title || "Property"}</span>
                  </div>
                  <span className={statusPillClass(t.status)}>{t.status || "pending"}</span>
                  <span className="dash-recent-time">{timeAgo(t.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default AgentDashboardHomePage;