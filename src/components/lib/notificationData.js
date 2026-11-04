// lib/notificationData.js

export const notifications = [
  {
    id: "notif-1",
    title: "Event Created Successfully",
    description: "The event has been successfully added to the system.",
    timestamp: "2025-06-06T01:47:00Z", // Today, 5 mins ago from current time
    isRead: false,
  },
  {
    id: "notif-2",
    title: "Event Created Successfully",
    description: "The event has been successfully added to the system.",
    timestamp: "2025-06-06T01:47:00Z", // Today, 5 mins ago from current time
    isRead: false,
  },
  {
    id: "notif-3",
    title: "Event Created Successfully",
    description: "The event has been successfully added to the system.",
    timestamp: "2025-06-05T23:55:00Z", // Yesterday (assuming current time is early morning 6th)
    isRead: false,
  },
  {
    id: "notif-4",
    title: "Event Created Successfully",
    description: "The event has been successfully added to the system.",
    timestamp: "2025-06-05T23:50:00Z", // Yesterday
    isRead: true, // Example of a read notification
  },
  {
    id: "notif-5",
    title: "New User Registered",
    description: "A new user, John Doe, has signed up for the platform.",
    timestamp: "2025-06-05T10:00:00Z", // Yesterday
    isRead: false,
  },
  {
    id: "notif-6",
    title: "System Update Available",
    description: "A critical system update is ready for installation.",
    timestamp: "2025-06-04T15:30:00Z", // Older notification
    isRead: true,
  },
  {
    id: "notif-6",
    title: "System Update Available",
    description: "A critical system update is ready for installation.",
    timestamp: "2025-06-04T15:30:00Z", // Older notification
    isRead: true,
  },
];

export const getNotificationById = (id) => {
  return notifications.find((notif) => notif.id === id);
};
