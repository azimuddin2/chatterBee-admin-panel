// ============================================
// FILE: lib/categoryItemsApiClient.js
// Purpose: Category Items/Buttons API client functions
// ============================================

import { API_ENDPOINTS } from "./api";

const getToken = () => {
  if (typeof document === "undefined") return null;
  const tokenCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="));
  return tokenCookie ? tokenCookie.substring(6) : null;
};

const parseResponseSafely = async (response) => {
  try {
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      return {
        success: false,
        message: `Invalid response format. Got: ${contentType || "unknown"}`,
        data: null,
        isNetworkError: true,
      };
    }
    return await response.json();
  } catch (error) {
    return {
      success: false,
      message: `Failed to parse server response: ${error.message}`,
      data: null,
      isNetworkError: true,
    };
  }
};

/**
 * Fetch ONE page of items (across all sub-categories, flat list), using the
 * global paginated endpoint:
 *   GET https://api.chatterbeeapp.com/api/dashboard/admin/items/
 * Response shape: { data: { total_count, total_pages, page, page_size, items: [...] } }
 *
 * Matches the same shape/usage as getAllRootCategories({ page, page_size }):
 * returns { success, data: items[], pagination: { totalCount, totalPages, currentPage, pageSize }, message }
 */
export const getAllItems = async ({ page = 1, page_size = 10 } = {}) => {
  const token = getToken();
  if (!token) {
    return {
      success: false,
      data: [],
      pagination: {
        totalCount: 0,
        totalPages: 0,
        currentPage: page,
        pageSize: page_size,
      },
      message: "No authentication token found.",
      isAuthError: true,
    };
  }

  try {
    const url = `${API_ENDPOINTS.CATEGORY_ITEMS.GET_ALL}?page=${page}&page_size=${page_size}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const result = await parseResponseSafely(response);

    if (!response.ok) {
      return {
        success: false,
        data: [],
        pagination: {
          totalCount: 0,
          totalPages: 0,
          currentPage: page,
          pageSize: page_size,
        },
        message: result.message || `Failed to fetch items (${response.status})`,
        statusCode: response.status,
      };
    }

    const payload = result.data || {};
    return {
      success: true,
      data: payload.items || [],
      pagination: {
        totalCount: payload.total_count || 0,
        totalPages: payload.total_pages || 0,
        currentPage: payload.page || page,
        pageSize: payload.page_size || page_size,
      },
      message: result.message || "Items fetched successfully",
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      pagination: {
        totalCount: 0,
        totalPages: 0,
        currentPage: page,
        pageSize: page_size,
      },
      message: `Network error: ${error.message}`,
      isNetworkError: true,
    };
  }
};

export const getItemsBySubCategory = async (subCategoryId) => {
  const token = getToken();
  if (!token)
    return {
      success: false,
      data: [],
      message: "No authentication token found.",
      isAuthError: true,
    };
  if (!subCategoryId)
    return { success: false, data: [], message: "Sub-Category ID is required" };

  try {
    const response = await fetch(
      API_ENDPOINTS.CATEGORY_ITEMS.GET_BY_SUB_CATEGORY(subCategoryId),
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    const data = await parseResponseSafely(response);
    if (!response.ok)
      return {
        success: false,
        data: [],
        message: data.message || `Failed to fetch items (${response.status})`,
        statusCode: response.status,
      };
    return {
      success: true,
      data: data.data || [],
      message: data.message || "Items fetched successfully",
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      message: `Network error: ${error.message}`,
      isNetworkError: true,
    };
  }
};

export const getSingleItem = async (itemId) => {
  const token = getToken();
  if (!token)
    return {
      success: false,
      data: null,
      message: "No authentication token found",
      isAuthError: true,
    };
  if (!itemId)
    return { success: false, data: null, message: "Item ID is required" };

  try {
    const response = await fetch(
      API_ENDPOINTS.CATEGORY_ITEMS.GET_SINGLE(itemId),
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    const data = await parseResponseSafely(response);
    if (!response.ok)
      return {
        success: false,
        data: null,
        message: data.message || `Failed to fetch item (${response.status})`,
        statusCode: response.status,
      };
    return {
      success: true,
      data: data.data || null,
      message: data.message || "Item fetched successfully",
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      message: `Network error: ${error.message}`,
      isNetworkError: true,
    };
  }
};

export const createItem = async (
  subCategoryId,
  word,
  speakAs = "",
  color = "#FFD700",
  imageFile = null,
  audioFile = null,
  isActive = true,
  lang = "en",
  buddyMode = false,
) => {
  const token = getToken();
  if (!token)
    return {
      success: false,
      data: null,
      message: "No authentication token found",
      isAuthError: true,
    };

  if (!word || !word.trim())
    return {
      success: false,
      data: null,
      message: "Item/Button word is required",
    };

  try {
    const formData = new FormData();
    formData.append("word", word.trim());
    formData.append("color", color);
    formData.append("is_active", isActive);
    formData.append("lang", lang);
    formData.append("buddy_mode", buddyMode);
    if (speakAs && speakAs.trim()) formData.append("speak_as", speakAs.trim());

    if (imageFile) {
      if (imageFile.size > 5 * 1024 * 1024)
        return {
          success: false,
          data: null,
          message: "Image file size must be less than 5MB",
        };
      formData.append("image_icon", imageFile);
    }
    if (audioFile) {
      if (audioFile.size > 10 * 1024 * 1024)
        return {
          success: false,
          data: null,
          message: "Audio file size must be less than 10MB",
        };
      formData.append("speak", audioFile);
    }

    const response = await fetch(
      API_ENDPOINTS.CATEGORY_ITEMS.CREATE(subCategoryId),
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      },
    );
    const data = await parseResponseSafely(response);
    if (!response.ok)
      return {
        success: false,
        data: null,
        message: data.message || `Failed to create item (${response.status})`,
        statusCode: response.status,
      };
    return {
      success: true,
      data: data.data || null,
      message: data.message || "Item created successfully",
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      message: `Network error: ${error.message}`,
      isNetworkError: true,
    };
  }
};

// categoryItemsApiClient.js e purono `updateItem` er jaygay eta boshan.
// getToken, API_ENDPOINTS, parseResponseSafely agei file e ache, tai import lagbe na.

// TEST: backend kon nam e category nei seta jani na, tai sob nam e pathacchi.
// Kaj korar por Network tab e dekhe ekta nam rekhe baki gulo muche din.
const CATEGORY_FIELD_NAMES = [
  "category",
  "category_id",
  "sub_category",
  "sub_category_id",
];



// categoryItemsApiClient.js e purono `updateItem` er jaygay eta boshan.

export const updateItem = async (
  itemId,
  word,
  speakAs = "",
  color = "#FFD700",
  imageFile = null,
  audioFile = null,
  isActive = true,
  lang = "en",
  buddyMode = false,
  categoryId = null, // Sub-category ID (optional)
  mainCategoryId = null, // Main category ID
) => {
  const token = getToken();

  if (!token) {
    return {
      success: false,
      data: null,
      message: "No authentication token found",
      isAuthError: true,
    };
  }

  if (!itemId) {
    return {
      success: false,
      data: null,
      message: "Item ID is required",
    };
  }

  if (!word?.trim()) {
    return {
      success: false,
      data: null,
      message: "Item word is required",
    };
  }

  try {
    const formData = new FormData();

    // Basic fields
    formData.append("word", word.trim());
    formData.append("color", color);
    formData.append("is_active", String(isActive));
    formData.append("lang", lang);
    formData.append("buddy_mode", String(buddyMode));

    if (speakAs?.trim()) {
      formData.append("speak_as", speakAs.trim());
    }

    // ── Category ──
    // Backend e `category` hocche item er sobcheye gobhir parent:
    //   sub-category thakle seta, na thakle main category.
    const hasSub = categoryId !== null && categoryId !== undefined;
    // Main category shudhu number hole pathabo (naam hole backend bujhbe na)
    const hasMain =
      mainCategoryId !== null &&
      mainCategoryId !== undefined &&
      /^\d+$/.test(String(mainCategoryId));

    if (hasSub) {
      // Sub-category select kora: category = sub-category
      formData.append("category", String(categoryId));
    } else if (hasMain) {
      // Sub-category nai: category = main category.
      // Eta na pathale item e age theke thaka purono sub-category theke jay.
      formData.append("category", String(mainCategoryId));
      formData.append("main_category_id", String(mainCategoryId));
    }

    // Image validation
    if (imageFile) {
      if (imageFile.size > 5 * 1024 * 1024) {
        return {
          success: false,
          data: null,
          message: "Image file size must be less than 5MB",
        };
      }

      formData.append("image_icon", imageFile);
    }

    // Audio validation
    if (audioFile) {
      if (audioFile.size > 10 * 1024 * 1024) {
        return {
          success: false,
          data: null,
          message: "Audio file size must be less than 10MB",
        };
      }

      formData.append("speak", audioFile);
    }

    // Debug payload (kaj shesh hole muche din)
    console.log("UPDATE ITEM PAYLOAD:");

    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }

    const response = await fetch(API_ENDPOINTS.CATEGORY_ITEMS.UPDATE(itemId), {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await parseResponseSafely(response);

    console.log("UPDATE ITEM RESPONSE:", data);

    if (!response.ok) {
      return {
        success: false,
        data: null,
        message: data?.message || `Failed to update item (${response.status})`,
        statusCode: response.status,
      };
    }

    return {
      success: true,
      data: data?.data ?? data,
      message: data?.message || "Item updated successfully",
    };
  } catch (error) {
    console.error("UPDATE ITEM ERROR:", error);

    return {
      success: false,
      data: null,
      message: error.message || "Network error",
      isNetworkError: true,
    };
  }
};


export const deleteItem = async (itemId) => {
  const token = getToken();
  if (!token)
    return {
      success: false,
      message: "No authentication token found",
      isAuthError: true,
    };
  if (!itemId) return { success: false, message: "Item ID is required" };

  try {
    const response = await fetch(API_ENDPOINTS.CATEGORY_ITEMS.DELETE(itemId), {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (response.status === 204)
      return { success: true, message: "Item deleted successfully" };
    const data = await parseResponseSafely(response);
    if (!response.ok)
      return {
        success: false,
        message: data.message || `Failed to delete item (${response.status})`,
        statusCode: response.status,
      };
    return {
      success: true,
      message: data.message || "Item deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: `Network error: ${error.message}`,
      isNetworkError: true,
    };
  }
};

export const searchItems = (items, searchQuery) => {
  if (!searchQuery || !searchQuery.trim()) return items;
  const query = searchQuery.toLowerCase().trim();
  return items.filter((item) => {
    const word =
      item.translations?.en?.word ||
      item.translations?.es?.word ||
      item.word ||
      "";
    return word.toLowerCase().includes(query);
  });
};

export const sortItems = (items, field = "word", order = "asc") => {
  const sorted = [...items].sort((a, b) => {
    const valueA = a[field];
    const valueB = b[field];
    if (typeof valueA === "string") {
      return order === "asc"
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }
    return order === "asc" ? valueA - valueB : valueB - valueA;
  });
  return sorted;
};

export const getItemsSummary = (items) => ({
  total: items.length,
  active: items.filter((i) => i.is_active).length,
  inactive: items.filter((i) => !i.is_active).length,
  withAudio: items.filter(
    (i) => !!(i.translations?.en?.speak || i.translations?.es?.speak),
  ).length,
  withImage: items.filter((i) => !!i.image_icon).length,
});

export const formatItem = (item, lang = "en") => {
  const translation = item.translations?.[lang] || item.translations?.en || {};
  const word = translation.word || item.word || "Unnamed Item";
  const audioUrl = translation.speak || null;
  return {
    ...item,
    word,
    formattedWord: word,
    displayColor: item.color || "#FFD700",
    statusBadge: item.is_active ? "Active" : "Inactive",
    statusColor: item.is_active ? "green" : "gray",
    hasImage: !!item.image_icon,
    hasAudio: !!audioUrl,
    audioUrl,
    speakText: audioUrl ? "Custom audio" : "TTS (device)",
    buddyMode: item.buddy_mode || false,
  };
};

export const categoryItemsApiClient = {
  getAllItems,
  getItemsBySubCategory,
  getSingleItem,
  createItem,
  updateItem,
  deleteItem,
  searchItems,
  sortItems,
  getItemsSummary,
  formatItem,
};

export default categoryItemsApiClient;
