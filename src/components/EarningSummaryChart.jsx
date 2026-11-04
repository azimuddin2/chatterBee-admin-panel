"use client";
import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChevronDown, Users, TrendingUp } from "lucide-react";
import {
  getAdminDashboardStats,
  transformUserGrowthData,
} from "./lib/adminStatsApi";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg border-0">
        <p className="text-gray-200 text-sm font-medium">{label}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
          <p className="text-white font-semibold">{payload[0].value}</p>
        </div>
        <p className="text-gray-300 text-xs mt-1">Total users</p>
      </div>
    );
  }
  return null;
};

function StatCard({
  title,
  value,
  icon: Icon,
  bgColor = "bg-blue-50",
  iconColor = "text-blue-500",
  isLoading = false,
}) {
  return (
    <div
      className="bg-white rounded-lg border flex items-center justify-center"
      style={{ boxShadow: "0px 4px 14.7px 0px rgba(0, 0, 0, 0.25)" }}
    >
      <div className="flex items-center justify-center gap-4 p-6">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-2">{title}</p>
          {isLoading ? (
            <div className="h-9 w-20 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}

export default function NonverbalActivityDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("Monthly");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const periods = ["Monthly", "Weekly", "Daily"];

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await getAdminDashboardStats();

      if (response.success && response.data) {
        setStats(response.data);

        // Transform user growth data for the chart
        const transformedData = transformUserGrowthData(
          response.data.user_growth_data,
        );
        setChartData(transformedData);
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

  // Calculate average subscription value
  const avgSubscriptionValue =
    stats?.active_subscriptions > 0
      ? Math.round(stats.total_revenue / stats.active_subscriptions)
      : 0;

  return (
    <div className="w-full rounded-xl p-4 bg-white">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="w-full flex gap-10">
        {/* Main Chart Section */}
        <div
          style={{ boxShadow: "0px 4px 14.7px 0px rgba(0, 0, 0, 0.25)" }}
          className="bg-white w-full rounded-xl shadow-sm border border-gray-100 p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Nonverbal User Activity
              </h2>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FDD268]"></div>
                <span className="text-sm text-gray-600 font-medium">
                  User Growth
                </span>
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <span>{selectedPeriod}</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  {periods.map((period) => (
                    <button
                      key={period}
                      onClick={() => {
                        setSelectedPeriod(period);
                        setIsDropdownOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {period}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="h-80 w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-gray-400">Loading chart data...</div>
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-gray-400">No data available</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  barCategoryGap="25%"
                >
                  <CartesianGrid
                    strokeDasharray="none"
                    vertical={false}
                    stroke="#f3f4f6"
                    strokeWidth={1}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#9ca3af",
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#9ca3af",
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: "transparent" }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#FDD268"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 w-1/3">
          <StatCard
            title="Active Subscriptions"
            value={stats?.active_subscriptions || 0}
            icon={Users}
            bgColor="bg-blue-50"
            iconColor="text-blue-500"
            isLoading={loading}
          />
          <StatCard
            title="Avg. Subscriptions Value"
            value={avgSubscriptionValue}
            icon={TrendingUp}
            bgColor="bg-purple-50"
            iconColor="text-purple-500"
            isLoading={loading}
          />
        </div>
      </div>
    </div>
  );
}
