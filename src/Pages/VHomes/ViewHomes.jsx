import React, { useState } from 'react'
import HomeViews from '../../Components/HomeViews/HomeViews'
import ViewLodges from '../../Components/ViewLodges/ViewLodges'
import Search from '../../Components/Search/Search'
import CustomerService from '../../Components/CustomerService/CustomerService'
import customerServiceImg from '../../assets/customer-service.png'
import './ViewHomes.css'
import FindMySpace from '../../Components/FindMySpace/FindMySpace'

const ViewHomes = () => {
   const [showHelp, setShowHelp] = useState(false);

  return (
    <div className='v-container'>
      <div className="search">
        <Search />
      </div>

      <HomeViews />
      <ViewLodges />
      <div className="find-space-wrapper">
        <FindMySpace />
      </div>

      {/* Floating Customer Service Button */}
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

export default ViewHomes