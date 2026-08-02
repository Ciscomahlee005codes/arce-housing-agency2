import React, { useState } from "react";
import { FiSearch, FiSliders, FiBell, FiMessageSquare } from "react-icons/fi";
import { useAuth } from "../../../context/AuthContext";
import "./AgentDashboardTop.css";

const AgentDashboardTop = () => {
  const { profile } = useAuth();
  const [search, setSearch] = useState("");

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : "AG";

  const firstName = profile?.full_name?.split(" ")[0] || "Agent";

  return (
    <header className="adt-bar">
      {/* Search */}
      <div className="adt-search">
        <FiSearch size={15} className="adt-search-icon" />
        <input
          type="text"
          placeholder="Search listings, tenants…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button className="adt-filter-btn" aria-label="Filter">
          <FiSliders size={14} />
        </button>
      </div>

      {/* Right side */}
      <div className="adt-right">
        {/* Icon buttons */}
        {/* <button className="adt-icon-btn" aria-label="Messages">
          <FiMessageSquare size={17} />
          <span className="adt-badge">3</span>
        </button>
        <button className="adt-icon-btn" aria-label="Notifications">
          <FiBell size={17} />
          <span className="adt-badge">5</span>
        </button> */}

        {/* Divider */}
        <span className="adt-divider" />

        {/* User */}
        <div className="adt-user">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="avatar" className="adt-avatar-img" />
          ) : (
            <div className="adt-avatar-placeholder">{initials}</div>
          )}
          <div className="adt-user-text">
            <span className="adt-user-name">{firstName}</span>
            <span className="adt-user-role">Agent</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AgentDashboardTop;