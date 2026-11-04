"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  getUserById,
  blockUser,
  unblockUser,
  deleteUser,
  restoreUser,
  transformUsersForDisplay,
} from "../../../../components/lib/userManagementApiClient";

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

const UserDetailsPage = ({ params }) => {
  // Unwrap params Promise using React.use() - Next.js 15+ requirement
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toast, setToast] = useState(null);
  const router = useRouter();

  // Show toast message
  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // Fetch user details with proper error handling
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await getUserById(id);

        // Check if response is valid JSON and contains data
        if (!response) {
          throw new Error("No response received from server");
        }

        // Handle different response structures
        let userData = null;

        if (response.data) {
          userData = response.data;
        } else if (response.user) {
          userData = response.user;
        } else {
          userData = response;
        }

        if (userData) {
          const transformed = transformUsersForDisplay([userData]);
          if (transformed && transformed.length > 0) {
            setUser(transformed[0]);
          } else {
            throw new Error("Failed to transform user data");
          }
        } else {
          throw new Error("User data not found in response");
        }
      } catch (err) {
        console.error("Error fetching user:", err);

        // Handle specific error types
        let errorMessage = "Failed to load user details";

        if (err.message?.includes("JSON")) {
          errorMessage =
            "Server returned invalid data. Please check if you're logged in and try again.";
        } else if (err.response?.status === 404) {
          errorMessage = "User not found";
        } else if (
          err.response?.status === 401 ||
          err.response?.status === 403
        ) {
          errorMessage = "You don't have permission to view this user";
        } else if (err.message) {
          errorMessage = err.message;
        }

        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchUser();
    }
  }, [id]);

  const handleBlockToggle = async () => {
    if (!user) return;

    setActionLoading("block");
    try {
      if (user.status === "Blocked") {
        await unblockUser(user.email);
        setUser({ ...user, status: "Active", is_blocked: false });
        showToast("User unblocked successfully", "success");
      } else {
        await blockUser(user.email);
        setUser({ ...user, status: "Blocked", is_blocked: true });
        showToast("User blocked successfully", "success");
      }
      setError(null);
    } catch (err) {
      console.error("Block/Unblock error:", err);

      let errorMsg = "Failed to update user status";

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

  const handleDelete = async () => {
    if (!user) return;

    setActionLoading("delete");
    try {
      await deleteUser(user.email);
      setShowDeleteModal(false);
      showToast("User deleted successfully", "success");
      setTimeout(() => {
        router.push("/admin/user-management");
      }, 1500);
    } catch (err) {
      console.error("Delete error:", err);

      let errorMsg = "Failed to delete user";

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

  const handleRestore = async () => {
    if (!user) return;

    setActionLoading("restore");
    try {
      await restoreUser(user.email);
      setUser({ ...user, is_deleted: false });
      showToast("User restored successfully", "success");
    } catch (err) {
      console.error("Restore error:", err);

      let errorMsg = "Failed to restore user";

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

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[#FAFAFA]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#FFD4A0] border-t-[#D4A12F] rounded-full animate-spin"></div>
          <div
            className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-[#FFD4A0] rounded-full animate-spin"
            style={{ animationDirection: "reverse", animationDuration: "1s" }}
          ></div>
        </div>
        <p className="mt-6 text-gray-600 font-medium">
          Loading user details...
        </p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen p-4 sm:p-8 bg-[#FAFAFA]">
        {/* Toast Notification */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 mb-6 text-gray-600 hover:text-[#D4A12F] transition-colors group"
          >
            <svg
              className="h-5 w-5 transition-transform group-hover:-translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span className="font-medium">Back to Users</span>
          </button>

          <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Unable to Load User
                </h3>
                <p className="text-gray-600 mb-4">
                  {error || "User not found"}
                </p>
                <button
                  onClick={() => router.back()}
                  className="px-6 py-2.5 bg-[#FFD4A0] text-[#D4A12F] rounded-lg font-medium hover:bg-[#E8B86B] transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const StatusBadge = ({ status }) => {
    const styles = {
      Active: "bg-[#E9F7EF] text-[#2D8A5A] border-[#2D8A5A]/20",
      Inactive: "bg-[#FBEBEE] text-[#B53D4D] border-[#B53D4D]/20",
      Blocked: "bg-[#FFF8E6] text-[#D4A12F] border-[#D4A12F]/20",
    };
    return (
      <span
        className={`px-4 py-1.5 text-sm font-semibold rounded-full border ${styles[status] || "bg-gray-100 text-gray-800 border-gray-300"}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-[#FAFAFA]">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-8 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="flex items-center gap-2 text-gray-600 hover:text-[#D4A12F] transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:border-[#FFD4A0] group-hover:bg-[#FFFBF5] transition-all">
              <svg
                className="h-5 w-5 transition-transform group-hover:-translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </div>
            {/* <span className="font-semibold">Back</span> */}
          </button>
          <div className="h-10 w-px bg-gray-300"></div>
          <h1 className="text-3xl font-bold text-gray-800">User Details</h1>
        </header>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Profile Banner */}
          <div className="relative bg-gradient-to-br from-[#D4A12F] via-[#E8B86B] to-[#FFD4A0] p-8 sm:p-12">
            {/* Decorative Pattern Overlay */}
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern
                    id="grid"
                    width="40"
                    height="40"
                    patternUnits="userSpaceOnUse"
                  >
                    <circle cx="20" cy="20" r="1" fill="white" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            <div className="relative flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group">
                <div className="absolute -inset-1 bg-white rounded-full opacity-25 group-hover:opacity-40 transition-opacity"></div>
                <img
                  src={user.avatar}
                  alt={`${user.name}'s avatar`}
                  className="relative w-32 h-32 rounded-full object-cover border-4 border-white shadow-2xl"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=D4A12F&color=fff&size=128&bold=true`;
                  }}
                />
              </div>
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
                  {user.name}
                </h2>
                <p className="text-white/90 font-medium text-lg mb-4">
                  {user.role}
                </p>
                <div className="flex gap-3 flex-wrap justify-center sm:justify-start">
                  <StatusBadge status={user.status} />
                  {user.is_deleted && (
                    <span className="px-4 py-1.5 text-sm font-semibold bg-red-500/90 text-white rounded-full border border-white/20">
                      Deleted
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* User Details Grid */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Contact Information */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-3 border-b-2 border-[#FFD4A0]">
                  <div className="w-8 h-8 rounded-lg bg-[#FFF8E6] flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-[#D4A12F]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-bold text-lg text-gray-800">
                    Contact Information
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-[#FFD4A0] transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                      <svg
                        className="w-5 h-5 text-[#D4A12F]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Email Address
                      </p>
                      <p className="text-gray-800 font-medium break-all">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-[#FFD4A0] transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                      <svg
                        className="w-5 h-5 text-[#D4A12F]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Phone Number
                      </p>
                      <p className="text-gray-800 font-medium">{user.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-[#FFD4A0] transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                      <svg
                        className="w-5 h-5 text-[#D4A12F]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Address
                      </p>
                      <p className="text-gray-800 font-medium">
                        {user.address}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-3 border-b-2 border-[#FFD4A0]">
                  <div className="w-8 h-8 rounded-lg bg-[#FFF8E6] flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-[#D4A12F]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-bold text-lg text-gray-800">
                    Account Information
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-[#FFD4A0] transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                      <svg
                        className="w-5 h-5 text-[#D4A12F]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Member Since
                      </p>
                      <p className="text-gray-800 font-medium">
                        {new Date(user.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-[#FFD4A0] transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                      <svg
                        className="w-5 h-5 text-[#D4A12F]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Last Active
                      </p>
                      <p className="text-gray-800 font-medium">
                        {user.last_login
                          ? new Date(user.last_login).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )
                          : "Never logged in"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-[#FFD4A0] transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                      <svg
                        className="w-5 h-5 text-[#D4A12F]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Bio
                      </p>
                      <p className="text-gray-800 font-medium">{user.bio}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 border-t border-gray-200 flex flex-wrap gap-3">
              <button
                onClick={handleBlockToggle}
                disabled={actionLoading === "block"}
                className="px-6 py-3 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md bg-[#FFF8E6] text-[#D4A12F] border-2 border-[#FFD4A0] hover:bg-[#FFD4A0] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {actionLoading === "block" ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : user.status === "Blocked" ? (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                      />
                    </svg>
                    Unblock User
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    Block User
                  </>
                )}
              </button>

              {user.is_deleted ? (
                <button
                  onClick={handleRestore}
                  disabled={actionLoading === "restore"}
                  className="px-6 py-3 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md bg-[#E9F7EF] text-[#2D8A5A] border-2 border-[#2D8A5A]/20 hover:bg-[#2D8A5A]/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {actionLoading === "restore" ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      Restoring...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Restore User
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-6 py-3 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md bg-[#FBEBEE] text-[#B53D4D] border-2 border-[#B53D4D]/20 hover:bg-[#B53D4D]/10 flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Delete User
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scale-in">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
                Delete User
              </h3>
              <p className="text-gray-600 mb-8 text-center">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-gray-900">{user.name}</span>
                ? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-300 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={actionLoading === "delete"}
                  className="flex-1 px-6 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
                >
                  {actionLoading === "delete" ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
            <style jsx>{`
              @keyframes fade-in {
                from {
                  opacity: 0;
                }
                to {
                  opacity: 1;
                }
              }
              @keyframes scale-in {
                from {
                  opacity: 0;
                  transform: scale(0.9);
                }
                to {
                  opacity: 1;
                  transform: scale(1);
                }
              }
              .animate-fade-in {
                animation: fade-in 0.2s ease-out;
              }
              .animate-scale-in {
                animation: scale-in 0.3s ease-out;
              }
            `}</style>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetailsPage;
