import React, { useState, useEffect } from "react";
import { UserAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";
import PropertyCard from "../PropertyCard/PropertyCard";
import "./SavedProperties.css";


const SavedProperties = () => {
  const [loading, setLoading] = useState(true);
  const { user } = UserAuth();
  const navigate = useNavigate();
  const [savedProperties, setSavedProperties] = useState([]);
    useEffect(() => {
  const fetchSavedProperties = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("saved_properties")
      .select(`
        property_id,
        properties (*)
      `)
      .eq("user_id", user.id);

    if (!error) {
      setSavedProperties(
        data.map(item => item.properties)
      );
    }

    setLoading(false);
  };

  fetchSavedProperties();
}, [user]);

const handleViewDetails = (property) => {
  switch (property.type?.toLowerCase()) {
    case "house":
      navigate(`/viewhomes/${property.id}`);
      break;

    case "lodge":
      navigate(`/lodge/${property.id}`);
      break;

    case "shared room":
      navigate(`/sharedroom/${property.id}`);
      break;

    case "hostel":
      navigate(`/hostel/${property.id}`);
      break;

    default:
      navigate(`/viewhomes/${property.id}`);
  }
};
  return (
  <div className="saved-properties-page">
    <div className="saved-properties-container">

      <div className="saved-header">
        <h2>Saved Properties</h2>

        {!loading && (
          <span className="saved-count">
            {savedProperties.length} Saved
          </span>
        )}
      </div>

      {loading ? (
        <div className="saved-loading">
          <p>Loading saved properties...</p>
        </div>
      ) : savedProperties.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏠</div>

          <h3>No Saved Properties Yet</h3>

          <p>
            Properties you save will appear
            here so you can easily find them
            later.
          </p>

          <button
            className="browse-btn"
            onClick={() =>
              navigate("/viewhomes")
            }
          >
            Browse Properties
          </button>
        </div>
      ) : (
        <div className="saved-grid">
          {savedProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onViewDetails={() =>
                handleViewDetails(property)
              }
            />
          ))}
        </div>
      )}
    </div>
  </div>
);
};

export default SavedProperties;