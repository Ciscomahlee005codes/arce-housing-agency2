import React from 'react'
import AgentSideBar from '../../AgentDashboard/AgentSideBar/AgentSideBar'
import AgentProfileSettings from '../../AgentDashboard/AgentProfileSettings/AgentProfileSettings'
import "./AgentProfilePage.css"

const AgentProfilePage = () => {
  return (
    <div className='profilePage-layout'>
      <AgentSideBar />
      <div className="profilePage-content">
        <AgentProfileSettings />
      </div>
    </div>
  )
}

export default AgentProfilePage
