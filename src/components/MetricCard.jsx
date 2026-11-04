"use client";
import React, { useState, useEffect } from "react";
import { Users, AlertTriangle, DollarSign } from "lucide-react";
import { getAdminDashboardStats } from "./lib/adminStatsApi";

function MetricCard({
  title,
  value,
  icon: Icon,
  iconBgColor = "bg-blue-50",
  iconColor = "text-blue-500",
  isLoading = false,
}) {
  return (
    <div
      style={{ boxShadow: "0px 4px 14.7px 0px rgba(0, 0, 0, 0.25)" }}
      className="bg-white rounded-lg p-6 py-10 px-16 shadow-sm "
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          {isLoading ? (
            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <p className="text-2xl font-bold text-gray-900">
              {typeof value === "number" ? value.toLocaleString() : value}
            </p>
          )}
        </div>
        <div className={`ml-4 p-3 rounded-lg ${iconBgColor}`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await getAdminDashboardStats();

      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError("Failed to load dashboard statistics");
      }
    } catch (err) {
      console.error("Dashboard stats error:", err);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Calculate caregiver alerts (you can modify this logic based on your needs)
  const caregiverAlerts = stats?.caregivers || 0;

  return (
    <div className="p-4">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Active User"
            value={stats?.active_users || 0}
            icon={Users}
            iconBgColor="bg-blue-50"
            iconColor="text-blue-500"
            isLoading={loading}
          />
          <MetricCard
            title="Caregiver Alerts"
            value={caregiverAlerts}
            icon={AlertTriangle}
            iconBgColor="bg-yellow-50"
            iconColor="text-yellow-500"
            isLoading={loading}
          />
          <MetricCard
            title="Total Earning"
            value={
              stats?.total_revenue
                ? `$${stats.total_revenue.toFixed(2)}`
                : "$0.00"
            }
            icon={DollarSign}
            iconBgColor="bg-green-50"
            iconColor="text-green-500"
            isLoading={loading}
          />
        </div>
      </div>
    </div>
  );
}
