// ============================================
// FILE: lib/subCategoriesApiClient.js
// Purpose: Sub-Categories API client functions
// ============================================

import { API_ENDPOINTS } from "./api";

const getToken = () => {
  if (typeof document === "undefined") return null;
  const tokenCookie = document.cookie.split('; ').find(row => row.startsWith('token='));
  return tokenCookie ? tokenCookie.substring(6) : null;
};

const parseResponseSafely = async (response) => {
  try {
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      return { success: false, message: `Invalid response format. Got: ${contentType || 'unknown'}`, data: null, isNetworkError: true };
    }
    return await response.json();
  } catch (error) {
    return { success: false, message: `Failed to parse server response: ${error.message}`, data: null, isNetworkError: true };
  }
};

/**
 * Fetch ONE page of sub-categories (across all main categories, flat list),
 * using the global paginated endpoint:
 *   GET https://api.chatterbeeapp.com/api/dashboard/admin/subcategories
 * Response shape: { data: { total_count, total_pages, page, page_size, sub_categories: [...] } }
 *
 * Matches the same shape/usage as getAllRootCategories({ page, page_size }):
 * returns { success, data: subCategories[], pagination: { totalCount, totalPages, currentPage, pageSize }, message }
 */
export const getAllSubCategories = async ({ page = 1, page_size = 10 } = {}) => {
  const token = getToken();
  if (!token) {
    return {
      success: false,
      data: [],
      pagination: { totalCount: 0, totalPages: 0, currentPage: page, pageSize: page_size },
      message: "No authentication token found.",
      isAuthError: true,
    };
  }

  try {
    const url = `${API_ENDPOINTS.SUB_CATEGORIES.GET_ALL}?page=${page}&page_size=${page_size}`;
    const response = await fetch(url, {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
    });
    const result = await parseResponseSafely(response);

    if (!response.ok) {
      return {
        success: false,
        data: [],
        pagination: { totalCount: 0, totalPages: 0, currentPage: page, pageSize: page_size },
        message: result.message || `Failed to fetch sub-categories (${response.status})`,
        statusCode: response.status,
      };
    }

    const payload = result.data || {};
    return {
      success: true,
      data: payload.sub_categories || [],
      pagination: {
        totalCount: payload.total_count || 0,
        totalPages: payload.total_pages || 0,
        currentPage: payload.page || page,
        pageSize: payload.page_size || page_size,
      },
      message: result.message || "Sub-categories fetched successfully",
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      pagination: { totalCount: 0, totalPages: 0, currentPage: page, pageSize: page_size },
      message: `Network error: ${error.message}`,
      isNetworkError: true,
    };
  }
};

export const getSubCategoriesByParent = async (categoryId) => {
  const token = getToken();
  if (!token) return { success: false, data: [], message: "No authentication token found.", isAuthError: true };
  if (!categoryId) return { success: false, data: [], message: "Category ID is required" };

  try {
    const response = await fetch(API_ENDPOINTS.SUB_CATEGORIES.GET_BY_PARENT(categoryId), {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
    });
    const data = await parseResponseSafely(response);
    if (!response.ok) return { success: false, data: [], message: data.message || `Failed to fetch sub-categories (${response.status})`, statusCode: response.status };
    return { success: true, data: data.data || [], message: data.message || "Sub-categories fetched successfully" };
  } catch (error) {
    return { success: false, data: [], message: `Network error: ${error.message}`, isNetworkError: true };
  }
};

export const getSingleSubCategory = async (subCategoryId) => {
  const token = getToken();
  if (!token) return { success: false, data: null, message: "No authentication token found", isAuthError: true };
  if (!subCategoryId) return { success: false, data: null, message: "Sub-Category ID is required" };

  try {
    const response = await fetch(API_ENDPOINTS.SUB_CATEGORIES.GET_SINGLE(subCategoryId), {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
    });
    const data = await parseResponseSafely(response);
    if (!response.ok) return { success: false, data: null, message: data.message || `Failed to fetch sub-category (${response.status})`, statusCode: response.status };
    return { success: true, data: data.data || null, message: data.message || "Sub-category fetched successfully" };
  } catch (error) {
    return { success: false, data: null, message: `Network error: ${error.message}`, isNetworkError: true };
  }
};

export const createSubCategory = async (
  categoryId,
  name,
  color = "#FF5733",
  imageFile = null,
  audioFile = null,
  isActive = true,
  lang = "en",
  buddyMode = false
) => {
  const token = getToken();
  if (!token) return { success: false, data: null, message: "No authentication token found", isAuthError: true };
  if (!categoryId) return { success: false, data: null, message: "Category ID is required" };
  if (!name || !name.trim()) return { success: false, data: null, message: "Sub-category name is required" };

  try {
    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("color", color);
    formData.append("is_active", isActive);
    formData.append("lang", lang);
    formData.append("buddy_mode", buddyMode);

    if (imageFile) {
      if (imageFile.size > 5 * 1024 * 1024) return { success: false, data: null, message: "Image file size must be less than 5MB" };
      formData.append("image_icon", imageFile);
    }
    if (audioFile) {
      if (audioFile.size > 10 * 1024 * 1024) return { success: false, data: null, message: "Audio file size must be less than 10MB" };
      formData.append("speak", audioFile);
    }

    const response = await fetch(API_ENDPOINTS.SUB_CATEGORIES.CREATE(categoryId), {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` },
      body: formData
    });
    const data = await parseResponseSafely(response);
    if (!response.ok) return { success: false, data: null, message: data.message || `Failed to create sub-category (${response.status})`, statusCode: response.status };
    return { success: true, data: data.data || null, message: data.message || "Sub-category created successfully" };
  } catch (error) {
    return { success: false, data: null, message: `Network error: ${error.message}`, isNetworkError: true };
  }
};

export const updateSubCategory = async (
  subCategoryId,
  name,
  color = "#FF5733",
  imageFile = null,
  audioFile = null,
  isActive = true,
  lang = "en",
  buddyMode = false
) => {
  const token = getToken();
  if (!token) return { success: false, data: null, message: "No authentication token found", isAuthError: true };
  if (!subCategoryId) return { success: false, data: null, message: "Sub-Category ID is required" };
  if (!name || !name.trim()) return { success: false, data: null, message: "Sub-category name is required" };

  try {
    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("color", color);
    formData.append("is_active", isActive);
    formData.append("lang", lang);
    formData.append("buddy_mode", buddyMode);

    if (imageFile) {
      if (imageFile.size > 5 * 1024 * 1024) return { success: false, data: null, message: "Image file size must be less than 5MB" };
      formData.append("image_icon", imageFile);
    }
    if (audioFile) {
      if (audioFile.size > 10 * 1024 * 1024) return { success: false, data: null, message: "Audio file size must be less than 10MB" };
      formData.append("speak", audioFile);
    }

    const response = await fetch(API_ENDPOINTS.SUB_CATEGORIES.UPDATE(subCategoryId), {
      method: "PUT",
      headers: { "Authorization": `Bearer ${token}` },
      body: formData
    });
    const data = await parseResponseSafely(response);
    if (!response.ok) return { success: false, data: null, message: data.message || `Failed to update sub-category (${response.status})`, statusCode: response.status };
    return { success: true, data: data.data || null, message: data.message || "Sub-category updated successfully" };
  } catch (error) {
    return { success: false, data: null, message: `Network error: ${error.message}`, isNetworkError: true };
  }
};

export const deleteSubCategory = async (subCategoryId) => {
  const token = getToken();
  if (!token) return { success: false, message: "No authentication token found", isAuthError: true };
  if (!subCategoryId) return { success: false, message: "Sub-Category ID is required" };

  try {
    const response = await fetch(API_ENDPOINTS.SUB_CATEGORIES.DELETE(subCategoryId), {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
    });
    if (response.status === 204) return { success: true, message: "Sub-category deleted successfully" };
    const data = await parseResponseSafely(response);
    if (!response.ok) return { success: false, message: data.message || `Failed to delete sub-category (${response.status})`, statusCode: response.status };
    return { success: true, message: data.message || "Sub-category deleted successfully" };
  } catch (error) {
    return { success: false, message: `Network error: ${error.message}`, isNetworkError: true };
  }
};

export const searchSubCategories = (subCategories, searchQuery) => {
  if (!searchQuery || !searchQuery.trim()) return subCategories;
  const query = searchQuery.toLowerCase().trim();
  return subCategories.filter(sc => {
    const name = sc.translations?.en?.name || sc.translations?.es?.name || "";
    return name.toLowerCase().includes(query);
  });
};

export const getSubCategoriesSummary = (subCategories) => ({
  total: subCategories.length,
  active: subCategories.filter(sc => sc.is_active).length,
  inactive: subCategories.filter(sc => !sc.is_active).length,
  totalItems: subCategories.reduce((sum, sc) => sum + (sc.items_count || 0), 0)
});

export const formatSubCategory = (subCategory, lang = "en") => {
  const name = subCategory.translations?.[lang]?.name || subCategory.translations?.en?.name || "Unnamed Sub-Category";
  return {
    ...subCategory,
    formattedName: name,
    displayColor: subCategory.color || "#FF5733",
    statusBadge: subCategory.is_active ? "Active" : "Inactive",
    statusColor: subCategory.is_active ? "green" : "gray",
    hasImage: !!subCategory.image_icon,
    hasAudio: !!(subCategory.translations?.[lang]?.speak),
    itemsText: `${subCategory.items_count || 0} items`,
    buddyMode: subCategory.buddy_mode || false,
  };
};

export const subCategoriesApiClient = {
  getAllSubCategories, getSubCategoriesByParent, getSingleSubCategory, createSubCategory,
  updateSubCategory, deleteSubCategory, searchSubCategories,
  getSubCategoriesSummary, formatSubCategory
};

export default subCategoriesApiClient;