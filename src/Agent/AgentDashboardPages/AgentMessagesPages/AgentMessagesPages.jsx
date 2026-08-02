import React from 'react'
import AgentSideBar from '../../AgentDashboard/AgentSideBar/AgentSideBar'
import AgentMessages from '../../AgentDashboard/AgentMessages/AgentMessages'
import "./AgentMessagesPages.css"

const AgentMessagesPages = () => {
  return (
    <div className='msg-layout '>
      <AgentSideBar />
      <div className="msg-content">
        <AgentMessages />
      </div>
    </div>
  )
}

export default AgentMessagesPages
