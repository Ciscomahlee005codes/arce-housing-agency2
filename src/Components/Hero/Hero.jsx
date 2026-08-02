// Hero.jsx
import React from "react";
import "./Hero.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, EffectFade, Autoplay } from "swiper/modules";
import "swiper/css/effect-fade";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const Hero = () => {
const heroSlides = [
  {
    id: 1,
    background: "/House-4.jpg",
    title: "Find Your Next Home with",
    brand: "ARCE Housing Agency",
    desc: "No more agent wahala! Browse verified rentals that fit your pocket and your lifestyle. Peace of mind starts here.",
  },
  {
    id: 2,
    background: "/House-6.jpg",
    title: "Rent Smarter. Live Better",
    brand: "ARCE Housing Agency",
    desc: "From self-cons to family flats, ARCE makes house-finding easy, sharp sharp — no long story.",
  },
  {
    id: 3,
    background: "/House-8.jpg",
    title: "Stress-Free Renting Starts With",
    brand: "ARCE Housing Agency",
    desc: "We don clear road for you. Verified houses, affordable prices — no hidden wahala.",
  },
  {
    id: 4,
    background: "/House-12.jpg",
    title: "Your Ideal Home Is Just Around the Corner —",
    brand: "ARCE Housing Agency",
    desc: "Short stay or long lease, ARCE get you covered. Just pick, pay, and pack in with ease.",
  },
  {
    id: 5,
    background: "/House-13.jpg",
    title: "Apartments You Can Trust, From",
    brand: "ARCE Housing Agency",
    desc: "Say bye-bye to fake listings. What you see is what you get — trusted landlords, clear prices, real homes.",
  },
];



  return (
    <div className="hero-swiper">
     <Swiper
  modules={[Navigation, Pagination, EffectFade, Autoplay]}
  navigation
  pagination={{ clickable: true }}
  loop
  effect="fade"
  fadeEffect={{ crossFade: true }}
  speed={1000}
  autoplay={{
    delay: 5000, // 5 seconds between slides
    disableOnInteraction: false, // keeps autoplay even if user interacts
  }}
>
        {heroSlides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div
              className="header"
              style={{ backgroundImage: `url(${slide.background})` }}
            >
              <div className="header-container">
                <div className="header-content">
                  <h2>
                    {slide.title}{" "}
                    <span
                      style={{ fontFamily: `"Montserrat", sans-serif` }}
                    >
                      {slide.brand}
                    </span>
                  </h2>
                  <p>{slide.desc}</p>
                  {/* <button>View Houses</button> */}
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Hero;
