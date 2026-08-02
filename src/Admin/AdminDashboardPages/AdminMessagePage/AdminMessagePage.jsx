import React from 'react'
import AdminSidebar from '../../AdminDashboard/AdminSidebar/AdminSidebar'
import AdminMessages from '../../AdminDashboard/AdminMessages/AdminMessages'
import "./AdminMessagePage.css"

const AdminMessagePage = () => {
  return (
    <div className='adminMsg-layout'>
      <AdminSidebar />
      <div className="adminMsg-content">
        <AdminMessages />
      </div>
    </div>
  )
}

export default AdminMessagePage
