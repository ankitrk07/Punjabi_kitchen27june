import { API_BASE_URL } from "../config/api";
import type { Category, Dish } from "../data/menu";
import type { Address, Order, User } from "../context/AppContext";

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

  // Dishes
  getDishes: () => apiCall<Dish[]>("/dishes"),

  // Reviews
  getReviews: () => apiCall<ReviewData[]>("/reviews"),

  // Offers
  getOffers: () => apiCall<OfferData[]>("/offers"),

  // Deal of the Day
  getDealOfDay: () => apiCall<DealOfDayData>("/deal-of-day"),

  // User
  syncUserProfile: (user: Partial<User>) =>
    apiCall<User & { addresses: Address[] }>("/users", {
      method: "POST",
      body: JSON.stringify(user),
    }),

  getUserProfile: (email: string) =>
    apiCall<User & { addresses: Address[]; cart?: any[] }>(`/users/${encodeURIComponent(email)}`),

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

  getOrders: () => apiCall<Order[]>("/orders"),
};
