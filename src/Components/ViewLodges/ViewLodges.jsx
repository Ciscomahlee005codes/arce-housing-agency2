// ViewLodges.jsx
import React, { useState, useEffect } from "react";
import { fetchApprovedProperties } from "../../lib/fetchProperties";
import { Swiper as ListingSwiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { useNavigate } from "react-router-dom";
import PropertyCard from "../PropertyCard/PropertyCard";
import PropertyCardSkeleton from "../PropertyCard/PropertyCardSkeleton";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./ViewLodges.css";

const ViewLodges = () => {
  const navigate = useNavigate();

  const [filter, setFilter] = useState("lodges");
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProperties = async () => {
      try {
        setLoading(true);
        const data = await fetchApprovedProperties();

        const studentProperties = data.filter(
          (property) => property.listing_category === "featured_student"
        );

        setProperties(studentProperties);
      } catch (error) {
        console.error("Error loading properties:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, []);

  const houses = properties.filter((property) => {
    switch (filter) {
      case "lodges":
        return property.type === "Lodge";

      case "shared":
        return property.type === "Shared Apartment";

      case "hostels":
        return property.type === "Hostel";

      default:
        return false;
    }
  });

  const handleViewDetails = (id) => {
    let path = "#";

    switch (filter) {
      case "lodges":
        path = `/lodge/${id}`;
        break;

      case "shared":
        path = `/sharedroom/${id}`;
        break;

      case "hostels":
        path = `/hostel/${id}`;
        break;

      default:
        break;
    }

    navigate(path);
  };

  return (
    <section className="home-view">
      <div className="container">
        <div className="lodge-header">
          <h1 className="lodge-title">
            {filter === "lodges"
              ? "Lodges For Students"
              : filter === "shared"
              ? "Shared Apartments"
              : "Hostels For Students"}
          </h1><br />

          <div className="filter-buttons">
            <button
              className={filter === "lodges" ? "active" : ""}
              onClick={() => setFilter("lodges")}
            >
              Lodges
            </button>

            <button
              className={filter === "shared" ? "active" : ""}
              onClick={() => setFilter("shared")}
            >
              Roommates
            </button>

            <button
              className={filter === "hostels" ? "active" : ""}
              onClick={() => setFilter("hostels")}
            >
              Hostels
            </button>
          </div>
        </div>

        {loading ? (

          <div className="skeleton-grid">
            {Array.from({ length: 3 }).map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>

        ) : houses.length > 0 ? (
          <ListingSwiper
            className="home-swiper-wrapper"
            modules={[Navigation, Pagination, Autoplay]}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 5000 }}
            spaceBetween={30}
            breakpoints={{
              320: { slidesPerView: 1 },
              640: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
          >
            {houses.map((house) => (
              <SwiperSlide key={house.id}>
                <PropertyCard
                  property={house}
                  onViewDetails={handleViewDetails}
                />
              </SwiperSlide>
            ))}
          </ListingSwiper>
        ) : (
          <p className="coming-soon">No listings available 🚧</p>
        )}
      </div>
    </section>
  );
};

export default ViewLodges;