import { findNavigationTarget } from "./navigationMap";
import type { AssistantIntent, ConversationMemory, ResolvedIntent } from "./types";

const FOLLOW_UP_PATTERN = /\b(cheaper|anything else|something else|more options|another|same one|that one|those|them|similar|spicier|milder|lighter|less spicy|more affordable)\b/i;
const GREETING_PATTERN = /\b(hi|hello|hey|namaste|good morning|good evening)\b/i;

function detectIntent(normalizedMessage: string): AssistantIntent {
  if (GREETING_PATTERN.test(normalizedMessage) && normalizedMessage.split(/\s+/).length <= 5) {
    return "greeting";
  }

  if (/\b(open|go to|take me|show me|navigate|switch to)\b/i.test(normalizedMessage) && findNavigationTarget(normalizedMessage)) {
    return "navigation";
  }

  if (/\b(track|where is my order|order status|eta|delivery status)\b/i.test(normalizedMessage)) {
    return "order_status";
  }

  if (/\b(order history|past orders|previous orders|last orders)\b/i.test(normalizedMessage)) {
    return "order_history";
  }

  if (/\b(reservation|book table|table booking|reserve)\b/i.test(normalizedMessage)) {
    return "reservations";
  }

  if (/\b(offer|coupon|deal|discount|promo)\b/i.test(normalizedMessage)) {
    return /\bcoupon|promo|code\b/i.test(normalizedMessage) ? "coupons" : "offers";
  }

  if (/\b(profile|account|address|favourite|favorite|membership|loyalty)\b/i.test(normalizedMessage)) {
    return "profile";
  }

  if (/\b(payment|upi|wallet|refund|card|checkout)\b/i.test(normalizedMessage)) {
    return "payment";
  }

  if (/\b(delivery|deliver|home delivery)\b/i.test(normalizedMessage)) {
    return "delivery";
  }

  if (/\b(pickup|takeaway|pick up)\b/i.test(normalizedMessage)) {
    return "pickup";
  }

  if (/\b(contact|timing|hours|location|restaurant|address|policy|refund policy|help center)\b/i.test(normalizedMessage)) {
    return /\b(policy|refund|delivery info|contact|timing|hours|location)\b/i.test(normalizedMessage) ? "faq" : "restaurant_info";
  }

  if (/\b(what is|tell me about|details of|ingredients|contains|allergen)\b/i.test(normalizedMessage)) {
    return "dish_details";
  }

  if (/\b(recommend|suggest|best|popular|top|try|craving)\b/i.test(normalizedMessage)) {
    return "menu_recommendation";
  }

  if (/\b(menu|dish|dishes|paneer|chicken|veg|non veg|spicy|under|budget|starter|biryani|naan|rice|dessert)\b/i.test(normalizedMessage)) {
    return "menu_search";
  }

  return "general_conversation";
}

function getModules(intent: AssistantIntent) {
  switch (intent) {
    case "menu_search":
    case "menu_recommendation":
    case "dish_details":
      return ["menu"] as const;
    case "offers":
    case "coupons":
      return ["offers"] as const;
    case "reservations":
      return ["reservations", "navigation"] as const;
    case "order_status":
      return ["orders", "navigation"] as const;
    case "order_history":
      return ["orders"] as const;
    case "profile":
      return ["user", "navigation"] as const;
    case "payment":
      return ["user", "navigation"] as const;
    case "delivery":
    case "pickup":
    case "restaurant_info":
    case "faq":
      return ["faq", "navigation"] as const;
    case "navigation":
      return ["navigation"] as const;
    default:
      return [] as const;
  }
}

export function resolveIntent(userMessage: string, memory?: ConversationMemory): ResolvedIntent {
  const normalizedMessage = userMessage.trim().replace(/\s+/g, " ");
  const isFollowUp = FOLLOW_UP_PATTERN.test(normalizedMessage) && !!memory?.lastTopic;
  const resolvedMessage = isFollowUp && memory?.lastTopic
    ? `${memory.lastTopic}. Follow-up request: ${normalizedMessage}`
    : normalizedMessage;

  const intent = detectIntent(resolvedMessage.toLowerCase());
  const navigationTarget = findNavigationTarget(resolvedMessage);
  const budgetMatch = resolvedMessage.match(/\b(?:under|below|less than|max|budget)\s*(?:rs\.?|inr|₹)?\s*(\d+)\b/i)
    || resolvedMessage.match(/\b(?:rs\.?|inr|₹)\s*(\d+)\b/i);

  return {
    intent,
    modules: [...getModules(intent)],
    normalizedMessage,
    resolvedMessage,
    isFollowUp,
    budgetMax: budgetMatch ? Number(budgetMatch[1]) : undefined,
    vegOnly: /\b(veg|vegetarian|paneer|mushroom|dal|pure veg)\b/i.test(resolvedMessage),
    nonVegOnly: /\b(non veg|non-veg|chicken|mutton|fish|egg|prawn)\b/i.test(resolvedMessage),
    wantsSpicy: /\b(spicy|hot|masala|schezwan|achari|fiery)\b/i.test(resolvedMessage),
    wantsMild: /\b(mild|light|less spicy|not spicy)\b/i.test(resolvedMessage),
    navigationTargetId: navigationTarget?.id,
  };
}
