"use client";

import {
  deleteItem,
  getAllItems,
} from "@/components/lib/categoryItemsApiClient";

import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import toast, { Toaster } from "react-hot-toast";

import AddItem from "./Additem";
import EditItem from "./Edititem";
import ItemsList from "./Itemslist";
import { PlusIcon } from "../../sub-cetegoary/_components/shared/Icons";
import LoadingPage from "@/app/admin/loading";

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

export default function AllItemsManage() {
  // Items received from API (current page only)
  const [allItems, setAllItems] = useState([]);

  // Current API page
  const [currentPage, setCurrentPage] = useState(1);

  // API pagination information
  const [pagination, setPagination] = useState({
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 200,
  });

  // Add / Edit / List
  const [view, setView] = useState("list");

  // Item being edited
  const [editingItem, setEditingItem] = useState(null);

  // Loading
  const [loading, setLoading] = useState(true);

  // Error
  const [error, setError] = useState("");

  // Items per API request
  const pageSize = 200;

  // ─────────────────────────────────────────────
  // Fetch Items
  // ─────────────────────────────────────────────

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAllItems({
        page: currentPage,
        page_size: pageSize,
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to load items");
      }

      setAllItems(response.data || []);

      setPagination(
        response.pagination || {
          totalCount: 0,
          totalPages: 0,
          currentPage,
          pageSize,
        }
      );
    } catch (err) {
      console.error("Fetch items error:", err);
      toast.error(err?.message || "Failed to load items");
      setAllItems([]);
      setError(err?.message || "Failed to load items");
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  // ─────────────────────────────────────────────
  // Fetch whenever page changes
  // ─────────────────────────────────────────────

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

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
  // Delete
  // ─────────────────────────────────────────────

  const handleDelete = (itemId, itemWord) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-gray-800">Delete <strong>"{itemWord}"</strong>?</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold">Cancel</button>
          <button onClick={async () => {
            const res = await deleteItem(itemId);
            toast.dismiss(t.id);
            res.success ? toast.success('Deleted') : toast.error(res.message);
            if (res.success) {
              // If we deleted the last item on this page (and it's not page 1),
              // step back a page so we don't land on an empty page.
              if (allItems.length === 1 && currentPage > 1) {
                setCurrentPage((p) => p - 1);
              } else {
                fetchAllData();
              }
            }
          }} className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-semibold">Delete</button>
        </div>
      </div>
    ), { duration: 6000, style: { minWidth: '280px' } });
  };

  // ─────────────────────────────────────────────
  // Add / Edit callbacks
  // ─────────────────────────────────────────────

  const handleAddDone = () => {
    setView("list");
    setCurrentPage(1); // reload first page
  };

  const handleEditDone = () => {
    setView("list");
    setEditingItem(null);
    fetchAllData();
  };

  const handleEditClick = (item) => {
    setEditingItem(item);
    setView("edit");
  };

  const handleCancel = () => {
    setView("list");
    setEditingItem(null);
  };

  // ─────────────────────────────────────────────
  // Content
  // ─────────────────────────────────────────────

  const renderContent = () => {
    switch (view) {
      case "add":
        return <AddItem onDone={handleAddDone} onCancel={handleCancel} />;
      case "edit":
        return (
          <EditItem
            item={editingItem}
            onDone={handleEditDone}
            onCancel={handleCancel}
          />
        );
      default:
        return (
          <ItemsList
            items={allItems}
            onEdit={handleEditClick}
            onDelete={handleDelete}
            loading={loading}
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            totalCount={pagination.totalCount}
            onPageChange={handlePageChange}
          />
        );
    }
  };

  if (loading && view === "list" && allItems.length === 0) {
    return <LoadingPage />;
  }

  // ─────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 font-sans">
      <Toaster position="top-right" />
      <div className="mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Items Management</h1>
            <p className="text-sm text-gray-400 mt-0.5">{pagination.totalCount} items across all sub-categories</p>
          </div>
          {view === "list" && (
            <button onClick={() => setView("add")}
              className="flex items-center px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold text-sm rounded-xl transition-colors shadow-sm">
              <PlusIcon /> Add Item
            </button>
          )}
        </div>

        {error && view === "list" && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
            <button onClick={fetchAllData} className="ml-4 text-red-700 font-semibold hover:underline">Retry</button>
          </div>
        )}

        {renderContent()}
      </div>
    </div>
  );
}