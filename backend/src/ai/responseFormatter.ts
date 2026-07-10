import type {
  AssistantAction,
  AssistantCard,
  AssistantIntent,
  AssistantReply,
  OfferRecord,
  RetrievalBundle,
  ResolvedIntent,
} from "./types";

function buildOfferAction(offer: OfferRecord): AssistantAction {
  return {
    type: "copy_coupon",
    label: `Use ${offer.code}`,
    code: offer.code,
  };
}

function buildQuickReplies(intent: AssistantIntent): string[] {
  switch (intent) {
    case "menu_recommendation":
    case "menu_search":
      return ["Show something cheaper", "Any vegetarian options?", "What pairs well with this?"];
    case "offers":
    case "coupons":
      return ["Best offer for delivery", "Show first-order deals", "Open offers"];
    case "order_status":
      return ["Track my order", "Need delivery help", "Show recent orders"];
    case "reservations":
      return ["Reserve a table", "Show my bookings", "Open reserves"];
    case "profile":
      return ["Open favourites", "Show my addresses", "Open profile"];
    default:
      return ["Show menu", "Track my order", "Show offers"];
  }
}

function buildNavigationActions(retrieval: RetrievalBundle): AssistantAction[] {
  return retrieval.navigation.map((target) => ({
    type: "navigate",
    label: `Open ${target.label}`,
    route: target.route,
  }));
}

function buildCards(intent: ResolvedIntent, retrieval: RetrievalBundle): AssistantCard[] {
  const cards: AssistantCard[] = [];

  for (const dish of retrieval.menu.slice(0, 3)) {
    cards.push({
      type: "dish",
      id: dish.id,
      title: dish.name,
      description: dish.description,
      image: dish.image,
      priceLabel: `Rs ${Math.round(dish.price)}`,
      meta: [
        dish.veg ? "Vegetarian" : "Non-vegetarian",
        dish.rating ? `${dish.rating.toFixed(1)} rating` : "Chef recommendation",
        dish.categoryName || "Menu",
      ],
      action: {
        type: "add_to_cart",
        label: "Add to cart",
        dishId: dish.id,
      },
    });
  }

  for (const offer of retrieval.offers.slice(0, 2)) {
    cards.push({
      type: "offer",
      id: offer.id,
      title: offer.title,
      description: offer.desc,
      badge: offer.code,
      action: buildOfferAction(offer),
    });
  }

  if (retrieval.activeOrder) {
    cards.push({
      type: "order_tracking",
      id: retrieval.activeOrder.id,
      title: `Order ${retrieval.activeOrder.id}`,
      description: retrieval.activeOrder.itemsSummary.join(", ") || "Your current order is in progress.",
      status: retrieval.activeOrder.status,
      meta: [
        retrieval.activeOrder.mode,
        `Rs ${Math.round(retrieval.activeOrder.total)}`,
      ],
      action: {
        type: "navigate",
        label: "Track order",
        route: "/orders/track",
      },
    });
  }

  for (const reservation of retrieval.reservations.slice(0, 2)) {
    cards.push({
      type: "reservation",
      id: reservation.id,
      title: `${reservation.reservationDate} at ${reservation.reservationSlot}`,
      description: reservation.occasion || "Table reservation",
      meta: [
        reservation.guests,
        `Table ${reservation.tableNumber}`,
        reservation.status,
      ],
      action: {
        type: "navigate",
        label: "Open reserves",
        route: "/(tabs)/reserves",
      },
    });
  }

  if (cards.length === 0 && retrieval.faq.length > 0) {
    const faq = retrieval.faq[0];
    cards.push({
      type: "info",
      id: faq.id,
      title: faq.title,
      description: faq.answer,
      meta: ["Punjabi Kitchen help"],
      action: {
        type: "navigate",
        label: "Open help",
        route: "/profile/support/help",
      },
    });
  }

  if (cards.length === 0 && intent.intent === "navigation" && retrieval.navigation[0]) {
    cards.push({
      type: "info",
      id: retrieval.navigation[0].id,
      title: retrieval.navigation[0].label,
      description: `I can take you straight to the ${retrieval.navigation[0].label} screen.`,
      action: {
        type: "navigate",
        label: `Open ${retrieval.navigation[0].label}`,
        route: retrieval.navigation[0].route,
      },
    });
  }

  return cards;
}

export function buildFallbackText(intent: ResolvedIntent, retrieval: RetrievalBundle): string {
  if (retrieval.menu.length > 0) {
    const firstDish = retrieval.menu[0];
    const secondDish = retrieval.menu[1];
    const lines = [
      `I found a few strong matches from the live Punjabi Kitchen menu.`,
      `${firstDish.name} stands out at Rs ${Math.round(firstDish.price)}${firstDish.rating ? ` with a ${firstDish.rating.toFixed(1)} rating` : ""}. ${firstDish.description}`,
    ];

    if (secondDish) {
      lines.push(`${secondDish.name} is another good option at Rs ${Math.round(secondDish.price)}. ${secondDish.description}`);
    }

    return lines.join("\n\n");
  }

  if (retrieval.offers.length > 0) {
    const offer = retrieval.offers[0];
    return `${offer.title} is one of the active offers right now. Use code ${offer.code} to unlock ${offer.desc.toLowerCase()}.`;
  }

  if (retrieval.activeOrder) {
    return `Your latest live order is ${retrieval.activeOrder.id}, and it is currently marked as ${retrieval.activeOrder.status}. If you want, I can open tracking for you.`;
  }

  if (retrieval.reservations.length > 0) {
    const reservation = retrieval.reservations[0];
    return `You have a reservation on ${reservation.reservationDate} at ${reservation.reservationSlot} for ${reservation.guests}.`;
  }

  if (retrieval.userProfile) {
    return `${retrieval.userProfile.name}, your account is on the ${retrieval.userProfile.membershipTier} tier with ${retrieval.userProfile.loyaltyPoints} loyalty points.`;
  }

  if (retrieval.navigation[0]) {
    return `Sure, I can take you to the ${retrieval.navigation[0].label} screen.`;
  }

  return "I can help with menu suggestions, active offers, order tracking, reservations, profile details, and app navigation.";
}

export function formatAssistantReply(params: {
  intent: ResolvedIntent;
  retrieval: RetrievalBundle;
  text: string;
}): AssistantReply {
  const cards = buildCards(params.intent, params.retrieval);
  const actions = [...buildNavigationActions(params.retrieval)];

  if (params.retrieval.offers.length > 0) {
    actions.push(buildOfferAction(params.retrieval.offers[0]));
  }

  return {
    text: params.text,
    cards,
    quickReplies: buildQuickReplies(params.intent.intent),
    actions,
  };
}
