import React from 'react'
import AdminSettings from '../../AdminDashboard/AdminSettings/AdminSettings'
import AdminSidebar from '../../AdminDashboard/AdminSidebar/AdminSidebar'
import "./AdminSettingsPage.css"

const AdminSettingsPage = () => {
  return (
    <div className='adminSetting-layout'>
        <AdminSidebar />
      <div className="adminSetting-content">
        <AdminSettings />
      </div>
    </div>
  )
}

export default AdminSettingsPage
