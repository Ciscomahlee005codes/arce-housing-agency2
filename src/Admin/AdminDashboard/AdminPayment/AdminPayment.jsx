import React, { useState } from "react"
import "./AdminPayment.css"

const dummyTransactions = [
  { id: 1, agent: "Agent John", amount: 50000, type: "Commission", status: "Paid", date: "2025-09-01" },
  { id: 2, agent: "Agent Ada", amount: 30000, type: "Subscription", status: "Pending", date: "2025-09-02" },
  { id: 3, agent: "Agent Mike", amount: 70000, type: "Commission", status: "Failed", date: "2025-09-03" },
]

const dummyPlans = [
  { id: 1, name: "Basic", price: "₦5,000", duration: "1 Month", features: "Up to 5 listings" },
  { id: 2, name: "Pro", price: "₦15,000", duration: "3 Months", features: "Up to 20 listings" },
  { id: 3, name: "Premium", price: "₦50,000", duration: "12 Months", features: "Unlimited listings" },
]

const AdminPayment = () => {
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="payments-container">
      <h2>Payments & Revenue</h2>

      {/* Revenue Overview */}
      <div className="revenue-cards">
        <div className="card">Total Revenue: ₦150,000</div>
        <div className="card">Agent Commissions: ₦120,000</div>
        <div className="card">Pending Payments: ₦30,000</div>
        <div className="card">Failed Payments: ₦10,000</div>
      </div>

      {/* Subscription Plans */}
      <div className="plans-section">
        <h3>Subscription Plans</h3>
        <button onClick={() => setShowModal(true)}>+ Add Plan</button>
        <table>
          <thead>
            <tr>
              <th>Plan</th>
              <th>Price</th>
              <th>Duration</th>
              <th>Features</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dummyPlans.map(plan => (
              <tr key={plan.id}>
                <td>{plan.name}</td>
                <td>{plan.price}</td>
                <td>{plan.duration}</td>
                <td>{plan.features}</td>
                <td>
                  <button>Edit</button>
                  <button className="danger">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Transactions Table */}
      <div className="transactions-section">
        <h3>Transactions</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Agent/User</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dummyTransactions.map(tx => (
              <tr key={tx.id}>
                <td>{tx.id}</td>
                <td>{tx.agent}</td>
                <td>₦{tx.amount.toLocaleString()}</td>
                <td>{tx.type}</td>
                <td className={`status ${tx.status.toLowerCase()}`}>{tx.status}</td>
                <td>{tx.date}</td>
                <td>
                  <button>View</button>
                  {tx.status === "Pending" && <button className="approve">Approve</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add New Plan</h3>
            <form>
              <input type="text" placeholder="Plan Name" required />
              <input type="text" placeholder="Price (₦)" required />
              <input type="text" placeholder="Duration (e.g. 3 Months)" required />
              <textarea placeholder="Features" required></textarea>
              <button type="submit">Save</button>
              <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPayment
