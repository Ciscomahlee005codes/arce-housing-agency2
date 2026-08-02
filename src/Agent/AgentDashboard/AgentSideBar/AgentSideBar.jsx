import React, { useState, useEffect } from "react";

import { NavLink, useNavigate } from "react-router-dom";

import {
  FaTachometerAlt,
  FaHome,
  FaHistory,
  FaEnvelope,
  FaClipboardList,
  FaUserCog,
  FaBell,
  FaSignOutAlt,
  FaTimes,
  FaBars,
  FaUserCircle,
} from "react-icons/fa";

import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import { useAuth } from "../../../context/AuthContext";

import "./AgentSideBar.css";

const AgentSideBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const [isMobile, setIsMobile] = useState(false);

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const { logoutUser, profile, user} = useAuth();

  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // detect screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    await logoutUser();

    toast.success("Logged out successfully");

    navigate("/");
  };

  return (
    <>
      {/* Hamburger */}
      {isMobile && !isOpen && (
        <button className="hamburger" onClick={toggleSidebar}>
          <FaBars />
        </button>
      )}

      {/* Overlay */}
      {isMobile && isOpen && (
        <div className="overlay" onClick={toggleSidebar} />
      )}

      {/* Sidebar */}
      <div className={`sidebar ${isMobile && isOpen ? "open" : ""}`}>
        {/* Close */}
        {isMobile && (
          <button className="close-btn" onClick={toggleSidebar}>
            <FaTimes />
          </button>
        )}

        {/* User Info */}
        <div className="user-info">
          <FaUserCircle className="user-avatar" />

          <div>
            <h3 className="user-name">
  {profile?.full_name || "Agent"}
</h3>

<p className="user-role">
  {profile?.role?.toUpperCase() || "User"}
</p>
          </div>
        </div>

        {/* Navigation */}
        <ul>
          <li>
            <NavLink to="/agentdashboard/home" className="link">
              <FaTachometerAlt />
              Dashboard
            </NavLink>
          </li>

          <li>
            <NavLink to="/agentdashboard/property" className="link">
              <FaHome />
              Browse Properties
            </NavLink>
          </li>

          <li>
            <NavLink to="/agentdashboard/rentalPage" className="link">
              <FaHistory />
              Rental History
            </NavLink>
          </li>

          <li>
            <NavLink to="/agentdashboard/messages" className="link">
              <FaEnvelope />
              Messages
            </NavLink>
          </li>

          <li>
            <NavLink to="/agentdashboard/request" className="link">
              <FaClipboardList />
              Requests
            </NavLink>
          </li>

          <li>
            <NavLink to="/agentdashboard/profile" className="link">
              <FaUserCog />
              Profile & Settings
            </NavLink>
          </li>

          <li>
            <NavLink to="/agentdashboard/notification" className="link">
              <FaBell />
              Notifications
            </NavLink>
          </li>
        </ul>

        {/* Logout */}
        <div className="logout">
          <button onClick={() => setShowLogoutModal(true)}>
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </div>

      {/* LOGOUT MODAL */}

      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            className="logout-modal-overlay"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
          >
            <motion.div
              className="logout-modal"
              initial={{
                scale: 0.8,
                opacity: 0,
                y: 30,
              }}
              animate={{
                scale: 1,
                opacity: 1,
                y: 0,
              }}
              exit={{
                scale: 0.8,
                opacity: 0,
                y: 30,
              }}
            >
              <h3>Logout Confirmation</h3>

              <p>Are you sure you want to logout?</p>

              <div className="logout-actions">
                <button
                  className="cancel-btn"
                  onClick={() => setShowLogoutModal(false)}
                >
                  Cancel
                </button>

                <button className="confirm-btn" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AgentSideBar;
