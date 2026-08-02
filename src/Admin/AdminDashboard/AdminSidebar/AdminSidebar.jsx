import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import {useNavigate} from "react-router-dom";
import {
  MdDashboard,
  MdPeople,
  MdApartment,
  MdRateReview,
  MdBookOnline,
  MdPayments,
  MdInsertChart,
  MdMessage,
  MdNotifications,
  MdManageAccounts,
  MdLogout,
  MdMenu,
  MdClose,
  MdWarning,
} from "react-icons/md";
import "./AdminSidebar.css";

const NAV_ITEMS = [
  {
    group: "Main",
    links: [
      { label: "Dashboard",           to: "/admindashboard/home",           icon: <MdDashboard /> },
      { label: "Users Management",    to: "/admindashboard/usermanagement", icon: <MdPeople />    },
      { label: "Properties",          to: "/admindashboard/properties",     icon: <MdApartment /> },
      { label: "Pending Reviews",     to: "/admindashboard/adminmanagement",icon: <MdRateReview />},
      { label: "Bookings",            to: "/admindashboard/bookings",       icon: <MdBookOnline />},
    ],
  },
  {
    group: "Finance",
    links: [
      { label: "Payments",            to: "/admindashboard/payment",        icon: <MdPayments />   },
      { label: "Reports & Analytics", to: "/admindashboard/reports",        icon: <MdInsertChart />},
    ],
  },
  {
    group: "Communication",
    links: [
      { label: "Messages & Support",  to: "/admindashboard/messages",       icon: <MdMessage />       },
      { label: "Notifications",       to: "/admindashboard/notification",   icon: <MdNotifications /> },
    ],
  },
  {
    group: "Account",
    links: [
      { label: "Profile & Settings",  to: "/admindashboard/settings",       icon: <MdManageAccounts />},
    ],
  },
];

 const AdminSidebar = () => {
  const [open, setOpen] = useState(false);

  const [showLogoutModal, setShowLogoutModal] =
    useState(false);

  const { logoutUser } = useAuth();

  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();

    navigate("/");

    setShowLogoutModal(false);
  };

  return (
    <>
      {/* ── Mobile hamburger ── */}
      <button
        className="asb-hamburger"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <MdMenu size={22} />
      </button>

      {/* ── Mobile backdrop ── */}
      {open && (
        <div
          className="asb-backdrop"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`asb-sidebar ${open ? "open" : ""}`}>

        {/* Logo / brand */}
        <div className="asb-brand">
          <div className="asb-brand-icon">A</div>
          <div>
            <span className="asb-brand-name">ARCE Admin</span>
            <span className="asb-brand-sub">Super Administrator</span>
          </div>
          {/* mobile close */}
          <button
            className="asb-close-btn"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="asb-nav">
          {NAV_ITEMS.map((group) => (
            <div className="asb-group" key={group.group}>
              <span className="asb-group-label">{group.group}</span>
              <ul className="asb-list">
                {group.links.map(({ label, to, icon }) => (
                  <li key={to}>
                    <NavLink
                      to={to}
                      className={({ isActive }) =>
                        `asb-link ${isActive ? "active" : ""}`
                      }
                      onClick={() => setOpen(false)}
                    >
                      <span className="asb-link-icon">{icon}</span>
                      <span className="asb-link-label">{label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="asb-footer">
            <button
  className="asb-logout-btn"
  onClick={() => setShowLogoutModal(true)}
>
            <MdLogout size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      {/* ── Logout Modal ───────────────────────────── */}
{showLogoutModal && (
  <div
    className="asb-modal-backdrop"
    onClick={() => setShowLogoutModal(false)}
  >
    <div
      className="asb-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="asb-modal-icon">
        <MdWarning />
      </div>

      <h2 className="asb-modal-title">
        Confirm Logout
      </h2>

      <p className="asb-modal-text">
        Are you sure you want to logout from the admin dashboard?
      </p>

      <div className="asb-modal-actions">
        <button
          className="asb-cancel-btn"
          onClick={() => setShowLogoutModal(false)}
        >
          Cancel
        </button>

        <button
          className="asb-confirm-btn"
          onClick={() => {
            setShowLogoutModal(false);
            handleLogout();
          }}
        >
          <MdLogout size={18} />
          Logout
        </button>
      </div>
    </div>
  </div>
)}
    </>
  );
};

export default AdminSidebar;