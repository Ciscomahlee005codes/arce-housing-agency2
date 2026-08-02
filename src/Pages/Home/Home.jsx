import React from 'react'
import { useState } from 'react'
import Hero from '../../Components/Hero/Hero'
import AvailableHouses from '../../Components/AvailableHouses/AvailableHouses'
import Search from '../../Components/Search/Search'
import Lodges from '../../Components/Lodges/Lodges'
import FAQ from '../../Components/FAQ/FAQ'
import Testimonial from '../../Components/Testimonial/Testimonial'
import CustomerService from '../../Components/CustomerService/CustomerService'
import customerServiceImg from '../../assets/customer-service.png'
import './Home.css'
import Objectives from '../../Components/Objectives/Objectives'


const Home = () => {
  const [showHelp, setShowHelp] = useState(false);
  return (
    <div><br />
      <Search />
      <Hero />
      <Objectives />
      <AvailableHouses />
      <Lodges />
      <FAQ isStandalone={false} />
      <Testimonial isStandalone={false}/>
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

export default Home
