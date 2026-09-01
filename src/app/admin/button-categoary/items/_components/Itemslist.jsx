"use client";

import {
  formatItem,
  searchItems,
} from "@/components/lib/categoryItemsApiClient";

import React, { useState } from "react";
import { Spinner, SearchIcon } from "../../sub-cetegoary/_components/shared/Icons";

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
  </svg>
);

const ItemsList = ({
  items = [],
  onEdit,
  onDelete,
  loading,
  currentPage = 1,
  totalPages = 0,
  totalCount = 0,
  onPageChange,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const filteredItems = searchItems(items, searchQuery);

  // Show a full-row spinner only when there's nothing to show yet
  // (e.g. first load, or search cleared out everything). Once we already
  // have rows on screen, keep them visible but dimmed + overlay a spinner
  // while the next page loads — this avoids the table flashing empty
  // between page changes.
  const showEmptyStateSpinner = loading && items.length === 0;
  const showOverlaySpinner = loading && items.length > 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
        <div>
          <h2 className="text-lg font-bold text-gray-800">All Items</h2>
          <p className="text-sm text-gray-500 mt-1">Total Items: {totalCount}</p>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl w-56">
          <SearchIcon />
          <input
            type="text" placeholder="Search..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 w-full"
          />
        </div>
      </div>

      {/* Table wrapper — relative so we can position the overlay spinner */}
      <div className="relative">

        {showOverlaySpinner && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
            <div className="flex flex-col items-center gap-2">
              <Spinner />
              <span className="text-xs font-semibold text-gray-500">Loading page {currentPage}...</span>
            </div>
          </div>
        )}

        <div className={`overflow-x-auto transition-opacity duration-150 ${showOverlaySpinner ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Sub-Category</th>
                <th className="text-left px-6 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Word</th>
                <th className="text-center px-6 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Icon</th>
                <th className="text-center px-6 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Color</th>
                <th className="text-center px-6 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Audio</th>
                <th className="text-center px-6 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Buddy</th>
                <th className="text-center px-6 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-center px-6 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {showEmptyStateSpinner ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center">
                    <div className="flex justify-center"><Spinner /></div>
                  </td>
                </tr>
              ) : filteredItems.length > 0 ? (
                filteredItems.map((rawItem) => {
                  const item = formatItem(rawItem);
                  return (
                    <tr key={item.id} className="hover:bg-amber-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full font-medium">
                          {item.category_name || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-800">{item.formattedWord}</td>
                      <td className="px-6 py-4 text-center">
                        {item.hasImage
                          ? <img src={item.image_icon} alt={item.formattedWord} className="h-9 w-9 mx-auto object-cover rounded-lg border border-gray-100" />
                          : <span className="text-gray-200 text-xs">—</span>
                        }
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="h-7 w-7 mx-auto rounded-full border border-gray-100 shadow-sm" style={{ backgroundColor: item.displayColor }} />
                      </td>
                      <td className="px-6 py-4 text-center text-xs text-gray-500">{item.speakText}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                          item.buddyMode ? "bg-amber-100 text-amber-700 border border-amber-200" : "bg-gray-100 text-gray-400 border border-gray-200"
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${item.buddyMode ? "bg-amber-500" : "bg-gray-400"}`} />
                          {item.buddyMode ? "ON" : "OFF"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          item.statusColor === "green" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                        }`}>
                          {item.statusBadge}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 justify-center">
                          <button onClick={() => onEdit(rawItem)}
                            className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition" title="Edit">
                            <EditIcon />
                          </button>
                          <button onClick={() => onDelete(rawItem.id, item.formattedWord)}
                            className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition" title="Delete">
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-500">
                    {searchQuery ? `No items found matching "${searchQuery}"` : "No items found. Add one to get started!"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-4">

          <div className="text-sm text-gray-600">
            Page <span className="font-semibold">{currentPage}</span> of{" "}
            <span className="font-semibold">{totalPages}</span>
            {loading && <span className="ml-2 text-amber-500 font-medium">· loading...</span>}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className={`px-4 py-2 text-sm font-semibold rounded-md ${
                currentPage === 1 || loading
                  ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                  : "text-gray-900 hover:bg-gray-50"
              }`}
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                disabled={loading}
                className={`px-4 py-2 text-sm font-semibold rounded-md ${
                  currentPage === page ? "bg-yellow-400 text-white" : "text-gray-900 hover:bg-gray-50"
                } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              className={`px-4 py-2 text-sm font-semibold rounded-md ${
                currentPage === totalPages || loading
                  ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                  : "text-gray-900 hover:bg-gray-50"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemsList;