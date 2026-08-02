import React, { useEffect, useState } from 'react';
import { FaLongArrowAltRight } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { fetchApprovedProperties } from '../../lib/fetchProperties';
import './AvailableHouses.css';
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

const AvailableHouses = () => {
  const navigate = useNavigate(); 
  const [houses, setHouses] = useState([]);

useEffect(() => {
  const loadProperties = async () => {
    const data = await fetchApprovedProperties();

    const featuredHomes = data.filter(
      (property) =>
        property.listing_category === "featured_home"
    );

    setHouses(featuredHomes);
  };

  loadProperties();
}, []);

  const handleViewDetails = (id) => {
    navigate(`/viewHomes/${id}`); 
  };

  return (
    <section className="available-houses">
      <div className="container">
        <h2 className="section-title">Featured Homes</h2>
        <div className="houses-grid">
          {houses.slice(0, 3).map((house) => (
            <PropertyCard
              key={house.id}
              property={house}
              onViewDetails={handleViewDetails}
              className="featured-home-card"
            />
          ))}
        </div>
        <div className="btn-container">
          <button onClick={()=> navigate('/viewHomes')}>View More Houses <FaLongArrowAltRight id='right-arrow' /></button>
        </div>
      </div>
    </section>
  );
};

export default AvailableHouses;
