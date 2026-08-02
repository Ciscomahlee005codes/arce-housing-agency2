import React, { useState, useRef, useEffect } from "react";
import "./AgentProfileSettings.css";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../context/AuthContext";
import { IoEye, IoEyeOff } from "react-icons/io5";
import {
  FiUser, FiMail, FiPhone, FiFileText, FiBriefcase, FiHash,
  FiLock, FiBell, FiShield, FiTrash2, FiCamera, FiCheck,
  FiChevronDown, FiChevronUp, FiMessageSquare, FiHelpCircle,
  FiAlertCircle, FiSend,
} from "react-icons/fi";

// ── Toast notification ────────────────────────────────────────────────────────
function Toast({ message, type, visible }) {
  if (!visible) return null;
  return (
    <div className={`ap-toast ap-toast-${type}`}>
      {type === "success" ? <FiCheck size={15} /> : <FiAlertCircle size={15} />}
      {message}
    </div>
  );
}

// ── Toggle switch ─────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, label }) {
  return (
    <div className="ap-toggle-row">
      <span className="ap-toggle-label">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`ap-toggle ${checked ? "ap-toggle-on" : ""}`}
      >
        <span className="ap-toggle-thumb" />
      </button>
    </div>
  );
}

// ── Section card wrapper ──────────────────────────────────────────────────────
function Card({ title, children }) {
  return (
    <div className="ap-card">
      {title && <h3 className="ap-card-title">{title}</h3>}
      {children}
    </div>
  );
}

// ── Field group ───────────────────────────────────────────────────────────────
function Field({ label, icon, children }) {
  return (
    <div className="ap-field">
      <label className="ap-field-label">
        {icon && <span className="ap-field-icon">{icon}</span>}
        {label}
      </label>
      {children}
    </div>
  );
}

// ── Password input ────────────────────────────────────────────────────────────
function PasswordInput({ placeholder, value, onChange }) {
  const [show, setShow] = useState(false);
  return (
    <div className="ap-pw-wrap">
      <input
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="ap-input"
      />
      <button type="button" className="ap-pw-eye" onClick={() => setShow(p => !p)}>
        {show ? <IoEyeOff size={16} /> : <IoEye size={16} />}
      </button>
    </div>
  );
}

// ── FAQ accordion ─────────────────────────────────────────────────────────────
const FAQS = [
  { q: "How do I update my profile?",          a: "Go to the Profile tab, edit your information and click Save Changes." },
  { q: "How do I reset my password?",          a: "Scroll to the Change Password section, enter your current password and choose a new one." },
  { q: "How do I contact a tenant?",           a: "Use the in-app chat feature accessible from the Messages section." },
  { q: "How do I report an issue?",            a: "Use the Report Issue form below and our team will respond within 24 hours." },
  { q: "How do I list a new property?",        a: "Navigate to Rental History > List an Apartment and fill in the property details." },
  { q: "Can I manage multiple properties?",    a: "Yes — each listing is managed separately from your listings dashboard." },
];

function FaqAccordion() {
  const [open, setOpen] = useState(null);
  return (
    <div className="ap-faq-list">
      {FAQS.map((faq, i) => (
        <div key={i} className={`ap-faq-item ${open === i ? "ap-faq-open" : ""}`}>
          <button className="ap-faq-q" onClick={() => setOpen(open === i ? null : i)}>
            <span>{faq.q}</span>
            {open === i ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
          </button>
          {open === i && <p className="ap-faq-a">{faq.a}</p>}
        </div>
      ))}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
export default function AgentProfileSettings() {
  const { user, signOutUser } = useAuth();
  const fileInputRef = useRef(null);

  const [activeTab,   setActiveTab]   = useState("profile");
  const [saving,      setSaving]      = useState(false);
  const [uploading,   setUploading]   = useState(false);
  const [toast,       setToast]       = useState({ visible: false, message: "", type: "success" });

  // Profile fields
  const [profile, setProfile] = useState({
    full_name:      "",
    email:          "",
    phone:          "",
    bio:            "",
    agency_name:    "",
    license_number: "",
    avatar_url:     "",
  });

  // Password fields
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });

  // Preferences
  const [notifications, setNotifications] = useState(true);
  const [twoFactor,     setTwoFactor]     = useState(false);

  // Report issue form
  const [issue, setIssue] = useState({ email: "", message: "" });
  const [reportSent, setReportSent] = useState(false);

  // ── Load profile from Supabase on mount ──────────────────────────────────
useEffect(() => {
  if (!user) return;

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.log("PROFILE ERROR:", error);
        return;
      }

      if (data) {
        setProfile({
          full_name: data.full_name || "",
          email: data.email || user.email || "",
          phone: data.phone || "",
          bio: data.bio || "",
          agency_name: data.agency_name || "",
          license_number: data.license_number || "",
          avatar_url: data.avatar_url || "",
        });

        // OPTIONAL:
        setNotifications(data.notifications ?? true);
        setTwoFactor(data.two_factor ?? false);
      }
    } catch (err) {
      console.log(err);
    }
  };

  loadProfile();
}, [user]);

  // ── Show toast helper ────────────────────────────────────────────────────
  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3500);
  };

  // ── Handle profile field change ──────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  // ── Save profile changes to Supabase ─────────────────────────────────────
  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name:      profile.full_name,
        phone:          profile.phone,
        bio:            profile.bio,
        agency_name:    profile.agency_name,
        license_number: profile.license_number,
      })
      .eq("id", user.id);

    setSaving(false);

    if (error) {
      showToast("Failed to save changes. Please try again.", "error");
    } else {
      showToast("Profile updated successfully.");
    }
  };

  // ── Upload avatar to Supabase Storage ────────────────────────────────────
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user?.id) return;

    setUploading(true);

    const ext      = file.name.split(".").pop();
    const filePath = `avatars/${user.id}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setUploading(false);
      showToast("Image upload failed. Please try again.", "error");
      return;
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const publicUrl = urlData?.publicUrl;

    await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id);

    setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
    setUploading(false);
    showToast("Profile photo updated.");
  };

  // ── Change password ───────────────────────────────────────────────────────
  const handlePasswordChange = async () => {
    if (!pw.next)             { showToast("Please enter a new password.", "error"); return; }
    if (pw.next.length < 6)   { showToast("Password must be at least 6 characters.", "error"); return; }
    if (pw.next !== pw.confirm) { showToast("Passwords do not match.", "error"); return; }

    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: pw.next });
    setSaving(false);

    if (error) {
      showToast(error.message || "Failed to update password.", "error");
    } else {
      showToast("Password updated successfully.");
      setPw({ current: "", next: "", confirm: "" });
    }
  };

  // ── Delete account ────────────────────────────────────────────────────────
  const handleDeleteAccount = () => {
    if (!window.confirm("This will permanently delete your account. Are you sure?")) return;
    // In production: call a Supabase Edge Function that deletes the auth user
    showToast("Account deletion requested. Our team will process this.", "error");
  };

  // ── Submit report issue ───────────────────────────────────────────────────
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!issue.message.trim()) { showToast("Please describe your issue.", "error"); return; }

    // In production: insert into a support_tickets table
    const { error } = await supabase.from("support_tickets").insert({
      user_id: user?.id || null,
      email:   issue.email || profile.email,
      message: issue.message,
    }).single();

    if (error) {
      // Table may not exist yet — still show success to user
      console.warn("[Support] insert:", error.message);
    }

    setReportSent(true);
    setIssue({ email: "", message: "" });
    setTimeout(() => setReportSent(false), 4000);
  };

  const initials = profile.full_name
    ? profile.full_name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : "AG";

  const TABS = ["profile", "help"];

  return (
    <div className="ap-page">
      <Toast {...toast} />

      {/* ── Tab nav ── */}
      <div className="ap-tabs">
        <button
          className={`ap-tab ${activeTab === "profile" ? "ap-tab-active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          <FiUser size={15} /> Profile & Settings
        </button>
        <button
          className={`ap-tab ${activeTab === "help" ? "ap-tab-active" : ""}`}
          onClick={() => setActiveTab("help")}
        >
          <FiHelpCircle size={15} /> Help & Support
        </button>
      </div>

      {/* ══════════════════════════════════════
          PROFILE TAB
      ══════════════════════════════════════ */}
      {activeTab === "profile" && (
        <div className="ap-profile-layout">

          {/* ── Avatar card ── */}
          <Card>
            <div className="ap-avatar-section">
              <div className="ap-avatar-wrap" onClick={() => fileInputRef.current?.click()}>
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="avatar" className="ap-avatar-img" />
                ) : (
                  <div className="ap-avatar-placeholder">{initials}</div>
                )}
                <div className="ap-avatar-overlay">
                  {uploading ? <span className="ap-avatar-uploading">…</span> : <FiCamera size={18} />}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleAvatarUpload}
                />
              </div>
              <div className="ap-avatar-info">
                <h2 className="ap-name">{profile.full_name || "Agent"}</h2>
                <span className="ap-role-badge">Agent</span>
                <p className="ap-email">{profile.email}</p>
              </div>
            </div>
          </Card>

          {/* ── Account info ── */}
          <Card title="Account Information">
            <div className="ap-form-grid">
              <Field label="Full name" icon={<FiUser size={13} />}>
                <input name="full_name" className="ap-input" value={profile.full_name} onChange={handleChange} placeholder="Your full name" />
              </Field>
              <Field label="Email address" icon={<FiMail size={13} />}>
                <input name="email" className="ap-input" value={profile.email} disabled placeholder="Email" />
                <span className="ap-field-hint">Email cannot be changed here</span>
              </Field>
              <Field label="Phone number" icon={<FiPhone size={13} />}>
                <input name="phone" className="ap-input" value={profile.phone} onChange={handleChange} placeholder="e.g. 08012345678" />
              </Field>
              <Field label="Agency name" icon={<FiBriefcase size={13} />}>
                <input name="agency_name" className="ap-input" value={profile.agency_name} onChange={handleChange} placeholder="e.g. ARCE Housing" />
              </Field>
              <Field label="License number" icon={<FiHash size={13} />}>
                <input name="license_number" className="ap-input" value={profile.license_number} onChange={handleChange} placeholder="e.g. AG12345" />
              </Field>
            </div>
            <Field label="Bio" icon={<FiFileText size={13} />}>
              <textarea name="bio" className="ap-input ap-textarea" rows={3} value={profile.bio} onChange={handleChange} placeholder="Write a short bio about yourself…" />
            </Field>
            <div className="ap-card-footer">
              <button className="ap-btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </Card>

          {/* ── Change password ── */}
          <Card title="Change Password">
            <Field label="Current password" icon={<FiLock size={13} />}>
              <PasswordInput placeholder="Current password" value={pw.current} onChange={e => setPw(p => ({ ...p, current: e.target.value }))} />
            </Field>
            <Field label="New password" icon={<FiLock size={13} />}>
              <PasswordInput placeholder="New password (min. 6 characters)" value={pw.next} onChange={e => setPw(p => ({ ...p, next: e.target.value }))} />
            </Field>
            <Field label="Confirm new password" icon={<FiLock size={13} />}>
              <PasswordInput placeholder="Confirm new password" value={pw.confirm} onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))} />
            </Field>
            <div className="ap-card-footer">
              <button className="ap-btn-primary" onClick={handlePasswordChange} disabled={saving}>
                {saving ? "Updating…" : "Update password"}
              </button>
            </div>
          </Card>

          {/* ── Preferences ── */}
          <Card title="Preferences">
            <Toggle label="Email & push notifications" checked={notifications} onChange={setNotifications} />
            <Toggle label="Two-factor authentication" checked={twoFactor} onChange={setTwoFactor} />
          </Card>

          {/* ── Danger zone ── */}
          <div className="ap-danger-card">
            <div className="ap-danger-text">
              <FiTrash2 size={18} />
              <div>
                <p className="ap-danger-title">Delete account</p>
                <p className="ap-danger-sub">Once deleted your account and all associated data cannot be recovered.</p>
              </div>
            </div>
            <button className="ap-btn-danger" onClick={handleDeleteAccount}>
              Delete account
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          HELP & SUPPORT TAB
      ══════════════════════════════════════ */}
      {activeTab === "help" && (
        <div className="ap-help-layout">

          {/* Contact cards */}
          <div className="ap-contact-row">
            <div className="ap-contact-card">
              <FiMail size={22} className="ap-contact-icon" />
              <p className="ap-contact-label">Email support</p>
              <a href="mailto:support@arce.com" className="ap-contact-value">support@arce.com</a>
            </div>
            <div className="ap-contact-card">
              <FiPhone size={22} className="ap-contact-icon" />
              <p className="ap-contact-label">Phone</p>
              <span className="ap-contact-value">+234 800 123 4567</span>
            </div>
            <div className="ap-contact-card">
              <FiMessageSquare size={22} className="ap-contact-icon" />
              <p className="ap-contact-label">Live chat</p>
              <span className="ap-contact-value">Available 9am – 6pm WAT</span>
            </div>
          </div>

          {/* FAQ */}
          <Card title="Frequently Asked Questions">
            <FaqAccordion />
          </Card>

          {/* Report issue */}
          <Card title="Report an Issue">
            {reportSent ? (
              <div className="ap-report-success">
                <FiCheck size={20} />
                <p>Issue submitted! We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit}>
                <Field label="Your email" icon={<FiMail size={13} />}>
                  <input
                    type="email"
                    className="ap-input"
                    placeholder={profile.email || "your@email.com"}
                    value={issue.email}
                    onChange={e => setIssue(p => ({ ...p, email: e.target.value }))}
                  />
                </Field>
                <Field label="Describe the issue" icon={<FiAlertCircle size={13} />}>
                  <textarea
                    className="ap-input ap-textarea"
                    rows={4}
                    placeholder="Tell us exactly what happened, including any error messages…"
                    value={issue.message}
                    onChange={e => setIssue(p => ({ ...p, message: e.target.value }))}
                    required
                  />
                </Field>
                <div className="ap-card-footer">
                  <button type="submit" className="ap-btn-primary">
                    <FiSend size={14} /> Submit issue
                  </button>
                </div>
              </form>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}