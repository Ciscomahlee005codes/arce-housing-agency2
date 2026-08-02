import React, { useState } from 'react'
import ContactUs from '../../Components/ContactUs/ContactUs'
import CustomerService from '../../Components/CustomerService/CustomerService'
import customerServiceImg from '../../assets/customer-service.png'
import "./Contact.css"

const Contact = () => {
  const [showHelp, setShowHelp] = useState(false);
  return (
    <div>
      <ContactUs />
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

export default Contact
