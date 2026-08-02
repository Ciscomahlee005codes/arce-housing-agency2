import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { IoEye, IoEyeOff } from "react-icons/io5";
import toast from "react-hot-toast";
import ARCELOGO from "../../assets/ARCE-Logo11.png";
import "./Login.css";
import { UserAuth } from "../../context/AuthContext";

// ── Role → dashboard route ────────────────────────────────────────────────────
const ROLE_ROUTES = {
  tenant: "/",
  student: "/",
  landlord: "/landlord/dashboard",
  agent: "/agentdashboard/home",
  admin: "/admindashboard/home",
};

// ── Nigerian states ───────────────────────────────────────────────────────────
const NG_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo",
  "Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa",
  "Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba",
  "Yobe","Zamfara",
];

// ── Password strength ─────────────────────────────────────────────────────────
function getStrength(pw) {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8)           score++;
  if (/[A-Z]/.test(pw))         score++;
  if (/[0-9]/.test(pw))         score++;
  if (/[^A-Za-z0-9]/.test(pw))  score++;
  const map = [
    { label: "Too short",  color: "#ef4444" },
    { label: "Weak",       color: "#f97316" },
    { label: "Fair",       color: "#eab308" },
    { label: "Good",       color: "#22c55e" },
    { label: "Strong",     color: "#16a34a" },
  ];
  return { score, ...map[score] };
}

function PasswordStrength({ password }) {
  const { score, label, color } = getStrength(password);
  if (!password) return null;
  return (
    <div style={{ marginBottom: "0.75rem", marginTop: "-0.5rem" }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              flex: 1, height: 4, borderRadius: 2,
              background: i <= score ? color : "#e5e7eb",
              transition: "background 0.3s",
            }}
          />
        ))}
      </div>
      <span style={{ fontSize: "0.75rem", color, fontWeight: 500 }}>{label}</span>
    </div>
  );
}

// ── Password input with eye toggle ────────────────────────────────────────────
function PasswordInput({ name, placeholder, value, onChange, disabled }) {
  const [show, setShow] = useState(false);
  return (
    <div className="password-field">
      <input
        type={show ? "text" : "password"}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
      <span className="toggle-password" onClick={() => setShow((p) => !p)}>
        {show ? <IoEyeOff size={18} /> : <IoEye size={18} />}
      </span>
    </div>
  );
}

// ── Blank form state ──────────────────────────────────────────────────────────
const BLANK = {
  fullName: "", email: "", phone: "", password: "", confirmPassword: "",
  role: "tenant",
  // student
  schoolName: "", studentLevel: "", accommodationType: "", preferredArea: "",
  // tenant
  tenantState: "", tenantCity: "",
  // agent
  agencyName: "", serviceAreas: "",
  // landlord
  companyName: "", landlordState: "", landlordCity: "",
  propertyLocation: "", propertyType: "",
};

// ─────────────────────────────────────────────────────────────────────────────
const Login = () => {
  // ✅ Destructure the EXACT names AuthContext exposes
  const { loginUser, registerUser, loading } = UserAuth();
  const navigate = useNavigate();

  const [isLoginForm, setIsLoginForm] = useState(true);
  const [formData,    setFormData]    = useState(BLANK);
  const [isLoading,   setIsLoading]   = useState(false);

  const handleToggleForm = () => { setFormData(BLANK); setIsLoginForm((p) => !p); };
  const handleChange     = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const strength = useMemo(() => getStrength(formData.password), [formData.password]);

  // ── Validate ────────────────────────────────────────────────────────────
  const validate = () => {
    if (!formData.email.trim()) { toast.error("Please enter your email");    return false; }
    if (!formData.password)     { toast.error("Please enter your password"); return false; }

    if (!isLoginForm) {
      if (!formData.fullName.trim())
        { toast.error("Please enter your full name"); return false; }
      if (formData.password.length < 6)
        { toast.error("Password must be at least 6 characters"); return false; }
      if (formData.password !== formData.confirmPassword)
        { toast.error("Passwords do not match"); return false; }
      if (strength.score < 2)
        { toast.error("Password is too weak. Add numbers or symbols."); return false; }
    }
    return true;
  };

  // ── LOGIN — calls AuthContext.loginUser ──────────────────────────────────
  const handleLogin = async () => {
    if (isLoading) return;
    if (!validate()) return;

    setIsLoading(true);
    const loadId = toast.loading("Signing in…");

    try {
      // ✅ Matches AuthContext: loginUser({ email, password })
      const result = await loginUser({
        email:    formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (!result.success) {
        // AuthContext already showed the error toast
        toast.dismiss(loadId);
        return;
      }

      toast.success("Welcome back!", { id: loadId });

      // AuthContext.loginUser returns { success, data, profile }
      const role = result.profile?.role ?? "tenant";
      setTimeout(() => navigate(ROLE_ROUTES[role] ?? "/"), 150);

    } catch (err) {
      console.error("[handleLogin]", err);
      toast.error("Something went wrong. Please try again.", { id: loadId });
    } finally {
      setIsLoading(false);
    }
  };

  // ── SIGN UP — calls AuthContext.registerUser ─────────────────────────────
  const handleSignUp = async () => {
    if (isLoading) return;
    if (!validate()) return;

    setIsLoading(true);
    const loadId = toast.loading("Creating your account…");

    try {
      const email = formData.email.trim().toLowerCase();

      // Build the profile payload — matches what AuthContext.registerUser expects
      const profileData = {
        full_name:          formData.fullName.trim(),
        phone:              formData.phone              || null,
        role:               formData.role,
        // student
        school_name:        formData.schoolName        || null,
        student_level:      formData.studentLevel      || null,
        accommodation_type: formData.accommodationType || null,
        preferred_area:     formData.preferredArea     || null,
        // tenant
        tenant_state:       formData.tenantState       || null,
        tenant_city:        formData.tenantCity        || null,
        // agent
        agency_name:        formData.agencyName        || null,
        service_areas:      formData.serviceAreas      || null,
        // landlord
        company_name:       formData.companyName       || null,
        landlord_state:     formData.landlordState     || null,
        landlord_city:      formData.landlordCity      || null,
        property_location:  formData.propertyLocation  || null,
        property_type:      formData.propertyType      || null,
      };

      // ✅ Matches AuthContext: registerUser({ email, password, profileData })
      const result = await registerUser({
        email,
        password: formData.password,
        profileData,
      });

      if (!result.success) {
        // AuthContext already showed the error toast
        toast.dismiss(loadId);
        return;
      }

      // No session = email confirmation is ON
      if (!result.data?.session) {
        toast.success(
          "Account created! Check your email to confirm, then log in.",
          { id: loadId, duration: 6000 }
        );
        setFormData(BLANK);
        setIsLoginForm(true);
        return;
      }

      // Session present = email confirmation OFF, user is logged in
toast.success("Account created! Welcome to ARCE.", { id: loadId });

const userRole = formData.role; // ← capture BEFORE clearing form
setFormData(BLANK);

setTimeout(() => navigate(ROLE_ROUTES[userRole] ?? "/"), 150);

    } catch (err) {
      console.error("[handleSignUp]", err);
      toast.error("Something went wrong. Please try again.", { id: loadId });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Role-specific fields ─────────────────────────────────────────────────
  const renderRoleFields = () => {
    switch (formData.role) {

      case "student":
        return (
          <>
            <select name="schoolName" value={formData.schoolName} onChange={handleChange} className="role-select" disabled={isLoading}>
              <option value="">Select University</option>
              <option>University of Lagos</option>
              <option>University of Port Harcourt</option>
              <option>Covenant University</option>
              <option>FUTO</option>
              <option>UNN</option>
              <option>OAU</option>
              <option>LASU</option>
              <option>ABU Zaria</option>
              <option>University of Ibadan</option>
              <option>UNIBEN</option>
              <option>Other</option>
            </select>
            <select name="studentLevel" value={formData.studentLevel} onChange={handleChange} className="role-select" disabled={isLoading}>
              <option value="">Student Level</option>
              <option value="100">100 Level</option>
              <option value="200">200 Level</option>
              <option value="300">300 Level</option>
              <option value="400">400 Level</option>
              <option value="500">500 Level</option>
              <option value="final">Final Year / Postgraduate</option>
            </select>
            <select name="accommodationType" value={formData.accommodationType} onChange={handleChange} className="role-select" disabled={isLoading}>
              <option value="">Preferred Accommodation</option>
              <option value="hostel">Hostel</option>
              <option value="self-contain">Self Contain</option>
              <option value="shared-apartment">Shared Apartment</option>
              <option value="single-room">Single Room</option>
            </select>
            <input name="preferredArea" type="text" placeholder="Preferred Area / Neighbourhood" value={formData.preferredArea} onChange={handleChange} disabled={isLoading} />
          </>
        );

      case "tenant":
        return (
          <>
            <select name="tenantState" value={formData.tenantState} onChange={handleChange} className="role-select" disabled={isLoading}>
              <option value="">Select State</option>
              {NG_STATES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <input name="tenantCity" type="text" placeholder="City" value={formData.tenantCity} onChange={handleChange} disabled={isLoading} />
          </>
        );

      case "agent":
        return (
          <>
            <input name="agencyName"   type="text" placeholder="Agency Name"                   value={formData.agencyName}   onChange={handleChange} disabled={isLoading} />
            <input name="serviceAreas" type="text" placeholder="Service Areas (e.g. Lagos, PH)" value={formData.serviceAreas} onChange={handleChange} disabled={isLoading} />
          </>
        );

      case "landlord":
        return (
          <>
            <input name="companyName" type="text" placeholder="Property / Company Name" value={formData.companyName} onChange={handleChange} disabled={isLoading} />
            <select name="landlordState" value={formData.landlordState} onChange={handleChange} className="role-select" disabled={isLoading}>
              <option value="">Property State</option>
              {NG_STATES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <input name="landlordCity"     type="text" placeholder="Property City"    value={formData.landlordCity}     onChange={handleChange} disabled={isLoading} />
            <input name="propertyLocation" type="text" placeholder="Property Address" value={formData.propertyLocation} onChange={handleChange} disabled={isLoading} />
            <select name="propertyType" value={formData.propertyType} onChange={handleChange} className="role-select" disabled={isLoading}>
              <option value="">Property Type</option>
              <option value="hostel">Hostel</option>
              <option value="apartment">Apartment</option>
              <option value="self-contain">Self Contain</option>
              <option value="duplex">Duplex</option>
              <option value="bungalow">Bungalow</option>
              <option value="commercial">Commercial</option>
            </select>
          </>
        );

      default:
        return null;
    }
  };

  // ── Loading guard — show spinner, never blank ────────────────────────────
  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-image" />
        <div className="auth-form login-mode">
          <div className="form-box" style={{ textAlign: "center", color: "#999" }}>
            <p>Loading…</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="auth-container">
      <div className="auth-image" />

      <div className={`auth-form ${isLoginForm ? "login-mode" : ""}`}>
        <AnimatePresence mode="wait">

          {/* ── LOGIN ── */}
          {isLoginForm ? (
            <motion.div
              key="login"
              className="form-box"
              initial={{ x: 200, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -200, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="auth-logo-wrapper">
  <img src={ARCELOGO} alt="ARCE Logo" className="login-logo" />
</div>

<h2>Welcome Back</h2>
<p className="auth-subtitle">
  Find your next home with ease
</p>

              <input
                name="email" type="email" placeholder="Email Address"
                value={formData.email} onChange={handleChange} disabled={isLoading}
              />

              <PasswordInput
                name="password" placeholder="Password"
                value={formData.password} onChange={handleChange} disabled={isLoading}
              />

              <p className="forgot-link" onClick={() => navigate("/forgot-password")}>
                Forgot Password?
              </p>

              <button className="primary-btn" onClick={handleLogin} disabled={isLoading}>
                {isLoading ? "Signing in…" : "Sign In"}
              </button>

              <p onClick={handleToggleForm}>
                Don&apos;t have an account? <span>Sign Up</span>
              </p>
            </motion.div>

          ) : (

            /* ── SIGNUP ── */
            <motion.div
              key="signup"
              className="form-box"
              initial={{ x: 200, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -200, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2>Create an Account on ARCE</h2>

              <input name="fullName" type="text"  placeholder="Full Name"     value={formData.fullName} onChange={handleChange} disabled={isLoading} />
              <input name="email"    type="email"  placeholder="Email Address" value={formData.email}    onChange={handleChange} disabled={isLoading} />
              <input name="phone"    type="tel"    placeholder="Phone Number"  value={formData.phone}    onChange={handleChange} disabled={isLoading} />

              <PasswordInput
                name="password" placeholder="Create Password"
                value={formData.password} onChange={handleChange} disabled={isLoading}
              />
              <PasswordStrength password={formData.password} />

              <PasswordInput
                name="confirmPassword" placeholder="Confirm Password"
                value={formData.confirmPassword} onChange={handleChange} disabled={isLoading}
              />

              <select name="role" value={formData.role} onChange={handleChange} className="role-select" disabled={isLoading}>
                <option value="tenant">Tenant</option>
                <option value="student">Student</option>
                <option value="landlord">Landlord</option>
                <option value="agent">Agent</option>
              </select>

              {renderRoleFields()}

              <button className="primary-btn" onClick={handleSignUp} disabled={isLoading}>
                {isLoading ? "Creating Account…" : "Sign Up"}
              </button>

              <p onClick={handleToggleForm}>
                Already have an account? <span>Login</span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Login;