import React, { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import "./AdminUserManagement.css";
import {
  FiUsers, FiUserCheck, FiBookOpen,
  FiSearch, FiMoreVertical, FiSlash,
  FiRefreshCw, FiCheckCircle, FiXCircle,
  FiEye, FiFilter,
} from "react-icons/fi";

// ── Sample data ───────────────────────────────────────────────────────────────
const INITIAL_USERS = [
  // Tenants
  { id: 1,  name: "John Doe",        email: "john@arce.com",    role: "Tenant",  status: "Active",  joined: "Jun 12, 2025", avatar: "https://i.pravatar.cc/40?img=1"  },
  { id: 2,  name: "Sarah Williams",  email: "sarah@arce.com",   role: "Tenant",  status: "Active",  joined: "Jun 18, 2025", avatar: "https://i.pravatar.cc/40?img=5"  },
  { id: 3,  name: "David Okafor",    email: "david@arce.com",   role: "Tenant",  status: "Blocked", joined: "May 22, 2025", avatar: "https://i.pravatar.cc/40?img=8"  },
  { id: 4,  name: "Ngozi Eze",       email: "ngozi@arce.com",   role: "Tenant",  status: "Pending", joined: "Jul 1, 2025",  avatar: "https://i.pravatar.cc/40?img=20" },
  // Students
  { id: 5,  name: "Jane Smith",      email: "jane@arce.com",    role: "Student", status: "Blocked", joined: "Apr 5, 2025",  avatar: "https://i.pravatar.cc/40?img=9"  },
  { id: 6,  name: "Mike Johnson",    email: "mike@arce.com",    role: "Student", status: "Pending", joined: "Jul 3, 2025",  avatar: "https://i.pravatar.cc/40?img=11" },
  { id: 7,  name: "Amaka Chukwu",    email: "amaka@arce.com",   role: "Student", status: "Active",  joined: "Jun 30, 2025", avatar: "https://i.pravatar.cc/40?img=47" },
  { id: 8,  name: "Tunde Bello",     email: "tunde@arce.com",   role: "Student", status: "Active",  joined: "May 15, 2025", avatar: "https://i.pravatar.cc/40?img=15" },
  // Agents
  { id: 9,  name: "Tony Raphael",    email: "tony@arce.com",    role: "Agent",   status: "Active",  joined: "Mar 10, 2025", avatar: "https://i.pravatar.cc/40?img=12" },
  { id: 10, name: "Kemi Adeyemi",    email: "kemi@arce.com",    role: "Agent",   status: "Active",  joined: "Feb 28, 2025", avatar: "https://i.pravatar.cc/40?img=21" },
  { id: 11, name: "Emeka Nwachukwu", email: "emeka@arce.com",   role: "Agent",   status: "Pending", joined: "Jul 5, 2025",  avatar: "https://i.pravatar.cc/40?img=33" },
  { id: 12, name: "Bisi Olatunji",   email: "bisi@arce.com",    role: "Agent",   status: "Blocked", joined: "Jan 14, 2025", avatar: "https://i.pravatar.cc/40?img=44" },
];

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    Active:  "aum-badge-active",
    Blocked: "aum-badge-blocked",
    Pending: "aum-badge-pending",
  };
  return <span className={`aum-badge ${map[status] || ""}`}>{status}</span>;
}

// ── Role sections config ──────────────────────────────────────────────────────
const SECTIONS = [
  { key: "Tenant",  label: "Tenants",  icon: <FiUsers size={16} />,     accent: "#6366f1" },
  { key: "Student", label: "Students", icon: <FiBookOpen size={16} />,  accent: "#f59e0b" },
  { key: "Agent",   label: "Agents",   icon: <FiUserCheck size={16} />, accent: "#22c55e" },
];

const STATUS_FILTERS = ["All", "Active", "Blocked", "Pending"];

// ─────────────────────────────────────────────────────────────────────────────
export default function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("Tenant");
  const [statusFilter,  setStatusFilter]  = useState("All");
  const [search,        setSearch]        = useState("");
  const [selected,      setSelected]      = useState(null); // for detail modal

  // ── Actions ──────────────────────────────────────────────────────────────
  const updateStatus = (id, status) =>
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u));

  const handleBlock   = id => updateStatus(id, "Blocked");
  const handleUnblock = id => updateStatus(id, "Active");
  const handleApprove = id => updateStatus(id, "Active");
  const handleReset   = id => alert(`Password reset link sent for user ID ${id}`);

  // ── Filter ───────────────────────────────────────────────────────────────
  const sectionUsers = users.filter(u => u.role === activeSection);

  const filtered = sectionUsers.filter(u => {
    const matchStatus = statusFilter === "All" || u.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  // ── Counts for badges ─────────────────────────────────────────────────────
  const counts = SECTIONS.reduce((acc, s) => {
    acc[s.key] = users.filter(u => u.role === s.key).length;
    return acc;
  }, {});

  const currentSection = SECTIONS.find(s => s.key === activeSection);

  const fetchUsers = async () => {
  try {
    setLoading(true);

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const formattedUsers = (data || []).map((user) => ({
  id: user.id,
  name: user.full_name || "Unknown User",
  email: user.email || "No Email",

  role:
    user.role?.toLowerCase() === "student"
      ? "Student"
      : user.role?.toLowerCase() === "agent"
      ? "Agent"
      : "Tenant",

  status: "Active",

  joined: user.created_at
    ? new Date(user.created_at).toLocaleDateString()
    : "N/A",

  avatar: "",
}));

    setUsers(formattedUsers);

  } catch (error) {
    console.log("FETCH USERS ERROR:", error.message);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchUsers();
}, []);

  return (
    <div className="aum-page">

      {/* ── Page header ── */}
      <div className="aum-page-header">
        <div>
          <h1 className="aum-page-title">User Management</h1>
          <p className="aum-page-sub">Manage tenants, students, and agents across the platform</p>
        </div>
      </div>

      {/* ── Section tabs (Tenants / Students / Agents) ── */}
      <div className="aum-section-tabs">
        {SECTIONS.map(s => (
          <button
            key={s.key}
            className={`aum-section-tab ${activeSection === s.key ? "aum-section-tab-active" : ""}`}
            style={activeSection === s.key ? { "--tab-accent": s.accent } : {}}
            onClick={() => { setActiveSection(s.key); setStatusFilter("All"); setSearch(""); }}
          >
            <span className="aum-tab-icon" style={{ color: activeSection === s.key ? s.accent : "#6b7280" }}>
              {s.icon}
            </span>
            {s.label}
            <span className="aum-tab-count"
              style={{ background: activeSection === s.key ? s.accent : "#e5e7eb",
                       color:      activeSection === s.key ? "#fff" : "#6b7280" }}>
              {counts[s.key]}
            </span>
          </button>
        ))}
      </div>

      {/* ── Controls: search + status pills ── */}
      <div className="aum-controls">
        <div className="aum-search">
          <FiSearch size={14} className="aum-search-icon" />
          <input
            type="text"
            placeholder={`Search ${currentSection?.label.toLowerCase()}…`}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="aum-status-pills">
          <FiFilter size={13} className="aum-filter-icon" />
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              className={`aum-pill ${statusFilter === s ? "aum-pill-active" : ""}`}
              onClick={() => setStatusFilter(s)}
            >
              {s}
              <span className="aum-pill-count">
                {s === "All" ? sectionUsers.length : sectionUsers.filter(u => u.status === s).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── User table ── */}
      <div className="aum-table-wrap">
        
      {loading ? (

  <div className="aum-loading">
    <div className="aum-spinner"></div>
    <p>Loading users...</p>
  </div>

) : filtered.length === 0 ? (
          <div className="aum-empty">
            <FiUsers size={32} />
            <p>No {currentSection?.label.toLowerCase()} match your filters.</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <table className="aum-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(user => (
                  <tr key={user.id} className="aum-row">
                    <td>
                      <div className="aum-user-cell">
                         {user.avatar ? (
  <img
    src={user.avatar}
    alt={user.name}
    className="aum-avatar"
  />
) : (
  <div className="aum-avatar-fallback">
    {user.name.charAt(0).toUpperCase()}
  </div>
)}
                        <div>
                          <p className="aum-user-name">{user.name}</p>
                          <p className="aum-user-id">ID #{user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="aum-email">{user.email}</td>
                    <td className="aum-joined">{user.joined}</td>
                    <td><StatusBadge status={user.status} /></td>
                    <td>
                      <div className="aum-actions">
                        {user.status === "Active" && (
                          <button className="aum-action-btn aum-btn-block"
                            onClick={() => handleBlock(user.id)} title="Block user">
                            <FiSlash size={13} /> Block
                          </button>
                        )}
                        {user.status === "Blocked" && (
                          <button className="aum-action-btn aum-btn-unblock"
                            onClick={() => handleUnblock(user.id)} title="Unblock user">
                            <FiCheckCircle size={13} /> Unblock
                          </button>
                        )}
                        {user.status === "Pending" && (
                          <>
                            <button className="aum-action-btn aum-btn-approve"
                              onClick={() => handleApprove(user.id)} title="Approve">
                              <FiCheckCircle size={13} /> Approve
                            </button>
                            <button className="aum-action-btn aum-btn-decline"
                              onClick={() => handleBlock(user.id)} title="Decline">
                              <FiXCircle size={13} /> Decline
                            </button>
                          </>
                        )}
                        <button className="aum-action-btn aum-btn-reset"
                          onClick={() => handleReset(user.id)} title="Reset password">
                          <FiRefreshCw size={13} /> Reset
                        </button>
                        <button className="aum-action-icon"
                          onClick={() => setSelected(user)} title="View details">
                          <FiEye size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <div className="aum-mobile-cards">
              {filtered.map(user => (
                <div key={user.id} className="aum-mobile-card">
                  <div className="aum-mobile-top">
                    <div className="aum-user-cell">
                      <img src={user.avatar} alt={user.name} className="aum-avatar" />
                      <div>
                        <p className="aum-user-name">{user.name}</p>
                        <p className="aum-email">{user.email}</p>
                      </div>
                    </div>
                    <StatusBadge status={user.status} />
                  </div>
                  <div className="aum-mobile-meta">
                    <span>Joined: {user.joined}</span>
                    <span>ID #{user.id}</span>
                  </div>
                  <div className="aum-actions aum-mobile-actions">
                    {user.status === "Active" && (
                      <button className="aum-action-btn aum-btn-block"
                        onClick={() => handleBlock(user.id)}>
                        <FiSlash size={13} /> Block
                      </button>
                    )}
                    {user.status === "Blocked" && (
                      <button className="aum-action-btn aum-btn-unblock"
                        onClick={() => handleUnblock(user.id)}>
                        <FiCheckCircle size={13} /> Unblock
                      </button>
                    )}
                    {user.status === "Pending" && (
                      <>
                        <button className="aum-action-btn aum-btn-approve"
                          onClick={() => handleApprove(user.id)}>
                          <FiCheckCircle size={13} /> Approve
                        </button>
                        <button className="aum-action-btn aum-btn-decline"
                          onClick={() => handleBlock(user.id)}>
                          <FiXCircle size={13} /> Decline
                        </button>
                      </>
                    )}
                    <button className="aum-action-btn aum-btn-reset"
                      onClick={() => handleReset(user.id)}>
                      <FiRefreshCw size={13} /> Reset
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Detail modal ── */}
      {selected && (
        <div className="aum-modal-backdrop" onClick={() => setSelected(null)}>
          <div className="aum-modal" onClick={e => e.stopPropagation()}>
            <div className="aum-modal-header">
              <span>User Details</span>
              <button onClick={() => setSelected(null)} aria-label="Close">✕</button>
            </div>
            <div className="aum-modal-body">
              <div className="aum-modal-avatar-row">
                <img src={selected.avatar} alt={selected.name} className="aum-modal-avatar" />
                <div>
                  <h3 className="aum-modal-name">{selected.name}</h3>
                  <p className="aum-modal-email">{selected.email}</p>
                  <StatusBadge status={selected.status} />
                </div>
              </div>
              <div className="aum-modal-rows">
                {[
                  ["User ID",  `#${selected.id}`],
                  ["Role",     selected.role],
                  ["Joined",   selected.joined],
                  ["Status",   selected.status],
                ].map(([k, v]) => (
                  <div key={k} className="aum-modal-row">
                    <span>{k}</span><strong>{v}</strong>
                  </div>
                ))}
              </div>
            </div>
            <div className="aum-modal-footer">
              {selected.status === "Active" && (
                <button className="aum-action-btn aum-btn-block"
                  onClick={() => { handleBlock(selected.id); setSelected(null); }}>
                  <FiSlash size={13} /> Block User
                </button>
              )}
              {selected.status === "Blocked" && (
                <button className="aum-action-btn aum-btn-unblock"
                  onClick={() => { handleUnblock(selected.id); setSelected(null); }}>
                  <FiCheckCircle size={13} /> Unblock User
                </button>
              )}
              {selected.status === "Pending" && (
                <button className="aum-action-btn aum-btn-approve"
                  onClick={() => { handleApprove(selected.id); setSelected(null); }}>
                  <FiCheckCircle size={13} /> Approve User
                </button>
              )}
              <button className="aum-action-btn aum-btn-reset"
                onClick={() => { handleReset(selected.id); }}>
                <FiRefreshCw size={13} /> Reset Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}