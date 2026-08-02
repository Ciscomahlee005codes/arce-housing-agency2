import React, { useState, useMemo } from "react";
import { useNotifications } from "../../../context/NotificationContext";
import {
  FiCalendar,
  FiDollarSign,
  FiFileText,
  FiKey,
  FiBell,
  FiBellOff,
} from "react-icons/fi";
import "./AgentNotification.css";

const TYPE_ICON = {
  tour: FiCalendar,
  payment: FiDollarSign,
  document: FiFileText,
  rental: FiKey,
};

const FILTERS = ["All", "Unread", "Tour", "Payment", "Document", "Rental"];

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

const AgentNotification = () => {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();
  const [filter, setFilter] = useState("All");

  const filtered = useMemo(() => {
    if (filter === "All") return notifications;
    if (filter === "Unread") return notifications.filter((n) => n.status === "Unread");
    return notifications.filter((n) => (n.type || "").toLowerCase() === filter.toLowerCase());
  }, [notifications, filter]);

  return (
    <div className="agent-notif-page">
      <div className="agent-notif-container">
        <div className="agent-notif-header">
          <div>
            <h2>
              Notifications
              {unreadCount > 0 && <span className="agent-notif-badge">{unreadCount}</span>}
            </h2>
            <p className="agent-notif-subtitle">Tour requests, payments and documents in one place.</p>
          </div>
          {unreadCount > 0 && (
            <button className="agent-notif-mark-all" onClick={markAllAsRead}>
              Mark all as read
            </button>
          )}
        </div>

        <div className="agent-notif-filters">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`agent-notif-pill ${filter === f ? "agent-notif-pill-active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}
              {f === "Unread" && unreadCount > 0 && <span className="agent-notif-pill-count">{unreadCount}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="agent-notif-loading">
            <div className="agent-notif-skeleton" />
            <div className="agent-notif-skeleton" />
            <div className="agent-notif-skeleton" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="agent-notif-empty">
            <FiBellOff size={26} />
            <h3>Nothing here</h3>
            <p>
              {filter === "All" ? "No notifications yet." : `No ${filter.toLowerCase()} notifications.`}
            </p>
          </div>
        ) : (
          <ul className="agent-notif-list">
            {filtered.map((notif) => {
              const Icon = TYPE_ICON[(notif.type || "").toLowerCase()] || FiBell;
              const isUnread = notif.status === "Unread";
              return (
                <li
                  key={notif.id}
                  className={`agent-notif-item ${isUnread ? "agent-notif-unread" : ""}`}
                  onClick={() => isUnread && markAsRead(notif.id)}
                >
                  {isUnread && <span className="agent-notif-dot" aria-hidden="true" />}

                  <div className={`agent-notif-icon type-${(notif.type || "").toLowerCase()}`}>
                    <Icon size={16} />
                  </div>

                  <div className="agent-notif-body">
                    <div className="agent-notif-top">
                      <h4>{notif.title}</h4>
                      {notif.type && <span className={`type type-${notif.type.toLowerCase()}`}>{notif.type}</span>}
                    </div>
                    <p>{notif.message}</p>
                    <div className="agent-notif-bottom">
                      <span className="agent-notif-date">{timeAgo(notif.created_at)}</span>
                      {isUnread && (
                        <button
                          className="mark-btn"
                          onClick={(e) => { e.stopPropagation(); markAsRead(notif.id); }}
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AgentNotification;