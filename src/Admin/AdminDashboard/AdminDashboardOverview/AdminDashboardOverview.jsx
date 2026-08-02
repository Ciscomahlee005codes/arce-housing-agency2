import React, { useState, useEffect } from "react";
import "./AdminDashboardOverview.css";
import {
  FiUsers, FiUserCheck, FiHome, FiMapPin,
  FiTrendingUp, FiAlertTriangle, FiCheckCircle,
  FiUserPlus, FiShield, FiArrowUpRight, FiArrowDownRight,
  FiMoreHorizontal, FiEye, FiRefreshCw,
} from "react-icons/fi";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { supabase } from "../../../lib/supabase";

const REVENUE_DATA = [
  { month: "Jan", revenue: 82000,  users: 9800  },
  { month: "Feb", revenue: 94000,  users: 10200 },
  { month: "Mar", revenue: 88000,  users: 10600 },
  { month: "Apr", revenue: 105000, users: 11100 },
  { month: "May", revenue: 97000,  users: 11400 },
  { month: "Jun", revenue: 118000, users: 11800 },
  { month: "Jul", revenue: 125430, users: 12450 },
];

const ACTIVITIES = [
  { id: 1, type: "new_user",    icon: <FiUserPlus size={14} />,      color: "#6366f1", text: <>User <b>John Doe</b> registered as a tenant.</>,          time: "2 mins ago"  },
  { id: 2, type: "property",   icon: <FiHome size={14} />,           color: "#f59e0b", text: <>Property <b>Duplex in Abuja</b> was listed.</>,            time: "14 mins ago" },
  { id: 3, type: "agent",      icon: <FiUserCheck size={14} />,      color: "#22c55e", text: <>Agent <b>Jane Smith</b> updated her profile.</>,           time: "1 hr ago"    },
  { id: 4, type: "alert",      icon: <FiAlertTriangle size={14} />,  color: "#ef4444", text: <><b>3 properties</b> flagged for review.</>,                time: "2 hrs ago"   },
  { id: 5, type: "approved",   icon: <FiCheckCircle size={14} />,    color: "#22c55e", text: <>Application by <b>Mike Obi</b> approved.</>,               time: "3 hrs ago"   },
  { id: 6, type: "security",   icon: <FiShield size={14} />,         color: "#a855f7", text: <>Security scan completed — <b>no threats found</b>.</>,      time: "5 hrs ago"   },
];

const QUICK_ACTIONS = [
  { label: "Add Agent",      icon: <FiUserPlus size={16} />,     accent: "#6366f1" },
  { label: "Review Flags",   icon: <FiAlertTriangle size={16} />, accent: "#ef4444" },
  { label: "View Reports",   icon: <FiEye size={16} />,           accent: "#f59e0b" },
  { label: "Sync Data",      icon: <FiRefreshCw size={16} />,     accent: "#22c55e" },
];

// ── Custom tooltip ─────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="adm-tooltip">
      <p className="adm-tooltip-label">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: <strong>{p.dataKey === "revenue" ? `₦${p.value.toLocaleString()}` : p.value.toLocaleString()}</strong>
        </p>
      ))}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function AdminDashboardOverview() {
  // ── Data ──────────────────────────────────────────────────────────────────────
const [stats, setStats] = useState({
  users: 0,
  agents: 0,
  properties: 0,
  pendingProperties: 0,
  statesCovered: 0,
});
  const [chartMetric, setChartMetric] = useState("revenue");

  const currentRevenue = REVENUE_DATA[REVENUE_DATA.length - 1].revenue;
  const prevRevenue    = REVENUE_DATA[REVENUE_DATA.length - 2].revenue;
  const revenueChange  = (((currentRevenue - prevRevenue) / prevRevenue) * 100).toFixed(1);
  const [loading, setLoading] = useState(true);
const [activities, setActivities] = useState([]);
const [chartData, setChartData] = useState([]);

  const fetchDashboardData = async () => {
  try {
    setLoading(true);

    // ───────────────── USERS ─────────────────
    const { count: usersCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    // ───────────────── AGENTS ─────────────────
    const { count: agentsCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "agent");

    // ───────────────── PROPERTIES ─────────────────
    const { count: propertiesCount } = await supabase
      .from("properties")
      .select("*", { count: "exact", head: true });

    // ───────────────── PENDING PROPERTIES ─────────────────
    const { count: pendingCount } = await supabase
      .from("properties")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    // ───────────────── STATES COVERED ─────────────────
    const { data: statesData } = await supabase
      .from("properties")
      .select("state");

    const uniqueStates = [...new Set(statesData?.map(i => i.state))];

    // ───────────────── RECENT ACTIVITIES ─────────────────
    const { data: recentProperties } = await supabase
      .from("properties")
      .select(`
        id,
        title,
        created_at,
        profiles (
          full_name
        )
      `)
      .order("created_at", { ascending: false })
      .limit(5);

    const formattedActivities = recentProperties?.map((item) => ({
      id: item.id,
      text: `${item.profiles?.full_name || "Agent"} listed ${item.title}`,
      time: new Date(item.created_at).toLocaleDateString(),
    }));

    // ───────────────── CHART DATA ─────────────────
    const { data: chartProperties } = await supabase
      .from("properties")
      .select("created_at");

    const monthlyData = {};

    chartProperties?.forEach((property) => {
      const month = new Date(property.created_at).toLocaleString("default", {
        month: "short",
      });

      if (!monthlyData[month]) {
        monthlyData[month] = 0;
      }

      monthlyData[month]++;
    });

    const finalChartData = Object.keys(monthlyData).map((month) => ({
      month,
      properties: monthlyData[month],
    }));

    // ───────────────── SAVE TO STATE ─────────────────
    setStats({
      users: usersCount || 0,
      agents: agentsCount || 0,
      properties: propertiesCount || 0,
      pendingProperties: pendingCount || 0,
      statesCovered: uniqueStates.length || 0,
    });

    setActivities(formattedActivities || []);

    setChartData(finalChartData);

  } catch (error) {
    console.log(error);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
  fetchDashboardData();
}, []);

  return (
    <div className="adm-page">

      {/* ── Page header ── */}
      <div className="adm-page-header">
        <div>
          <h1 className="adm-greeting">Welcome back, Mega 👋</h1>
          <p className="adm-date">
            {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="adm-header-actions">
          <button className="adm-btn-outline">Export report</button>
          <button className="adm-btn-primary">+ Add listing</button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="adm-stats-grid">
        {[
  {
    label: "Total Users",
    value: stats.users,
    icon: <FiUsers size={20} />,
  },
  {
    label: "Agents",
    value: stats.agents,
    icon: <FiUserCheck size={20} />,
  },
  {
    label: "Properties",
    value: stats.properties,
    icon: <FiHome size={20} />,
  },
  {
    label: "Pending Reviews",
    value: stats.pendingProperties,
    icon: <FiAlertTriangle size={20} />,
  },
].map((s) => (
          <div key={s.id} className="adm-stat-card">
            <div className="adm-stat-top">
              <div className="adm-stat-icon" style={{ background: s.bg, color: s.accent }}>
                {s.icon}
              </div>
              <button className="adm-stat-more" aria-label="Options">
                <FiMoreHorizontal size={15} />
              </button>
            </div>
            <p className="adm-stat-value">{s.value}</p>
            <p className="adm-stat-label">{s.label}</p>
            <div className="adm-stat-change">
              {s.up
                ? <FiArrowUpRight size={13} className="adm-change-up" />
                : <FiArrowDownRight size={13} className="adm-change-down" />
              }
              <span className={s.up ? "adm-change-up" : "adm-change-down"}>{s.change}</span>
              <span className="adm-change-sub">{s.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main row: chart + activity ── */}
      <div className="adm-main-row">

        {/* Revenue / Users chart */}
        <div className="adm-chart-card">
          <div className="adm-chart-header">
            <div>
              <h3 className="adm-card-title">
                {chartMetric === "revenue" ? "Revenue Overview" : "User Growth"}
              </h3>
              <p className="adm-card-sub">
                {chartMetric === "revenue"
                  ? <>₦{currentRevenue.toLocaleString()} this month
                      <span className={revenueChange > 0 ? "adm-inline-up" : "adm-inline-down"}>
                        &nbsp;{revenueChange > 0 ? "↑" : "↓"} {Math.abs(revenueChange)}%
                      </span>
                    </>
                  : "Monthly active users"
                }
              </p>
            </div>
            <div className="adm-chart-toggle">
              <button
                className={`adm-toggle-btn ${chartMetric === "revenue" ? "active" : ""}`}
                onClick={() => setChartMetric("revenue")}
              >Revenue</button>
              <button
                className={`adm-toggle-btn ${chartMetric === "users" ? "active" : ""}`}
                onClick={() => setChartMetric("users")}
              >Users</button>
            </div>
          </div>

          <div className="adm-chart-wrap">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}    />
                  </linearGradient>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => chartMetric === "revenue" ? `₦${(v/1000).toFixed(0)}k` : v.toLocaleString()}
                />
                <Tooltip content={<ChartTooltip />} />
                {chartMetric === "revenue"
                  ? <Area
                      type="monotone"
                       dataKey="properties"
                      name="Properties"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      fill="url(#colorRevenue)"
                      dot={false}
                      activeDot={{ r: 5, fill: "#6366f1" }}
                    />
                  : <Area
                      type="monotone"
                      dataKey="users"
                      name="Users"
                      stroke="#22c55e"
                      strokeWidth={2.5}
                      fill="url(#colorUsers)"
                      dot={false}
                      activeDot={{ r: 5, fill: "#22c55e" }}
                    />
                }
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity feed */}
        <div className="adm-activity-card">
          <div className="adm-activity-header">
            <h3 className="adm-card-title">Recent Activity</h3>
            <button className="adm-view-all">View all</button>
          </div>
          <div className="adm-activity-list">
            {activities.map((a) => (
  <div key={a.id} className="adm-activity-item">
    <div
      className="adm-activity-dot"
      style={{
        background: "#6d5dfc",
        boxShadow: "0 0 0 4px rgba(109,93,252,0.2)",
      }}
    >
      <FiHome size={14} color="#fff" />
    </div>

    <div className="adm-activity-content">
      <p className="adm-activity-text">{a.text}</p>
      <span className="adm-activity-time">{a.time}</span>
    </div>
  </div>
))}
          </div>
        </div>
      </div>

      {/* ── Bottom row: quick actions + top states ── */}
      <div className="adm-bottom-row">

        {/* Quick actions */}
        <div className="adm-quick-card">
          <h3 className="adm-card-title">Quick Actions</h3>
          <div className="adm-quick-grid">
            {QUICK_ACTIONS.map(a => (
              <button key={a.label} className="adm-quick-btn" style={{ "--accent": a.accent }}>
                <span className="adm-quick-icon" style={{ background: `${a.accent}18`, color: a.accent }}>
                  {a.icon}
                </span>
                <span>{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Platform summary */}
        <div className="adm-summary-card">
          <h3 className="adm-card-title">Platform Summary</h3>
          <div className="adm-summary-list">
            {[
              { label: "Active listings",    value: "1,842", bar: 86 },
              { label: "Pending reviews",    value: "47",    bar: 22 },
              { label: "Verified agents",    value: "284",   bar: 89 },
              { label: "Tenant applications",value: "638",   bar: 60 },
            ].map(r => (
              <div key={r.label} className="adm-summary-row">
                <div className="adm-summary-top">
                  <span className="adm-summary-label">{r.label}</span>
                  <span className="adm-summary-value">{r.value}</span>
                </div>
                <div className="adm-bar-track">
                  <div className="adm-bar-fill" style={{ width: `${r.bar}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}