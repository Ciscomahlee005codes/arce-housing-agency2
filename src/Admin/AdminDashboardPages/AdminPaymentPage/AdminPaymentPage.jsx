import React from 'react'
import './AdminPaymentPage.css'
import AdminSidebar from '../../AdminDashboard/AdminSidebar/AdminSidebar'
import AdminPayment from '../../AdminDashboard/AdminPayment/AdminPayment'

const AdminPaymentPage = () => {
  return (
    <div className='adminPayment-layout'>
      <AdminSidebar />
      <div className="adminPayment-content">
        <AdminPayment />
      </div>
    </div>
  )
}

export default AdminPaymentPage
