import React, { useRef, useState } from "react";
import { FaHeart } from "react-icons/fa";
import { supabase } from "../../lib/supabase";
import { v4 as uuidv4 } from "uuid";
import "./MyProfile.css";
import {
  FaUser, FaBell, FaSignOutAlt, FaChevronRight,
  FaPhoneAlt, FaInfoCircle, FaQuestionCircle, FaStar,
} from "react-icons/fa";
import { FaHandHoldingDollar } from "react-icons/fa6";
import { BsChatSquareTextFill } from "react-icons/bs";
import { MdCameraAlt } from "react-icons/md";
import { Link } from "react-router-dom";
import { UserAuth } from "../../context/AuthContext";

const getInitials = (name) =>
  name
    ? name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
    : "?";

const MyProfile = () => {
  const { profile, logoutUser } = UserAuth();

  const [photoURL, setPhotoURL] = useState(
  profile?.avatar_url || ""
);
  const fileInputRef = useRef(null);

   const handleImageUpload = async (e) => {
  const file = e.target.files[0];

  if (!file) return;

  const fileExt = file.name.split(".").pop();

  const fileName = `${profile.id}-${uuidv4()}.${fileExt}`;

  const filePath = `${profile.id}/${fileName}`;

  const { error } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, {
      upsert: true,
    });

  if (error) {
    console.log(error);
    return;
  }

  const {
    data: { publicUrl },
  } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath);

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      avatar_url: publicUrl,
    })
    .eq("id", profile.id);

  if (updateError) {
    console.log(updateError);
    return;
  }

  setPhotoURL(publicUrl);
};

  const handleLogout = async () => await logoutUser();

  const accountLinks = [
    { title: "Profile Settings", icon: <FaUser />,              link: "/profileSettings"  },
    { title: "Messages",         icon: <BsChatSquareTextFill />, link: "/userChats"        },
    { title: "Notifications",    icon: <FaBell />,               link: "/userNotification" },
  ];

  const activityLinks = [
    { title: "Saved Properties", icon: <FaHeart />,              link: "/saved-properties" },
    { title: "Referral & Earn",  icon: <FaHandHoldingDollar />,  link: "/referTenants"     },
  ];

  const supportLinks = [
    { title: "Contact Us",       icon: <FaPhoneAlt />,           link: "/contactUs"    },
    { title: "About Us",         icon: <FaInfoCircle />,         link: "/aboutUs"      },
    { title: "FAQs",             icon: <FaQuestionCircle />,     link: "/faq"          },
    { title: "Testimonials",     icon: <FaStar />,               link: "/testimonials" },
  ];

  const renderLinks = (items) =>
    items.map((item, i) => (
      <Link to={item.link} className="mp-link-card" key={i}>
        <div className="mp-link-left">
          <span className="mp-link-icon">{item.icon}</span>
          <span className="mp-link-title">{item.title}</span>
        </div>
        <FaChevronRight className="mp-link-arrow" />
      </Link>
    ));

  const name  = profile?.full_name || "ARCE User";
  const email = profile?.email     || "";
  const role  = profile?.role      || "tenant";

  return (
    <div className="mp-page">
      <div className="mp-container">

        {/* ── PROFILE CARD ── */}
        <div className="mp-card">

          {/* Avatar — camera badge always visible */}
          <div className="mp-avatar-wrap">
            <div
              className="mp-avatar"
              onClick={() => fileInputRef.current.click()}
              role="button"
              tabIndex={0}
              aria-label="Change profile photo"
              onKeyDown={e => e.key === "Enter" && fileInputRef.current.click()}
            >
              {photoURL
                ? <img src={photoURL} alt="avatar" />
                : <div className="mp-avatar-initials">{getInitials(name)}</div>
              }
            </div>

            {/* Camera badge — ALWAYS visible, sits outside the avatar circle */}
            <button
              className="mp-camera-badge"
              onClick={() => fileInputRef.current.click()}
              aria-label="Upload photo"
            >
              <MdCameraAlt size={15} />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageUpload}
            />
          </div>

          <h2 className="mp-name">{name}</h2>
          {email && <p className="mp-email">{email}</p>}

          <span className="mp-role-badge">{role}</span>

          {/* Tap to change hint */}
          <p className="mp-photo-hint">
            Tap the photo to change it
          </p>
        </div>

        {/* ── ACCOUNT ── */}
        <div className="mp-section">
          <p className="mp-section-label">Account</p>
          {renderLinks(accountLinks)}
        </div>

        {/* ── ACTIVITY ── */}
        <div className="mp-section">
          <p className="mp-section-label">Activity</p>
          {renderLinks(activityLinks)}
        </div>

        {/* ── SUPPORT — mobile only ── */}
        <div className="mp-section mp-support">
          <p className="mp-section-label">Support</p>
          {renderLinks(supportLinks)}
        </div>

        {/* ── LOGOUT ── */}
        <button className="mp-logout-btn" onClick={handleLogout}>
          <FaSignOutAlt size={15} />
          Logout
        </button>

      </div>
    </div>
  );
};

export default MyProfile;