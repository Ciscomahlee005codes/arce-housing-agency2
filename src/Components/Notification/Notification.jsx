import React, { useMemo, useState } from "react";
import customerServiceImg from '../../assets/customer-service.png'
import CustomerService from "../CustomerService/CustomerService";
import { useNotifications } from "../../context/NotificationContext";
import "./Notification.css";

const FILTERS = ["All", "Unread", "Tour", "Payment", "Document", "Listing"];

const formatDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const Notification = () => {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();
  const [showHelp, setShowHelp] = useState(false);
  const [filter, setFilter] = useState("All");

  const filtered = useMemo(() => {
    if (filter === "All") return notifications;
    if (filter === "Unread") return notifications.filter((n) => n.status === "Unread");
    return notifications.filter((n) => n.type === filter);
  }, [notifications, filter]);

  return (
    <div className="notification-container">
      <div className="notif-topbar">
        <div className="notif-back-wrap">
        </div>
      </div>

      <div className="notif-header-row">
        <div className="notif-heading">
          <h2>
            Notifications
            {unreadCount > 0 && <span className="notif-count-badge">{unreadCount}</span>}
          </h2>
          <p className="notif-subtitle">Listings · Tours · Payments · Documents</p>
        </div>
        {unreadCount > 0 && (
          <button className="mark-all-btn" onClick={markAllAsRead}>
            Mark all read
          </button>
        )}
      </div>

      <div className="notif-filters">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`notif-filter-pill ${filter === f ? "notif-filter-active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f}
            {f === "Unread" && unreadCount > 0 && <span className="pill-count">{unreadCount}</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="notif-loading">
          <div className="loader" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <span className="empty-glyph" aria-hidden="true">🔔</span>
          <h3>Nothing here</h3>
          <p className="empty-msg">
            {filter === "All" ? "No notifications yet." : `No ${filter.toLowerCase()} notifications.`}
          </p>
        </div>
      ) : (
        <ul className="notification-list">
          {filtered.map((notif) => (
            <li
              key={notif.id}
              className={`notification type-${notif.type.toLowerCase()} ${notif.status === "Unread" ? "unread" : ""}`}
              onClick={() => notif.status === "Unread" && markAsRead(notif.id)}
            >
              <span className="notif-index" aria-hidden="true" />

              <div className="notif-body">
                <div className="notification-header">
                  <h4>{notif.title}</h4>
                  <span className={`type ${notif.type.toLowerCase()}`}>{notif.type}</span>
                </div>
                <p>{notif.message}</p>
                <div className="notification-footer">
                  <span className="date">{formatDate(notif.created_at)}</span>
                  {notif.status === "Unread" ? (
                    <button
                      className="mark-btn"
                      onClick={(e) => { e.stopPropagation(); markAsRead(notif.id); }}
                    >
                      Mark read
                    </button>
                  ) : (
                    <span className="read-tag">Read</span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <img
        onClick={() => setShowHelp(true)}
        src={customerServiceImg}
        alt="Customer Service"
        className="customer-service-btn"
      />
      {showHelp && <CustomerService onClose={() => setShowHelp(false)} />}
    </div>
  );
};

export default Notification;