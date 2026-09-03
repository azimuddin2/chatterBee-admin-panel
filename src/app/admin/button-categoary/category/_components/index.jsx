"use client";

import {
  deleteCategory,
  getAllRootCategories,
} from "@/components/lib/categoryApiClient";

import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import toast from "react-hot-toast";

import AddCategory from "./AddCategoary";
import EditCategory from "./EditCategoary";
import CategoryList from "./Categorylist";
import LoadingPage from "@/app/admin/loading";

// ─────────────────────────────────────────────
// Plus Icon
// ─────────────────────────────────────────────

const PlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-2"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011 1z"
      clipRule="evenodd"
    />
  </svg>
);

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

export default function CategoryManagement() {
  // Categories received from API (current page only)
  const [categories, setCategories] = useState([]);

  // Current API page
  const [currentPage, setCurrentPage] = useState(1);

  // API pagination information
  const [pagination, setPagination] = useState({
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 20,
  });

  // Add / Edit / List
  const [currentView, setCurrentView] = useState("list");

  // Category being edited
  const [editingCategory, setEditingCategory] = useState(null);

  // Loading
  const [loading, setLoading] = useState(true);

  // Error
  const [error, setError] = useState("");

  // Items per API request
  const pageSize = 20;

  // ─────────────────────────────────────────────
  // Fetch Categories
  // ─────────────────────────────────────────────

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAllRootCategories({
        lang: "en",
        page: currentPage,
        page_size: pageSize,
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to load categories");
      }

      // API categories array
      setCategories(response.data || []);

      // API pagination
      setPagination(
        response.pagination || {
          totalCount: 0,
          totalPages: 0,
          currentPage,
          pageSize,
        }
      );
    } catch (err) {
      console.error("Fetch categories error:", err);
      toast.error(err?.message || "Failed to load categories");
      setCategories([]);
      setError(err?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  // ─────────────────────────────────────────────
  // Fetch whenever page changes
  // ─────────────────────────────────────────────

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // ─────────────────────────────────────────────
  // Pagination
  // ─────────────────────────────────────────────

  const handlePageChange = (page) => {
    if (loading) return;
    if (page < 1) return;
    if (pagination.totalPages > 0 && page > pagination.totalPages) return;
    setCurrentPage(page);
  };

  // ─────────────────────────────────────────────
  // Add Category
  // ─────────────────────────────────────────────

  const handleAddCategory = () => {
    setCurrentView("list");
    setCurrentPage(1); // reload first page
  };

  // ─────────────────────────────────────────────
  // Update Category
  // ─────────────────────────────────────────────

  const handleUpdateCategory = () => {
    setCurrentView("list");
    setEditingCategory(null);
    fetchCategories();
  };

  // ─────────────────────────────────────────────
  // Delete Category
  // ─────────────────────────────────────────────

  const handleDeleteCategory = async (categoryId, categoryName) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${categoryName}"?`
    );
    if (!confirmed) return;

    try {
      const response = await deleteCategory(categoryId);
      if (!response.success) {
        throw new Error(response.message || "Failed to delete category");
      }

      toast.success("Category deleted");

      // If we deleted the last category on this page (and it's not page 1),
      // step back a page so we don't land on an empty page.
      if (categories.length === 1 && currentPage > 1) {
        setCurrentPage((p) => p - 1);
      } else {
        await fetchCategories();
      }
    } catch (err) {
      console.error("Delete category error:", err);
      toast.error(err?.message || "Failed to delete category");
      setError(err?.message || "Failed to delete category");
    }
  };

  // ─────────────────────────────────────────────
  // Edit
  // ─────────────────────────────────────────────

  const handleEditClick = (category) => {
    setEditingCategory(category);
    setCurrentView("edit");
  };

  // ─────────────────────────────────────────────
  // Cancel
  // ─────────────────────────────────────────────

  const handleCancel = () => {
    setCurrentView("list");
    setEditingCategory(null);
  };

  // ─────────────────────────────────────────────
  // Content
  // ─────────────────────────────────────────────

  const renderContent = () => {
    switch (currentView) {
      case "add":
        return (
          <AddCategory
            onAddCategory={handleAddCategory}
            onCancel={handleCancel}
          />
        );

      case "edit":
        return (
          <EditCategory
            category={editingCategory}
            onUpdateCategory={handleUpdateCategory}
            onCancel={handleCancel}
          />
        );

      default:
        return (
          <CategoryList
            categories={categories}
            onEdit={handleEditClick}
            onDelete={handleDeleteCategory}
            loading={loading}
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            totalCount={pagination.totalCount}
            onPageChange={handlePageChange}
          />
        );
    }
  };

  if (loading && currentView === "list" && categories.length === 0) {
    return <LoadingPage />;
  }

  // ─────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────

  return (
    <div className="w-full min-h-screen font-sans p-4 sm:p-6 lg:p-8 bg-gray-50">

      <div className="mx-auto">

        {/* Header */}
        <header className="w-full flex justify-between items-center mb-8">

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Category Management
            </h1>

            <p className="text-gray-600 mt-1">
              Create, edit, and manage your categories
            </p>
          </div>

          {currentView === "list" && (
            <button
              onClick={() => setCurrentView("add")}
              className="flex items-center justify-center bg-yellow-400 text-gray-800 font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-yellow-500 transition-all duration-300"
            >
              <PlusIcon />
              Add Category
            </button>
          )}

        </header>

        {/* Error */}
        {error && currentView === "list" && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
            <button
              onClick={fetchCategories}
              className="ml-4 text-red-700 font-semibold hover:underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Content */}
        <main className="w-full">
          {renderContent()}
        </main>

      </div>
    </div>
  );
}