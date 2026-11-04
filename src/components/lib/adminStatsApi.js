// ============================================
// FILE: lib/adminStatsApi.js
// Purpose: Admin Dashboard Statistics API Functions
// ============================================

import apiCall from "./apiClient";
import API_BASE_URL from "./api";

/**
 * Get Admin Dashboard Statistics
 * @returns {Promise} - Dashboard statistics data
 */
export const getAdminDashboardStats = async () => {
  try {
    const endpoint = `${API_BASE_URL}/api/dashboard/admin/dashboard/stats/`;
    const response = await apiCall(endpoint, "GET");
    return response;
  } catch (error) {
    console.error("Error fetching admin dashboard stats:", error);
    throw error;
  }
};

/**
 * Transform user growth data for chart
 * @param {Array} userGrowthData - Raw user growth data from API
 * @returns {Array} - Transformed data for Recharts
 */
export const transformUserGrowthData = (userGrowthData) => {
  if (!userGrowthData || !Array.isArray(userGrowthData)) {
    return [];
  }

  return userGrowthData.map((item) => ({
    name: item.month.substring(0, 3), // "February" -> "Feb"
    value: item.count,
  }));
};

/**
 * Transform revenue data for chart
 * @param {Array} revenueData - Raw revenue data from API
 * @returns {Array} - Transformed data for Recharts
 */
export const transformRevenueData = (revenueData) => {
  if (!revenueData || !Array.isArray(revenueData)) {
    return [];
  }

  return revenueData.map((item) => ({
    name: item.month.substring(0, 3), // "February" -> "Feb"
    value: parseFloat(item.amount),
  }));
};
