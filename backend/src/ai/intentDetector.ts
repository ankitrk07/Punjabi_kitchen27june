export type Intent =
  | "menu_search"
  | "menu_recommendation"
  | "offers"
  | "reservations"
  | "order_status"
  | "navigation"
  | "faq"
  | "greeting"
  | "general_conversation";

export class IntentDetector {
  detect(message: string): Intent[] {
    const q = message.toLowerCase();
    const intents: Intent[] = [];

    // 1. Navigation intents
    if (/\b(go to|open|show|navigate|view|track)\b/i.test(q) && /\b(cart|basket|profile|account|home|menu|booking|reservation|offer|offers|coupon|coupons)\b/i.test(q)) {
      intents.push("navigation");
    }

    // 2. Reservations
    if (/\b(booking|bookings|reservation|reservations|table|booked|book a table|reserve)\b/i.test(q)) {
      intents.push("reservations");
    }

    // 3. Orders / Order History
    if (/\b(order|orders|ordered|track my order|delivery status|eta)\b/i.test(q)) {
      intents.push("order_status");
    }

    // 4. Offers / Coupons
    if (/\b(offer|offers|deal|deals|promo|coupon|coupons|discount|discounts)\b/i.test(q)) {
      intents.push("offers");
    }

    // 5. FAQ
    if (/\b(timings|hours|refund|refunds|delivery|contact|location|where is|open time|close time)\b/i.test(q)) {
      intents.push("faq");
    }

    // 6. Greetings
    if (/\b(hi|hello|hey|greetings|namaste|good morning|good evening|yo)\b/i.test(q)) {
      intents.push("greeting");
    }

    // 7. Menu search / recommendations
    if (
      /\b(spicy|veg|vegetarian|non-veg|chicken|paneer|sweet|dessert|soup|noodle|rice|biryani|roti|naan|starters|under|below|budget|recommend|suggest|food|eat|hungry|menu|price|cost)\b/i.test(q) ||
      intents.length === 0
    ) {
      intents.push("menu_search");
    }

    // If nothing else and it is general chit chat
    if (intents.length === 0) {
      intents.push("general_conversation");
    }

    return intents;
  }
}
