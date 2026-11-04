// ============================================
// FILE: lib/userManagementApiClient.js
// Purpose: User Management API Client
// ============================================

import { API_ENDPOINTS } from "./api";
import { apiCall } from "./apiClient";

/**
 * Get all users with optional filters
 * @param {Object} filters - Filter parameters (role, is_active, page, page_size)
 * @returns {Promise} - List of users
 */
export const getAllUsers = async (filters = {}) => {
  try {
    let endpoint = API_ENDPOINTS.USER_MANAGEMENT.GET_ALL_USERS;

    // Add query parameters if filters provided
    if (Object.keys(filters).length > 0) {
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== null && filters[key] !== undefined) {
          queryParams.append(key, filters[key]);
        }
      });
      endpoint = `${endpoint}?${queryParams.toString()}`;
    }

    const response = await apiCall(endpoint, "GET");
    return response;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

/**
 * Get user details by ID
 * @param {number} userId - User ID
 * @returns {Promise} - User details
 */
export const getUserById = async (userId) => {
  try {
    const endpoint = API_ENDPOINTS.USER_MANAGEMENT.GET_USER_DETAILS(userId);
    const response = await apiCall(endpoint, "GET");
    return response;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

/**
 * Block a user
 * @param {string} email - User email
 * @param {string} reason - Reason for blocking
 * @returns {Promise} - Block response
 */
export const blockUser = async (email, reason = "") => {
  try {
    const response = await apiCall(
      API_ENDPOINTS.USER_MANAGEMENT.BLOCK_USER,
      "POST",
      {
        email,
        reason: reason || "Violation of terms",
      },
    );
    return response;
  } catch (error) {
    console.error("Error blocking user:", error);
    throw error;
  }
};

/**
 * Unblock a user
 * @param {string} email - User email
 * @returns {Promise} - Unblock response
 */
export const unblockUser = async (email) => {
  try {
    const response = await apiCall(
      API_ENDPOINTS.USER_MANAGEMENT.UNBLOCK_USER,
      "POST",
      {
        email,
      },
    );
    return response;
  } catch (error) {
    console.error("Error unblocking user:", error);
    throw error;
  }
};

/**
 * Delete a user (soft delete)
 * @param {string} email - User email
 * @returns {Promise} - Delete response
 */
export const deleteUser = async (email) => {
  try {
    const response = await apiCall(
      API_ENDPOINTS.USER_MANAGEMENT.DELETE_USER,
      "POST",
      {
        email,
      },
    );
    return response;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

/**
 * Restore a deleted user
 * @param {string} email - User email
 * @returns {Promise} - Restore response
 */
export const restoreUser = async (email) => {
  try {
    const response = await apiCall(
      API_ENDPOINTS.USER_MANAGEMENT.RESTORE_USER,
      "POST",
      {
        email,
      },
    );
    return response;
  } catch (error) {
    console.error("Error restoring user:", error);
    throw error;
  }
};

/**
 * Transform user data for display
 * @param {Array} users - Raw users array from API
 * @returns {Array} - Transformed users for display
 */
export const transformUsersForDisplay = (users) => {
  if (!Array.isArray(users)) {
    return [];
  }

  return users.map((user) => ({
    id: user.id,
    name: user.profile?.full_name || user.full_name || "Unknown",
    avatar: user.profile?.avatar || `https://i.pravatar.cc/40?u=user${user.id}`,
    role: user.profile?.role || user.role || "User",
    email: user.email,
    status: user.is_blocked
      ? "Blocked"
      : user.is_active
        ? "Active"
        : "Inactive",
    phone: user.profile?.phone || "(N/A)",
    is_active: user.is_active,
    is_blocked: user.is_blocked,
    is_deleted: user.is_deleted,
    created_at: user.created_at,
    last_login: user.last_login,
    full_name: user.profile?.full_name || user.full_name || "Unknown",
    address: user.profile?.address || "N/A",
    bio: user.profile?.bio || "No bio provided",
    social: user.profile?.social || {},
  }));
};

export default getAllUsers;
