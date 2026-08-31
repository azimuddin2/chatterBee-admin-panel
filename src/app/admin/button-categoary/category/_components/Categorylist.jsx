"use client";

import {
  formatCategory,
  searchCategories,
} from "@/components/lib/categoryApiClient";

import React, { useState } from "react";

// ─────────────────────────────────────────────
// Loading
// ─────────────────────────────────────────────

const LoadingSpinner = () => (
  <svg
    className="animate-spin h-5 w-5"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />

    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

// ─────────────────────────────────────────────
// Trash
// ─────────────────────────────────────────────

const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
      clipRule="evenodd"
    />
  </svg>
);

// ─────────────────────────────────────────────
// Edit
// ─────────────────────────────────────────────

const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
  </svg>
);

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

const CategoryList = ({
  categories = [],
  onEdit,
  onDelete,
  loading,
  currentPage = 1,
  totalPages = 0,
  totalCount = 0,
  onPageChange,
}) => {
  const [searchQuery, setSearchQuery] =
    useState("");

  // Search current API page
  const filteredCategories =
    searchCategories(
      categories,
      searchQuery
    );

  return (
    <div className="p-8 rounded-xl shadow-lg w-full bg-white">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">

        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Category List
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Total Categories:{" "}
            {totalCount}
          </p>
        </div>

        {/* Search */}
        <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-2">

          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery(
                e.target.value
              )
            }
            className="outline-none w-64 text-sm text-gray-700 placeholder-gray-500"
          />

          <svg
            className="w-5 h-5 text-gray-500 ml-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>

        </div>

      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg">

        <table className="w-full text-sm">

          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">

              <th className="text-left p-4 font-semibold text-gray-600">
                Category Name
              </th>

              <th className="text-center p-4 font-semibold text-gray-600">
                Lang
              </th>

              <th className="text-center p-4 font-semibold text-gray-600">
                Color
              </th>

              <th className="text-center p-4 font-semibold text-gray-600">
                Image
              </th>

              <th className="text-center p-4 font-semibold text-gray-600">
                Sub Categories
              </th>

              <th className="text-center p-4 font-semibold text-gray-600">
                Buddy Mode
              </th>

              <th className="text-center p-4 font-semibold text-gray-600">
                Status
              </th>

              <th className="text-center p-4 font-semibold text-gray-600">
                Actions
              </th>

            </tr>
          </thead>

          <tbody>

            {loading ? (

              <tr>
                <td
                  colSpan="8"
                  className="p-8 text-center"
                >
                  <div className="flex justify-center">
                    <LoadingSpinner />
                  </div>
                </td>
              </tr>

            ) : filteredCategories.length > 0 ? (

              filteredCategories.map(
                (category) => {

                  const langs =
                    Object.keys(
                      category.translations ||
                      {}
                    );

                  const displayLang =
                    langs[0] || "en";

                  const formatted =
                    formatCategory(
                      category,
                      displayLang
                    );

                  return (
                    <tr
                      key={category.id}
                      className="border-b hover:bg-gray-50 transition"
                    >

                      {/* Name */}
                      <td className="p-4 text-left text-gray-800 font-medium">
                        {
                          formatted.formattedName
                        }
                      </td>

                      {/* Language */}
                      <td className="p-4 text-center">

                        <div className="flex gap-1 flex-wrap justify-center">

                          {langs.map(
                            (lang) => (
                              <span
                                key={lang}
                                className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100 uppercase"
                              >
                                {lang}
                              </span>
                            )
                          )}

                        </div>

                      </td>

                      {/* Color */}
                      <td className="p-4 text-center">

                        <div className="flex justify-center">

                          <div
                            className="h-8 w-8 rounded-full border-2 border-gray-300"
                            style={{
                              backgroundColor:
                                formatted.displayColor,
                            }}
                          />

                        </div>

                      </td>

                      {/* Image */}
                      <td className="p-4 text-center">

                        {formatted.hasImage ? (

                          <img
                            src={
                              category.image_icon
                            }
                            alt={
                              formatted.formattedName
                            }
                            className="h-10 w-10 mx-auto object-cover rounded-md"
                            onError={(e) => {
                              e.currentTarget.style.display =
                                "none";
                            }}
                          />

                        ) : (

                          <span className="text-gray-400 text-xs">
                            No image
                          </span>

                        )}

                      </td>

                      {/* Sub Categories */}
                      <td className="p-4 text-center text-gray-700 font-medium">
                        {
                          category.sub_categories_count ||
                          0
                        }
                      </td>

                      {/* Buddy Mode */}
                      <td className="p-4 text-center">

                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${category.buddy_mode
                              ? "bg-amber-100 text-amber-700 border border-amber-200"
                              : "bg-gray-100 text-gray-500 border border-gray-200"
                            }`}
                        >

                          <span
                            className={`h-1.5 w-1.5 rounded-full ${category.buddy_mode
                                ? "bg-amber-500"
                                : "bg-gray-400"
                              }`}
                          />

                          {category.buddy_mode
                            ? "ON"
                            : "OFF"}

                        </span>

                      </td>

                      {/* Status */}
                      <td className="p-4 text-center">

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${category.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                            }`}
                        >
                          {
                            formatted.statusBadge
                          }
                        </span>

                      </td>

                      {/* Actions */}
                      <td className="p-4 text-center">

                        <div className="flex gap-2 items-center justify-center">

                          <button
                            onClick={() =>
                              onEdit(category)
                            }
                            className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                            title="Edit"
                          >
                            <EditIcon />
                          </button>

                          <button
                            onClick={() =>
                              onDelete(
                                category.id,
                                formatted.formattedName
                              )
                            }
                            className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                            title="Delete"
                          >
                            <TrashIcon />
                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                }
              )

            ) : (

              <tr>
                <td
                  colSpan="8"
                  className="p-8 text-center text-gray-500"
                >
                  {searchQuery
                    ? `No categories found matching "${searchQuery}"`
                    : "No categories found. Add one to get started!"}
                </td>
              </tr>

            )}

          </tbody>

        </table>

      </div>

      {/* Pagination */}
      {totalPages > 1 && (

        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-4 mt-4">

          {/* Info */}
          <div className="text-sm text-gray-600">
            Page{" "}
            <span className="font-semibold">
              {currentPage}
            </span>{" "}
            of{" "}
            <span className="font-semibold">
              {totalPages}
            </span>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2">

            {/* Previous */}
            <button
              onClick={() =>
                onPageChange(
                  currentPage - 1
                )
              }
              disabled={
                currentPage === 1 ||
                loading
              }
              className={`px-4 py-2 text-sm font-semibold rounded-md ${currentPage === 1 ||
                  loading
                  ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                  : "text-gray-900 hover:bg-gray-50"
                }`}
            >
              Previous
            </button>

            {/* Page Numbers */}
            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            ).map((page) => (

              <button
                key={page}
                onClick={() =>
                  onPageChange(page)
                }
                disabled={loading}
                className={`px-4 py-2 text-sm font-semibold rounded-md ${currentPage === page
                    ? "bg-yellow-400 text-white"
                    : "text-gray-900 hover:bg-gray-50"
                  }`}
              >
                {page}
              </button>

            ))}

            {/* Next */}
            <button
              onClick={() =>
                onPageChange(
                  currentPage + 1
                )
              }
              disabled={
                currentPage ===
                totalPages ||
                loading
              }
              className={`px-4 py-2 text-sm font-semibold rounded-md ${currentPage ===
                  totalPages ||
                  loading
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

export default CategoryList;