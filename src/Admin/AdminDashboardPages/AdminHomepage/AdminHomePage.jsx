import React from 'react'
import "./AdminHomePage.css"
import AdminSidebar from '../../AdminDashboard/AdminSidebar/AdminSidebar'
import AdminTopbar from '../../AdminDashboard/AdminTopbar/AdminTopbar'
import AdminDashboardOverview from '../../AdminDashboard/AdminDashboardOverview/AdminDashboardOverview'

const AdminHomePage = () => {
  return (
    <div className='dashboard-layout'>
      <AdminSidebar />
      <div className="dashboard-content">
        <AdminTopbar />
        <AdminDashboardOverview />
      </div>
    </div>
  )
}

export default AdminHomePage
