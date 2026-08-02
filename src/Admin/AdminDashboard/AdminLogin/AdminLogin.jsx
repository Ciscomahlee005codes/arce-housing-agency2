import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";
import { supabase } from "../../../lib/supabase";
import toast from "react-hot-toast";

// API URL from VITE env
const API_BASE = import.meta.env.VITE_API_URL;

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "admin", // 🔒 fixed role
  });
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async () => {
  const { email, password } = formData;

  if (!email || !password) {
    toast.error("Please enter email and password");
    return;
  }

  try {
    setIsLoading(true);

    // LOGIN
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    // CHECK ROLE
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      toast.error("Unable to verify admin");
      return;
    }

    // BLOCK NON ADMINS
    if (profile.role !== "admin") {
      await supabase.auth.signOut();

      toast.error("Access denied");
      return;
    }

    toast.success("Welcome Admin 🚀");

    navigate("/admindashboard/home");

  } catch (err) {
    console.log(err);
    toast.error("Something went wrong");
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="auth-container">
      <div className="auth-image"></div>
      <div className="auth-form login-mode">
        <AnimatePresence mode="wait">
          <motion.div
            key="admin-login"
            initial={{ x: 200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -200, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="form-box"
          >
            <h2>Admin Login</h2>
            <input
              name="email"
              type="email"
              placeholder="Admin Email"
              value={formData.email}
              onChange={handleInputChange}
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
            />
            <button
              className="primary-btn"
              onClick={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Login"}
            </button>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminLogin;
