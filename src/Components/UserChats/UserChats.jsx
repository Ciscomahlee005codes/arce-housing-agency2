// src/pages/UserChats.jsx

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { UserAuth } from "../../context/AuthContext";
import { IoArrowBack } from "react-icons/io5";
import { FiSearch, FiSend, FiMoreVertical, FiAlertCircle } from "react-icons/fi";
import "./UserChats.css";

const UserChats = () => {
  const { user } = UserAuth();
  const location = useLocation();

  const [agents, setAgents] = useState([]);
  const [conversations, setConversations] = useState([]); // one row per agent this user has chatted with
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [search, setSearch] = useState("");

  const [selectedAgent, setSelectedAgent] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [sending, setSending] = useState(false);
  const [chatError, setChatError] = useState("");

  const bottomRef = useRef(null);
  const messagesChannelRef = useRef(null);

  const preselectedAgentId = location.state?.agentId;

  // ── Load agents + this user's existing conversations ──────────────────────
  useEffect(() => {
    const fetchAgents = async () => {
      setLoadingAgents(true);

      const { data: agentRows, error: agentErr } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, agency_name")
        .eq("role", "agent");

      if (agentErr) {
        console.error(agentErr);
      } else {
        setAgents(agentRows || []);
      }

      if (user) {
        const { data: convoRows, error: convoErr } = await supabase
          .from("conversations")
          .select("*")
          .eq("user_id", user.id);

        if (!convoErr) setConversations(convoRows || []);
      }

      setLoadingAgents(false);
    };

    fetchAgents();
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectAgent = useCallback(async (agent) => {
    if (!user || !agent?.id) return;
    setSelectedAgent(agent);
    setLoadingMessages(true);
    setMessages([]);
    setChatError("");

    const { data: existingConvo, error: existingConvoErr } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", user.id)
      .eq("agent_id", agent.id)
      .maybeSingle();

    if (existingConvoErr) {
      console.error(existingConvoErr);
      setChatError(`Couldn't load this conversation: ${existingConvoErr.message}`);
      setLoadingMessages(false);
      return;
    }

    let convo = existingConvo;

    if (!convo) {
      const { data: created, error: createErr } = await supabase
        .from("conversations")
        .insert({ user_id: user.id, agent_id: agent.id })
        .select()
        .single();

      if (createErr) {
        console.error(createErr);
        setChatError(`Couldn't start this conversation: ${createErr.message}`);
        setLoadingMessages(false);
        return;
      }
      convo = created;
      setConversations((prev) => (prev.some((item) => item.id === created.id) ? prev : [...prev, created]));
    } else {
      setConversations((prev) => (prev.some((item) => item.id === existingConvo.id) ? prev : [...prev, existingConvo]));
    }

    setConversationId(convo.id);

    const { data: msgRows, error: msgErr } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", convo.id)
      .order("created_at", { ascending: true });

    if (msgErr) {
      console.error(msgErr);
      setChatError(`Couldn't load messages: ${msgErr.message}`);
    } else {
      setMessages(msgRows || []);
    }
    setLoadingMessages(false);

    await supabase
      .from("messages")
      .update({ read: true })
      .eq("conversation_id", convo.id)
      .eq("sender_id", agent.id)
      .eq("read", false);
  }, [user]);

  useEffect(() => {
    if (!user || !preselectedAgentId || !agents.length) return;
    if (selectedAgent?.id === preselectedAgentId) return;

    const preferredAgent = agents.find((agent) => agent.id === preselectedAgentId);
    if (!preferredAgent) return;

    handleSelectAgent(preferredAgent);
  }, [user, preselectedAgentId, agents, selectedAgent?.id, handleSelectAgent]);

  const handleBack = () => {
    setSelectedAgent(null);
    setConversationId(null);
    setMessages([]);
    setChatError("");
  };

  // ── Realtime: catch replies from the agent while this thread is open ──────
  useEffect(() => {
    if (messagesChannelRef.current) {
      supabase.removeChannel(messagesChannelRef.current);
      messagesChannelRef.current = null;
    }
    if (!conversationId) return;

    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          // Own messages are already appended optimistically on send — only
          // append here if it came from the other side (the agent).
          if (payload.new.sender_id === user?.id) return;
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    messagesChannelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      messagesChannelRef.current = null;
    };
  }, [conversationId, user]);

  // ── Send a message ──────────────────────────────────────────────────────────
  const handleSendMessage = async () => {
    const text = chatInput.trim();
    if (!text || !selectedAgent || !conversationId || sending) return;

    setSending(true);
    setChatError("");
    setChatInput("");

    const { data: inserted, error } = await supabase
      .from("messages")
      .insert({ conversation_id: conversationId, sender_id: user.id, text })
      .select()
      .single();

    setSending(false);

    if (error) {
      console.error(error);
      setChatError(error.message || "Message failed to send.");
      setChatInput(text); // give the message back so nothing is lost
      return;
    }

    setMessages((prev) => [...prev, inserted]);

    // Keep the sidebar preview current for this conversation.
    const now = new Date().toISOString();
    await supabase
      .from("conversations")
      .update({ last_message: text, last_message_at: now })
      .eq("id", conversationId);

    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, last_message: text, last_message_at: now } : c))
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSendMessage();
  };

  const convoFor = (agentId) => conversations.find((c) => c.agent_id === agentId);

  const filteredAgents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return agents;
    return agents.filter(
      (a) =>
        a.full_name?.toLowerCase().includes(q) ||
        a.agency_name?.toLowerCase().includes(q)
    );
  }, [agents, search]);

  const formatPreviewTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const isToday = d.toDateString() === new Date().toDateString();
    return isToday
      ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <>
      <div className="chat-wrapper">
        {/* LEFT SIDEBAR */}
        <div className={`chat-list-section ${selectedAgent ? "hide-on-mobile" : ""}`}>
          <div className="chat-sidebar-header">
            <h2>Messages</h2>
            <p className="chat-sidebar-subtitle">
              {loadingAgents ? "Loading…" : `${agents.length} Agents · Online`}
            </p>

            <div className="chat-search">
              <FiSearch />
              <input
                type="text"
                placeholder="Search agents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="chat-list">
            {loadingAgents ? (
              <p className="chat-list-empty">Loading agents…</p>
            ) : filteredAgents.length === 0 ? (
              <p className="chat-list-empty">No agents found.</p>
            ) : (
              filteredAgents.map((agent) => {
                const convo = convoFor(agent.id);
                const initials = agent.full_name
                  ? agent.full_name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
                  : "AG";
                return (
                  <div
                    key={agent.id}
                    className={`chat-item ${selectedAgent?.id === agent.id ? "active" : ""}`}
                    onClick={() => handleSelectAgent(agent)}
                  >
                    <div className="avatar-wrapper">
                      {agent.avatar_url ? (
                        <img src={agent.avatar_url} alt={agent.full_name} className="chat-avatar" />
                      ) : (
                        <div className="chat-avatar chat-avatar-fallback">{initials}</div>
                      )}
                      <span className="online-dot"></span>
                    </div>

                    <div className="chat-info">
                      <h4>{agent.full_name || "Agent"}</h4>
                      <p>{convo?.last_message || agent.agency_name || "Tap to start chatting"}</p>
                    </div>

                    <div className="chat-meta">
                      <span>{formatPreviewTime(convo?.last_message_at)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* CHAT WINDOW */}
        <div className={`chat-window ${selectedAgent ? "active" : ""}`}>
          {selectedAgent ? (
            <>
              {/* HEADER */}
              <div className="chat-window-header">
                <div className="header-left">
                  <IoArrowBack className="back-btn" onClick={handleBack} />

                  {selectedAgent.avatar_url ? (
                    <img src={selectedAgent.avatar_url} alt={selectedAgent.full_name} className="chat-avatar" />
                  ) : (
                    <div className="chat-avatar chat-avatar-fallback">
                      {(selectedAgent.full_name || "AG").split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
                    </div>
                  )}

                  <div>
                    <h4>{selectedAgent.full_name || "Agent"}</h4>
                    <p>{selectedAgent.agency_name || "Online"}</p>
                  </div>
                </div>

                <FiMoreVertical className="header-menu" />
              </div>

              {/* MESSAGES */}
              <div className="chat-messages">
                {loadingMessages ? (
                  <p className="chat-list-empty">Loading messages…</p>
                ) : messages.length === 0 ? (
                  <p className="chat-list-empty">
                    Say hello to {selectedAgent.full_name?.split(" ")[0] || "your agent"} to get started.
                  </p>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`chat-message ${message.sender_id === user?.id ? "user" : "agent"}`}
                    >
                      <span>{message.text}</span>
                      <small>
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </small>
                    </div>
                  ))
                )}
                <div ref={bottomRef} />
              </div>

              {/* ERROR BANNER — shows the real Supabase error instead of failing silently */}
              {chatError && (
                <div className="chat-error-banner">
                  <FiAlertCircle size={14} />
                  {chatError}
                </div>
              )}

              {/* INPUT */}
              <div className="chat-input">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />

                <button onClick={handleSendMessage} disabled={sending || !chatInput.trim()} aria-label="Send message">
                  <FiSend />
                </button>
              </div>
            </>
          ) : (
            <div className="empty-chat">
              <div>
                <span className="empty-chat-glyph" aria-hidden="true">·</span>
                <h2>Messages</h2>
                <p>Select an agent from the left panel to start chatting.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UserChats;