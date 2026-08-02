import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [user,    setUser]    = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // =========================
  // FETCH PROFILE
  // =========================
  const fetchProfile = async (userId) => {
    if (!userId) return null;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) { console.error("[fetchProfile]", error.message); return null; }
      if (data) setProfile(data);
      return data;
    } catch (err) {
      console.error("[fetchProfile]", err.message);
      return null;
    }
  };

  // =========================
  // INITIAL SESSION
  // Races getSession against an 8s timeout so loading never
  // stays true forever when Supabase is paused/unreachable
  // =========================
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // ✅ Timeout race — prevents blank page if Supabase is paused
        const result = await Promise.race([
          supabase.auth.getSession(),
          new Promise((resolve) =>
            setTimeout(() => resolve({ data: { session: null } }), 8000)
          ),
        ]);

        const session = result?.data?.session;

if (mounted) {
  setUser(session?.user ?? null);

  if (session?.user) {
  const profileData =
    await fetchProfile(session.user.id);

  // AUTO REDIRECT BASED ON ROLE
  const currentPath =
    window.location.pathname;

  // prevent redirect loops
  const publicRoutes = [
    "/",
    "/login",
    "/aboutus",
    "/contactus",
    "/viewhomes",
  ];

  // Only redirect if user is on public page
  if (
    publicRoutes.includes(
      currentPath.toLowerCase()
    )
  ) {
    const role =
      profileData?.role;

    if (role === "agent") {
      navigate(
        "/agentdashboard/home",
        { replace: true }
      );
    }

    if (role === "admin") {
      navigate(
        "/admindashboard/home",
        { replace: true }
      );
    }

    if (role === "landlord") {
      navigate(
        "/landlord/dashboard",
        { replace: true }
      );
    }
  }
}
}
      } catch (err) {
        console.error("[initializeAuth]", err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    // =========================
    // AUTH LISTENER
    // =========================
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      try {
        if (session?.user) {
          setUser(session.user);
           fetchProfile(session.user.id)
  .catch(console.error);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error("[onAuthStateChange]", err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // =========================
  // REGISTER USER
  // Called as: registerUser({ email, password, profileData })
  // =========================
  const registerUser = async ({ email, password, profileData }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: profileData.full_name,
            role:      profileData.role,
          },
        },
      });

      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes("already registered") || msg.includes("already exists")) {
          toast.error("Account already exists. Please log in.");
        } else {
          toast.error(error.message);
        }
        return { success: false };
      }

      const createdUser = data?.user;
      if (!createdUser?.id) {
        toast.error("Signup failed. Please try again.");
        return { success: false };
      }

      // Update profile with all extra fields (trigger already created the row)
      const { error: updateError } = await supabase
        .from("profiles")
        .update(profileData)
        .eq("id", createdUser.id);

      if (updateError) {
        // Not fatal — the DB trigger already saved full_name + role
        console.warn("[registerUser] profile update:", updateError.message);
      }

      return { success: true, data };

    } catch (err) {
      console.error("[registerUser]", err);
      toast.error("Signup failed. Please try again.");
      return { success: false };
    }
  };

  // =========================
  // LOGIN USER
  // Called as: loginUser({ email, password })
  // Returns: { success, data: { user, session }, profile }
  // =========================
  const loginUser = async ({ email, password }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes("email not confirmed")) {
          toast.error("Please confirm your email first.");
        } else if (msg.includes("invalid login") || msg.includes("invalid credentials")) {
          toast.error("Incorrect email or password.");
        } else {
          toast.error(error.message);
        }
        return { success: false };
      }

      setUser(data.user);
      const profileData = await fetchProfile(data.user.id);

      return {
        success: true,
        data:    { user: data.user, session: data.session },
        profile: profileData,
      };

    } catch (err) {
      console.error("[loginUser]", err);
      toast.error("Login failed. Please try again.");
      return { success: false };
    }
  };

  // =========================
  // LOGOUT USER
  // =========================
  // =========================
// LOGOUT USER
// =========================
const logoutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    setUser(null);
    setProfile(null);

    toast.success("Logged out successfully.");

    // redirect user
    navigate("/login", { replace: true });

  } catch (err) {
    console.error("[logoutUser]", err.message);
    toast.error("Logout failed.");
  }
};

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        registerUser,
        loginUser,
        logoutUser,
        fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => useContext(AuthContext);
export const useAuth  = () => useContext(AuthContext);