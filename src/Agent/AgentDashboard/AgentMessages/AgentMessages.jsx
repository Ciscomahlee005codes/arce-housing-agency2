import React, { useState, useRef, useEffect, useMemo } from "react";
import "./AgentMessages.css";
import { supabase } from "../../../lib/supabase";
import { UserAuth } from "../../../context/AuthContext";
import {
  FiArrowLeft, FiSend, FiSearch, FiMoreVertical,
  FiPhone, FiVideo, FiPaperclip, FiSmile, FiAlertCircle,
} from "react-icons/fi";

function capitalize(s) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatPreviewTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const isToday = d.toDateString() === new Date().toDateString();
  if (isToday) return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const diffDays = Math.round((new Date().setHours(0,0,0,0) - new Date(d).setHours(0,0,0,0)) / 86400000);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return d.toLocaleDateString(undefined, { weekday: "short" });
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// ── Avatar with online dot ────────────────────────────────────────────────────
function Avatar({ src, name, online, size = 40 }) {
  const initials = (name || "?").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  return (
    <div className="am-avatar-wrap" style={{ width: size, height: size }}>
      {src
        ? <img src={src} alt={name} className="am-avatar-img" />
        : <div className="am-avatar-fallback">{initials}</div>
      }
      {online && <span className="am-online-dot" />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function AgentMessages() {
  const { user } = UserAuth();

  const [conversations, setConversations] = useState([]); // merged convo + tenant profile + unread + preview
  const [loadingList,   setLoadingList]    = useState(true);
  const [selected,      setSelected]       = useState(null); // the merged conversation object
  const [messages,      setMessages]       = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [input,         setInput]          = useState("");
  const [search,        setSearch]         = useState("");
  const [mobileView,    setMobileView]     = useState("list"); // "list" | "chat"
  const [sending,       setSending]        = useState(false);
  const [chatError,     setChatError]      = useState("");

  const bottomRef   = useRef(null);
  const inputRef     = useRef(null);
  const selectedRef  = useRef(null);
  const convoIdsRef  = useRef(new Set());
  const globalChannelRef = useRef(null);

  useEffect(() => { selectedRef.current = selected; }, [selected]);

  // ── Load this agent's conversations + tenant profiles + unread counts ─────
  useEffect(() => {
    const loadConversations = async () => {
      if (!user) return;
      setLoadingList(true);

      const { data: convoRows, error: convoErr } = await supabase
        .from("conversations")
        .select("*")
        .eq("agent_id", user.id)
        .order("last_message_at", { ascending: false, nullsFirst: false });

      if (convoErr) {
        console.error(convoErr);
        setLoadingList(false);
        return;
      }

      const rows = convoRows || [];
      const userIds = [...new Set(rows.map((c) => c.user_id))];

      let profileMap = {};
      if (userIds.length > 0) {
        const { data: profiles, error: profErr } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, role")
          .in("id", userIds);
        if (!profErr) {
          profileMap = Object.fromEntries((profiles || []).map((p) => [p.id, p]));
        }
      }

      let unreadMap = {};
      const convoIds = rows.map((c) => c.id);
      if (convoIds.length > 0) {
        const { data: unreadRows } = await supabase
          .from("messages")
          .select("conversation_id")
          .eq("read", false)
          .neq("sender_id", user.id)
          .in("conversation_id", convoIds);
        (unreadRows || []).forEach((m) => {
          unreadMap[m.conversation_id] = (unreadMap[m.conversation_id] || 0) + 1;
        });
      }

      const merged = rows.map((c) => {
        const profile = profileMap[c.user_id] || {};
        return {
          id: c.id,
          user_id: c.user_id,
          name: profile.full_name || "Tenant",
          avatar: profile.avatar_url || null,
          role: capitalize(profile.role) || "Tenant",
          online: false,
          lastMessage: c.last_message || "No messages yet",
          time: formatPreviewTime(c.last_message_at),
          unread: unreadMap[c.id] || 0,
        };
      });

      convoIdsRef.current = new Set(convoIds);
      setConversations(merged);
      setLoadingList(false);
    };

    loadConversations();
  }, [user]);

  // ── One realtime channel: updates sidebar previews/unread + live message
  //    stream for whichever conversation is currently open ─────────────────
  useEffect(() => {
    if (!user) return;
    if (globalChannelRef.current) {
      supabase.removeChannel(globalChannelRef.current);
      globalChannelRef.current = null;
    }

    const channel = supabase
      .channel(`agent-messages:${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new;
          if (!convoIdsRef.current.has(msg.conversation_id)) return;
          if (msg.sender_id === user.id) return; // our own sends are handled locally

          // If this is the open conversation, append it live.
          if (selectedRef.current?.id === msg.conversation_id) {
            setMessages((prev) => [...prev, msg]);
            supabase.from("messages").update({ read: true }).eq("id", msg.id).then(() => {});
          }

          // Always refresh the sidebar preview + unread count.
          setConversations((prev) =>
            prev.map((c) =>
              c.id === msg.conversation_id
                ? {
                    ...c,
                    lastMessage: msg.text,
                    time: formatPreviewTime(msg.created_at),
                    unread: selectedRef.current?.id === msg.conversation_id ? 0 : c.unread + 1,
                  }
                : c
            )
          );
        }
      )
      .subscribe();

    globalChannelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
      globalChannelRef.current = null;
    };
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Open a conversation ─────────────────────────────────────────────────────
  const openChat = async (convo) => {
    setSelected(convo);
    setMobileView("chat");
    setChatError("");
    setLoadingMessages(true);
    setMessages([]);

    const { data: msgRows, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", convo.id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      setChatError(`Couldn't load messages: ${error.message}`);
    } else {
      setMessages(msgRows || []);
    }
    setLoadingMessages(false);

    // Mark the tenant's messages as read now that the agent has opened the thread.
    await supabase
      .from("messages")
      .update({ read: true })
      .eq("conversation_id", convo.id)
      .eq("sender_id", convo.user_id)
      .eq("read", false);

    setConversations((prev) => prev.map((c) => (c.id === convo.id ? { ...c, unread: 0 } : c)));

    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // ── Send message ───────────────────────────────────────────────────────────
  const sendMessage = async () => {
    const text = input.trim();
    if (!text || !selected || sending) return;

    setSending(true);
    setChatError("");
    setInput("");

    const { data: inserted, error } = await supabase
      .from("messages")
      .insert({ conversation_id: selected.id, sender_id: user.id, text })
      .select()
      .single();

    setSending(false);

    if (error) {
      console.error(error);
      setChatError(error.message || "Message failed to send.");
      setInput(text);
      return;
    }

    setMessages((prev) => [...prev, inserted]);

    const now = new Date().toISOString();
    await supabase.from("conversations").update({ last_message: text, last_message_at: now }).eq("id", selected.id);

    setConversations((prev) =>
      prev.map((c) => (c.id === selected.id ? { ...c, lastMessage: text, time: formatPreviewTime(now) } : c))
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => c.name.toLowerCase().includes(q));
  }, [conversations, search]);

  const totalUnread = conversations.reduce((n, c) => n + c.unread, 0);

  return (
    <div className="am-root">

      {/* ════ SIDEBAR ════ */}
      <aside className={`am-sidebar ${mobileView === "chat" ? "am-hidden-mobile" : ""}`}>

        {/* Sidebar header */}
        <div className="am-sidebar-header">
          <div className="am-sidebar-title">
            <h2>Messages</h2>
            {totalUnread > 0 && (
              <span className="am-unread-total">{totalUnread}</span>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="am-search">
          <FiSearch size={14} className="am-search-icon" />
          <input
            type="text"
            placeholder="Search conversations…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Conversation list */}
        <div className="am-list">
          {loadingList ? (
            <p className="am-empty-list">Loading conversations…</p>
          ) : filtered.length === 0 ? (
            <p className="am-empty-list">No conversations found</p>
          ) : (
            filtered.map(chat => (
              <button
                key={chat.id}
                className={`am-list-item ${selected?.id === chat.id ? "am-list-item-active" : ""}`}
                onClick={() => openChat(chat)}
              >
                <Avatar src={chat.avatar} name={chat.name} online={chat.online} size={44} />

                <div className="am-list-info">
                  <div className="am-list-top">
                    <span className="am-list-name">{chat.name}</span>
                    <span className="am-list-time">{chat.time}</span>
                  </div>
                  <div className="am-list-bottom">
                    <span className="am-list-preview">{chat.lastMessage}</span>
                    {chat.unread > 0 && (
                      <span className="am-unread-badge">{chat.unread}</span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* ════ CHAT PANEL ════ */}
      <main className={`am-chat ${mobileView === "list" ? "am-hidden-mobile" : ""}`}>
        {selected ? (
          <>
            {/* Chat header */}
            <div className="am-chat-header">
              <div className="am-chat-header-left">
                <button
                  className="am-back-btn"
                  onClick={() => setMobileView("list")}
                  aria-label="Back"
                >
                  <FiArrowLeft size={18} />
                </button>
                <Avatar src={selected.avatar} name={selected.name} online={selected.online} size={40} />
                <div className="am-chat-header-info">
                  <span className="am-chat-name">{selected.name}</span>
                  <span className="am-chat-status">
                    {selected.online ? "Online" : "Offline"}
                    <span className="am-chat-role"> · {selected.role}</span>
                  </span>
                </div>
              </div>

              <div className="am-chat-header-actions">
                <button className="am-header-btn" aria-label="Call"><FiPhone size={16} /></button>
                <button className="am-header-btn" aria-label="Video"><FiVideo size={16} /></button>
                <button className="am-header-btn" aria-label="More"><FiMoreVertical size={16} /></button>
              </div>
            </div>

            {/* Messages area */}
            <div className="am-messages">
              {loadingMessages ? (
                <p className="am-empty-list">Loading messages…</p>
              ) : messages.length === 0 ? (
                <p className="am-empty-list">No messages yet — say hello to {selected.name.split(" ")[0]}.</p>
              ) : (
                messages.map((msg, i) => {
                  const isMe   = msg.sender_id === user?.id;
                  const showAvatar = !isMe && (i === 0 || messages[i - 1].sender_id === user?.id);
                  return (
                    <div key={msg.id} className={`am-msg-row ${isMe ? "am-msg-row-me" : "am-msg-row-them"}`}>
                      {!isMe && (
                        <div className="am-bubble-avatar">
                          {showAvatar
                            ? (selected.avatar
                                ? <img src={selected.avatar} alt={selected.name} className="am-bubble-img" />
                                : <div className="am-bubble-spacer" />)
                            : <div className="am-bubble-spacer" />
                          }
                        </div>
                      )}
                      <div className={`am-bubble ${isMe ? "am-bubble-me" : "am-bubble-them"}`}>
                        <p>{msg.text}</p>
                        <span className="am-bubble-time">
                          {new Date(msg.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Error banner — shows the real Supabase error instead of failing silently */}
            {chatError && (
              <div className="am-error-banner">
                <FiAlertCircle size={14} />
                {chatError}
              </div>
            )}

            {/* Input bar */}
            <div className="am-input-bar">
              <button className="am-attach-btn" aria-label="Attach"><FiPaperclip size={17} /></button>
              <div className="am-input-wrap">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Type a message…"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button className="am-emoji-btn" aria-label="Emoji"><FiSmile size={17} /></button>
              </div>
              <button
                className={`am-send-btn ${input.trim() ? "am-send-active" : ""}`}
                onClick={sendMessage}
                disabled={!input.trim() || sending}
                aria-label="Send"
              >
                <FiSend size={16} />
              </button>
            </div>
          </>
        ) : (
          /* Empty state */
          <div className="am-empty-chat">
            <div className="am-empty-icon">💬</div>
            <h3>Your messages</h3>
            <p>Select a conversation from the list to start chatting</p>
          </div>
        )}
      </main>
    </div>
  );
}