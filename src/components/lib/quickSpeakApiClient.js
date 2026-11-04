// ============================================
// FILE: lib/quickSpeakApiClient.js
// Purpose: Quick Speak API Client Functions
// ============================================

import { API_ENDPOINTS } from "./api";
import { getToken } from "./apiClient";

// ============================================
// Helper: Build Auth Headers
// ============================================
const getAuthHeaders = () => {
  const token = getToken();
  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

// ============================================
// Get All Quick Speaks
// GET /api/dashboard/admin/quickspeaks/
// ============================================
export const getAllQuickSpeaks = async () => {
  try {
    const response = await fetch(API_ENDPOINTS.QUICK_SPEAKS.GET_ALL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || `HTTP ${response.status}`,
        data: [],
      };
    }

    return {
      success: true,
      data: data.data || [],
      message: data.message || "Quick speaks retrieved successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Network error. Please check your connection.",
      data: [],
    };
  }
};

// ============================================
// Get Single Quick Speak
// GET /api/dashboard/admin/quickspeaks/{id}/
// ============================================
export const getSingleQuickSpeak = async (id) => {
  try {
    const response = await fetch(API_ENDPOINTS.QUICK_SPEAKS.GET_SINGLE(id), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || `HTTP ${response.status}`,
        data: null,
      };
    }

    return {
      success: true,
      data: data.data || null,
      message: data.message || "Success",
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Network error. Please check your connection.",
      data: null,
    };
  }
};

// ============================================
// Create Quick Speak
// POST /api/dashboard/admin/quickspeaks/
// Body: form-data { word, color, order, is_active, image_icon (File), speak (File) }
// ============================================
export const createQuickSpeak = async (
  word,
  color,
  order,
  isActive,
  imageIcon,
  speak,
) => {
  try {
    const formData = new FormData();
    formData.append("word", word);
    formData.append("color", color);
    formData.append("order", order);
    formData.append("is_active", isActive);

    if (imageIcon) {
      formData.append("image_icon", imageIcon);
    }
    if (speak) {
      formData.append("speak", speak);
    }

    const response = await fetch(API_ENDPOINTS.QUICK_SPEAKS.CREATE, {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
        // Do NOT set Content-Type for FormData — browser sets it with boundary
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || `HTTP ${response.status}`,
        data: null,
      };
    }

    return {
      success: true,
      data: data.data || null,
      message: data.message || "Quick speak created successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Network error. Please check your connection.",
      data: null,
    };
  }
};

// ============================================
// Update Quick Speak
// PUT /api/dashboard/admin/quickspeaks/{id}/
// Body: form-data { word, color, order, is_active, image_icon (File), speak (File) }
// ============================================
export const updateQuickSpeak = async (
  id,
  word,
  color,
  order,
  isActive,
  imageIcon,
  speak,
) => {
  try {
    const formData = new FormData();
    formData.append("word", word);
    formData.append("color", color);
    formData.append("order", order);
    formData.append("is_active", isActive);

    if (imageIcon) {
      formData.append("image_icon", imageIcon);
    }
    if (speak) {
      formData.append("speak", speak);
    }

    const response = await fetch(API_ENDPOINTS.QUICK_SPEAKS.UPDATE(id), {
      method: "PUT",
      headers: {
        ...getAuthHeaders(),
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || `HTTP ${response.status}`,
        data: null,
      };
    }

    return {
      success: true,
      data: data.data || null,
      message: data.message || "Quick speak updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Network error. Please check your connection.",
      data: null,
    };
  }
};

// ============================================
// Delete Quick Speak
// DELETE /api/dashboard/admin/quickspeaks/{id}/
// Returns 204 No Content on success
// ============================================
export const deleteQuickSpeak = async (id) => {
  try {
    const response = await fetch(API_ENDPOINTS.QUICK_SPEAKS.DELETE(id), {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    });

    // 204 No Content — success with no body
    if (response.status === 204) {
      return {
        success: true,
        message: "Quick speak deleted successfully",
      };
    }

    // Try to parse body for error messages
    let data = {};
    try {
      data = await response.json();
    } catch (_) {}

    if (!response.ok) {
      return {
        success: false,
        message: data.message || `HTTP ${response.status}`,
      };
    }

    return {
      success: true,
      message: data.message || "Quick speak deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Network error. Please check your connection.",
    };
  }
};

// ============================================
// Helper: Search Quick Speaks (client-side)
// ============================================
export const searchQuickSpeaks = (quickSpeaks, query) => {
  if (!query || !query.trim()) return quickSpeaks;
  const lower = query.toLowerCase();
  return quickSpeaks.filter(
    (qs) =>
      qs.word?.toLowerCase().includes(lower) ||
      qs.color?.toLowerCase().includes(lower),
  );
};

// ============================================
// Helper: Format Quick Speak for display
// ============================================
export const formatQuickSpeak = (quickSpeak) => {
  return {
    formattedWord: quickSpeak.word || "—",
    displayColor: quickSpeak.color || "#FFD700",
    hasImage: !!quickSpeak.image_icon,
    hasAudio: !!quickSpeak.speak,
    statusBadge: quickSpeak.is_active ? "Active" : "Inactive",
    orderDisplay: quickSpeak.order ?? "—",
  };
};

export default getAllQuickSpeaks;
