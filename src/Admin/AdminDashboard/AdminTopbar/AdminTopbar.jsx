import React, { useState, useRef, useEffect } from "react";
import {
  FaSearch, FaBell, FaSignOutAlt,
  FaUserCircle, FaCog, FaChevronDown,
} from "react-icons/fa";
import "./AdminTopbar.css";

const AdminTopbar = ({ onLogout }) => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [profileOpen,   setProfileOpen]   = useState(false);
  const [notiOpen,      setNotiOpen]      = useState(false);

  const profileRef = useRef(null);
  const notiRef    = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notiRef.current    && !notiRef.current.contains(e.target))    setNotiOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const notifications = [
    { id: 1, text: "John Doe applied as Agent",      time: "2 min ago",  unread: true  },
    { id: 2, text: "New property listed in Lagos",    time: "18 min ago", unread: true  },
    { id: 3, text: "3 properties flagged for review", time: "1 hr ago",  unread: true  },
    { id: 4, text: "Agent Jane updated her profile",  time: "3 hrs ago", unread: false },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="atb-bar">

      {/* Search */}
      <div className={`atb-search ${searchFocused ? "focused" : ""}`}>
        <FaSearch className="atb-search-icon" />
        <input
          type="text"
          placeholder="Search users, properties, agents…"
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
      </div>

      {/* Right cluster */}
      <div className="atb-right">

        {/* Bell */}
        <div className="atb-icon-wrap" ref={notiRef}>
          <button
            className={`atb-icon-btn ${notiOpen ? "active" : ""}`}
            onClick={() => setNotiOpen((p) => !p)}
          >
            <FaBell />
            {unreadCount > 0 && (
              <span className="atb-badge">{unreadCount}</span>
            )}
          </button>

          {notiOpen && (
            <div className="atb-dropdown atb-noti-drop">
              <div className="atb-drop-header">
                <span>Notifications</span>
                <span className="atb-drop-clear">Mark all read</span>
              </div>
              <ul className="atb-noti-list">
                {notifications.map((n) => (
                  <li key={n.id} className={`atb-noti-item ${n.unread ? "unread" : ""}`}>
                    <div className="atb-noti-dot" />
                    <div>
                      <p>{n.text}</p>
                      <span>{n.time}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="atb-drop-footer">View all notifications</div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="atb-profile-wrap" ref={profileRef}>
          <button
            className={`atb-profile-btn ${profileOpen ? "active" : ""}`}
            onClick={() => setProfileOpen((p) => !p)}
          >
            <div className="atb-avatar">A</div>
            <div className="atb-profile-info">
              <span className="atb-profile-name">Admin</span>
              <span className="atb-profile-role">Super Admin</span>
            </div>
            <FaChevronDown
              size={11}
              className={`atb-chevron ${profileOpen ? "open" : ""}`}
            />
          </button>

          {profileOpen && (
            <div className="atb-dropdown atb-profile-drop">
              <div className="atb-drop-user">
                <div className="atb-drop-avatar">A</div>
                <div>
                  <p className="atb-drop-name">Admin User</p>
                  <p className="atb-drop-email">admin@arce.ng</p>
                </div>
              </div>
              <div className="atb-drop-divider" />
              <button className="atb-drop-item">
                <FaUserCircle /> View Profile
              </button>
              <button className="atb-drop-item">
                <FaCog /> Settings
              </button>
              <div className="atb-drop-divider" />
              <button
                className="atb-drop-item danger"
                onClick={onLogout}
              >
                <FaSignOutAlt /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminTopbar;