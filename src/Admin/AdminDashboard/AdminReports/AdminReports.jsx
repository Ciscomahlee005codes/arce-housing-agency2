import React from "react"
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from "recharts"
import "./AdminReports.css"

const AdminReports = () => {
  // Dummy data
  const userGrowth = [
    { name: "Mon", users: 40 },
    { name: "Tue", users: 55 },
    { name: "Wed", users: 70 },
    { name: "Thu", users: 60 },
    { name: "Fri", users: 90 },
    { name: "Sat", users: 120 },
    { name: "Sun", users: 150 },
  ]

  const propertiesData = [
    { name: "Listed", value: 400 },
    { name: "Rented", value: 250 },
  ]

  const agentActivity = [
    { status: "Active", count: 120 },
    { status: "Inactive", count: 30 },
  ]

  const fraudReports = [
    { id: 1, user: "John Doe", issue: "Fake property", date: "2025-09-01" },
    { id: 2, user: "Jane Smith", issue: "Scam payment request", date: "2025-09-03" },
  ]

  const systemPerformance = [
    { metric: "CPU Usage (%)", value: 45 },
    { metric: "Memory Usage (%)", value: 65 },
    { metric: "Uptime (days)", value: 120 },
  ]

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

  return (
    <div className="reports-container">
      <h2>Reports & Analytics</h2>

      {/* User Growth */}
      <div className="report-card">
        <h3>Daily New Users</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={userGrowth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="users" stroke="#13118a" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Properties Listed vs Rented */}
      <div className="report-card">
        <h3>Properties Listed vs Rented</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={propertiesData} dataKey="value" cx="50%" cy="50%" outerRadius={100} label>
              {propertiesData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Agent Activity */}
      <div className="report-card">
        <h3>Agent Activity</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={agentActivity}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="status" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#0b08b8" barSize={60} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Fraud Reports */}
      <div className="report-card">
        <h3>Fraud/Scam Reports</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Issue</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {fraudReports.map((report) => (
              <tr key={report.id}>
                <td>{report.id}</td>
                <td>{report.user}</td>
                <td>{report.issue}</td>
                <td>{report.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* System Performance */}
      <div className="report-card">
        <h3>System Performance</h3>
        <ul>
          {systemPerformance.map((perf, idx) => (
            <li key={idx}>
              <strong>{perf.metric}:</strong> {perf.value}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default AdminReports
