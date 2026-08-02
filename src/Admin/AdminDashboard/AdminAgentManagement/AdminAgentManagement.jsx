import React, { useState } from "react";
import { FaBan, FaUndo, FaCheckCircle, FaUserShield } from "react-icons/fa";
import "./AdminAgentManagement.css";

const dummyAgents = [
  { id: 1, name: "Alex Johnson", role: "Agent", properties: 12, status: "Active" },
  { id: 2, name: "Grace Williams", role: "Campus Agent", properties: 5, status: "Blocked" },
  { id: 3, name: "Daniel Smith", role: "Landlord", properties: 20, status: "Pending" },
  { id: 4, name: "Sophia Brown", role: "Agent", properties: 7, status: "Active" },
];

const AdminAgentManagement = () => {
  const [agents, setAgents] = useState(dummyAgents);
  const [filter, setFilter] = useState("All");

  const filteredAgents =
    filter === "All"
      ? agents
      : agents.filter((agent) => agent.role === filter);

  const handleBlock = (id) => {
    setAgents(
      agents.map((agent) =>
        agent.id === id ? { ...agent, status: "Blocked" } : agent
      )
    );
  };

  const handleUnblock = (id) => {
    setAgents(
      agents.map((agent) =>
        agent.id === id ? { ...agent, status: "Active" } : agent
      )
    );
  };

  const handleApprove = (id) => {
    setAgents(
      agents.map((agent) =>
        agent.id === id ? { ...agent, status: "Active" } : agent
      )
    );
  };

  const handleReset = (id) => {
    alert(`Reset credentials for Agent ID: ${id}`);
  };

  return (
    <div className="agent-management">
      <h2>Agent Management</h2>

      {/* Filter Buttons */}
      <div className="filter-buttons">
        {["All", "Agent", "Campus Agent", "Landlord"].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={filter === type ? "active" : ""}
          >
            {type}s
          </button>
        ))}
      </div>

      {/* Table */}
      <table className="agent-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Role</th>
            <th>Properties</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredAgents.map((agent) => (
            <tr key={agent.id} className={agent.status.toLowerCase()}>
              <td>{agent.id}</td>
              <td>{agent.name}</td>
              <td>{agent.role}</td>
              <td>{agent.properties}</td>
              <td>{agent.status}</td>
              <td className="actions">
                {agent.status === "Active" && (
                  <button
                    onClick={() => handleBlock(agent.id)}
                    className="btn block"
                  >
                    <FaBan /> Block
                  </button>
                )}
                {agent.status === "Blocked" && (
                  <button
                    onClick={() => handleUnblock(agent.id)}
                    className="btn unblock"
                  >
                    <FaUndo /> Unblock
                  </button>
                )}
                {agent.status === "Pending" && (
                  <button
                    onClick={() => handleApprove(agent.id)}
                    className="btn approve"
                  >
                    <FaCheckCircle /> Approve
                  </button>
                )}
                <button
                  onClick={() => handleReset(agent.id)}
                  className="btn reset"
                >
                  <FaUserShield /> Reset
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminAgentManagement;
