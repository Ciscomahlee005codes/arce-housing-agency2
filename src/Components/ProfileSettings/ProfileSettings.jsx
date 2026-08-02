import React, {
  useEffect,
  useRef,
  useState,
} from "react";
import "./ProfileSettings.css";
import { UserAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import BackButton from "../BackButton/BackButton";

const ProfileSettings = () => {
  const { user, profile, fetchProfile } =
    UserAuth();

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const [loading, setLoading] =
    useState(false);

   const [photoURL, setPhotoURL] = useState(profile?.avatar_url || "");
   useEffect(() => {
  if (profile?.avatar_url) {
    setPhotoURL(profile.avatar_url);
  }
}, [profile]);
  

  const [formData, setFormData] =
    useState({
      full_name: "",
      email: "",
      phone: "",
      role: "",

      // TENANT
      tenant_state: "",
      tenant_city: "",

      // STUDENT
      school_name: "",
      student_level: "",
      accommodation_type: "",
      preferred_area: "",

      // GENERAL
      password: "",
      confirmPassword: "",
    });

  // LOAD USER DATA
   useEffect(() => {
  if (profile) {
    setPhotoURL(profile.avatar_url || "");

    setFormData({
      full_name: profile.full_name || "",
      email: user?.email || "",
      phone: profile.phone || "",
      role: profile.role || "",
      tenant_state: profile.tenant_state || "",
      tenant_city: profile.tenant_city || "",
      school_name: profile.school_name || "",
      student_level: profile.student_level || "",
      accommodation_type:
        profile.accommodation_type || "",
      preferred_area:
        profile.preferred_area || "",
      password: "",
      confirmPassword: "",
    });
  }
}, [profile, user]);

  // HANDLE INPUT
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // IMAGE UPLOAD
  const handleImageClick = () => {
    fileInputRef.current.click();
  };

   const handleImageUpload = async (e) => {
  const file = e.target.files[0];

  if (!file || !user) return;

  try {
    setLoading(true);

    const fileExt =
      file.name.split(".").pop();

    const fileName =
      `${user.id}-${Date.now()}.${fileExt}`;

    const filePath =
      `${user.id}/${fileName}`;

    const { error: uploadError } =
      await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          upsert: true,
        });

    if (uploadError)
      throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const {
      error: profileError,
    } = await supabase
      .from("profiles")
      .update({
        avatar_url: publicUrl,
      })
      .eq("id", user.id);

    if (profileError)
      throw profileError;

    setPhotoURL(publicUrl);

    await fetchProfile(user.id);

    toast.success(
      "Profile picture updated"
    );
  } catch (err) {
    console.error(err);

    toast.error(
      "Failed to upload image"
    );
  } finally {
    setLoading(false);
  }
};

  // SAVE PROFILE
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      formData.password &&
      formData.password !==
        formData.confirmPassword
    ) {
      toast.error(
        "Passwords do not match"
      );

      return;
    }

    try {
      setLoading(true);

      const updateData = {
        full_name:
          formData.full_name,

        phone: formData.phone,

        tenant_state:
          formData.tenant_state,

        tenant_city:
          formData.tenant_city,

        school_name:
          formData.school_name,

        student_level:
          formData.student_level,

        accommodation_type:
          formData.accommodation_type,

        preferred_area:
          formData.preferred_area,
      };

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id);

      if (error) {
        toast.error(error.message);

        return;
      }

      // UPDATE PASSWORD
      if (formData.password) {
        const {
          error: passwordError,
        } =
          await supabase.auth.updateUser({
            password:
              formData.password,
          });

        if (passwordError) {
          toast.error(
            passwordError.message
          );

          return;
        }
      }

      await fetchProfile(user.id);

      toast.success(
        "Profile updated successfully"
      );
    } catch (err) {
      console.error(err);

      toast.error(
        "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-settings-page">
      <div className="profile-settings-container">

        {/* HEADER */}

        <div className="settings-header">
          <BackButton />
          <h2>Profile Settings</h2>

          <p>
            Manage your account details
            and preferences.
          </p>
        </div>

        {/* CARD */}

        <div className="settings-card">

          {/* PROFILE IMAGE */}

          <div className="profile-image-section">
            <div
              className="profile-image-wrapper"
              onClick={handleImageClick}
            >
              {photoURL ? (
                <img
                  src={photoURL}
                  alt="profile"
                />
              ) : (
                <div className="image-placeholder">
                  +
                </div>
              )}
            </div>

            <button
              className="change-photo-btn"
              onClick={handleImageClick}
            >
              Change Photo
            </button>

            <input
              type="file"
              hidden
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>

          {/* FORM */}

          <form
            className="settings-form"
            onSubmit={handleSubmit}
          >

            {/* PERSONAL */}

            <div className="settings-section">
              <h3>
                Personal Information
              </h3>

              <div className="form-grid">

                <div className="form-group">
                  <label>
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="full_name"
                    value={
                      formData.full_name
                    }
                    onChange={
                      handleChange
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>

                  <input
                    type="email"
                    value={
                      formData.email
                    }
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label>
                    Phone Number
                  </label>

                  <input
                    type="text"
                    name="phone"
                    value={
                      formData.phone
                    }
                    onChange={
                      handleChange
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Role</label>

                  <input
                    type="text"
                    value={
                      formData.role
                    }
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* TENANT FIELDS */}

            {formData.role ===
              "tenant" && (
              <div className="settings-section">
                <h3>
                  Location Information
                </h3>

                <div className="form-grid">

                  <div className="form-group">
                    <label>State</label>

                    <input
                      type="text"
                      name="tenant_state"
                      value={
                        formData.tenant_state
                      }
                      onChange={
                        handleChange
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>City</label>

                    <input
                      type="text"
                      name="tenant_city"
                      value={
                        formData.tenant_city
                      }
                      onChange={
                        handleChange
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STUDENT FIELDS */}

            {formData.role ===
              "student" && (
              <div className="settings-section">
                <h3>
                  Student Information
                </h3>

                <div className="form-grid">

                  <div className="form-group">
                    <label>
                      University
                    </label>

                    <input
                      type="text"
                      name="school_name"
                      value={
                        formData.school_name
                      }
                      onChange={
                        handleChange
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Student Level
                    </label>

                    <input
                      type="text"
                      name="student_level"
                      value={
                        formData.student_level
                      }
                      onChange={
                        handleChange
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Preferred Accommodation
                    </label>

                    <input
                      type="text"
                      name="accommodation_type"
                      value={
                        formData.accommodation_type
                      }
                      onChange={
                        handleChange
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Preferred Area
                    </label>

                    <input
                      type="text"
                      name="preferred_area"
                      value={
                        formData.preferred_area
                      }
                      onChange={
                        handleChange
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {/* PASSWORD */}

            <div className="settings-section">
              <h3>Security</h3>

              <div className="form-grid">

                <div className="form-group">
                  <label>
                    New Password
                  </label>

                  <input
                    type="password"
                    name="password"
                    value={
                      formData.password
                    }
                    onChange={
                      handleChange
                    }
                  />
                </div>

                <div className="form-group">
                  <label>
                    Confirm Password
                  </label>

                  <input
                    type="password"
                    name="confirmPassword"
                    value={
                      formData.confirmPassword
                    }
                    onChange={
                      handleChange
                    }
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="save-btn"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;