// ============================================
// FILE: lib/userApiClient.js
// Purpose: User-specific API client functions
// ============================================

import { API_ENDPOINTS } from "./api";

/**
 * Get user profile data
 */
export const getProfile = async () => {
  const token =
    typeof document !== "undefined"
      ? document.cookie.split("token=")[1]?.split(";")[0]
      : null;

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch(API_ENDPOINTS.USER_PROFILE.GET, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch profile");
    }

    return {
      success: true,
      data: data.data || data,
    };
  } catch (error) {
    console.error("Error fetching profile:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch profile",
    };
  }
};

/**
 * Update user profile with FormData support for file uploads
 * @param {FormData} formData - Form data with profile fields and optional avatar file
 */
export const updateProfile = async (formData) => {
  const token =
    typeof document !== "undefined"
      ? document.cookie.split("token=")[1]?.split(";")[0]
      : null;

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch(API_ENDPOINTS.USER_PROFILE.UPDATE, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        // Note: Don't set Content-Type for FormData, browser will set it with boundary
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update profile");
    }

    return {
      success: true,
      data: data.data || data,
      message: data.message || "Profile updated successfully",
    };
  } catch (error) {
    console.error("Error updating profile:", error);
    return {
      success: false,
      message: error.message || "Failed to update profile",
    };
  }
};

/**
 * Change user password
 */
export const changePassword = async (
  currentPassword,
  newPassword,
  confirmedPassword,
) => {
  const token =
    typeof document !== "undefined"
      ? document.cookie.split("token=")[1]?.split(";")[0]
      : null;

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        old_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmedPassword,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to change password");
    }

    return {
      success: true,
      message: data.message || "Password changed successfully",
    };
  } catch (error) {
    console.error("Error changing password:", error);
    return {
      success: false,
      message: error.message || "Failed to change password",
    };
  }
};

export const userApiClient = {
  getProfile,
  updateProfile,
  changePassword,
};

export default userApiClient;
