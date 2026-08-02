import React from 'react'
import "./AgentRentalTourPage.css"

import AgentSideBar from '../../AgentDashboard/AgentSideBar/AgentSideBar'
import AgentRentals from '../../AgentDashboard/AgentRentals/AgentRentals'
import AgentDashboardTop from '../../AgentDashboard/AgentDashboardTop/AgentDashboardTop'

const AgentRentalTourPage = () => {
  return (
    <div className='rental-layout'>
      <AgentSideBar />
      <div className="rental-content">
        <AgentDashboardTop />
        <AgentRentals />
      </div>
    </div>
  )
}

export default AgentRentalTourPage
