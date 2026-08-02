import React, { useState } from "react";
import "./AgentRequest.css";

const requestData = [
  {
    address: "15 Banana Island Road, Ikoyi",
    date: "June 30, 2025",
    status: "Completed",
    file: "LeaseAgreement.pdf",
  },
  {
    address: "22 Admiralty Way, Lekki Phase 1",
    date: "July 1, 2025",
    status: "Pending",
    file: "PaymentReceipt.png",
  },
  {
    address: "10 GRA Phase 2, Port Harcourt",
    date: "June 25, 2025",
    status: "Completed",
    file: "InspectionReport.docx",
  },
  {
    address: "5 Independence Layout, Enugu",
    date: "July 3, 2025",
    status: "Pending",
    file: "RenovationPlan.pdf",
  },
  {
    address: "11 Hamilton Layout, Awka",
    date: "May 3, 2025",
    status: "Completed",
    file: "RenovationPlan.pdf",
  },
  {
    address: "No. 8 Amaechi Street Abakpa Nike",
    date: "May 3, 2025",
    status: "Completed",
    file: "Renovation.pdf",
  },
];

const AgentRequest = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRequests = requestData.filter(
    (req) =>
      req.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.file.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="request">
      <div className="request-container">
        <h2>Requests</h2>

        <input
          type="text"
          placeholder="Search by address or file..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="request-bar"
        />

        {/* Desktop Table View */}
        <table className="request-table desktop-view">
          <thead>
            <tr>
              <th>Address</th>
              <th>Date</th>
              <th>Status</th>
              <th>File</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.length > 0 ? (
              filteredRequests.map((req, index) => (
                <tr key={index} className="request-row">
                  <td>{req.address}</td>
                  <td>{req.date}</td>
                  <td>
                    <span className={`status ${req.status === "Completed" ? "completed" : "pending"}`}>
                      {req.status}
                    </span>
                  </td>
                  <td>{req.file}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="no-results">No requests match your search.</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Mobile View */}
        <div className="mobile-view">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((req, index) => (
              <div key={index} className="mobile-request-card">
                <p><strong>Address:</strong> {req.address}</p>
                <p><strong>Date:</strong> {req.date}</p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className={`status ${req.status === "Completed" ? "completed" : "pending"}`}>
                    {req.status}
                  </span>
                </p>
                <p><strong>File:</strong> {req.file}</p>
              </div>
            ))
          ) : (
            <p className="no-results">No requests match your search.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentRequest;