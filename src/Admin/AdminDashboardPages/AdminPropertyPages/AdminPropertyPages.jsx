import React from 'react'
import "./AdminPropertyPages.css"
import AdminProperties from '../../AdminDashboard/AdminProperties/AdminProperties'
import AdminSidebar from "../../AdminDashboard/AdminSidebar/AdminSidebar"

const AdminPropertyPages = () => {
  return (
    <div className='propertyPage-layout'>
        <AdminSidebar />
      <div className="propertyPage-content">
        <AdminProperties />
      </div>
    </div>
  )
}

export default AdminPropertyPages
