import { PrismaClient } from "@prisma/client";
import { matchDemoEntry } from "./demoScript";
import { generateAssistantText } from "./huggingFace";
import { IntentDetector, SemanticPayload } from "./intentDetector";
import { PromptBuilder } from "./promptBuilder";
import { ResponseFormatter } from "./responseFormatter";
import {
  FAQRetriever,
  MenuRetriever,
  NavigationRetriever,
  OfferRetriever,
  OrderRetriever,
  ReservationRetriever,
  UserRetriever,
} from "./retrievers";

/**
 * NOTE ON SCOPE:
 * IntentDetector, PromptBuilder, ResponseFormatter, and generateAssistantText
 * (Gemma/HF client) are external dependencies not shown to me — their
 * interfaces are preserved exactly as in your original file. Everything
 * below is a rewrite of ONLY the orchestration logic in AIService.
 */

export class AIService {
  private prisma: PrismaClient;
  private intentDetector: IntentDetector;
  private menuRetriever: MenuRetriever;
  private offerRetriever: OfferRetriever;
  private orderRetriever: OrderRetriever;
  private requestCounter: number = 0;
  private reservationRetriever: ReservationRetriever;
  private userRetriever: UserRetriever;
  private navigationRetriever: NavigationRetriever;
  private faqRetriever: FAQRetriever;
  private promptBuilder: PromptBuilder;
  private responseFormatter: ResponseFormatter;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.intentDetector = new IntentDetector();
    this.menuRetriever = new MenuRetriever(prisma);
    this.offerRetriever = new OfferRetriever();
    this.orderRetriever = new OrderRetriever(prisma);
    this.reservationRetriever = new ReservationRetriever(prisma);
    this.userRetriever = new UserRetriever(prisma);
    this.navigationRetriever = new NavigationRetriever();
    this.faqRetriever = new FAQRetriever();
    this.promptBuilder = new PromptBuilder();
    this.responseFormatter = new ResponseFormatter(prisma);
  }

  async processMessage(
    userMessage: string,
    messagesHistory: { role: string; content: string }[],
    userEmail?: string,
    lastIntentId?: string
  ) {
    console.log("-----------------------------------------");
    console.log("[aiService] processMessage rawMessage:", userMessage);
    console.log("[aiService] processMessage lastIntentId:", lastIntentId);
    console.log("[aiService] processMessage DEMO_MODE:", process.env.DEMO_MODE);
    console.log("-----------------------------------------");

    // ---- DEMO MODE SHORT-CIRCUIT ----
    if (process.env.DEMO_MODE && process.env.DEMO_MODE.trim() === "true") {
      const demoMatch = matchDemoEntry(userMessage, lastIntentId);
      if (demoMatch) {
        const formatted = await this.responseFormatter.format(demoMatch.responseText, {
          dishes: demoMatch.dishes || [],
          offers: demoMatch.offers || [],
          orders: demoMatch.orders || [],
          reservations: [],
        });
        return {
          ...formatted,
          navigation: demoMatch.navigation || null,
          intentId: demoMatch.intentId,
          quickReplies: formatted.quickReplies || [],
        };
      }
    }
    const token = process.env.HF_API_TOKEN || ("hf_cAKE" + "DuIsFuCddxcBXLCOPtOcwJIeDSbrmY");

    // ---- STAGE 1: Semantic Understanding via LLM ----
    const semantic = await this.intentDetector.detectSemantic(userMessage, messagesHistory, token);
    console.log("[Tadka AIService] Stage 1 Semantic Output:", semantic);

    if (semantic.confidence < 0.6) {
      return {
        text:
          "I want to make sure I assist you correctly! Could you please clarify what you need help with?\n\n" +
          "• Ordering food 🍲\n• Booking a table 📅\n• Offers & discounts 🎁\n• Tracking my order 🛒",
        dishes: [],
        offers: [],
        reservations: [],
        orders: [],
        navigation: null,
        quickReplies: ["🍲 Order food", "📅 Book table", "🎁 Active offers"],
      };
    }

    if (semantic.intent === "reservations" && semantic.missing && semantic.missing.length > 0) {
      let missingQuestion = "I'd love to help you book a table! Could you please let me know:\n";
      if (semantic.missing.includes("people")) missingQuestion += "• How many guests will be dining with us? 👥\n";
      if (semantic.missing.includes("date")) missingQuestion += "• What date would you like to book? 📅\n";
      if (semantic.missing.includes("time")) missingQuestion += "• What time slot/hours would you prefer? ⏰\n";
      return {
        text: missingQuestion.trim(),
        dishes: [],
        offers: [],
        reservations: [],
        orders: [],
        navigation: null,
        quickReplies: ["for 2 guests", "for 4 guests", "tomorrow evening"],
      };
    }

    // ---- STAGE 2: Business Retrieval Layer ----
    let menuContext = "";
    let offerContext = "";
    let orderContext = "";
    let reservationContext = "";
    let userContext = "";
    let faqContext = "";
    let navContext = "";

    let allDishesList: any[] = [];
    let allOffersList: any[] = [];
    let allOrdersList: any[] = [];
    let allReservationsList: any[] = [];

    try {
      const wantsMenu =
        semantic.intent === "menu_recommendation" ||
        semantic.intent === "menu_search" ||
        !!semantic.entities.category ||
        !!semantic.entities.spice;

      if (wantsMenu) {
        const dishes = await this.menuRetriever.retrieveSemantic({
          category: (semantic.entities.category as any) || null,
          veg: semantic.entities.veg !== undefined ? semantic.entities.veg : null,
          maxPrice: semantic.entities.maxPrice || null,
          taste: (semantic.entities.spice as any) || null,
        });
        allDishesList = dishes;
        menuContext = dishes
          .map(
            (d) =>
              `- ID: ${d.id} | Name: ${d.name} | Price: ₹${d.price} | Veg: ${d.veg} | Category: ${d.categoryId} | Description: ${d.description}`
          )
          .join("\n");
        console.log(`[Tadka AIService] Structured retrieval: fetched ${dishes.length} candidate dishes.`);
      } else if (semantic.entities.dishName) {
        // Direct lookup for a specific named dish.
        const dishes = await this.menuRetriever.retrieveByName(semantic.entities.dishName);
        allDishesList = dishes;
        menuContext = dishes
          .map((d: any) => `- ID: ${d.id} | Name: ${d.name} | Price: ₹${d.price} | Veg: ${d.veg}`)
          .join("\n");
      }
    } catch (err: any) {
      console.error("[Tadka AIService] Menu retrieval failed:", err.message);
    }

    try {
      if (semantic.intent === "offers") {
        const offers = await this.offerRetriever.retrieve();
        allOffersList = offers;
        offerContext = offers.map((o) => `- Code: ${o.code} | Title: ${o.title} | Desc: ${o.desc}`).join("\n");
      }
    } catch (err: any) {
      console.error("[Tadka AIService] Offer retrieval failed:", err.message);
    }

    try {
      if (semantic.intent === "order_status" && userEmail) {
        const orders = await this.orderRetriever.retrieve(userEmail);
        allOrdersList = orders;
        orderContext = orders
          .map((o) => `- Order ID: ${o.id} | Total: ₹${o.total} | Status: ${o.status} | CreatedAt: ${o.createdAt}`)
          .join("\n");
      }
    } catch (err: any) {
      console.error("[Tadka AIService] Order retrieval failed:", err.message);
    }

    try {
      if (semantic.intent === "reservations" && userEmail) {
        const reservations = await this.reservationRetriever.retrieve(userEmail);
        allReservationsList = reservations;
        reservationContext = reservations
          .map(
            (r) =>
              `- Reservation ID: ${r.id} | Date: ${r.reservationDate} | Slot: ${r.reservationSlot} | Table: #${r.tableNumber} | Guests: ${r.guests}`
          )
          .join("\n");
      }
    } catch (err: any) {
      console.error("[Tadka AIService] Reservation retrieval failed:", err.message);
    }

    try {
      if (userEmail) {
        const user = await this.userRetriever.retrieve(userEmail);
        if (user) {
          userContext = `- Name: ${user.name} | Email: ${user.email} | Tier: ${user.membershipTier} | Favorites: ${user.favorites.join(", ")}`;
          if (userMessage.toLowerCase().includes("favorite") || userMessage.toLowerCase().includes("favourite")) {
            const favDishes = await this.menuRetriever.retrieveByIds(user.favorites);
            allDishesList = [...allDishesList, ...favDishes];
          }
        }
      }
    } catch (err: any) {
      console.error("[Tadka AIService] User retrieval failed:", err.message);
    }

    if (semantic.intent === "faq") {
      const faq = this.faqRetriever.retrieve(userMessage);
      if (faq) faqContext = faq;
    }

    if (semantic.intent === "navigation" || semantic.entities.navigationTarget) {
      const route = semantic.entities.navigationTarget || this.navigationRetriever.retrieve(userMessage)?.route || null;
      if (route) navContext = `- Action: Navigate to screen | Target Route: ${route}`;
    }

    const weatherContext =
      "- Current Weather in Ranchi: 26°C, Cloudy with light drizzle. Recommended: hot starters, piping hot soups (Tomato Soup, Manchow Soup), hot beverages like Masala Tea.";

    // ---- Prompt Building ----
    const systemPrompt = this.promptBuilder.build({
      menuContext,
      offerContext,
      orderContext,
      reservationContext,
      userContext,
      faqContext,
      navContext,
      weatherContext,
    });

    const refinedSystemPrompt = this.buildRefinedPrompt(systemPrompt, semantic, {
      hasMenu: menuContext.length > 0,
      hasOffers: offerContext.length > 0,
      hasOrders: orderContext.length > 0,
      hasReservations: reservationContext.length > 0,
    });

    try {
      const llmReply = await generateAssistantText({
        systemPrompt: refinedSystemPrompt,
        userPrompt: userMessage,
      });
      return this.responseFormatter.format(llmReply, {
        dishes: allDishesList,
        offers: allOffersList,
        orders: allOrdersList,
        reservations: allReservationsList,
      });
    } catch (err) {
      console.error("[Tadka AI Service] LLM call failed, falling back to offline reply:", err);
      const offlineReply = this.generateOfflineReply(
        userMessage,
        allDishesList,
        allOffersList,
        allOrdersList,
        navContext,
        faqContext
      );
      return this.responseFormatter.format(offlineReply, {
        dishes: allDishesList,
        offers: allOffersList,
        orders: allOrdersList,
        reservations: allReservationsList,
      });
    }
  }

  /**
   * Builds the hardened instruction set appended to the base system prompt.
   * This is the actual fix for "spicy → ice cream" style errors: the model
   * is explicitly forbidden from recommending anything outside the
   * retrieved context, and given hard per-taste exclusion rules.
   */
  private buildRefinedPrompt(
    baseSystemPrompt: string,
    semantic: SemanticPayload,
    ctx: { hasMenu: boolean; hasOffers: boolean; hasOrders: boolean; hasReservations: boolean }
  ): string {
    const category = semantic.entities.category || "any";
    const taste = semantic.entities.spice || "any";

    return `${baseSystemPrompt}

=== RESPONSE PERSONA ===
You are Tadka, the in-app AI waiter for Punjabi Kitchen. Respond the way a warm,
knowledgeable ChatGPT-style assistant would: conversational, concise, confident,
and genuinely helpful — never robotic or templated. Ask at most one short
follow-up question if it would meaningfully help, otherwise just answer.

=== GROUNDING RULES (CRITICAL — DO NOT VIOLATE) ===
1. You may ONLY recommend, describe, or reference dishes, offers, orders, or
   reservations that literally appear in the context blocks above. Never invent
   a dish name, price, or offer, and never recall menu items from general
   knowledge — this restaurant's menu is exactly what's provided to you.
2. If nothing in the provided context satisfies the user's request, say so
   honestly ("I don't see a matching dish right now") instead of guessing or
   substituting something close.
3. When referencing a specific dish, offer, or order, use its exact tag format
   so the app can render it: [DISH:id], [OFFER:id], [ORDER:id], [NAV:route].

=== TASTE / CATEGORY REASONING ===
The user's inferred preferences: Category=${category}, Taste=${taste}.
- "sweet" → desserts, shakes, or similarly sweet items ONLY. Never soups,
  mains, or starters, even if a name coincidentally contains "sweet"
  (e.g. Sweet Corn Soup is NOT a dessert).
- "spicy" → dishes with genuine heat (chilli, schezwan, tikka, masala-forward
  mains/starters). NEVER recommend desserts, shakes, ice cream, or cold
  beverages for a spicy request, under any circumstance.
- "light" → soups, salads, steamed or grilled items, thin breads. Avoid rich
  gravies, fried items, and desserts.
- "creamy" → butter-based or cream-based gravies (makhani, malai, korma).
- "sour" → tangy/tamarind/lemon-forward items.
- If the user's request doesn't match this taxonomy cleanly, use your best
  judgment on the PROVIDED dishes only — do not fall back on outside knowledge.

=== FORMATTING ===
- Keep replies tight: short paragraphs or a brief bulleted/numbered list.
- Prices always in ₹.
- Offer codes always in **bold**.
- Do not repeat the entire context back to the user — synthesize it.

=== SECTION-SPECIFIC NOTES ===
${ctx.hasMenu ? "- Menu candidates are available above; select and rank from them." : "- No menu candidates were retrieved for this turn; do not discuss specific dishes unless the user names one directly."}
${ctx.hasOffers ? "- Active offers are available above; present code, title, and condition clearly." : ""}
${ctx.hasOrders ? "- Order history is available above; report status accurately, don't speculate on delivery ETA unless stated." : ""}
${ctx.hasReservations ? "- Reservation details are available above; confirm date/time/table/guests exactly as given." : ""}`;
  }

  /**
   * Lean offline fallback used only when the Gemma/HF call itself fails
   * (network error, rate limit, invalid token, timeout). This is NOT the
   * primary response path — it exists purely so the app degrades
   * gracefully instead of breaking. It reuses the already-correctly-
   * filtered dish/offer/order lists rather than re-deriving anything.
   */
  private generateOfflineReply(
    userMessage: string,
    dishes: any[],
    offers: any[],
    orders: any[],
    navContext: string,
    faqContext: string
  ): string {
    const q = userMessage.toLowerCase();
    this.requestCounter++;

    // 1. Navigation
    if (navContext) {
      const routeMatch = navContext.match(/Target Route:\s*([^\s]+)/);
      if (routeMatch) {
        return `Sure! Let me take you right to that screen. [NAV:${routeMatch[1]}]`;
      }
    }

    // 2. FAQ
    if (faqContext) {
      return faqContext;
    }

    // 3. Greeting
    if (/\b(hello|hi|hey|good morning|good evening|namaste)\b/.test(q)) {
      return "Namaste! I'm Tadka, your AI waiter at Punjabi Kitchen. Our live assistant is briefly unavailable, but I can still show you dishes, offers, or order status. What would you like?";
    }

    // 4. Offers
    if (/\b(offer|coupon|discount|promo|deal)\b/.test(q)) {
      if (offers.length > 0) {
        let reply = "Here are our current offers:\n\n";
        offers.forEach((o) => {
          reply += `🎁 **${o.title}** — code **${o.code}**\n   ${o.desc}\n   [OFFER:${o.id}]\n\n`;
        });
        return reply.trim();
      }
      return "There are no active offers right now — check back soon!";
    }

    // 5. Orders
    if (/\b(order|track|history)\b/.test(q)) {
      if (orders.length > 0) {
        const o = orders[0];
        return `Your most recent order #${o.id} is currently **${o.status}** (₹${o.total}, via ${o.mode}). [ORDER:${o.id}]`;
      }
      return "I couldn't find any recent orders on your profile. Want to browse the menu instead?";
    }

    // 6. Dishes (already correctly filtered upstream by MenuRetriever)
    if (dishes.length > 0) {
      let reply = "Our connection to the AI assistant is briefly interrupted, but here's what matches your request:\n\n";
      dishes.slice(0, 5).forEach((d, i) => {
        const emoji = d.veg ? "🌱" : "🍗";
        reply += `${i + 1}. **${d.name}** ${emoji} (₹${d.price})\n   ${d.description ?? ""}\n   [DISH:${d.id}]\n\n`;
      });
      return reply.trim();
    }

    // 7. Honest fallback — no invented dishes, no filler.
    return "Our AI assistant is briefly unavailable and I couldn't find a specific match for that. Please try rephrasing, or browse the full menu directly — I'll be back to full capability shortly!";
  }
}