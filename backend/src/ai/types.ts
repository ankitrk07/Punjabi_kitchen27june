import type { PrismaClient } from "@prisma/client";

export type ChatRole = "user" | "assistant" | "system";

export type AssistantIntent =
  | "menu_search"
  | "menu_recommendation"
  | "dish_details"
  | "offers"
  | "coupons"
  | "reservations"
  | "order_status"
  | "order_history"
  | "profile"
  | "payment"
  | "delivery"
  | "pickup"
  | "restaurant_info"
  | "navigation"
  | "faq"
  | "greeting"
  | "general_conversation";

export type RetrievalModule =
  | "menu"
  | "offers"
  | "orders"
  | "reservations"
  | "user"
  | "navigation"
  | "faq";

export type AssistantMessage = {
  role: ChatRole;
  content: string;
};

export type AssistantRequestBody = {
  conversationId?: string;
  userEmail?: string;
  messages: AssistantMessage[];
};

export type AssistantAction =
  | {
      type: "navigate";
      label: string;
      route: string;
    }
  | {
      type: "add_to_cart";
      label: string;
      dishId: string;
    }
  | {
      type: "copy_coupon";
      label: string;
      code: string;
    };

export type AssistantCard =
  | {
      type: "dish";
      id: string;
      title: string;
      description: string;
      image?: string;
      priceLabel: string;
      meta: string[];
      action?: AssistantAction;
    }
  | {
      type: "offer";
      id: string;
      title: string;
      description: string;
      badge?: string;
      action?: AssistantAction;
    }
  | {
      type: "order_tracking";
      id: string;
      title: string;
      description: string;
      status: string;
      meta: string[];
      action?: AssistantAction;
    }
  | {
      type: "reservation";
      id: string;
      title: string;
      description: string;
      meta: string[];
      action?: AssistantAction;
    }
  | {
      type: "info";
      id: string;
      title: string;
      description: string;
      meta?: string[];
      action?: AssistantAction;
    };

export type AssistantReply = {
  text: string;
  cards: AssistantCard[];
  quickReplies: string[];
  actions: AssistantAction[];
};

export type AssistantResponse = {
  conversationId: string;
  intent: AssistantIntent;
  reply: AssistantReply;
};

export type OfferRecord = {
  id: string;
  title: string;
  code: string;
  desc: string;
  color?: string;
};

export type DishRecord = {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  veg: boolean;
  rating: number | null;
  categoryId: string;
  categoryName?: string;
  popularityScore?: number;
};

export type OrderRecord = {
  id: string;
  total: number;
  status: string;
  mode: string;
  createdAt: string;
  itemsSummary: string[];
};

export type ReservationRecord = {
  id: string;
  reservationDate: string;
  reservationSlot: string;
  guests: string;
  status: string;
  tableNumber: number;
  occasion?: string | null;
};

export type UserProfileRecord = {
  name: string;
  email: string;
  membershipTier: string;
  loyaltyPoints: number;
  addresses: string[];
  favorites: DishRecord[];
};

export type NavigationTarget = {
  id: string;
  label: string;
  route: string;
  keywords: string[];
};

export type FaqRecord = {
  id: string;
  title: string;
  answer: string;
};

export type ConversationMemory = {
  lastIntent?: AssistantIntent;
  lastResolvedQuery?: string;
  lastTopic?: string;
  lastMenuResults?: DishRecord[];
  lastNavigationRoute?: string;
  updatedAt: number;
};

export type ResolvedIntent = {
  intent: AssistantIntent;
  modules: RetrievalModule[];
  normalizedMessage: string;
  resolvedMessage: string;
  isFollowUp: boolean;
  budgetMax?: number;
  vegOnly?: boolean;
  nonVegOnly?: boolean;
  wantsSpicy?: boolean;
  wantsMild?: boolean;
  navigationTargetId?: string;
};

export type RetrievalBundle = {
  menu: DishRecord[];
  offers: OfferRecord[];
  activeOrder: OrderRecord | null;
  orderHistory: OrderRecord[];
  reservations: ReservationRecord[];
  userProfile: UserProfileRecord | null;
  navigation: NavigationTarget[];
  faq: FaqRecord[];
};

export type AssistantDependencies = {
  prisma: PrismaClient;
  offers: OfferRecord[];
};
