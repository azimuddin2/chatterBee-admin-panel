"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { changePassword } from "../lib/apiClient";

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!currentPassword.trim()) {
      toast.error("Please enter your current password");
      return;
    }

    if (!newPassword.trim()) {
      toast.error("Please enter a new password");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmedPassword) {
      toast.error("New password and confirmed password do not match");
      return;
    }

    if (currentPassword === newPassword) {
      toast.error("New password must be different from current password");
      return;
    }

    setIsLoading(true);

    try {
      const response = await changePassword(
        currentPassword,
        newPassword,
        confirmedPassword,
      );
      if (response.success) {
        toast.success(response.message || "Password changed successfully!");

        // Clear form
        setCurrentPassword("");
        setNewPassword("");
        setConfirmedPassword("");
      } else {
        throw new Error(response.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password:", error);

      // Handle specific error messages
      let errorMessage = "Failed to change password";

      if (error.message?.includes("current password")) {
        errorMessage = "Current password is incorrect";
      } else if (error.message?.includes("match")) {
        errorMessage = "Passwords do not match";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 flex flex-col items-center">
      <div className="mb-4 w-full max-w-[982px]">
        <label
          htmlFor="currentPassword"
          className="block text-black text-sm font-bold mb-2"
        >
          Current Password
        </label>
        <input
          type="password"
          id="currentPassword"
          className="shadow appearance-none rounded w-full h-[50px] py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline border border-[#C3C3C3] bg-gray-100"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div className="mb-4 w-full max-w-[982px]">
        <label
          htmlFor="newPassword"
          className="block text-black text-sm font-bold mb-2"
        >
          New Password
        </label>
        <input
          type="password"
          id="newPassword"
          className="shadow appearance-none rounded w-full h-[50px] py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline border border-[#C3C3C3] bg-gray-100"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          disabled={isLoading}
          minLength={8}
        />
        <p className="text-gray-500 text-xs mt-1">
          Password must be at least 8 characters long
        </p>
      </div>

      <div className="mb-6 w-full max-w-[982px]">
        <label
          htmlFor="confirmedPassword"
          className="block text-black text-sm font-bold mb-2"
        >
          Confirmed Password
        </label>
        <input
          type="password"
          id="confirmedPassword"
          className="shadow appearance-none rounded w-full h-[50px] py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline border border-[#C3C3C3] bg-gray-100"
          value={confirmedPassword}
          onChange={(e) => setConfirmedPassword(e.target.value)}
          required
          disabled={isLoading}
          minLength={8}
        />
      </div>

      <div className="flex items-center justify-center mt-6 md:w-[982px]">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-[#FDD268] hover:bg-opacity-80 text-black font-bold w-full py-3 px-4 rounded-[4px] focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Changing Password..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
