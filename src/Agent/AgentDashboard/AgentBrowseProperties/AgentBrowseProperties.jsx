import React from 'react'
import { house_List } from '../../../../house_List'
import './AgentBrowseProperties.css'
import { Swiper as ListingSwiper, SwiperSlide } from 'swiper/react'
import { Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'

const AgentBrowseProperties = () => {
  return (
    <div className="property-container2">
      <div className="property-header2">
        <h2>Available Properties</h2>
        <p>Browse through all listed houses and apartments for rent.</p>
      </div>

      <ListingSwiper
        className="home-swiper-wrapper"
        modules={[Pagination, Autoplay]}
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
        {house_List.map((house) => (
          <SwiperSlide key={house.id}>
            <div className="house-card">
              <img src={house.image} alt={house.name} className="house-image" />
              <div className="house-info">
                <h3 className="house-name">{house.name}</h3>
                <p><strong>State:</strong> {house.state}</p>
                <p><strong>Location:</strong> {house.location}</p>
                <button className="view-btn">View Details</button>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </ListingSwiper>

      <div className="button-container">
        <button className="add-btn">+ Add Property</button>
      </div>
    </div>
  )
}

export default AgentBrowseProperties
