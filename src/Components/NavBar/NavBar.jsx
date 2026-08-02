import { useEffect, useState, useRef } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { FaBell, FaHistory,FaUser,FaHeart, FaCog,FaSignOutAlt, FaHome} from "react-icons/fa";
import { BsChatSquareTextFill,BsBuildingsFill} from "react-icons/bs";
import { FaCircleUser } from "react-icons/fa6";
import { AiFillHome } from "react-icons/ai";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useNotifications } from "../../context/NotificationContext";
import ARCELOGO from "../../assets/ARCE-Logo11.png";
import "./NavBar.css";

const NavBar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useNotifications();
  const [showLogoutModal, setShowLogoutModal] =
  useState(false);
  const menuRef = useRef(null);
  const {
  user,
  profile,
  loading,
  logoutUser,
} = useAuth();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
  setMenuOpen(false);
  setProfileMenuOpen(false);
}, [location.pathname]);

  // Close menu on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close the profile dropdown on outside click. There are two profile
  // triggers in the DOM at once (desktop-actions + mobile-actions, CSS
  // just decides which is visible), so we check by class rather than a
  // single ref — that way the check works no matter which one rendered.
  useEffect(() => {
  const handleOutsideClick = (e) => {
    if (!e.target.closest(".profile-wrapper")) {
      setProfileMenuOpen(false);
    }
  };

  document.addEventListener(
    "mousedown",
    handleOutsideClick
  );

  return () => {
    document.removeEventListener(
      "mousedown",
      handleOutsideClick
    );
  };
}, []);

  // User Initials
  const userInitial =
  profile?.full_name?.[0]?.toUpperCase();

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/viewHomes", label: "View Homes" },
    { to: "/aboutUs", label: "About Us" },
    { to: "/rentalHistory", label: "Rental History" },
    { to: "/contactUs", label: "Contact" },
  ];

  const profileMenuItems = [
  {
    label: "Profile",
    icon: <FaUser />,
    action: () => navigate("/profile"),
  },

  {
    label: "Saved Properties",
    icon: <FaHeart />,
    action: () => navigate("/saved-properties"),
  },

  {
    label: "Settings",
    icon: <FaCog />,
    action: () => navigate("/profilesettings"),
  },
];

  // Shared profile dropdown, rendered once per breakpoint's action bar
  // so its behaviour (sign-up vs. avatar) is identical on desktop and mobile.
  const renderProfileArea = () => (
    !loading && user ? (
      <div className="profile-wrapper">
        <button
          className="profile-avatar"
          onClick={() => setProfileMenuOpen((prev) => !prev)}
        >
          {userInitial}
        </button>

        <AnimatePresence>
          {profileMenuOpen && (
            <motion.div
              className="profile-dropdown"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className="profile-info">
                <h4>{profile?.full_name}</h4>
                <p>{profile?.email}</p>
              </div>

              {profileMenuItems.map(({ label, icon, action }) => (
                <button
                  key={label}
                  className="profile-dropdown-btn"
                  onClick={action}
                >
                  <span className="dropdown-icon">{icon}</span>
                  {label}
                </button>
              ))}

              {(profile?.role === "agent" || profile?.role === "admin") && (
                <button
                  className="profile-dropdown-btn"
                  onClick={() => navigate(`/${profile.role}dashboard/home`)}
                >
                  <span className="dropdown-icon">
                    <FaHome />
                  </span>
                  Dashboard
                </button>
              )}

              <button
                className="profile-dropdown-btn logout-btn"
                onClick={() => setShowLogoutModal(true)}
              >
                <span className="dropdown-icon">
                  <FaSignOutAlt />
                </span>
                Logout
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    ) : (
      <button className="arce-cta" onClick={() => navigate("/login")}>
        Sign Up
      </button>
    )
  );

  const renderMobileProfileArea = () => (
    !loading && user ? (
      <div className="profile-wrapper">
        <button
          className="profile-avatar mobile-avatar"
          onClick={() => setProfileMenuOpen((prev) => !prev)}
        >
          {userInitial}
        </button>

        <AnimatePresence>
          {profileMenuOpen && (
            <motion.div
              className="profile-dropdown"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className="profile-info">
                <h4>{profile?.full_name}</h4>
                <p>{profile?.email}</p>
              </div>

              {profileMenuItems.map(({ label, icon, action }) => (
                <button
                  key={label}
                  className="profile-dropdown-btn"
                  onClick={action}
                >
                  <span className="dropdown-icon">{icon}</span>
                  {label}
                </button>
              ))}

              {(profile?.role === "agent" || profile?.role === "admin") && (
                <button
                  className="profile-dropdown-btn"
                  onClick={() => navigate(`/${profile.role}dashboard/home`)}
                >
                  <span className="dropdown-icon">
                    <FaHome />
                  </span>
                  Dashboard
                </button>
              )}

              <button
                className="profile-dropdown-btn logout-btn"
                onClick={() => setShowLogoutModal(true)}
              >
                <span className="dropdown-icon">
                  <FaSignOutAlt />
                </span>
                Logout
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    ) : (
      <button className="mobile-cta" onClick={() => navigate("/login")}>
        Sign Up
      </button>
    )
  );

  return (
    <>
      <header className={`arce-header ${scrolled ? "scrolled" : ""}`}>
        <div className="arce-nav">

          {/* Logo */}
          <NavLink to="/" className="arce-logo">
            <img src={ARCELOGO} alt="ARCE Logo" />
          </NavLink>

          {/* Desktop Links */}
          <nav className="arce-links">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `arce-link ${isActive ? "arce-link--active" : ""}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="arce-actions">

  {/* 🔥 Desktop Only */}
   <div className="desktop-actions">
  <NavLink
    to="/userNotification"
    className={({ isActive }) =>
      `arce-icon-btn ${isActive ? "arce-icon-btn--active" : ""}`
    }
  >
    <FaBell />
    {unreadCount > 0 && (
      <span className="notif-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
    )}
  </NavLink>

  <NavLink
    to="/userChats"
    className={({ isActive }) =>
      `arce-icon-btn ${isActive ? "arce-icon-btn--active" : ""}`
    }
  >
    <BsChatSquareTextFill />
  </NavLink>

  {renderProfileArea()}
</div>

  {/* 🔥 Mobile Only */}
  <div className="mobile-actions">
  <NavLink
    to="/userNotification"
    className={({ isActive }) =>
      `mobile-bell ${isActive ? "mobile-bell--active" : ""}`
    }
  >
    <FaBell />
    {unreadCount > 0 && (
      <span className="notif-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
    )}
  </NavLink>

  {renderMobileProfileArea()}
</div>

  {/* Hamburger */}
  <button
    className={`arce-hamburger ${menuOpen ? "open" : ""}`}
    onClick={() => setMenuOpen((v) => !v)}
    ref={menuRef}
  >
    <span />
    <span />
    <span />
  </button>
</div>
        </div>

        {/* Mobile Dropdown Menu (tablet range) */}
        <div className={`arce-mobile-menu ${menuOpen ? "arce-mobile-menu--open" : ""}`}>
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `arce-mobile-link ${isActive ? "arce-mobile-link--active" : ""}`
              }
            >
              {label}
            </NavLink>
          ))}
          <button
            className="arce-mobile-cta"
            onClick={() => navigate("/login")}
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* Bottom Navigation — Mobile only */}
      <nav className="arce-bottom-nav">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `arce-bottom-item ${isActive ? "arce-bottom-item--active" : ""}`
          }
        >
          <span className="bottom-icon"><AiFillHome /></span>
          <span className="bottom-label">Home</span>
        </NavLink>

        <NavLink
          to="/viewHomes"
          className={({ isActive }) =>
            `arce-bottom-item ${isActive ? "arce-bottom-item--active" : ""}`
          }
        >
          <span className="bottom-icon"><BsBuildingsFill /></span>
          <span className="bottom-label">Explore</span>
        </NavLink>

        {/* Center Highlight Button */}
        <NavLink
          to="/userChats"
          className={({ isActive }) =>
            `arce-bottom-item arce-bottom-center ${isActive ? "arce-bottom-item--active" : ""}`
          }
        >
          <span className="bottom-center-bubble">
            <BsChatSquareTextFill />
          </span>
          <span className="bottom-label">Chats</span>
        </NavLink>

        <NavLink
          to="/rentalHistory"
          className={({ isActive }) =>
            `arce-bottom-item ${isActive ? "arce-bottom-item--active" : ""}`
          }
        >
          <span className="bottom-icon"><FaHistory /></span>
          <span className="bottom-label">History</span>
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `arce-bottom-item ${isActive ? "arce-bottom-item--active" : ""}`
          }
        >
          <span className="bottom-icon"><FaCircleUser /></span>
          <span className="bottom-label">Profile</span>
        </NavLink>
      </nav>
      <AnimatePresence>
  {showLogoutModal && (
    <motion.div
      className="logout-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
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
        transition={{
          duration: 0.25,
        }}
      >
        <h3>
          Logout Confirmation
        </h3>

        <p>
          Are you sure you want to
          logout?
        </p>

        <div className="logout-actions">

          <button
            className="cancel-btn"
            onClick={() =>
              setShowLogoutModal(false)
            }
          >
            Cancel
          </button>

          <button
            className="confirm-btn"
            onClick={async () => {

              await logoutUser();

              toast.success(
                "Logged out successfully"
              );

              setShowLogoutModal(false);

              navigate("/");
            }}
          >
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

export default NavBar;