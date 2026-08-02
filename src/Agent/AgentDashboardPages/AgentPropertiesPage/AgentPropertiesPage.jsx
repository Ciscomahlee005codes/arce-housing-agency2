import React from 'react'
import "./AgentPropertiesPage.css"

import AgentSideBar from '../../AgentDashboard/AgentSideBar/AgentSideBar'
import AgentBrowseProperties from '../../AgentDashboard/AgentBrowseProperties/AgentBrowseProperties'
import AgentDashboardTop from '../../AgentDashboard/AgentDashboardTop/AgentDashboardTop'
import AgentProperties from '../../AgentDashboard/AgentProperties/AgentProperties'

const AgentPropertiesPage = () => {
  return (
    <div className='property-layout'>
      <AgentSideBar />
      <div className="property-content">
        <AgentDashboardTop />
        <AgentProperties />
      </div>
    </div>
  )
}

export default AgentPropertiesPage
