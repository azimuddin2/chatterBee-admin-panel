"use client";
import { resetPassword, sendOTP, verifyOTP } from "@/components/lib/apiClient";
import React, { useState, useEffect, useRef } from "react";
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
      <line x1="3" y1="18" x2="17" y2="3" stroke="#211F2F" strokeWidth="1.5" />
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

// Step 1: Email Entry Component
const ForgotPasswordInitial = ({ onSendCode, loading }) => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    onSendCode(email);
  };

  return (
    <>
      <div className="self-stretch text-left sm:text-start">
        <h1 className="text-zinc-800 text-3xl font-semibold font-['Nunito'] leading-10">
          Forgot Password
        </h1>
        <p className="text-zinc-800 text-base font-medium font-['Nunito'] leading-snug mt-2">
          Enter your email to receive a verification code.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
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
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-[#FBBF24] rounded-xl text-zinc-800 text-base font-bold font-['Nunito'] hover:bg-yellow-400 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? "Sending Code..." : "Send Verification Code"}
        </button>
      </form>
    </>
  );
};

// Step 2: OTP Verification Component (4 digits)
const OTPVerification = ({ email, onVerify, onResend, loading, countdown }) => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputsRef = useRef([]);

  const handleChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    if (/^\d{4}$/.test(pastedData)) {
      const newOtp = pastedData.split("").slice(0, 4);
      setOtp(newOtp);
      inputsRef.current[3].focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 4) {
      toast.error("Please enter the complete 4-digit code.");
      return;
    }

    onVerify(code);
  };

  return (
    <>
      <div className="self-stretch text-left sm:text-start">
        <h1 className="text-zinc-800 text-3xl font-semibold font-['Nunito'] leading-10">
          Verification Code
        </h1>
        <p className="text-zinc-800 text-base font-medium font-['Nunito'] leading-snug mt-2">
          Enter the 4-digit code sent to your email.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
        <div>
          <label className="block text-zinc-800 text-sm font-semibold font-['Nunito'] mb-3">
            Verification Code
          </label>
          <div className="flex justify-between gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputsRef.current[index] = el)}
                type="text"
                maxLength="1"
                className="w-12 h-12 text-center rounded-xl border border-zinc-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FBBF24]"
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={index === 0 ? handlePaste : null}
                required
              />
            ))}
          </div>
        </div>

        <div className="text-center">
          <p className="text-slate-500 text-sm font-normal font-['Nunito']">
            {countdown > 0 ? (
              <>Resend code in 0:{countdown.toString().padStart(2, "0")}</>
            ) : (
              <button
                type="button"
                onClick={onResend}
                className="text-[#FBBF24] font-medium hover:underline"
              >
                Click to resend the code
              </button>
            )}
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-[#FBBF24] rounded-xl text-zinc-800 text-base font-bold font-['Nunito'] hover:bg-yellow-400 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? "Verifying..." : "Continue"}
        </button>
      </form>
    </>
  );
};

// Step 3: Set New Password Component
const SetNewPassword = ({ email, otp, onReset, loading }) => {
  const [password, setPassword] = useState("••••••••");
  const [confirmPassword, setConfirmPassword] = useState("••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = (field) => {
    if (field === "password") {
      if (password === "••••••••") setPassword("");
      setShowPassword(!showPassword);
    } else {
      if (confirmPassword === "••••••••") setConfirmPassword("");
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password === "••••••••" || confirmPassword === "••••••••") {
      toast.error("Please enter your new password.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    onReset(password, confirmPassword);
  };

  return (
    <>
      <div className="self-stretch text-left sm:text-start">
        <h1 className="text-zinc-800 text-3xl font-semibold font-['Nunito'] leading-10">
          Set New Password
        </h1>
        <p className="text-zinc-800 text-base font-medium font-['Nunito'] leading-snug mt-2">
          Create a new password for your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
        <div>
          <label
            htmlFor="password"
            className="block text-zinc-800 text-sm font-semibold font-['Nunito'] mb-1.5"
          >
            New Password
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
              onClick={() => togglePasswordVisibility("password")}
            >
              <EyeIcon show={showPassword} />
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-zinc-800 text-sm font-semibold font-['Nunito'] mb-1.5"
          >
            Confirm New Password
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <LockIcon />
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              className="w-full h-12 rounded-xl border border-zinc-200 bg-white pl-10 pr-10 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FBBF24]"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3.5"
              onClick={() => togglePasswordVisibility("confirmPassword")}
            >
              <EyeIcon show={showConfirmPassword} />
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-[#FBBF24] rounded-xl text-zinc-800 text-base font-bold font-['Nunito'] hover:bg-yellow-400 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? "Resetting Password..." : "Reset Password"}
        </button>
      </form>
    </>
  );
};

// Main Forgot Password Page
export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [verifiedOtp, setVerifiedOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendCode = async (userEmail) => {
    setLoading(true);
    setEmail(userEmail);

    try {
      const response = await sendOTP(userEmail);

      if (response.success) {
        toast.success("Verification code sent to your email!");
        setStep(2);
        setCountdown(30);
      } else {
        toast.error(response.message || "Failed to send verification code.");
      }
    } catch (err) {
      console.error("Send OTP error:", err);
      toast.error(err.message || "Failed to send verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (code) => {
    setLoading(true);

    try {
      const response = await verifyOTP(email, code);

      if (response.success) {
        toast.success("Code verified successfully!");
        setVerifiedOtp(code);
        setStep(3);
      } else {
        toast.error(response.message || "Invalid verification code.");
      }
    } catch (err) {
      console.error("Verify OTP error:", err);
      toast.error(err.message || "Invalid verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;

    setLoading(true);

    try {
      const response = await sendOTP(email);

      if (response.success) {
        toast.success("New verification code sent!");
        setCountdown(30);
      } else {
        toast.error(response.message || "Failed to resend code.");
      }
    } catch (err) {
      console.error("Resend OTP error:", err);
      toast.error(err.message || "Failed to resend code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (newPassword, confirmPassword) => {
    setLoading(true);

    try {
      const response = await resetPassword(
        email,
        verifiedOtp,
        newPassword,
        confirmPassword,
      );

      if (response.success) {
        toast.success("Password reset successfully!");
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      } else {
        toast.error(response.message || "Failed to reset password.");
      }
    } catch (err) {
      console.error("Reset password error:", err);
      toast.error(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Toaster position="top-center" reverseOrder={false} />

      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg flex flex-col justify-between items-start p-8 sm:p-18">
        <header className="w-full mb-8">
          <div className="w-[200px] h-[95px] mb-5">
            <img src="/chetterBee.png" alt="ChatterBee Logo" />
          </div>
        </header>

        <main className="w-full flex justify-center">
          <div className="w-full max-w-md flex flex-col gap-8">
            {step === 1 && (
              <ForgotPasswordInitial
                onSendCode={handleSendCode}
                loading={loading}
              />
            )}

            {step === 2 && (
              <OTPVerification
                email={email}
                onVerify={handleVerifyCode}
                onResend={handleResendCode}
                loading={loading}
                countdown={countdown}
              />
            )}

            {step === 3 && (
              <SetNewPassword
                email={email}
                otp={verifiedOtp}
                onReset={handleResetPassword}
                loading={loading}
              />
            )}

            {step !== 1 && (
              <p className="text-center text-slate-500 text-base font-normal font-['Nunito']">
                <button
                  onClick={() => setStep(1)}
                  className="text-[#FBBF24] font-medium hover:underline"
                >
                  Back to Email Entry
                </button>
              </p>
            )}
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
