import React, { useState } from "react";
import "./AdminSettings.css";

const AdminSettings = () => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [theme, setTheme] = useState("light");
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    system: true,
  });

  const handleSave = () => {
    alert("✅ Settings saved successfully!");
  };

  return (
    <div className="admin-settings-container">
      <h2 className="page-title">⚙️ Admin Settings</h2>

      <div className="settings-grid">
        {/* System Settings */}
        <div className="settings-card">
          <h3>System Controls</h3>
          <div className="setting-item">
            <label>Maintenance Mode</label>
            <label className="switch">
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={() => setMaintenanceMode(!maintenanceMode)}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <label>Allow User Registration</label>
            <label className="switch">
              <input
                type="checkbox"
                checked={allowRegistration}
                onChange={() => setAllowRegistration(!allowRegistration)}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="settings-card">
          <h3>Theme & Appearance</h3>
          <div className="setting-item">
            <label>Default Theme</label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="select-input"
            >
              <option value="light">🌞 Light Mode</option>
              <option value="dark">🌚 Dark Mode</option>
              <option value="blue">💙 Blue Accent</option>
              <option value="green">💚 Green Accent</option>
            </select>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="settings-card">
          <h3>Notifications</h3>
          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={notifications.email}
                onChange={() =>
                  setNotifications({
                    ...notifications,
                    email: !notifications.email,
                  })
                }
              />
              Email Alerts
            </label>
            <label>
              <input
                type="checkbox"
                checked={notifications.sms}
                onChange={() =>
                  setNotifications({
                    ...notifications,
                    sms: !notifications.sms,
                  })
                }
              />
              SMS Alerts
            </label>
            <label>
              <input
                type="checkbox"
                checked={notifications.system}
                onChange={() =>
                  setNotifications({
                    ...notifications,
                    system: !notifications.system,
                  })
                }
              />
              System Notifications
            </label>
          </div>
        </div>

        {/* Data Management */}
        <div className="settings-card">
          <h3>Data Management</h3>
          <div className="data-buttons">
            <button className="danger">🗑 Clear Logs</button>
            <button className="secondary">💾 Backup Data</button>
            <button className="danger-outline">🔄 Reset System</button>
          </div>
        </div>
      </div>

      <div className="save-container">
        <button className="save-btn" onClick={handleSave}>
          💾 Save Changes
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;
