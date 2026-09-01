// ============================================
// FILE: lib/api.js
// Purpose: Centralized API Configuration & Endpoints
// ============================================

const API_BASE_URL = "https://api.chatterbeeapp.com";

export const API_ENDPOINTS = {
  // ============================================
  // Authentication Endpoints
  // ============================================
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login/`,
    SEND_OTP: `${API_BASE_URL}/api/auth/resend-otp/`,
    VERIFY_OTP: `${API_BASE_URL}/api/auth/password/reset-verify-otp/`,
    RESET_PASSWORD: `${API_BASE_URL}/api/auth/password/reset-confirm/`,
    CHANGE_PASSWORD: `${API_BASE_URL}/api/auth/password/change/`,
    VERIFY_EMAIL: `${API_BASE_URL}/api/auth/verify-email/`,
    RESET_PASSWORD_REQUEST: `${API_BASE_URL}/api/auth/password/reset-request/`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout/`,
  },

  // ============================================
  // User Management Endpoints
  // ============================================
  USER_MANAGEMENT: {
    GET_ALL_USERS: `${API_BASE_URL}/api/dashboard/admin/users/`,
    GET_USER_DETAILS: (userId) => `${API_BASE_URL}/api/dashboard/admin/users/${userId}/`,
    BLOCK_USER: `${API_BASE_URL}/api/dashboard/admin/users/block/`,
    UNBLOCK_USER: `${API_BASE_URL}/api/dashboard/admin/users/unblock/`,
    DELETE_USER: `${API_BASE_URL}/api/dashboard/admin/users/delete/`,
    RESTORE_USER: `${API_BASE_URL}/api/dashboard/admin/users/restore/`,
  },

  // ============================================
  // Dashboard Statistics Endpoints
  // ============================================
  DASHBOARD: {
    GET_ADMIN_STATS: `${API_BASE_URL}/api/dashboard/admin/dashboard/stats/`,
    GET_USER_STATS: `${API_BASE_URL}/api/dashboard/admin/users/stats/`,
  },

  // ============================================
  // Subscription Endpoints
  // ============================================
  SUBSCRIPTION: {
    GET_ALL_SUBSCRIPTIONS: `${API_BASE_URL}/api/dashboard/admin/subscriptions/`,
    GET_SUBSCRIPTION_DETAILS: (subscriptionId) => `${API_BASE_URL}/api/dashboard/admin/subscriptions/${subscriptionId}/`,
  },

  // ============================================
  // User Profile Endpoints
  // ============================================
  USER_PROFILE: {
    GET: `${API_BASE_URL}/api/auth/profile/`,
    UPDATE: `${API_BASE_URL}/api/auth/profile/`,
  },

  // ============================================
  // Category Endpoints
  // ============================================
  CATEGORIES: {
    GET_ALL_ROOT_CATEGORIES: `${API_BASE_URL}/api/dashboard/admin/categories/`,
    CREATE_ROOT_CATEGORY: `${API_BASE_URL}/api/dashboard/admin/categories/`,
    GET_SINGLE_CATEGORY: (categoryId) => `${API_BASE_URL}/api/dashboard/admin/categories/${categoryId}/`,
    UPDATE_CATEGORY: (categoryId) => `${API_BASE_URL}/api/dashboard/admin/categories/${categoryId}/`,
    DELETE_CATEGORY: (categoryId) => `${API_BASE_URL}/api/dashboard/admin/categories/${categoryId}/`,
  },

  // ============================================
  // Sub-Category Endpoints
  // ============================================
  SUB_CATEGORIES: {
    // GET all sub-categories across every main category, flat + paginated
    // Response: { data: { total_count, total_pages, page, page_size, sub_categories: [...] } }
    GET_ALL: `${API_BASE_URL}/api/dashboard/admin/subcategories`,
    GET_BY_PARENT: (categoryId) => `${API_BASE_URL}/api/dashboard/admin/categories/${categoryId}/subcategories/`,
    CREATE: (categoryId) => `${API_BASE_URL}/api/dashboard/admin/categories/${categoryId}/subcategories/`,
    GET_SINGLE: (subCategoryId) => `${API_BASE_URL}/api/dashboard/admin/subcategories/${subCategoryId}/`,
    UPDATE: (subCategoryId) => `${API_BASE_URL}/api/dashboard/admin/subcategories/${subCategoryId}/`,
    DELETE: (subCategoryId) => `${API_BASE_URL}/api/dashboard/admin/subcategories/${subCategoryId}/`,
  },
  // ============================================
  // Category Items / Buttons Endpoints
  // ============================================
  CATEGORY_ITEMS: {
    // GET all items across every sub-category, flat + paginated
    // Response: { data: { total_count, total_pages, page, page_size, items: [...] } }
    GET_ALL: `${API_BASE_URL}/api/dashboard/admin/items/`,
    GET_BY_SUB_CATEGORY: (subCategoryId) => `${API_BASE_URL}/api/dashboard/admin/subcategories/${subCategoryId}/items/`,
    CREATE: (subCategoryId) => `${API_BASE_URL}/api/dashboard/admin/subcategories/${subCategoryId}/items/`,
    GET_SINGLE: (itemId) => `${API_BASE_URL}/api/dashboard/admin/items/${itemId}/`,
    UPDATE: (itemId) => `${API_BASE_URL}/api/dashboard/admin/items/${itemId}/`,
    DELETE: (itemId) => `${API_BASE_URL}/api/dashboard/admin/items/${itemId}/`,
  },

  // ============================================
  // Quick Speak Endpoints
  // ============================================
  QUICK_SPEAKS: {
    GET_ALL: `${API_BASE_URL}/api/dashboard/admin/quickspeaks/`,
    CREATE: `${API_BASE_URL}/api/dashboard/admin/quickspeaks/`,
    GET_SINGLE: (id) => `${API_BASE_URL}/api/dashboard/admin/quickspeaks/${id}/`,
    UPDATE: (id) => `${API_BASE_URL}/api/dashboard/admin/quickspeaks/${id}/`,
    DELETE: (id) => `${API_BASE_URL}/api/dashboard/admin/quickspeaks/${id}/`,
  },

  // ============================================
  // Events Management Endpoints
  // ============================================
  EVENTS: {
    GET_PROPOSALS: `${API_BASE_URL}/api/shopadmin/admin/events/proposals/`,
    GET_DETAILS: (eventId) => `${API_BASE_URL}/api/shopadmin/admin/events/${eventId}/`,
    APPROVE_REJECT: (eventId) => `${API_BASE_URL}/api/shopadmin/admin/events/${eventId}/approve-reject/`,
  },

  // ============================================
  // Legal / Settings Endpoints (generic/core)
  // ============================================
  LEGAL: {
    GET_SETTINGS: `${API_BASE_URL}/api/core/settings/`,
    UPDATE_SETTING: (slug) => `${API_BASE_URL}/api/core/settings/${slug}/`,
  },

  // ============================================
  // Settings Endpoints
  // ============================================
  SETTINGS: {
    GET_ALL: `${API_BASE_URL}/api/settings/`,
    PRIVACY_POLICY: `${API_BASE_URL}/api/settings/privacy-policy/`,
    TERMS_AND_CONDITIONS: `${API_BASE_URL}/api/settings/terms-and-conditions/`,
    ABOUT_US: `${API_BASE_URL}/api/settings/about-us/`,
    UPDATE: (type) => `${API_BASE_URL}/api/settings/update/${type}/`,
  },

  // ============================================
  // FAQ Endpoints
  // ============================================
  FAQ: {
    GET_ALL: `${API_BASE_URL}/api/settings/faq/`,
    CREATE: `${API_BASE_URL}/api/settings/faq/`,
    UPDATE: (id) => `${API_BASE_URL}/api/settings/faq/${id}/`,
    DELETE: (id) => `${API_BASE_URL}/api/settings/faq/${id}/`,
  },
};

// ============================================
// HTTP Status Codes
// ============================================
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
};

// ============================================
// API Error Messages
// ============================================
export const API_ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection.",
  UNAUTHORIZED: "Session expired. Please login again.",
  FORBIDDEN: "You don't have permission to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  SERVER_ERROR: "Server error. Please try again later.",
  VALIDATION_ERROR: "Please check your input and try again.",
  NO_TOKEN: "No authentication token found. Please login.",
  FILE_TOO_LARGE: "File size exceeds the limit.",
  INVALID_FILE_TYPE: "Invalid file type. Please check the supported formats.",
};

export default API_BASE_URL;