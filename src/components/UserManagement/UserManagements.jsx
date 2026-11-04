"use client";

import { useRouter } from "next/navigation";
import React, { useState, useMemo, useEffect } from "react";
import {
  getAllUsers,
  blockUser,
  deleteUser,
  transformUsersForDisplay,
  unblockUser,
} from "../lib/userManagementApiClient";

// Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: "bg-green-50 border-green-200 text-green-700",
    error: "bg-red-50 border-red-200 text-red-700",
    info: "bg-blue-50 border-blue-200 text-blue-700",
  };

  const iconColor = {
    success: "text-green-600",
    error: "text-red-600",
    info: "text-blue-600",
  };

  const icons = {
    success: (
      <svg
        className={`w-5 h-5 ${iconColor.success}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    ),
    error: (
      <svg
        className={`w-5 h-5 ${iconColor.error}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
    ),
    info: (
      <svg
        className={`w-5 h-5 ${iconColor.info}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      </svg>
    ),
  };

  return (
    <div
      className={`fixed top-4 right-4 p-4 rounded-lg border shadow-lg flex items-center gap-3 ${bgColor[type]} z-50 animate-slide-in`}
    >
      {icons[type]}
      <p className="font-medium">{message}</p>
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

// UserList Component (main component)
const UserList = () => {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);
  const itemsPerPage = 10;

  const router = useRouter();

  // Show toast message
  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // Fetch users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getAllUsers();

        if (response && response.data) {
          let usersData = response.data;

          // Handle different response formats
          if (Array.isArray(response.data)) {
            usersData = response.data;
          } else if (response.data.results) {
            usersData = response.data.results;
          } else if (response.data.users) {
            usersData = response.data.users;
          }

          if (Array.isArray(usersData) && usersData.length > 0) {
            const transformed = transformUsersForDisplay(usersData);
            setUsers(transformed);
            setError(null);
          } else {
            setError("No users found");
            setUsers([]);
          }
        } else {
          setError("Invalid response format");
          setUsers([]);
        }
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setError(err.message || "Failed to load users");
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchTerm = searchQuery.toLowerCase();
      return (
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.role.toLowerCase().includes(searchTerm)
      );
    });
  }, [users, searchQuery]);

  // Memoize paginated users for performance
  const paginatedUsers = useMemo(() => {
    const indexOfLastUser = currentPage * itemsPerPage;
    const indexOfFirstUser = indexOfLastUser - itemsPerPage;
    return filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // --- Action Handlers ---
  const handleView = (userId) => {
    router.push(`/admin/user-management/${userId}`);
  };

  const handleBlock = async (userId, userEmail, currentStatus) => {
    setActionLoading(userId);
    try {
      if (currentStatus === "Blocked") {
        await unblockUser(userEmail);
        setUsers((currentUsers) =>
          currentUsers.map((user) =>
            user.id === userId
              ? { ...user, status: "Active", is_blocked: false }
              : user,
          ),
        );
        showToast("User unblocked successfully", "success");
      } else {
        await blockUser(userEmail);
        setUsers((currentUsers) =>
          currentUsers.map((user) =>
            user.id === userId
              ? { ...user, status: "Blocked", is_blocked: true }
              : user,
          ),
        );
        showToast("User blocked successfully", "success");
      }
      setError(null);
    } catch (err) {
      console.error("Block/Unblock error:", err);

      let errorMsg = "Failed to update user status";

      // Handle validation errors with field-specific messages
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const errorMessages = [];

        Object.keys(errors).forEach((field) => {
          if (Array.isArray(errors[field])) {
            errorMessages.push(errors[field][0]);
          } else {
            errorMessages.push(errors[field]);
          }
        });
        errorMsg = errorMessages.join(" • ");
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.message) {
        errorMsg = err.message;
      }

      showToast(errorMsg, "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId, userEmail) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone.",
      )
    ) {
      return;
    }

    setActionLoading(userId);
    try {
      await deleteUser(userEmail);
      setUsers((currentUsers) =>
        currentUsers.filter((user) => user.id !== userId),
      );
      showToast("User deleted successfully", "success");
    } catch (err) {
      console.error("Delete error:", err);

      let errorMsg = "Failed to delete user";

      // Handle validation errors with field-specific messages
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const errorMessages = [];

        Object.keys(errors).forEach((field) => {
          if (Array.isArray(errors[field])) {
            errorMessages.push(errors[field][0]);
          } else {
            errorMessages.push(errors[field]);
          }
        });

        errorMsg = errorMessages.join(" | ");
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.message) {
        errorMsg = err.message;
      }

      showToast(errorMsg, "error");
    } finally {
      setActionLoading(null);
    }
  };

  // --- Pagination Logic ---
  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      if (currentPage > 2) {
        pageNumbers.push("...");
      }

      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage === 1) {
        endPage = 3;
      }
      if (currentPage === totalPages) {
        startPage = totalPages - 2;
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (currentPage < totalPages - 1) {
        pageNumbers.push("...");
      }
      pageNumbers.push(totalPages);
    }

    const uniquePageNumbers = pageNumbers.filter((item, index) => {
      return item !== "..." || pageNumbers[index - 1] !== "...";
    });

    return uniquePageNumbers.map((num, index) =>
      num === "..." ? (
        <span key={`ellipsis-${index}`} className="px-4 py-2 text-gray-500">
          ...
        </span>
      ) : (
        <button
          key={num}
          onClick={() => handlePageChange(num)}
          className={`px-4 py-2 rounded-md transition-colors text-sm font-medium ${
            currentPage === num
              ? "bg-[#FFD4A0] text-[#D4A12F]"
              : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          {num}
        </button>
      ),
    );
  };

  // --- Sub-components for Rendering ---
  const StatusBadge = ({ status }) => {
    const styles = {
      Active: "bg-[#E9F7EF] text-[#2D8A5A]",
      Inactive: "bg-[#FBEBEE] text-[#B53D4D]",
      Blocked: "bg-[#FFF8E6] text-[#D4A12F]",
    };
    return (
      <span
        className={`px-3 py-1 text-xs font-medium rounded-md ${styles[status] || "bg-gray-200 text-gray-700"}`}
      >
        {status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4 mx-auto"></div>
          <p className="text-gray-600">Loading users...</p>
          <style jsx>{`
            .loader {
              border-top-color: #ffd4a0;
              animation: spinner 1.5s linear infinite;
            }
            @keyframes spinner {
              0% {
                transform: rotate(0deg);
              }
              100% {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ boxShadow: "0px 4px 14.7px 0px rgba(0, 0, 0, 0.25)" }}
      className="rounded-lg min-h-screen p-4 sm:p-8 bg-white"
    >
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div>
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        <div>
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-700">User List</h2>
            <div className="relative">
              <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-2">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="outline-none w-64 text-sm text-gray-700 placeholder-gray-500"
                />
                <svg
                  className="w-5 h-5 text-gray-500 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
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
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-gray-500">
                  <th className="py-3 px-4 font-medium">Name</th>
                  <th className="py-3 px-4 font-medium">Role</th>
                  <th className="py-3 px-4 font-medium">Email</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar}
                            alt={`${user.name}'s avatar`}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://ui-avatars.com/api/?name=" +
                                encodeURIComponent(user.name);
                            }}
                          />
                          <span className="font-medium text-gray-800">
                            {user.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{user.role}</td>
                      <td className="py-4 px-4 text-gray-600 text-xs">
                        {user.email}
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={user.status} />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleBlock(user.id, user.email, user.status)
                            }
                            disabled={actionLoading === user.id}
                            className="px-4 py-2 text-sm font-medium rounded-md bg-[#FFF8E6] text-[#D4A12F] hover:bg-opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading === user.id ? (
                              <span className="flex items-center gap-1">
                                <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                                Processing...
                              </span>
                            ) : user.status === "Blocked" ? (
                              "Unblock"
                            ) : (
                              "Block"
                            )}
                          </button>
                          <button
                            onClick={() => handleView(user.id)}
                            className="cursor-pointer px-4 py-2 text-sm font-medium rounded-md bg-[#EBF5FF] text-[#3B82F6] hover:bg-opacity-80 transition-colors"
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-500">
                      {users.length === 0
                        ? "No users found."
                        : "No results match your search."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 flex justify-end items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 19l-7-7 7-7"
                  ></path>
                </svg>
              </button>

              {renderPageNumbers()}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  ></path>
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserList;
