import React from 'react'

import "./AgentNotificationPage.css"
import AgentSideBar from '../../AgentDashboard/AgentSideBar/AgentSideBar'
import AgentNotification from '../../AgentDashboard/AgentNotification/AgentNotification'

const AgentNotificationPage = () => {
  return (
    <div className='notification-layout'>
      <AgentSideBar />
      <div className="notification-content">
        <AgentNotification />
      </div>
    </div>
  )
}

export default AgentNotificationPage
