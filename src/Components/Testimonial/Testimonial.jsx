import React, { useState, useEffect, useRef } from "react";
import './Testimonial.css'
import {
  FaChevronLeft,
  FaChevronRight,
  FaQuoteLeft,
  FaQuoteRight,
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
} from "react-icons/fa";

const Testimonial = ( { isStandalone } ) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const timerRef = useRef(null);
  const totalSlides = 5;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      nextSlide();
    }, 4500);
    return () => clearTimeout(timerRef.current);
  }, [currentSlide]);

  const testimonials = [
    {
      name: "Okwuibe Chinedu",
      text: "I was tired of paying agents who showed me nothing but stress. ARCE helped me find a verified apartment within 3 days — no hassle, no drama. The inspection part gave me real peace of mind.",
      stars: 4.5,
      image: "./src/assets/customer-3.jpg"
    },
    {
      name: "Emmanuel John",
      text: "At first, I thought it was too good to be true. But after using ARCE, I can proudly say it's the real deal. Transparent process, fair pricing, and the landlord I got was respectful and professional.",
      stars: 5,
       image: "./src/assets/customer-1.jpg"
    },
    {
      name: "Sarah Umeh",
      text: "As a student, I needed a short-term place that wasn’t overpriced or sketchy. ARCE gave me options I could trust, and now I recommend it to everyone in my hostel. The review system is such a smart idea too!",
      stars: 3.5,
       image: "./src/assets/customer-2.jpg"
    },
    {
      name: "Obafemi Bolawatife",
      text: "I’ve had bad experiences with agents and fake listings before, but ARCE came through. Their inspection system is a game-changer. I finally got an apartment that matched the pictures — no catfish!",
      stars: 4.5,
       image: "./src/assets/customer-4.jpg"
    },
    {
      name: "Ifemelu Obinze",
      text: "I love how professional the whole process felt. From the listings to the communication and even payment — ARCE felt like using Airbnb but for long-term rentals. Smooth and trustworthy.",
      stars: 5,
       image: "./src/assets/customer-5.jpg"
    },
  ];

  return (
    <section className={`testimonial-section ${isStandalone ? "standalone" : ""}`} id="Testimonials">
      <div className="testimonial-wrap">
        <h1 className="over-head">What Our Tenants are Saying...</h1><br />
        
        <span className="arrow left" onClick={prevSlide}><FaChevronLeft /></span>
        <span className="arrow right" onClick={nextSlide}><FaChevronRight /></span>

        <ul className="dots" id="testim-dots">
          {testimonials.map((_, index) => (
            <li
              key={index}
              className={`dot ${currentSlide === index ? "active" : ""}`}
              onClick={() => goToSlide(index)}
            ></li>
          ))}
        </ul>

        <div className="content-test" id="testim-content">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={
                currentSlide === index
                  ? "active"
                  : index === (currentSlide - 1 + totalSlides) % totalSlides
                  ? "inactive"
                  : ""
              }
            >
              <div className="test-img">
               <img src={testimonial.image} alt={testimonial.name} className="customer-pics" />
              </div>
              <h2 className="customer-name">{testimonial.name}</h2>
              <p className="test-text">
                <FaQuoteLeft style={{ marginRight: 5 }} />
                {testimonial.text}
                <FaQuoteRight style={{ marginLeft: 5 }} />
              </p><br />
              <div className="star-box">
                {Array.from({ length: 5 }).map((_, i) => {
                  const rating = testimonial.stars;
                  return (
                    <span key={i}>
                      {rating >= i + 1 ? (
                        <FaStar style={{color: 'goldenrod'}}/>
                      ) : rating >= i + 0.5 ? (
                        <FaStarHalfAlt style={{color: 'goldenrod'}} />
                      ) : (
                        <FaRegStar style={{color: 'goldenrod'}} />
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonial;
