import React, { useState } from 'react'
import AboutPage from '../../Components/AboutPage/AboutPage'
import CustomerService from '../../Components/CustomerService/CustomerService'
import customerServiceImg from '../../assets/customer-service.png'
import "./About.css"

const About = () => {
   const [showHelp, setShowHelp] = useState(false);
  return (
    <div>
      <AboutPage />
       <img
        onClick={() => setShowHelp(true)}
          src={customerServiceImg}
          alt="Customer Service"
          className="customer-service-btn"
        />
         {showHelp && <CustomerService onClose={() => setShowHelp(false)} />}
    </div>
  )
}

export default About
