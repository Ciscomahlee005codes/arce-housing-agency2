import React from 'react'
import AdminReports from '../../AdminDashboard/AdminReports/AdminReports'
import AdminSidebar from '../../AdminDashboard/AdminSidebar/AdminSidebar'
import './AdminReportPages.css'

const AdminReportPages = () => {
  return (
    <div className='adminReport-layout'>
        <AdminSidebar />
      <div className="adminReport-content">
        <AdminReports />
      </div>
    </div>
  )
}

export default AdminReportPages
