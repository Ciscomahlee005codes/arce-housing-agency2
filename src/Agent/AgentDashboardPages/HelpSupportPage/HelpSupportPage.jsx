import React from 'react'
import AgentSideBar from '../../AgentDashboard/AgentSideBar/AgentSideBar'
import HelpSupport from '../../AgentDashboard/HelpSupport/HelpSupport'
import "./HelpSupportPage.css"

const HelpSupportPage = () => {
  return (
    <div className='help-layout'>
      <AgentSideBar />
      <div className="help-content">
        <HelpSupport />
      </div>
    </div>
  )
}

export default HelpSupportPage
