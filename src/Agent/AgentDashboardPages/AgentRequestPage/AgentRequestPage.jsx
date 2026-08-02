import React from 'react'

import "./AgentRequestPage.css"
import AgentSideBar from '../../AgentDashboard/AgentSideBar/AgentSideBar'
import AgentRequest2 from '../../AgentDashboard/AgentRequest2/AgentRequest2'

const AgentRequestPage = () => {
  return (
    <div className='request-layout'>
      <AgentSideBar />
      <div className="request-content">
        <AgentRequest2 />
      </div>
    </div>
  )
}

export default AgentRequestPage
