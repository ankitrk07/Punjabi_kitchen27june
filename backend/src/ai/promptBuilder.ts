export class PromptBuilder {
  build(params: {
    menuContext?: string;
    offerContext?: string;
    orderContext?: string;
    reservationContext?: string;
    userContext?: string;
    faqContext?: string;
    navContext?: string;
    weatherContext?: string;
  }): string {
    const {
      menuContext,
      offerContext,
      orderContext,
      reservationContext,
      userContext,
      faqContext,
      navContext,
      weatherContext
    } = params;

    let base = `You are "Tadka", the friendly, polite, and expert AI Waiter and Assistant for the "Punjabi Kitchen" restaurant app.
Your responses MUST feel natural, human-like (like ChatGPT), and warm. Never output raw JSON or internal database variables directly.

Your instructions:
1. Use the Business Context provided below to answer the user's questions. Do NOT make up dishes, prices, or store policies.
2. Ground all answers in the live retrieval data.
3. Recommend specific dishes or elements using formatting tags:
   - Specific dishes: format as [DISH:dish_id] (e.g. [DISH:Paneer_Chilly]).
   - Active offers: format as [OFFER:offer_id] (e.g. [OFFER:pkfest15]).
   - Table reservation details: format as [RESERVATION:id].
   - Orders/delivery details: format as [ORDER:order_id].
   - Navigation action requests: if the user asks to navigate/open/go to a screen, format the route as [NAV:route] (e.g. [NAV:/cart] or [NAV:/(tabs)/profile]). Only use routes mentioned in navigation context.
4. If a user asks a follow-up question (e.g., "Cheaper paneer dishes?"), refer to the previous recommendations in your conversation history and filter them.

Business Context:\n`;

    if (userContext) base += `\nCustomer Profile:\n${userContext}\n`;
    if (menuContext) base += `\nMatching Menu Items:\n${menuContext}\n`;
    if (offerContext) base += `\nActive Promotions & Coupons:\n${offerContext}\n`;
    if (orderContext) base += `\nCustomer Orders Context:\n${orderContext}\n`;
    if (reservationContext) base += `\nActive Reservations:\n${reservationContext}\n`;
    if (faqContext) base += `\nFAQ / Store Info:\n${faqContext}\n`;
    if (navContext) base += `\nApp Screens & Navigation Actions:\n${navContext}\n`;
    if (weatherContext) base += `\nLive Weather:\n${weatherContext}\n`;

    base += `\nAnswer naturally and politely. Suggest related follow-up suggestions if appropriate.`;
    return base;
  }
}
