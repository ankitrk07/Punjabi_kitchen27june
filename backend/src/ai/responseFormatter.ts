import { PrismaClient } from "@prisma/client";

export class ResponseFormatter {
  private prisma: PrismaClient;
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async format(
    rawText: string,
    contextData: {
      dishes: any[];
      offers: any[];
      orders: any[];
      reservations: any[];
    }
  ) {
    // Regex extractors
    const dishRegex = /\[DISH:([A-Za-z0-9_\-\(\)]+)\]/g;
    const offerRegex = /\[OFFER:([A-Za-z0-9_\-\(\)]+)\]/g;
    const reservationRegex = /\[RESERVATION:([A-Za-z0-9_\-]+)\]/g;
    const orderRegex = /\[ORDER:([A-Za-z0-9_\-]+)\]/g;
    const navRegex = /\[NAV:([A-Za-z0-9_\-\(\)\/]+)\]/g;

    const dishIds: string[] = [];
    const offerIds: string[] = [];
    const reservationIds: string[] = [];
    const orderIds: string[] = [];
    let navigationRoute: string | null = null;

    let match;
    while ((match = dishRegex.exec(rawText)) !== null) {
      dishIds.push(match[1]);
    }
    while ((match = offerRegex.exec(rawText)) !== null) {
      offerIds.push(match[1]);
    }
    while ((match = reservationRegex.exec(rawText)) !== null) {
      reservationIds.push(match[1]);
    }
    while ((match = orderRegex.exec(rawText)) !== null) {
      orderIds.push(match[1]);
    }
    if ((match = navRegex.exec(rawText)) !== null) {
      navigationRoute = match[1];
    }

    // Clean rawText of all tags
    const cleanedText = rawText
      .replace(dishRegex, "")
      .replace(offerRegex, "")
      .replace(reservationRegex, "")
      .replace(orderRegex, "")
      .replace(navRegex, "")
      .replace(/\s+/g, " ")
      .trim();

    // Map matched IDs to full business items
    const matchedDishes = contextData.dishes.filter(d => dishIds.includes(d.id));
    const matchedOffers = contextData.offers.filter(o => offerIds.includes(o.id) || offerIds.includes(o.code));
    const matchedReservations = contextData.reservations.filter(r => reservationIds.includes(r.id));
    const matchedOrders = contextData.orders.filter(o => orderIds.includes(o.id));

    // Dynamic quick reply suggestions based on matches
    const quickReplies: string[] = [];
    if (matchedOffers.length > 0) {
      quickReplies.push("🎁 Redeem Offers");
    }
    if (navigationRoute) {
      quickReplies.push(`👉 Go to ${navigationRoute.replace(/\/\(tabs\)\//, "")}`);
    }
    if (quickReplies.length === 0) {
      quickReplies.push("🔥 Spicy paneer?", "🌱 Under ₹300", "📅 Table booking");
    }

    return {
      text: cleanedText,
      dishes: matchedDishes,
      offers: matchedOffers,
      reservations: matchedReservations,
      orders: matchedOrders,
      navigation: navigationRoute,
      quickReplies
    };
  }
}
