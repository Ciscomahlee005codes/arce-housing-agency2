import React, { useEffect, useState } from "react";
import {
  FiHome,
  FiUsers,
  FiClock,
  FiCheckCircle,
} from "react-icons/fi";

import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../lib/supabase";

import "./AgentActivity.css";

const AgentActivity = () => {
  const { profile } = useAuth();

  const firstName =
    profile?.full_name?.split(" ")[0] || "Agent";

  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    pendingListings: 0,
    completedDeals: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      // FETCH ALL PROPERTIES
       const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) {
  setLoading(false);
  return;
}

const { data: properties, error } = await supabase
  .from("properties")
  .select("*")
  .eq("agent_id", user.id);

      if (error) {
        console.log(error);
        return;
      }

      // TOTAL
      const totalListings = properties.length;

      // ACTIVE
      const activeListings = properties.filter(
        (property) => property.status === "active"
      ).length;

      // PENDING
      const pendingListings = properties.filter(
        (property) => property.status === "pending"
      ).length;

      // COMPLETED
      const completedDeals = properties.filter(
        (property) => property.status === "completed"
      ).length;

      setStats({
        totalListings,
        activeListings,
        pendingListings,
        completedDeals,
      });

    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const STATS = [
    {
      id: 1,
      title: "Total Listings",
      count: stats.totalListings,
      trend: "All uploaded properties",
      up: true,
      icon: <FiHome size={20} />,
      accent: "#160053",
      bg: "#ede9fe",
    },

    {
      id: 2,
      title: "Active Listings",
      count: stats.activeListings,
      trend: "Currently active",
      up: true,
      icon: <FiUsers size={20} />,
      accent: "#16a34a",
      bg: "#dcfce7",
    },

    {
      id: 3,
      title: "Pending Requests",
      count: stats.pendingListings,
      trend: "Awaiting approval",
      up: false,
      icon: <FiClock size={20} />,
      accent: "#b45309",
      bg: "#fef9c3",
    },

    {
      id: 4,
      title: "Completed Deals",
      count: stats.completedDeals,
      trend: "Successfully closed",
      up: true,
      icon: <FiCheckCircle size={20} />,
      accent: "#1d4ed8",
      bg: "#dbeafe",
    },
  ];

  return (
    <section className="aa-section">

      <div className="aa-header">
        <div>
          <h2 className="aa-greeting">
            Good day, {firstName} 👋
          </h2>

          <p className="aa-sub">
            Here's what's happening with your listings today.
          </p>
        </div>
      </div>

      <div className="aa-grid">

        {loading ? (
          <p>Loading dashboard stats...</p>
        ) : (
          STATS.map((item) => (
            <div key={item.id} className="aa-card">

              <div className="aa-card-top">

                <div
                  className="aa-icon-wrap"
                  style={{
                    background: item.bg,
                    color: item.accent,
                  }}
                >
                  {item.icon}
                </div>

                <span
                  className={`aa-trend ${
                    item.up
                      ? "aa-trend-up"
                      : "aa-trend-warn"
                  }`}
                >
                  {item.trend}
                </span>

              </div>

              <p
                className="aa-count"
                style={{ color: item.accent }}
              >
                {item.count}
              </p>

              <p className="aa-title">
                {item.title}
              </p>

            </div>
          ))
        )}

      </div>
    </section>
  );
};

export default AgentActivity;