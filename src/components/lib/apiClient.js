// ============================================
// FILE: lib/apiClient.js
// Purpose: Reusable API Call Function with Token Management
// ============================================

import { API_ENDPOINTS } from "./api";

// Helper function to get token from cookie
const getTokenFromCookie = () => {
  if (typeof document === "undefined") return null;
  const name = "token=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(";");
  for (let cookie of cookieArray) {
    cookie = cookie.trim();
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length);
    }
  }
  return null;
};

// Helper function to set token in cookie
const setTokenInCookie = (token, expiryDays = 30) => {
  const date = new Date();
  date.setTime(date.getTime() + expiryDays * 24 * 60 * 60 * 1000);
  const expires = "expires=" + date.toUTCString();
  document.cookie = `token=${token};${expires};path=/;SameSite=Lax`;
};

// Helper function to remove token from cookie
const removeTokenFromCookie = () => {
  document.cookie = "token=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
};

/**
 * Generic API Call Function with Authorization Header
 * @param {string} endpoint - API endpoint URL
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {object} data - Request body data
 * @param {object} headers - Custom headers
 * @returns {Promise} - API response
 */
export const apiCall = async (
  endpoint,
  method = "POST",
  data = null,
  headers = {},
) => {
  try {
    const token = getTokenFromCookie();
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    // Add token to Authorization header if available
    if (token) {
      options.headers.Authorization = `Bearer ${token}`;
    }

    if (data && method !== "GET") {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(endpoint, options);

    // If unauthorized, remove token and redirect to login
    if (response.status === 401) {
      removeTokenFromCookie();
      window.location.href = "/";
      throw new Error("Session expired. Please login again.");
    }

    // Parse response
    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || `HTTP ${response.status}`);
    }

    return responseData;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

/**
 * Login API Call
 */
export const loginUser = async (email, password) => {
  const response = await apiCall(API_ENDPOINTS.AUTH.LOGIN, "POST", {
    email,
    password,
  });

  // Store token if login is successful
  if (response.success && response.data?.access) {
    setTokenInCookie(response.data.access, 30);
  }

  return response;
};

/**
 * Send OTP (for password reset)
 */
export const sendOTP = async (email) => {
  return apiCall(API_ENDPOINTS.AUTH.SEND_OTP, "POST", {
    email,
    purpose: "password_reset",
  });
};

/**
 * Verify OTP
 */
export const verifyOTP = async (email, otp) => {
  return apiCall(API_ENDPOINTS.AUTH.VERIFY_OTP, "POST", {
    email,
    otp,
  });
};

/**
 * Reset Password (Confirm)
 */
export const resetPassword = async (email, otp, newPassword, newPassword2) => {
  return apiCall(API_ENDPOINTS.AUTH.RESET_PASSWORD, "POST", {
    email,
    otp,
    new_password: newPassword,
    new_password2: newPassword2,
  });
};

/**
 * Change Password (Requires Authentication)
 */
export const changePassword = async (
  oldPassword,
  newPassword,
  newPassword2,
) => {
  return apiCall(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, "POST", {
    old_password: oldPassword,
    new_password: newPassword,
    new_password2: newPassword2,
  });
};

/**
 * Verify Email
 */
export const verifyEmail = async (email) => {
  return apiCall(API_ENDPOINTS.AUTH.VERIFY_EMAIL, "POST", {
    email,
  });
};

/**
 * Request Password Reset
 */
export const requestPasswordReset = async (email) => {
  return apiCall(API_ENDPOINTS.AUTH.RESET_PASSWORD_REQUEST, "POST", {
    email,
  });
};

/**
 * Logout - Calls backend logout API, clears token, redirects to login
 */
export const logoutUser = async () => {
  try {
    await apiCall(API_ENDPOINTS.AUTH.LOGOUT, "POST");
  } catch (error) {
    // Even if the API call fails, we still clear the token and redirect
    console.error("Logout API error:", error);
  } finally {
    removeTokenFromCookie();
    window.location.href = "/";
  }
};

/**
 * Get stored token
 */
export const getToken = () => {
  return getTokenFromCookie();
};

export default apiCall;
