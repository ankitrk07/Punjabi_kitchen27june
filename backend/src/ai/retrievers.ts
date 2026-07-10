import { NAVIGATION_TARGETS, findNavigationTarget } from "./navigationMap";
import type {
  AssistantDependencies,
  DishRecord,
  FaqRecord,
  OfferRecord,
  OrderRecord,
  ReservationRecord,
  ResolvedIntent,
  RetrievalBundle,
  UserProfileRecord,
} from "./types";

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1);
}

function summarizeOrderItems(rawItems: unknown): string[] {
  if (!Array.isArray(rawItems)) {
    return [];
  }

  return rawItems
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const safeItem = item as { name?: string; qty?: number };
      const name = safeItem.name || "Item";
      const qty = safeItem.qty || 1;
      return `${qty} x ${name}`;
    })
    .filter((entry): entry is string => !!entry);
}

function getFaqRecords(): FaqRecord[] {
  return [
    {
      id: "delivery_help",
      title: "Delivery Help",
      answer: "You can track a live delivery from the Orders section, and support is available from the Help Center or Live Chat screens.",
    },
    {
      id: "refund_help",
      title: "Refund Help",
      answer: "Refund and payment history are available from the profile payments section, and order-specific help is available from support.",
    },
    {
      id: "reservation_help",
      title: "Reservations",
      answer: "Table bookings and reservation updates are managed from the Reserves tab and reservation history screens.",
    },
  ];
}

async function getPopularityMap(deps: AssistantDependencies): Promise<Map<string, number>> {
  const orders = await deps.prisma.order.findMany({
    take: 120,
    orderBy: { createdAt: "desc" },
    select: { items: true },
  });

  const popularityMap = new Map<string, number>();

  for (const order of orders) {
    for (const item of summarizeOrderItems(order.items)) {
      const parts = item.split(" x ");
      const name = parts.length > 1 ? parts[1] : parts[0];
      popularityMap.set(name.toLowerCase(), (popularityMap.get(name.toLowerCase()) || 0) + 1);
    }
  }

  return popularityMap;
}

function scoreDish(dish: DishRecord, query: string, intent: ResolvedIntent, queryTokens: string[]): number {
  const haystack = `${dish.name} ${dish.description} ${dish.categoryName || ""}`.toLowerCase();
  let score = 0;

  for (const token of queryTokens) {
    if (haystack.includes(token)) {
      score += 3;
    }
    if (dish.name.toLowerCase().includes(token)) {
      score += 5;
    }
    if ((dish.categoryName || "").toLowerCase().includes(token)) {
      score += 2;
    }
  }

  if (intent.vegOnly && dish.veg) {
    score += 4;
  }

  if (intent.nonVegOnly && !dish.veg) {
    score += 4;
  }

  if (intent.wantsSpicy && /spicy|hot|schezwan|achari|masala|chilli|pepper/i.test(dish.description)) {
    score += 4;
  }

  if (intent.wantsMild && !/spicy|hot|schezwan|achari|masala|chilli|pepper/i.test(dish.description)) {
    score += 3;
  }

  if (intent.budgetMax !== undefined && dish.price <= intent.budgetMax) {
    score += 3;
  }

  if (/\b(popular|best|top|recommend)\b/i.test(query)) {
    score += dish.popularityScore || 0;
    score += dish.rating || 0;
  }

  if (dish.rating) {
    score += dish.rating / 2;
  }

  return score;
}

async function retrieveMenu(deps: AssistantDependencies, intent: ResolvedIntent): Promise<DishRecord[]> {
  const [categories, dishes, popularityMap] = await Promise.all([
    deps.prisma.category.findMany(),
    deps.prisma.dish.findMany(),
    getPopularityMap(deps),
  ]);

  const categoryMap = new Map(categories.map((category) => [category.id, category.name]));
  const hydratedDishes: DishRecord[] = dishes.map((dish) => ({
    ...dish,
    categoryName: categoryMap.get(dish.categoryId) || "Menu",
    popularityScore: popularityMap.get(dish.name.toLowerCase()) || 0,
  }));

  let filtered = [...hydratedDishes];

  if (intent.vegOnly && !intent.nonVegOnly) {
    filtered = filtered.filter((dish) => dish.veg);
  }

  if (intent.nonVegOnly && !intent.vegOnly) {
    filtered = filtered.filter((dish) => !dish.veg);
  }

  if (intent.budgetMax !== undefined) {
    filtered = filtered.filter((dish) => dish.price <= intent.budgetMax!);
  }

  const queryTokens = tokenize(intent.resolvedMessage);
  filtered = filtered
    .map((dish) => ({ dish, score: scoreDish(dish, intent.resolvedMessage, intent, queryTokens) }))
    .filter((entry) => entry.score > 0 || intent.intent === "menu_recommendation")
    .sort((left, right) => right.score - left.score || right.dish.price - left.dish.price)
    .map((entry) => entry.dish);

  if (intent.intent === "dish_details" && filtered.length > 0) {
    return filtered.slice(0, 1);
  }

  return filtered.slice(0, 6);
}

async function retrieveOffers(deps: AssistantDependencies, intent: ResolvedIntent): Promise<OfferRecord[]> {
  const query = intent.resolvedMessage.toLowerCase();
  const filtered = deps.offers.filter((offer) => {
    const haystack = `${offer.title} ${offer.code} ${offer.desc}`.toLowerCase();
    return haystack.includes(query) || /\boffer|coupon|deal|discount|promo\b/.test(query);
  });

  return (filtered.length > 0 ? filtered : deps.offers).slice(0, 4);
}

async function retrieveOrders(deps: AssistantDependencies, userEmail: string | undefined) {
  if (!userEmail) {
    return {
      activeOrder: null,
      orderHistory: [] as OrderRecord[],
    };
  }

  const orders = await deps.prisma.order.findMany({
    where: { userEmail },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  const mappedOrders: OrderRecord[] = orders.map((order) => ({
    id: order.id,
    total: order.total,
    status: order.status,
    mode: order.mode,
    createdAt: order.createdAt.toISOString(),
    itemsSummary: summarizeOrderItems(order.items),
  }));

  const activeOrder = mappedOrders.find((order) => !["Delivered", "Cancelled"].includes(order.status)) || null;

  return {
    activeOrder,
    orderHistory: mappedOrders,
  };
}

async function retrieveReservations(deps: AssistantDependencies, userEmail: string | undefined): Promise<ReservationRecord[]> {
  if (!userEmail) {
    return [];
  }

  const reservations = await deps.prisma.reservation.findMany({
    where: { userEmail },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  return reservations.map((reservation) => ({
    id: reservation.id,
    reservationDate: reservation.reservationDate,
    reservationSlot: reservation.reservationSlot,
    guests: reservation.guests,
    status: reservation.status,
    tableNumber: reservation.tableNumber,
    occasion: reservation.occasion,
  }));
}

async function retrieveUserProfile(deps: AssistantDependencies, userEmail: string | undefined): Promise<UserProfileRecord | null> {
  if (!userEmail) {
    return null;
  }

  const user = await deps.prisma.user.findUnique({
    where: { email: userEmail },
    include: {
      addresses: true,
    },
  });

  if (!user) {
    return null;
  }

  const favorites = user.favorites.length > 0
    ? await deps.prisma.dish.findMany({
        where: {
          id: { in: user.favorites },
        },
      })
    : [];

  return {
    name: user.name,
    email: user.email,
    membershipTier: user.membershipTier,
    loyaltyPoints: user.loyaltyPoints,
    addresses: user.addresses.map((address) => `${address.label}: ${address.line}`),
    favorites,
  };
}

export async function retrieveBusinessData(
  deps: AssistantDependencies,
  intent: ResolvedIntent,
  userEmail?: string,
): Promise<RetrievalBundle> {
  const navigationTarget = intent.navigationTargetId
    ? NAVIGATION_TARGETS.filter((target) => target.id === intent.navigationTargetId)
    : findNavigationTarget(intent.resolvedMessage)
      ? [findNavigationTarget(intent.resolvedMessage)!]
      : [];

  const [menu, offers, orderData, reservations, userProfile] = await Promise.all([
    intent.modules.includes("menu") ? retrieveMenu(deps, intent) : Promise.resolve([] as DishRecord[]),
    intent.modules.includes("offers") ? retrieveOffers(deps, intent) : Promise.resolve([] as OfferRecord[]),
    intent.modules.includes("orders") ? retrieveOrders(deps, userEmail) : Promise.resolve({ activeOrder: null, orderHistory: [] as OrderRecord[] }),
    intent.modules.includes("reservations") ? retrieveReservations(deps, userEmail) : Promise.resolve([] as ReservationRecord[]),
    intent.modules.includes("user") ? retrieveUserProfile(deps, userEmail) : Promise.resolve(null),
  ]);

  return {
    menu,
    offers,
    activeOrder: orderData.activeOrder,
    orderHistory: orderData.orderHistory,
    reservations,
    userProfile,
    navigation: navigationTarget,
    faq: intent.modules.includes("faq") ? getFaqRecords() : [],
  };
}
