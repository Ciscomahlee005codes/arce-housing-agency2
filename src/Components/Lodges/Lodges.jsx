import React, { useState, useEffect } from 'react';
import './Lodges.css';
import { FaLongArrowAltRight } from "react-icons/fa";
import { fetchApprovedProperties } from '../../lib/fetchProperties';
import { useNavigate } from 'react-router-dom'; 
import PropertyCard from '../PropertyCard/PropertyCard';

const renderStars = (rating) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 0; i < fullStars; i++) {
    stars.push(<span key={`full-${i}`} className="star">&#9733;</span>);
  }

  if (hasHalfStar) {
    stars.push(<span key="half" className="star half">&#9733;</span>);
  }

  while (stars.length < 5) {
    stars.push(<span key={`empty-${stars.length}`} className="star empty">&#9733;</span>);
  }

  return stars;
};

const Lodges = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Lodges"); // default is lodges
  const [properties, setProperties] = useState([]);
  useEffect(() => {
  const loadProperties = async () => {
    const data = await fetchApprovedProperties();

    const studentProperties = data.filter(
      (property) =>
        property.listing_category === "featured_student"
    );

    setProperties(studentProperties);
  };

  loadProperties();
}, []);

  const handleViewDetails = (id) => {
    if (activeTab === "Lodges") {
      navigate(`/lodge/${id}`);
    } else if (activeTab === "Shared Rooms") {
      navigate(`/sharedroom/${id}`);
    } else if (activeTab === "Hostels") {
      navigate(`/hostel/${id}`);
    }
  };

  // pick which list to render
  const displayedList = properties.filter((property) => {
  if (activeTab === "Lodges") {
    return property.type === "Lodge";
  }

  if (activeTab === "Shared Rooms") {
    return property.type === "Shared Apartment";
  }

  if (activeTab === "Hostels") {
    return property.type === "Hostel";
  }

  return false;
});
  return (
    <div>
      <section className="available-houses">
        <div className="container">
          <h2 className="section-title">Featured For Students</h2>

          {/* Filter Buttons */}
          <div className="filter-buttons">
            <button 
              className={activeTab === "Lodges" ? "active" : ""} 
              onClick={() => setActiveTab("Lodges")}
            >
              Lodges
            </button>
            <button 
              className={activeTab === "Shared Rooms" ? "active" : ""} 
              onClick={() => setActiveTab("Shared Rooms")}
            >
              Shared Rooms
            </button>
            <button 
              className={activeTab === "Hostels" ? "active" : ""} 
              onClick={() => setActiveTab("Hostels")}
            >
              Hostels
            </button>
          </div>

          <div className="houses-grid">
            {displayedList.slice(0, 3).map((item) => (
              <PropertyCard
                key={item.id}
                property={item}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>

          <div className="btn-container">
            {activeTab === "Lodges" && (
              <button onClick={() => navigate('/viewHomes')}>
                View More Lodges <FaLongArrowAltRight id='right-arrow' />
              </button>
            )}
            {activeTab === "Shared Rooms" && (
              <button onClick={() => navigate('/viewHomes')}>
                View More Shared Rooms <FaLongArrowAltRight id='right-arrow' />
              </button>
            )}
            {activeTab === "Hostels" && (
              <button onClick={() => navigate('/viewHomes')}>
                View More Hostels <FaLongArrowAltRight id='right-arrow' />
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Lodges;
