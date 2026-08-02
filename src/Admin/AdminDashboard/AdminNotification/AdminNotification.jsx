import React, { useState } from "react"
import "./AdminNotification.css"
import { FaBell, FaTrash, FaCheckCircle } from "react-icons/fa"

const dummyNotifications = [
   {
    id: 1,
    type: "User",
    message: "Student Amanda Echezona requests a house tour.",
    time: "20mins ago",
    read: false,
  },
  {
    id: 2,
    type: "System",
    message: "New system update will be applied tonight.",
    time: "2h ago",
    read: false,
  },
  {
    id: 3,
    type: "User",
    message: "User John Doe reported a property issue.",
    time: "5h ago",
    read: false,
  },
  {
    id: 4,
    type: "Agent",
    message: "Agent request approval pending for Jane Smith.",
    time: "1d ago",
    read: true,
  },
]

const AdminNotification = () => {
  const [filter, setFilter] = useState("All")
  const [notifications, setNotifications] = useState(dummyNotifications)

  // Filtering logic
  const filteredNotifications = notifications.filter((n) =>
    filter === "All" ? true : n.type === filter
  )

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    )
  }

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h2>Admin Notifications</h2>
        <select onChange={(e) => setFilter(e.target.value)}>
          <option value="All">All</option>
          <option value="System">System Alerts</option>
          <option value="User">User Activities</option>
          <option value="Agent">Agent Updates</option>
        </select>
      </div>

      <div className="notifications-list">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((n) => (
            <div
              key={n.id}
              className={`notification-card ${n.read ? "read" : "unread"}`}
            >
              <div className="notification-icon">
                <FaBell />
              </div>
              <div className="notification-content">
                <p className="notification-message">{n.message}</p>
                <span className="notification-time">{n.time}</span>
              </div>
              <div className="notification-actions">
                {!n.read && (
                  <button
                    className="mark-btn"
                    onClick={() => markAsRead(n.id)}
                  >
                    <FaCheckCircle /> Mark Read
                  </button>
                )}
                <button
                  className="delete-btn"
                  onClick={() => deleteNotification(n.id)}
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="no-notifications">No notifications available.</p>
        )}
      </div>
    </div>
  )
}

export default AdminNotification
