import React from 'react'
import "./AdminAgentPage.css"
import AdminSidebar from '../../AdminDashboard/AdminSidebar/AdminSidebar'
import AdminAgentManagement from '../../AdminDashboard/AdminAgentManagement/AdminAgentManagement'

const AdminAgentPage = () => {
  return (
    <div className='admin-layout'>
      <AdminSidebar />
      <div className="admin-content">
        <AdminAgentManagement />
      </div>
    </div>
  )
}

export default AdminAgentPage
