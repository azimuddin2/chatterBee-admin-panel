"use client";
import { getAllRootCategories } from '@/components/lib/categoryApiClient';

/**
 * Fetches all root categories (with nested sub_categories/items) from the API.
 * Thin wrapper around categoryApiClient.getAllRootCategories so callers in
 * this folder don't need to know the underlying client's import path.
 *
 * @returns {Promise<{success: boolean, data: Array, message: string}>}
 */
export const fetchRootCategories = async () => {
  return getAllRootCategories();
};

/**
 * Gets the display name of a category (or sub-category/item) for a given
 * language, falling back to English, then any available translation,
 * then a placeholder if nothing is found.
 *
 * @param {Object} category - category/sub_category/item object with a `translations` map
 * @param {string} [lang='en'] - preferred language code, e.g. 'en' | 'es'
 * @returns {string}
 */
export const getCatName = (category, lang = 'en') => {
  if (!category || !category.translations) return 'Untitled';

  const translations = category.translations;

  if (translations[lang]?.name) {
    return translations[lang].name;
  }

  if (translations.en?.name) {
    return translations.en.name;
  }

  const firstAvailable = Object.values(translations).find((t) => t?.name);
  return firstAvailable?.name || 'Untitled';
};
