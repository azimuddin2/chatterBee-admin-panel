"use client";
import { API_ENDPOINTS } from '@/components/lib/api';
import { getToken } from '@/components/lib/authHelpers'; // adjust import path if different in your project

// ─── FETCH ALL SUB-CATEGORIES (flat, across all main categories, paginated) ──
// The API returns: { data: { total_count, total_pages, page, page_size, sub_categories: [...] } }
// This walks every page and concatenates sub_categories into one flat array.
export const getAllSubCategories = async () => {
  const token = getToken();
  if (!token) throw new Error("No authentication token found");

  try {
    let page = 1;
    const pageSize = 100;
    let allSubCategories = [];
    let totalPages = 1;

    do {
      const url = API_ENDPOINTS.SUB_CATEGORIES.GET_ALL(page, pageSize);
      const response = await fetch(url, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || "Failed to fetch sub-categories");

      const payload = json.data || {};
      allSubCategories = allSubCategories.concat(payload.sub_categories || []);
      totalPages = payload.total_pages || 1;
      page += 1;
    } while (page <= totalPages);

    return { success: true, data: allSubCategories, message: "Sub-categories fetched successfully" };
  } catch (error) {
    return { success: false, data: [], message: error.message || "Failed to fetch sub-categories" };
  }
};

// ─── FETCH SUB-CATEGORIES FOR ONE MAIN CATEGORY ──────────────────────────────
export const getSubCategoriesByParent = async (categoryId) => {
  const token = getToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const url = API_ENDPOINTS.SUB_CATEGORIES.GET_BY_PARENT(categoryId);
    const response = await fetch(url, {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json.message || "Failed to fetch sub-categories");

    // Handle both flat-array and { sub_categories: [...] } shapes defensively
    const data = Array.isArray(json.data) ? json.data : (json.data?.sub_categories || []);
    return { success: true, data, message: "Sub-categories fetched successfully" };
  } catch (error) {
    return { success: false, data: [], message: error.message || "Failed to fetch sub-categories" };
  }
};

// ─── CREATE SUB-CATEGORY ──────────────────────────────────────────────────────
export const createSubCategory = async (parentCategoryId, name, color, iconFile, audioFile, isActive, lang, buddyMode) => {
  const token = getToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const url = API_ENDPOINTS.SUB_CATEGORIES.CREATE(parentCategoryId);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('lang', lang);
    formData.append('color', color);
    formData.append('is_active', isActive);
    formData.append('buddy_mode', buddyMode);
    if (iconFile) formData.append('image_icon', iconFile);
    if (audioFile) formData.append('speak_audio', audioFile);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` }, // no Content-Type: browser sets multipart boundary
      body: formData
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json.message || "Failed to create sub-category");
    return { success: true, data: json.data, message: json.message || "Sub-category created successfully" };
  } catch (error) {
    return { success: false, data: null, message: error.message || "Failed to create sub-category" };
  }
};

// ─── UPDATE SUB-CATEGORY ──────────────────────────────────────────────────────
export const updateSubCategory = async (subCategoryId, name, color, iconFile, audioFile, isActive, lang, buddyMode) => {
  const token = getToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const url = API_ENDPOINTS.SUB_CATEGORIES.UPDATE(subCategoryId);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('lang', lang);
    formData.append('color', color);
    formData.append('is_active', isActive);
    formData.append('buddy_mode', buddyMode);
    if (iconFile) formData.append('image_icon', iconFile);
    if (audioFile) formData.append('speak_audio', audioFile);

    const response = await fetch(url, {
      method: "PUT",
      headers: { "Authorization": `Bearer ${token}` },
      body: formData
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json.message || "Failed to update sub-category");
    return { success: true, data: json.data, message: json.message || "Sub-category updated successfully" };
  } catch (error) {
    return { success: false, data: null, message: error.message || "Failed to update sub-category" };
  }
};

// ─── DELETE SUB-CATEGORY ──────────────────────────────────────────────────────
export const deleteSubCategory = async (subCategoryId) => {
  const token = getToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const url = API_ENDPOINTS.SUB_CATEGORIES.DELETE(subCategoryId);
    const response = await fetch(url, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
    });
    if (response.status === 204) {
      return { success: true, message: "Sub-category deleted successfully" };
    }
    const json = await response.json();
    if (!response.ok) throw new Error(json.message || "Failed to delete sub-category");
    return { success: true, message: json.message || "Sub-category deleted successfully" };
  } catch (error) {
    return { success: false, message: error.message || "Failed to delete sub-category" };
  }
};