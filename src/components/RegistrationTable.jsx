"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import getUserStatistics, {
  transformRecentUsersForDisplay,
} from "./lib/userStatsApiClient";

export default function RecentUsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getUserStatistics();

      console.log("User Stats API Response:", response);

      if (response && response.success && response.data) {
        // Get recent_users from the response
        const recentUsers = response.data.recent_users || [];

        console.log("Recent Users:", recentUsers);

        if (recentUsers.length > 0) {
          const transformedUsers = transformRecentUsersForDisplay(recentUsers);
          console.log("Transformed Users:", transformedUsers);
          // Show only first 3-4 users
          setUsers(transformedUsers.slice(0, 4));
        } else {
          setUsers([]);
        }
      } else {
        console.error("API returned unsuccessful response:", response);
        setError(response?.message || "Failed to load user statistics");
      }
    } catch (err) {
      console.error("Error fetching user statistics:", err);
      setError(err.message || "An error occurred while loading users");
    } finally {
      setLoading(false);
    }
  };

  const handleSeeMore = () => {
    router.push("/admin/user-management");
  };

  // Function to render subscription status badge
  const SubscriptionBadge = ({ status }) => {
    const baseClasses = "px-3 py-1 text-xs font-medium rounded-md";
    if (status === "premium" || status === "paid") {
      return (
        <span className={`${baseClasses} bg-[#E9F7EF] text-[#2D8A5A]`}>
          Premium
        </span>
      );
    }
    if (status === "trial") {
      return (
        <span className={`${baseClasses} bg-[#FFF8E6] text-[#D4A12F]`}>
          Trial
        </span>
      );
    }
    return (
      <span className={`${baseClasses} bg-[#F3F4F6] text-[#6B7280]`}>Free</span>
    );
  };

  // Function to render status badge
  const StatusBadge = ({ isActive, isBlocked }) => {
    const baseClasses = "px-3 py-1 text-xs font-medium rounded-md";
    if (isBlocked) {
      return (
        <span className={`${baseClasses} bg-[#FBEBEE] text-[#B53D4D]`}>
          Blocked
        </span>
      );
    }
    if (isActive) {
      return (
        <span className={`${baseClasses} bg-[#E9F7EF] text-[#2D8A5A]`}>
          Active
        </span>
      );
    }
    return (
      <span className={`${baseClasses} bg-[#FFF8E6] text-[#D4A12F]`}>
        Inactive
      </span>
    );
  };

  return (
    <div
      className="p-4 sm:p-6 bg-white rounded-lg"
      style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)" }}
    >
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <p className="font-medium">Error loading users</p>
          <p className="text-xs mt-1">{error}</p>
          <button
            onClick={fetchUserStats}
            className="mt-2 text-xs underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Recent Users</h1>
        <button
          onClick={handleSeeMore}
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-md border border-gray-200 hover:bg-gray-100 transition-colors"
        >
          See More
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500">
              <th className="py-3 px-4 font-medium">Name</th>
              <th className="py-3 px-4 font-medium">Email</th>
              <th className="py-3 px-4 font-medium">Role</th>
              <th className="py-3 px-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // Loading skeleton
              Array(3)
                .fill(0)
                .map((_, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                  </tr>
                ))
            ) : users.length > 0 ? (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={`${user.name}'s avatar`}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=EFEFEF&color=333`;
                        }}
                      />
                      <div>
                        <p className="font-medium text-gray-800">{user.name}</p>
                        {user.social_auth_provider && (
                          <p className="text-xs text-gray-500">
                            via {user.social_auth_provider}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600">{user.email}</td>
                  <td className="py-4 px-4">
                    <span className="text-gray-600">{user.role}</span>
                    {user.subscription_status !== "free" && (
                      <div className="mt-1">
                        <SubscriptionBadge status={user.subscription_status} />
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <StatusBadge
                      isActive={user.is_active}
                      isBlocked={user.is_blocked}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-12">
                  <div className="flex flex-col items-center justify-center">
                    <svg
                      className="w-16 h-16 text-gray-300 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <p className="text-gray-500 font-medium mb-1">
                      No recent users
                    </p>
                    <p className="text-gray-400 text-sm">
                      New users will appear here
                    </p>
                    {!loading && !error && (
                      <button
                        onClick={fetchUserStats}
                        className="mt-4 text-sm text-blue-600 hover:text-blue-700 underline"
                      >
                        Refresh
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
