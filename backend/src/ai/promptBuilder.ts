import type { AssistantMessage, ResolvedIntent, RetrievalBundle } from "./types";

function formatMenuContext(retrieval: RetrievalBundle): string {
  if (retrieval.menu.length === 0) {
    return "No matching menu items were retrieved for this request.";
  }

  return retrieval.menu
    .map((dish) => {
      const meta = [
        dish.veg ? "Vegetarian" : "Non-vegetarian",
        `Price: Rs ${Math.round(dish.price)}`,
        dish.rating ? `Rating: ${dish.rating.toFixed(1)}` : null,
        dish.categoryName ? `Category: ${dish.categoryName}` : null,
      ].filter(Boolean);

      return `- ${dish.name}\n  ${meta.join(" | ")}\n  ${dish.description}`;
    })
    .join("\n");
}

function formatOffersContext(retrieval: RetrievalBundle): string {
  if (retrieval.offers.length === 0) {
    return "No active offers matched the request.";
  }

  return retrieval.offers
    .map((offer) => `- ${offer.title} (${offer.code}): ${offer.desc}`)
    .join("\n");
}

function formatOrderContext(retrieval: RetrievalBundle): string {
  const blocks: string[] = [];

  if (retrieval.activeOrder) {
    blocks.push(
      `Active order:\n- ${retrieval.activeOrder.id}\n- Status: ${retrieval.activeOrder.status}\n- Mode: ${retrieval.activeOrder.mode}\n- Total: Rs ${Math.round(retrieval.activeOrder.total)}\n- Items: ${retrieval.activeOrder.itemsSummary.join(", ") || "Not available"}`,
    );
  }

  if (retrieval.orderHistory.length > 0) {
    blocks.push(
      `Recent orders:\n${retrieval.orderHistory
        .slice(0, 3)
        .map((order) => `- ${order.id}: ${order.status}, Rs ${Math.round(order.total)}`)
        .join("\n")}`,
    );
  }

  return blocks.join("\n\n") || "No order data available for this request.";
}

function formatReservationContext(retrieval: RetrievalBundle): string {
  if (retrieval.reservations.length === 0) {
    return "No reservation data is available for this request.";
  }

  return retrieval.reservations
    .map((reservation) => `- ${reservation.reservationDate} at ${reservation.reservationSlot}, ${reservation.guests}, status ${reservation.status}, table ${reservation.tableNumber}`)
    .join("\n");
}

function formatUserContext(retrieval: RetrievalBundle): string {
  if (!retrieval.userProfile) {
    return "No user profile is available.";
  }

  return [
    `Customer: ${retrieval.userProfile.name}`,
    `Membership: ${retrieval.userProfile.membershipTier}`,
    `Loyalty points: ${retrieval.userProfile.loyaltyPoints}`,
    retrieval.userProfile.addresses.length > 0 ? `Addresses: ${retrieval.userProfile.addresses.join(" | ")}` : null,
    retrieval.userProfile.favorites.length > 0 ? `Favorites: ${retrieval.userProfile.favorites.map((dish) => dish.name).join(", ")}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

function formatNavigationContext(retrieval: RetrievalBundle): string {
  if (retrieval.navigation.length === 0) {
    return "No navigation target was matched.";
  }

  return retrieval.navigation
    .map((target) => `- ${target.label} -> ${target.route}`)
    .join("\n");
}

function formatFaqContext(retrieval: RetrievalBundle): string {
  if (retrieval.faq.length === 0) {
    return "No FAQ entry matched the request.";
  }

  return retrieval.faq
    .map((entry) => `- ${entry.title}: ${entry.answer}`)
    .join("\n");
}

export function buildAssistantPrompt(params: {
  intent: ResolvedIntent;
  retrieval: RetrievalBundle;
  messages: AssistantMessage[];
}) {
  const recentMessages = params.messages.slice(-8);

  const systemPrompt = [
    `You are Tadka, the Punjabi Kitchen AI assistant.`,
    `You must answer naturally, warmly, and clearly like a polished business assistant.`,
    `Never invent dishes, offers, orders, reservations, customer details, or navigation routes.`,
    `Use only the business context provided in this prompt.`,
    `Do not expose raw JSON, field names, database identifiers, or internal implementation details.`,
    `If the retrieved data is missing, say that clearly and offer the next best action.`,
    `Keep the answer concise but helpful.`,
  ].join("\n");

  const userPrompt = [
    `Intent: ${params.intent.intent}`,
    `Resolved user request: ${params.intent.resolvedMessage}`,
    "",
    "Business context:",
    `Menu:\n${formatMenuContext(params.retrieval)}`,
    "",
    `Offers:\n${formatOffersContext(params.retrieval)}`,
    "",
    `Orders:\n${formatOrderContext(params.retrieval)}`,
    "",
    `Reservations:\n${formatReservationContext(params.retrieval)}`,
    "",
    `User profile:\n${formatUserContext(params.retrieval)}`,
    "",
    `Navigation:\n${formatNavigationContext(params.retrieval)}`,
    "",
    `FAQ:\n${formatFaqContext(params.retrieval)}`,
    "",
    "Recent conversation:",
    recentMessages.map((message) => `${message.role}: ${message.content}`).join("\n"),
    "",
    "Write the assistant reply in markdown-friendly plain text.",
  ].join("\n");

  return {
    systemPrompt,
    userPrompt,
  };
}
