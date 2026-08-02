import React from "react";
import "./Objectives.css";
import Picture from "../../assets/House-7.jpg"
import { FaHome, FaHandshake, FaCheckCircle, FaUsers } from "react-icons/fa";

const Objectives = () => {
  return (
    <section className="objectives">
      <div className="obj-header">
        <h3>Making House Hunting in Naija Simple, Safe & Stress-Free</h3><br />
        <h3>Listings across major cities and schools</h3><br />
        <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Autem dolor asperiores dolorem consequuntur deleniti dolore exercitationem voluptatum illum, placeat sapiente deserunt corporis nulla, delectus doloribus, a quos labore? Facilis, minima!
        </p>
      </div>
     <img src={Picture} alt="" />
    </section>
  );
};

export default Objectives;
