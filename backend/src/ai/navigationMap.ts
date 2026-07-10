import type { NavigationTarget } from "./types";

export const NAVIGATION_TARGETS: NavigationTarget[] = [
  {
    id: "home",
    label: "Home",
    route: "/(tabs)/home",
    keywords: ["home", "main screen", "dashboard", "landing"],
  },
  {
    id: "menu",
    label: "Menu",
    route: "/(tabs)/menu",
    keywords: ["menu", "browse dishes", "food menu", "show food"],
  },
  {
    id: "cart",
    label: "Cart",
    route: "/cart",
    keywords: ["cart", "basket", "checkout"],
  },
  {
    id: "orders",
    label: "Orders",
    route: "/(tabs)/orders",
    keywords: ["orders", "my orders", "order tab"],
  },
  {
    id: "track_order",
    label: "Track Order",
    route: "/orders/track",
    keywords: ["track order", "track my order", "order status", "tracking"],
  },
  {
    id: "reserves",
    label: "Reserve Table",
    route: "/(tabs)/reserves",
    keywords: ["reserve", "reservation", "book table", "table booking"],
  },
  {
    id: "profile",
    label: "Profile",
    route: "/(tabs)/profile",
    keywords: ["profile", "account", "my account"],
  },
  {
    id: "favorites",
    label: "Favorites",
    route: "/profile/favorites/saved-dishes",
    keywords: ["favorites", "favourites", "saved dishes", "liked dishes"],
  },
  {
    id: "offers",
    label: "Offers",
    route: "/profile/offers",
    keywords: ["offers", "deals", "discounts", "coupons"],
  },
  {
    id: "payments",
    label: "Payments",
    route: "/profile/payments",
    keywords: ["payments", "payment methods", "wallet", "upi"],
  },
  {
    id: "support",
    label: "Support",
    route: "/profile/support/help",
    keywords: ["support", "help", "help center", "customer care"],
  },
  {
    id: "live_chat",
    label: "Live Chat",
    route: "/profile/support/live-chat",
    keywords: ["live chat", "agent", "human support"],
  },
  {
    id: "ai_waiter",
    label: "AI Assistant",
    route: "/profile/support/ai-waiter",
    keywords: ["ai waiter", "tadka", "assistant", "ai assistant"],
  },
];

export function findNavigationTarget(query: string): NavigationTarget | null {
  const normalized = query.toLowerCase();

  for (const target of NAVIGATION_TARGETS) {
    if (target.keywords.some((keyword) => normalized.includes(keyword))) {
      return target;
    }
  }

  return null;
}
