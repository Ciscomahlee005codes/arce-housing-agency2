import React from 'react'
import AdminSidebar from '../../AdminDashboard/AdminSidebar/AdminSidebar'
import "./AdminNotificationPages.css"
import AdminNotification from '../../AdminDashboard/AdminNotification/AdminNotification'

const AdminNotificationPages = () => {
  return (
    <div className='adminNotify-layout'>
      <AdminSidebar />
      <div className="adminNotify-content">
        <AdminNotification />
      </div>
    </div>
  )
}

export default AdminNotificationPages
