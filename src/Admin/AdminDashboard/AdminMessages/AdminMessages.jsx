import React, { useState, useEffect, useRef } from "react";
import "./AdminMessages.css";

const AdminMessages = () => {
  const contacts = [
    { id: 1, name: "Tony Adams", role: "Agent" },
    { id: 2, name: "Sarah Bello", role: "Landlord" },
    { id: 3, name: "Mike Daniels", role: "Tenant" },
    { id: 4, name: "Jane Nwosu", role: "Agent" },
    { id: 5, name: "John Smith", role: "Tenant" },
    { id: 6, name: "Aisha Kareem", role: "Admin" },
    { id: 7, name: "Kelvin Brooks", role: "Landlord" },
    { id: 8, name: "Grace Okon", role: "Tenant" },
    { id: 9, name: "David Obi", role: "Agent" },
    { id: 10, name: "Sophia James", role: "Admin" },
  ];

  const [selectedUser, setSelectedUser] = useState(contacts[0]);
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState([]);
  const chatEndRef = useRef(null);

  const handleSend = () => {
    if (!message.trim()) return;

    const newMessage = {
      sender: "Admin",
      text: message,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChats([...chats, newMessage]);
    setMessage("");

    // simulate reply
    setTimeout(() => {
      setChats((prev) => [
        ...prev,
        {
          sender: selectedUser.name,
          text: `Got your message, Admin 👋`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }, 1000);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  return (
    <div className="admin-chat-container">
      <div className="chat-sidebar">
        <h3>Contacts</h3>
        <ul>
          {contacts.map((user) => (
            <li
              key={user.id}
              className={selectedUser.id === user.id ? "active" : ""}
              onClick={() => setSelectedUser(user)}
            >
              <div className="avatar">{user.name.charAt(0)}</div>
              <div className="contact-info">
                <span className="contact-name">{user.name}</span>
                <span className="contact-role">{user.role}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="chat-section">
        <div className="chat-header">
          <div className="chat-user">
            <div className="avatar big">{selectedUser.name.charAt(0)}</div>
            <div>
              <h4>{selectedUser.name}</h4>
              <p>{selectedUser.role} • Online</p>
            </div>
          </div>
        </div>

        <div className="chat-body">
          {chats.length === 0 ? (
            <p className="empty-chat">
              Start a conversation with {selectedUser.name} ({selectedUser.role})...
            </p>
          ) : (
            chats.map((msg, index) => (
              <div
                key={index}
                className={`chat-bubble ${
                  msg.sender === "Admin" ? "sent" : "received"
                }`}
              >
                <p>{msg.text}</p>
                <span>{msg.time}</span>
              </div>
            ))
          )}
          <div ref={chatEndRef}></div>
        </div>

        <div className="chat-footer">
          <input
            type="text"
            placeholder={`Message ${selectedUser.name}...`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button onClick={handleSend}>➤</button>
        </div>
      </div>
    </div>
  );
};

export default AdminMessages;
