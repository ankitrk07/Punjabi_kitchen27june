import { API_BASE_URL } from "../config/api";
import type { Category, Dish } from "../data/menu";
import type { Address, Order, User } from "../context/AppContext";

/**
 * Resolves local relative image paths to the fully-qualified backend server URL.
 * If the image is already an external URL (e.g. Unsplash), it returns it as-is.
 */
export const resolveImageUrl = (imageUrl: string): string => {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://") || imageUrl.startsWith("file://")) {
    return imageUrl;
  }
  // Strip "/api" from API_BASE_URL (e.g. "http://192.168.1.10:3000/api" -> "http://192.168.1.10:3000")
  const serverBase = API_BASE_URL.replace(/\/api$/, "");
  const cleanPath = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
  return `${serverBase}${encodeURI(cleanPath)}`;
};

export type ReviewData = {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  text: string;
  createdAt: string;
};

export type OfferData = {
  id: string;
  title: string;
  code: string;
  desc: string;
  color: string;
};

export type DealOfDayData = {
  title: string;
  dishName: string;
  price: number;
  originalPrice: number;
  image: string;
  desc: string;
};

// Generic API caller to simplify fetch wrapper
async function apiCall<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${response.status} calling ${path}`);
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  // Categories
  getCategories: () => apiCall<Category[]>("/categories"),

  addCategory: (category: any) =>
    apiCall<Category>("/categories", {
      method: "POST",
      body: JSON.stringify(category),
    }),

  updateCategory: (id: string, category: any) =>
    apiCall<Category>(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(category),
    }),

  deleteCategory: (id: string) =>
    apiCall<any>(`/categories/${id}`, {
      method: "DELETE",
    }),

  // Dishes
  getDishes: () => apiCall<Dish[]>("/dishes"),

  // Reviews
  getReviews: () => apiCall<ReviewData[]>("/reviews"),

  // Offers
  getOffers: () => apiCall<OfferData[]>("/offers"),

  // Deal of the Day
  getDealOfDay: () => apiCall<DealOfDayData>("/deal-of-day"),

  // User
  syncUserProfile: (user: Partial<User> & { favorites?: string[] }) =>
    apiCall<User & { addresses: Address[]; favorites?: string[] }>("/users", {
      method: "POST",
      body: JSON.stringify(user),
    }),

  getUserProfile: (email: string) =>
    apiCall<User & { addresses: Address[]; favorites?: string[]; cart?: any[] }>(`/users/${encodeURIComponent(email)}`),

  saveCart: (email: string, cart: any[]) =>
    apiCall<{ success: boolean }>(`/users/${encodeURIComponent(email)}/cart`, {
      method: "POST",
      body: JSON.stringify({ cart }),
    }),

  // Addresses
  addAddress: (email: string, address: Omit<Address, "id">) =>
    apiCall<Address>("/addresses", {
      method: "POST",
      body: JSON.stringify({ email, label: address.label, line: address.line }),
    }),

  removeAddress: (id: string) =>
    apiCall<{ success: boolean }>(`/addresses/${id}`, {
      method: "DELETE",
    }),

  // Orders
  createOrder: (order: Order) =>
    apiCall<Order>("/orders", {
      method: "POST",
      body: JSON.stringify(order),
    }),

  getOrders: (email?: string) =>
    apiCall<Order[]>(email ? `/orders?email=${encodeURIComponent(email)}` : "/orders"),

  cancelOrder: (id: string) =>
    apiCall<Order>(`/orders/${id}/cancel`, {
      method: "POST",
    }),

  updateOrderStatus: (id: string, status: string) =>
    apiCall<Order>(`/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  // Reviews
  submitReview: (review: { name: string; avatar?: string; rating: number; text: string }) =>
    apiCall<any>("/reviews", {
      method: "POST",
      body: JSON.stringify(review),
    }),

  getReservations: (email?: string, date?: string, slot?: string) => {
    const params = [];
    if (email) params.push(`email=${encodeURIComponent(email)}`);
    if (date) params.push(`date=${encodeURIComponent(date)}`);
    if (slot) params.push(`slot=${encodeURIComponent(slot)}`);
    const query = params.length > 0 ? `?${params.join("&")}` : "";
    return apiCall<any[]>(`/reservations${query}`);
  },

  createReservation: (reservation: {
    customerName: string;
    customerPhone: string;
    reservationDate: string;
    reservationSlot: string;
    guests: string;
    guestCount: number;
    userEmail?: string;
    tableNumber?: number;
    occasion?: string;
    specialRequests?: string | null;
    seatingType?: string | null;
  }) =>
    apiCall<any>("/reservations", {
      method: "POST",
      body: JSON.stringify(reservation),
    }),

  cancelReservation: (id: string) =>
    apiCall<any>(`/reservations/${id}/cancel`, {
      method: "POST",
    }),

  // Dishes Editor
  addDish: (dish: any) =>
    apiCall<any>("/dishes", {
      method: "POST",
      body: JSON.stringify(dish),
    }),

  updateDish: (id: string, dish: any) =>
    apiCall<any>(`/dishes/${id}`, {
      method: "PUT",
      body: JSON.stringify(dish),
    }),

  deleteDish: (id: string) =>
    apiCall<any>(`/dishes/${id}`, {
      method: "DELETE",
    }),

  // Admin Metrics & Users
  getAdminMetrics: () => apiCall<any>("/admin/metrics"),
  getAdminUsers: () => apiCall<any[]>("/admin/users"),
  getDealOfDayStatus: () => apiCall<any>("/admin/deal-of-day-status"),
  updateDealOfDay: (deal: any) =>
    apiCall<any>("/admin/deal-of-day", {
      method: "POST",
      body: JSON.stringify(deal),
    }),

  // Catering
  getCateringRequests: (email?: string) =>
    apiCall<any[]>(email ? `/catering?email=${encodeURIComponent(email)}` : "/catering"),

  createCateringRequest: (request: any) =>
    apiCall<any>("/catering", {
      method: "POST",
      body: JSON.stringify(request),
    }),

  updateCateringStatus: (id: string, status: string) =>
    apiCall<any>(`/catering/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  // Support
  getSupportTickets: (email?: string) =>
    apiCall<any[]>(email ? `/support/tickets?email=${encodeURIComponent(email)}` : "/support/tickets"),

  createSupportTicket: (ticket: any) =>
    apiCall<any>("/support/tickets", {
      method: "POST",
      body: JSON.stringify(ticket),
    }),

  updateTicketStatus: (id: string, update: { status: string; lastUpdate: string }) =>
    apiCall<any>(`/support/tickets/${id}`, {
      method: "PATCH",
      body: JSON.stringify(update),
    }),

  // Notifications/Announcements
  getNotifications: (email?: string) =>
    apiCall<any[]>(email ? `/notifications?email=${encodeURIComponent(email)}` : "/notifications"),

  createNotification: (notification: any) =>
    apiCall<any>("/notifications", {
      method: "POST",
      body: JSON.stringify(notification),
    }),

  // Image Upload API
  uploadImage: (name: string, base64: string) =>
    apiCall<{ imageUrl: string }>("/upload", {
      method: "POST",
      body: JSON.stringify({ name, base64 }),
    }),

  // Authentication API
  login: (credentials: { email: string; password?: string }) =>
    apiCall<any>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),
};
