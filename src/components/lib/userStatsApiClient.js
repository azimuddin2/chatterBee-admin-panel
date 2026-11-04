// ============================================
// FILE: lib/userStatsApiClient.js
// Purpose: User Statistics API Client
// ============================================

import apiCall from "./apiClient";
import API_BASE_URL from "./api";

/**
 * Get User Statistics
 * @returns {Promise} - User statistics data
 */
export const getUserStatistics = async () => {
  try {
    const endpoint = `${API_BASE_URL}/api/dashboard/admin/users/stats/`;
    const response = await apiCall(endpoint, "GET");
    return response;
  } catch (error) {
    console.error("Error fetching user statistics:", error);
    throw error;
  }
};

/**
 * Transform recent users data for display
 * @param {Array} recentUsers - Raw recent users array from API
 * @returns {Array} - Transformed users for display
 */
export const transformRecentUsersForDisplay = (recentUsers) => {
  if (!Array.isArray(recentUsers)) {
    return [];
  }

  return recentUsers.map((user) => ({
    id: user.id,
    name: user.full_name || user.username || "Unknown User",
    avatar:
      user.avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || user.username || "U")}&background=EFEFEF&color=333`,
    email: user.email,
    role: user.role || "User",
    subscription_status: user.subscription_status || "free",
    is_active: user.is_active,
    is_blocked: user.is_blocked,
    is_deleted: user.is_deleted,
    created_at: user.created_at,
    last_login: user.last_login,
    social_auth_provider: user.social_auth_provider || null,
  }));
};

export default getUserStatistics;
