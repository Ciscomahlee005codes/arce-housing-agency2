import React from 'react'
import AdminUserManagement from '../../AdminDashboard/AdminUserManagement/AdminUserManagement'
import AdminSidebar from '../../AdminDashboard/AdminSidebar/AdminSidebar'
import "./AdminUserPage.css"

const AdminUserPage = () => {
  return (
    <div className='aUser-layout '>
        <AdminSidebar />
        <div className="aUser-content">        
        <AdminUserManagement />
        </div> 
    </div>
  )
}

export default AdminUserPage
