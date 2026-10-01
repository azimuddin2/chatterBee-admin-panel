"use client";

import { loginUser } from "@/components/lib/apiClient";
import Link from "next/link";
import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";


// SVG Icons (unchanged)
const MailIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-gray-400"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
  </svg>
);

const LockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-gray-400"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
      clipRule="evenodd"
    />
  </svg>
);

const EyeIcon = ({ show }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="21"
    viewBox="0 0 20 21"
    fill="none"
  >
    <path
      d="M17.9534 9.70425C18.2067 10.0595 18.3334 10.2372 18.3334 10.5001C18.3334 10.763 18.2067 10.9407 17.9534 11.2959C16.815 12.8922 13.9077 16.3334 10.0001 16.3334C6.0924 16.3334 3.18516 12.8922 2.04678 11.2959C1.79342 10.9407 1.66675 10.763 1.66675 10.5001C1.66675 10.2372 1.79342 10.0595 2.04678 9.70425C3.18516 8.10795 6.0924 4.66675 10.0001 4.66675C13.9077 4.66675 16.815 8.10795 17.9534 9.70425Z"
      stroke="#211F2F"
      strokeWidth="1.5"
    />
    {!show && (
      <line
        x1="3"
        y1="18"
        x2="17"
        y2="3"
        stroke="#211F2F"
        strokeWidth="1.5"
      />
    )}
    {show && (
      <path
        d="M12.5 10.5C12.5 9.11925 11.3807 8 10 8C8.61925 8 7.5 9.11925 7.5 10.5C7.5 11.8807 8.61925 13 10 13C11.3807 13 12.5 11.8807 12.5 10.5Z"
        stroke="#211F2F"
        strokeWidth="1.5"
      />
    )}
  </svg>
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password || password === "") {
      setError("Please enter both email and password.");
      toast.error("Please enter both email and password.");
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      toast.error("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      const response = await loginUser(email, password);

      if (response.success) {
        toast.success("Login Successful!");

        // Set cookie expiry based on Remember Me
        if (rememberMe) {
          const token = response.data?.access;
          const date = new Date();
          date.setTime(date.getTime() + 30 * 24 * 60 * 60 * 1000);
          const expires = "expires=" + date.toUTCString();
          document.cookie = `token=${token};${expires};path=/;SameSite=Lax`;
        }

        // Redirect based on user role if available
        const redirectPath = response.data?.is_admin ? "/admin" : "/admin";
        setTimeout(() => {
          window.location.href = redirectPath;
        }, 500);
      } else {
        setError(response.message || "Login failed. Please try again.");
        toast.error(response.message || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage = err.message || "An unexpected error occurred. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    if (password === "") {
      setPassword("");
    }
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Toaster position="top-center" reverseOrder={false} />

      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg flex flex-col justify-between items-start p-8 sm:p-18">
        <header className="w-full mb-8">
          <div className="w-[200px] h-[95px]">
            <img src="/chetterBee.png" alt="" />
          </div>
        </header>

        <main className="w-full flex justify-center">
          <div className="w-full max-w-md flex flex-col gap-8">
            <div className="flex justify-center sm:justify-start "></div>
            <div className="self-stretch text-left sm:text-start">
              <h1 className="text-zinc-800 text-3xl font-semibold font-['Nunito'] leading-10">
                Login
              </h1>
              <p className="text-zinc-800 text-base font-medium font-['Nunito'] leading-snug mt-2">
                Let's login into your account first
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="w-full flex flex-col gap-5"
            >
              <div>
                <label
                  htmlFor="email"
                  className="block text-zinc-800 text-sm font-semibold font-['Nunito'] mb-1.5"
                >
                  Email address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <MailIcon />
                  </div>
                  <input
                    type="email"
                    id="email"
                    className="w-full h-12 rounded-xl border border-zinc-200 bg-white pl-10 pr-3.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FBBF24]"
                    placeholder="demo@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    suppressHydrationWarning
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-zinc-800 text-sm font-semibold font-['Nunito'] mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <LockIcon />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    className="w-full h-12 rounded-xl border border-zinc-200 bg-white pl-10 pr-10 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FBBF24]"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5"
                    onClick={togglePasswordVisibility}
                  >
                    <EyeIcon show={showPassword} />
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <label
                  htmlFor="rememberMe"
                  className="flex items-center gap-2 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    id="rememberMe"
                    className="hidden peer"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <div className="w-5 h-5 bg-white peer-checked:bg-[#FBBF24] rounded-md border-2 border-zinc-200 peer-checked:border-[#FBBF24] flex items-center justify-center transition-colors">
                    {rememberMe && (
                      <svg
                        className="w-3 h-3 text-black"
                        fill="none"
                        viewBox="0 0 14 11"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <path d="M1 5.5L4.95263 9.5L13 1.5" />
                      </svg>
                    )}
                  </div>
                  <span className="text-slate-500 text-xs font-normal font-['Nunito']">
                    Remember Me
                  </span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-red-500 text-sm font-normal font-['Nunito'] hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center font-['Nunito']">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#FBBF24] rounded-xl text-zinc-800 text-base font-bold font-['Nunito'] hover:bg-yellow-400 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </form>

            <p className="text-center text-slate-500 text-base font-normal font-['Nunito']">
              Don't have an account?{" "}
              <Link href="/register" className="font-bold text-yellow-500 hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </main>

        <footer className="w-full border-t border-gray-200 pt-6 mt-8 sm:mt-12 flex flex-col sm:flex-row justify-between items-center text-sm">
          <p className="text-slate-500 font-medium font-['Nunito'] mb-2 sm:mb-0">
            © 2025 ChatterBee. All rights reserved.
          </p>
          <a
            href="#"
            className="text-[#FBBF24] font-medium font-['Nunito'] hover:underline"
          >
            Term & Condition
          </a>
        </footer>
      </div>
    </div>
  );
}