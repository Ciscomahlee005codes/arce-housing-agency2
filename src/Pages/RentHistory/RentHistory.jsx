import React, { useState } from 'react'
import RentalHistory from '../../Components/RentalHistory/RentalHistory'
import CustomerService from '../../Components/CustomerService/CustomerService'
import customerServiceImg from '../../assets/customer-service.png'

const RentHistory = () => {
  const [showHelp, setShowHelp] = useState(false);
  return (
    <div>
      <RentalHistory />
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

export default RentHistory
