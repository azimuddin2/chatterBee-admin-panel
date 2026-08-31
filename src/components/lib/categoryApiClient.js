// ============================================
// FILE: lib/categoryApiClient.js
// Purpose: Category-specific API client functions
// ============================================

import { API_ENDPOINTS } from "./api";

const getToken = () => {
  if (typeof document === "undefined") return null;
  const tokenCookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('token='));
  return tokenCookie ? tokenCookie.substring(6) : null;
};

export const getAllRootCategories = async ({
  lang = "en",
  page = 1,
  page_size = 10,
} = {}) => {
  const token = getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const url =
      `${API_ENDPOINTS.CATEGORIES.GET_ALL_ROOT_CATEGORIES}` +
      `?lang=${encodeURIComponent(lang)}` +
      `&page=${page}` +
      `&page_size=${page_size}`;

    console.log("CATEGORY URL:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    console.log("CATEGORY API RESULT:", result);
    console.log("CATEGORY ARRAY:", result?.data?.categories);

    if (!response.ok) {
      throw new Error(
        result?.message || "Failed to fetch categories"
      );
    }

    return {
      success: true,
      data: result?.data?.categories || [],
      pagination: {
        totalCount: result?.data?.total_count || 0,
        totalPages: result?.data?.total_pages || 0,
        currentPage: result?.data?.page || page,
        pageSize: result?.data?.page_size || page_size,
      },
      message: result?.message || "Categories fetched successfully",
    };
  } catch (error) {
    console.error("CATEGORY ERROR:", error);

    return {
      success: false,
      data: [],
      pagination: {
        totalCount: 0,
        totalPages: 0,
        currentPage: page,
        pageSize: page_size,
      },
      message: error?.message || "Failed to fetch categories",
    };
  }
};

export const getSingleCategory = async (categoryId) => {
  const token = getToken();
  if (!token) throw new Error("No authentication token found");
  if (!categoryId) throw new Error("Category ID is required");

  try {
    const response = await fetch(API_ENDPOINTS.CATEGORIES.GET_SINGLE_CATEGORY(categoryId), {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to fetch category");
    return { success: true, data: data.data || null, message: data.message || "Category fetched successfully" };
  } catch (error) {
    return { success: false, data: null, message: error.message || "Failed to fetch category" };
  }
};

/**
 * Create new root category
 * @param {string} name - Category name
 * @param {string} color - Hex color
 * @param {File} imageFile - Image file (optional)
 * @param {File} audioFile - Audio file (optional)
 * @param {boolean} isActive - Active status
 * @param {string} lang - Language code: "en" | "es"
 * @param {boolean} buddyMode - Buddy mode toggle
 */
export const createCategory = async (
  name,
  color = "#FF5733",
  imageFile = null,
  audioFile = null,
  isActive = true,
  lang = "en",
  buddyMode = false
) => {
  const token = getToken();
  if (!token) throw new Error("No authentication token found");
  if (!name || !name.trim()) throw new Error("Category name is required");

  try {
    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("color", color);
    formData.append("is_active", isActive);
    formData.append("lang", lang);
    formData.append("buddy_mode", buddyMode);

    if (imageFile) {
      if (imageFile.size > 5 * 1024 * 1024) throw new Error("Image file size must be less than 5MB");
      formData.append("image_icon", imageFile);
    }
    if (audioFile) {
      if (audioFile.size > 10 * 1024 * 1024) throw new Error("Audio file size must be less than 10MB");
      formData.append("speak", audioFile);
    }

    const response = await fetch(API_ENDPOINTS.CATEGORIES.CREATE_ROOT_CATEGORY, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` },
      body: formData
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to create category");
    return { success: true, data: data.data || null, message: data.message || "Category created successfully" };
  } catch (error) {
    return { success: false, data: null, message: error.message || "Failed to create category" };
  }
};

/**
 * Update existing category
 * @param {number} categoryId
 * @param {string} name
 * @param {string} color
 * @param {File} imageFile
 * @param {File} audioFile
 * @param {boolean} isActive
 * @param {string} lang - "en" | "es"
 * @param {boolean} buddyMode
 */
export const updateCategory = async (
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
  if (!token) throw new Error("No authentication token found");
  if (!categoryId) throw new Error("Category ID is required");
  if (!name || !name.trim()) throw new Error("Category name is required");

  try {
    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("color", color);
    formData.append("is_active", isActive);
    formData.append("lang", lang);
    formData.append("buddy_mode", buddyMode);

    if (imageFile) {
      if (imageFile.size > 5 * 1024 * 1024) throw new Error("Image file size must be less than 5MB");
      formData.append("image_icon", imageFile);
    }
    if (audioFile) {
      if (audioFile.size > 10 * 1024 * 1024) throw new Error("Audio file size must be less than 10MB");
      formData.append("speak", audioFile);
    }

    const response = await fetch(API_ENDPOINTS.CATEGORIES.UPDATE_CATEGORY(categoryId), {
      method: "PUT",
      headers: { "Authorization": `Bearer ${token}` },
      body: formData
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to update category");
    return { success: true, data: data.data || null, message: data.message || "Category updated successfully" };
  } catch (error) {
    return { success: false, data: null, message: error.message || "Failed to update category" };
  }
};

export const deleteCategory = async (categoryId) => {
  const token = getToken();
  if (!token) throw new Error("No authentication token found");
  if (!categoryId) throw new Error("Category ID is required");

  try {
    const response = await fetch(API_ENDPOINTS.CATEGORIES.DELETE_CATEGORY(categoryId), {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
    });
    if (response.status === 204) return { success: true, message: "Category deleted successfully" };
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to delete category");
    return { success: true, message: data.message || "Category deleted successfully" };
  } catch (error) {
    return { success: false, message: error.message || "Failed to delete category" };
  }
};

/**
 * Helper: get display name from translations object
 * Prefers "en", falls back to first available lang
 */
export const getTranslatedName = (translations, lang = "en") => {
  if (!translations) return "";
  if (translations[lang]?.name) return translations[lang].name;
  const firstLang = Object.keys(translations)[0];
  return translations[firstLang]?.name || "";
};

export const searchCategories = (categories, searchQuery) => {
  if (!searchQuery || !searchQuery.trim()) return categories;
  const query = searchQuery.toLowerCase().trim();
  return categories.filter(category => {
    const name = getTranslatedName(category.translations);
    return name.toLowerCase().includes(query);
  });
};

export const sortCategories = (categories, field = "name", order = "asc") => {
  const sorted = [...categories].sort((a, b) => {
    const valueA = a[field];
    const valueB = b[field];
    if (typeof valueA === "string") {
      return order === "asc" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
    }
    return order === "asc" ? valueA - valueB : valueB - valueA;
  });
  return sorted;
};

export const getCategoriesSummary = (categories) => ({
  total: categories.length,
  active: categories.filter(c => c.is_active).length,
  inactive: categories.filter(c => !c.is_active).length,
  deleted: categories.filter(c => c.is_deleted).length,
  totalSubCategories: categories.reduce((sum, c) => sum + (c.sub_categories_count || 0), 0)
});

export const formatCategory = (category, lang = "en") => {
  const name = getTranslatedName(category.translations, lang);
  return {
    ...category,
    formattedName: name || "Unnamed Category",
    displayColor: category.color || "#FF5733",
    statusBadge: category.is_active ? "Active" : "Inactive",
    statusColor: category.is_active ? "green" : "gray",
    hasImage: !!category.image_icon,
    hasAudio: !!(category.translations?.[lang]?.speak),
    subCategoriesText: `${category.sub_categories_count || 0} sub-categories`,
    buddyMode: category.buddy_mode || false,
  };
};

export const categoryApiClient = {
  getAllRootCategories, getSingleCategory, createCategory, updateCategory,
  deleteCategory, searchCategories, sortCategories, getCategoriesSummary,
  formatCategory, getTranslatedName
};

export default categoryApiClient;