"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import ChangePasswordForm from "./ChangePasswordForm";

import toast, { Toaster } from "react-hot-toast";
import { getProfile, updateProfile } from "../lib/userProfileApiClient";

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("editProfile");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [profileData, setProfileData] = useState({
    full_name: "",
    email: "",
    phone: "",
    avatar: null,
  });
  const [profileImage, setProfileImage] = useState("/image/userImage.png");
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);
  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        const response = await getProfile();

        console.log("Profile Response:", response); // Debug log

        if (response.success && response.data) {
          const userData = response.data;

          // Extract avatar URL from response
          const avatarUrl = userData.profile?.avatar || userData.avatar;

          setProfileData({
            full_name: userData.full_name || "",
            email: userData.email || "",
            phone: userData.profile?.phone || "",
            avatar: avatarUrl || null,
          });

          // Set profile image if available
          if (avatarUrl) {
            console.log("Setting avatar URL:", avatarUrl); // Debug log
            setProfileImage(avatarUrl);
          } else if (userData.full_name) {
            // Generate avatar with user initials if no image
            setProfileImage(
              `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.full_name)}&background=FDD268&color=000&size=128&bold=true`,
            );
          }
        } else {
          toast.error(response.message || "Failed to load profile data");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  const handleBackClick = () => {
    router.back();
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ["image/png", "image/jpeg", "image/jpg"];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a valid image (PNG, JPG, JPEG)");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      // Create preview URL

      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
      setAvatarFile(file);
      toast.success("Image selected! Click 'Save Changes' to upload.");
    }
  };
  const handleImageClick = () => {
    fileInputRef.current.click();
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!profileData.full_name.trim()) {
      toast.error("Full name is required");
      return;
    }
    setIsSaving(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("full_name", profileData.full_name);

      // Email is not included - backend should not allow email changes
      // Only send phone if it exists
      if (profileData.phone) {
        formData.append("phone", profileData.phone);
      }

      // Only append avatar if a new file was selected
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      // Make API call using userApiClient
      const response = await updateProfile(formData);

      console.log("Update Response:", response); // Debug log

      if (response.success && response.data) {
        toast.success(response.message || "Profile updated successfully!");

        // Update profile data with response
        const updatedData = response.data;

        // Extract avatar URL - check multiple possible locations
        const updatedAvatar = updatedData.avatar || updatedData.profile?.avatar;

        console.log("Updated Avatar URL:", updatedAvatar); // Debug log

        setProfileData({
          full_name: updatedData.full_name || "",
          email: updatedData.email || "",
          phone: updatedData.profile?.phone || "",
          avatar: updatedAvatar || null,
        });

        // Update profile image - CRITICAL FIX
        if (updatedAvatar) {
          // Force image reload by adding timestamp
          const timestamp = new Date().getTime();
          const imageUrlWithCache = `${updatedAvatar}?t=${timestamp}`;

          console.log("Setting new profile image:", imageUrlWithCache); // Debug log

          setProfileImage(imageUrlWithCache);

          // Dispatch custom event to update Topbar
          window.dispatchEvent(
            new CustomEvent("profileUpdated", {
              detail: { avatar: imageUrlWithCache },
            }),
          );
          // Clear preview after successful upload
          if (previewImage) {
            URL.revokeObjectURL(previewImage);
          }
          setPreviewImage(null);
          setAvatarFile(null);

          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        } else {
          console.error("No avatar URL in response"); // Debug log
        }
      } else {
        throw new Error(response.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#FDD268] border-t-[#FBBF24] rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // Determine which image to show
  const displayImage = previewImage || profileImage;

  return (
    <div className="min-h-screen bg-white text-black flex justify-center items-start pt-8 pb-8 rounded-lg">
      <Toaster position="top-center" reverseOrder={false} />
      <div
        className="flex items-center gap-4 cursor-pointer ml-5"
        onClick={handleBackClick}
      >
        <div className="">
          <ArrowLeft
            className="text-black bg-[#E0E0E0] rounded-full p-2"
            size={40}
          />
        </div>
        <h1 className="text-2xl font-bold">Profile</h1>
      </div>

      <div className="w-full max-w-6xl mx-auto px-4">
        <div className="p-6">
          <div className="flex justify-center gap-[18px] items-center mb-6">
            <div
              className="relative rounded-full border-4 border-gray-300 cursor-pointer hover:border-gray-400 transition-colors"
              onClick={handleImageClick}
            >
              <div className="w-[100px] h-[100px] rounded-full overflow-hidden">
                <img
                  src={displayImage}
                  alt="User Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error("Image load error, using fallback");
                    e.target.src = "/image/userImage.png";
                  }}
                />
              </div>
              <span className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1 border-2 border-white shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M13.586 3.586a2 2 0 112.828 2.828l-7.793 7.793a.5.5 0 01-.128.093l-3 1a.5.5 0 01-.611-.611l1-3a.5.5 0 01.093-.128l7.793-7.793zM10.707 6.293a1 1 0 00-1.414 1.414L12 9.414l1.293-1.293a1 1 0 00-1.414-1.414L10.707 6.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </div>
            <div className="flex flex-col gap-[12px]">
              <h2 className="text-[24px] font-bold mt-3 text-black">
                {profileData.full_name || "Loading..."}
              </h2>
              <p className="text-black font-[400] text-xl">Admin</p>
            </div>
          </div>

          <div className="flex justify-center mb-6">
            <button
              className={`py-2 px-6 text-[16px] font-semibold ${
                activeTab === "editProfile"
                  ? "border-b-2 border-[#FDD268] text-[#000000]"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setActiveTab("editProfile")}
            >
              Edit Profile
            </button>
            <button
              className={`py-2 px-6 text-[16px] font-semibold ${
                activeTab === "changePassword"
                  ? "border-b-2 border-[#FDD268] text-[#000000]"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setActiveTab("changePassword")}
            >
              Change Password
            </button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            style={{ display: "none" }}
            accept="image/png, image/jpeg, image/jpg"
          />
          {activeTab === "editProfile" && (
            <div className="p-6 flex flex-col items-center">
              <form className="w-full max-w-[982px]" onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label
                    htmlFor="full_name"
                    className="block text-black text-sm font-bold mb-2"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    className="shadow appearance-none rounded w-full h-[50px] py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline border border-[#C3C3C3] bg-gray-100"
                    value={profileData.full_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="email"
                    className="block text-black text-sm font-bold mb-2"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="shadow appearance-none rounded w-full h-[50px] py-3 px-4 text-gray-500 leading-tight border border-[#C3C3C3] bg-gray-200 cursor-not-allowed"
                    value={profileData.email}
                    disabled
                    title="Email cannot be changed"
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    Email address cannot be changed
                  </p>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="phone"
                    className="block text-black text-sm font-bold mb-2"
                  >
                    Contact No
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="shadow appearance-none rounded w-full h-[50px] py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline border border-[#C3C3C3] bg-gray-100"
                    value={profileData.phone}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="flex items-center justify-center mt-6">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="bg-[#FDD268] hover:bg-opacity-80 text-black font-bold w-full py-3 px-4 rounded-[4px] focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? "Saving Changes..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "changePassword" && <ChangePasswordForm />}
        </div>
      </div>
    </div>
  );
}
