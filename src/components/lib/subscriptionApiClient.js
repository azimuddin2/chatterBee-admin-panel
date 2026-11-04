// ============================================
// FILE: lib/subscriptionApiClient.js
// Purpose: Subscription-specific API Client
// ============================================

import { apiCall } from "./apiClient";
import { API_ENDPOINTS } from "./api";

/**
 * Get all subscriptions with user details
 * @returns {Promise} - List of subscriptions with nested user and subscription data
 * Response format:
 * {
 *   success: boolean,
 *   message: string,
 *   data: {
 *     total_count: number,
 *     page: number,
 *     page_size: number,
 *     subscriptions: Array<{
 *       user: { id, email, full_name, role },
 *       subscription: { id, status, plan_name, plan_type, price, ... }
 *     }>
 *   }
 * }
 */
export const getAllSubscriptions = async () => {
  try {
    const response = await apiCall(
      API_ENDPOINTS.SUBSCRIPTION.GET_ALL_SUBSCRIPTIONS,
      "GET",
    );
    return response;
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    throw error;
  }
};

/**
 * Get subscription details by ID
 * @param {number} subscriptionId - Subscription ID
 * @returns {Promise} - Subscription details
 */
export const getSubscriptionById = async (subscriptionId) => {
  try {
    const endpoint =
      API_ENDPOINTS.SUBSCRIPTION.GET_SUBSCRIPTION_DETAILS(subscriptionId);
    const response = await apiCall(endpoint, "GET");
    return response;
  } catch (error) {
    console.error("Error fetching subscription:", error);
    throw error;
  }
};

/**
 * Transform subscription data for display
 * Flattens nested user and subscription data
 * @param {Array} subscriptions - Raw subscriptions array from API
 * @returns {Array} - Transformed subscriptions for display
 */
export const transformSubscriptionsForDisplay = (subscriptions) => {
  if (!Array.isArray(subscriptions)) {
    return [];
  }

  return subscriptions.map((item) => ({
    id: item.subscription?.id || Math.random(),
    // User Information
    userId: item.user?.id,
    userEmail: item.user?.email,
    fullName: item.user?.full_name,
    userRole: item.user?.role,
    // Subscription Information
    status: item.subscription?.status,
    planName: item.subscription?.plan_name,
    planType: item.subscription?.plan_type,
    price: item.subscription?.price,
    currentPeriodStart: item.subscription?.current_period_start,
    currentPeriodEnd: item.subscription?.current_period_end,
    trialEnd: item.subscription?.trial_end,
    canceledAt: item.subscription?.canceled_at,
    paymentStatus: item.subscription?.payment_status,
    lastPaymentDate: item.subscription?.last_payment_date,
    createdAt: item.subscription?.created_at,
  }));
};

export default getAllSubscriptions;
