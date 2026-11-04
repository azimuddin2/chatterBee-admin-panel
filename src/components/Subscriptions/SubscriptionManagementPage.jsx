"use client";
import React, { useState, useEffect } from "react";
import getAllSubscriptions, {
  transformSubscriptionsForDisplay,
} from "../lib/subscriptionApiClient";

// --- ICONS ---
const LoadingIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8 animate-spin text-yellow-400"
    viewBox="0 0 24 24"
    fill="none"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-green-500"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

const AlertIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-yellow-500"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
      clipRule="evenodd"
    />
  </svg>
);

// --- SUBSCRIPTION TABLE COMPONENT ---
const SubscriptionTable = ({ subscriptions, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <LoadingIcon />
          <p className="mt-4 text-gray-600">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <AlertIcon />
          <div>
            <p className="text-red-700 font-semibold">
              Error loading subscriptions
            </p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!subscriptions || subscriptions.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-700 font-semibold">No subscriptions found</p>
        <p className="text-yellow-600 text-sm mt-2">
          No subscription data available at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Plan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Period
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Payment
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {subscriptions.map((sub) => (
              <tr key={sub.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {sub.fullName}
                  </div>
                  <div className="text-xs text-gray-500">{sub.userEmail}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{sub.planName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">
                    ${parseFloat(sub.price || 0).toFixed(2)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                    {sub.planType || "N/A"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {sub.status === "active" ? (
                      <>
                        <CheckIcon />
                        <span className="text-sm font-medium text-green-700">
                          Active
                        </span>
                      </>
                    ) : (
                      <span className="text-sm font-medium text-gray-600">
                        {sub.status}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-xs text-gray-600">
                  <div>
                    Start:{" "}
                    {new Date(sub.currentPeriodStart).toLocaleDateString()}
                  </div>
                  <div>
                    End: {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${sub.paymentStatus === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                  >
                    {sub.paymentStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- STATS COMPONENT ---
const SubscriptionStats = ({ subscriptions }) => {
  const totalSubscriptions = subscriptions.length;
  const activeSubscriptions = subscriptions.filter(
    (s) => s.status === "active",
  ).length;
  const totalRevenue = subscriptions.reduce(
    (sum, s) => sum + parseFloat(s.price || 0),
    0,
  );
  const paidSubscriptions = subscriptions.filter(
    (s) => s.paymentStatus === "paid",
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600 text-sm font-medium">Total Subscriptions</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">
          {totalSubscriptions}
        </p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600 text-sm font-medium">
          Active Subscriptions
        </p>
        <p className="text-3xl font-bold text-green-600 mt-2">
          {activeSubscriptions}
        </p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
        <p className="text-3xl font-bold text-blue-600 mt-2">
          ${totalRevenue.toFixed(2)}
        </p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600 text-sm font-medium">Paid Subscriptions</p>
        <p className="text-3xl font-bold text-purple-600 mt-2">
          {paidSubscriptions}
        </p>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
export default function SubscriptionManagementPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch subscriptions on mount
  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getAllSubscriptions();

        if (response && response.data && response.data.subscriptions) {
          const transformed = transformSubscriptionsForDisplay(
            response.data.subscriptions,
          );
          setSubscriptions(transformed);
        } else {
          setError("Invalid response format from server");
        }
      } catch (err) {
        console.error("Failed to fetch subscriptions:", err);
        setError(
          err.message ||
            "Failed to load subscriptions. Please try again later.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  return (
    <div className=" min-h-screen p-4 sm:p-6 lg:p-8">
      <div className=" mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Subscriptions</h1>
          <p className="text-gray-600 mt-2">
            Manage and monitor all user subscriptions
          </p>
        </div>

        {/* Stats */}
        {!isLoading && !error && (
          <SubscriptionStats subscriptions={subscriptions} />
        )}

        {/* Subscription Table */}
        <SubscriptionTable
          subscriptions={subscriptions}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  );
}
