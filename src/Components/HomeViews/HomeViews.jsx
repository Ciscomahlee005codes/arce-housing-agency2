import React, { useEffect, useState } from 'react';
import { fetchApprovedProperties } from '../../lib/fetchProperties';
import { FaLongArrowAltRight } from "react-icons/fa";
import './HomeViews.css';
import PropertyCard from '../PropertyCard/PropertyCard';
import PropertyCardSkeleton from '../PropertyCard/PropertyCardSkeleton';

import { Swiper as ListingSwiper, SwiperSlide } from 'swiper/react';

import { Navigation, Pagination, Autoplay } from 'swiper/modules';

import { useNavigate } from 'react-router-dom';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const renderStars = (rating = 5) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <span key={`full-${i}`} className="star">
        &#9733;
      </span>
    );
  }

  if (hasHalfStar) {
    stars.push(
      <span key="half" className="star half">
        &#9733;
      </span>
    );
  }

  while (stars.length < 5) {
    stars.push(
      <span key={`empty-${stars.length}`} className="star empty">
        &#9733;
      </span>
    );
  }

  return stars;
};

const HomeViews = () => {
  const navigate = useNavigate();

  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const loadProperties = async () => {
      try {
        setLoading(true);
        const data = await fetchApprovedProperties();

        const featuredHomes = data.filter(
          (property) =>
            property.listing_category === "featured_home"
        );

        setHouses(featuredHomes);
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, []);

  const filteredHouses = houses.filter((house) => {
    if (filter === "all") return true;

    return house.type === filter;
  });

  const handleViewDetails = (id) => {
    navigate(`/viewHomes/${id}`);
  };

  return (
    <section className="home-view">
      <div className="container">

        <h2 className="section-title">
          Listed Homes
        </h2>

        {/* FILTERS */}

        <div className="filter-buttons">

          <button
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            All
          </button>

          <button
            className={filter === "Apartment" ? "active" : ""}
            onClick={() => setFilter("Apartment")}
          >
            Apartments
          </button>

          <button
            className={filter === "Duplex" ? "active" : ""}
            onClick={() => setFilter("Duplex")}
          >
            Duplex
          </button>

          <button
            className={filter === "Bungalow" ? "active" : ""}
            onClick={() => setFilter("Bungalow")}
          >
            Bungalow
          </button>

          <button
            className={filter === "Self Contain" ? "active" : ""}
            onClick={() => setFilter("Self Contain")}
          >
            Self Contain
          </button>

        </div>

        {loading ? (

          <div className="skeleton-grid">
            {Array.from({ length: 3 }).map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>

        ) : filteredHouses.length > 0 ? (

          <ListingSwiper
            className="home-swiper-wrapper"
            modules={[
              Navigation,
              Pagination,
              Autoplay,
            ]}
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

            {filteredHouses.map((house) => (

              <SwiperSlide key={house.id}>

                <PropertyCard
                  property={house}
                  onViewDetails={handleViewDetails}
                />

              </SwiperSlide>

            ))}

          </ListingSwiper>

        ) : (

          <p className="coming-soon">
            No properties found 🚧
          </p>

        )}

      </div>
    </section>
  );
};

export default HomeViews;