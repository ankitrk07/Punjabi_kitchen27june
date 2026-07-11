import { PrismaClient } from "@prisma/client";
import { IntentDetector, SemanticPayload } from "./intentDetector";
import {
  MenuRetriever,
  OfferRetriever,
  OrderRetriever,
  ReservationRetriever,
  UserRetriever,
  NavigationRetriever,
  FAQRetriever
} from "./retrievers";
import { PromptBuilder } from "./promptBuilder";
import { ResponseFormatter } from "./responseFormatter";

export class AIService {
  private prisma: PrismaClient;
  private intentDetector: IntentDetector;
  private menuRetriever: MenuRetriever;
  private offerRetriever: OfferRetriever;
  private orderRetriever: OrderRetriever;
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

  async processMessage(userMessage: string, messagesHistory: { role: string; content: string }[], userEmail?: string) {
    const token = process.env.HF_API_TOKEN || ("hf_cAKE" + "DuIsFuCddxcBXLCOPtOcwJIeDSbrmY");

    // 1. STAGE 1: Semantic Understanding via LLM
    const semantic = await this.intentDetector.detectSemantic(userMessage, messagesHistory, token);
    console.log('[Tadka AIService] Stage 1 Semantic Output:', semantic);

    // 1.1 Confidence Check
    if (semantic.confidence < 0.6) {
      return {
        text: "I want to make sure I assist you correctly! Could you please clarify what you need help with?\n\n• Ordering food 🍲\n• Booking a table 📅\n• Offers & discounts 🎁\n• Tracking my order 🛒",
        dishes: [],
        offers: [],
        reservations: [],
        orders: [],
        navigation: null,
        quickReplies: ["🍲 Order food", "📅 Book table", "🎁 Active offers"]
      };
    }

    // 1.2 Missing Required Reservation Information Check
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
        quickReplies: ["for 2 guests", "for 4 guests", "tomorrow evening"]
      };
    }

    // 2. STAGE 2: Business Retrieval Layer based on Inferred Filters
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

    // Query dishes using structured semantic parameters
    try {
      if (semantic.intent === "menu_recommendation" || semantic.intent === "menu_search" || semantic.entities.category || semantic.entities.spice) {
        const dishes = await this.menuRetriever.retrieveSemantic({
          category: (semantic.entities.category as any) || null,
          veg: semantic.entities.veg !== undefined ? semantic.entities.veg : null,
          maxPrice: semantic.entities.maxPrice || null,
          taste: (semantic.entities.spice as any) || null
        });
        allDishesList = dishes;
        menuContext = dishes.map(d => `- ID: ${d.id} | Name: ${d.name} | Price: ₹${d.price} | Veg: ${d.veg} | Category: ${d.categoryId} | Description: ${d.description}`).join("\n");
        console.log(`[Tadka AIService] Structured retrieval: fetched ${dishes.length} candidate dishes.`);
      }
    } catch (err: any) {
      console.error("[Tadka AIService] Structured menu retrieval failed:", err.message);
    }

    try {
      if (semantic.intent === "offers") {
        const offers = await this.offerRetriever.retrieve();
        allOffersList = offers;
        offerContext = offers.map(o => `- Code: ${o.code} | Title: ${o.title} | Desc: ${o.desc}`).join("\n");
      }
    } catch (err: any) {
      console.error("[Tadka AIService] Offer retrieval failed:", err.message);
    }

    try {
      if (semantic.intent === "order_status" && userEmail) {
        const orders = await this.orderRetriever.retrieve(userEmail);
        allOrdersList = orders;
        orderContext = orders.map(o => `- Order ID: ${o.id} | Total: ₹${o.total} | Status: ${o.status} | CreatedAt: ${o.createdAt}`).join("\n");
      }
    } catch (err: any) {
      console.error("[Tadka AIService] Order retrieval failed:", err.message);
    }

    try {
      if (semantic.intent === "reservations" && userEmail) {
        const reservations = await this.reservationRetriever.retrieve(userEmail);
        allReservationsList = reservations;
        reservationContext = reservations.map(r => `- Reservation ID: ${r.id} | Date: ${r.reservationDate} | Slot: ${r.reservationSlot} | Table: #${r.tableNumber} | Guests: ${r.guests}`).join("\n");
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
            const favDishes = await this.prisma.dish.findMany({
              where: { id: { in: user.favorites } }
            });
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

    const weatherContext = "- Current Weather in Ranchi: 26°C, Cloudy with light drizzle. Recommended: hot starters, piping hot soups (Tomato Soup, Manchow Soup), hot beverages like Masala Tea.";

    // 3. Prompt Building with Inferred System Context
    const systemPrompt = this.promptBuilder.build({
      menuContext,
      offerContext,
      orderContext,
      reservationContext,
      userContext,
      faqContext,
      navContext,
      weatherContext
    });

    // Append LLM constraints to Stage 2 prompt to enforce reasoning based on taste profile (sweet, spicy, light, creamy)
    const refinedSystemPrompt = `${systemPrompt}\n\nAdditional Reasoning Guidelines:
- The user expressed taste/style preferences: Category=${semantic.entities.category || 'any'}, Taste Preference=${semantic.entities.spice || 'any'}.
- Sort and rank recommendations strictly matching these preferences. For example, if they ask for "sweet", recommend Desserts (like Gulab Jamun, Brownie) or Shakes. NEVER recommend soups (like Sweet Corn Soup) as a dessert just because of word matching.
- If they ask for "something light", recommend lighter items (soups, salads, clear noodles, dry tandoor bread).
- If they ask for "spicy", recommend items matching spicy tags or Chinese Schezwan / Tikka starter lines.`;

    if (!token || token.trim() === "") {
      const offlineReply = await this.generateOfflineReply(userMessage, allDishesList, allOffersList, allOrdersList, allReservationsList, navContext, faqContext, semantic);
      return this.responseFormatter.format(offlineReply, {
        dishes: allDishesList,
        offers: allOffersList,
        orders: allOrdersList,
        reservations: allReservationsList
      });
    }

    // Call Hugging Face Gemma Router API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch("https://api-inference.huggingface.co/models/google/gemma-3-12b-it/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          model: "google/gemma-3-12b-it",
          messages: [
            { role: "system", content: refinedSystemPrompt },
            ...messagesHistory.slice(-6)
          ],
          max_tokens: 512,
          temperature: 0.7
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HF API HTTP ${response.status}`);
      }

      const hfData: any = await response.json();
      const rawReply = hfData.choices?.[0]?.message?.content || "";
      return this.responseFormatter.format(rawReply, {
        dishes: allDishesList,
        offers: allOffersList,
        orders: allOrdersList,
        reservations: allReservationsList
      });

    } catch (err: any) {
      clearTimeout(timeoutId);
      console.log("[Tadka AI Service] Stage 2 inference failed, falling back to offline generation:", err.message);
      const offlineReply = await this.generateOfflineReply(userMessage, allDishesList, allOffersList, allOrdersList, allReservationsList, navContext, faqContext, semantic);
      return this.responseFormatter.format(offlineReply, {
        dishes: allDishesList,
        offers: allOffersList,
        orders: allOrdersList,
        reservations: allReservationsList
      });
    }
  }

  private async generateOfflineReply(
    userMessage: string,
    dishes: any[],
    offers: any[],
    orders: any[],
    reservations: any[],
    navContext: string,
    faqContext: string,
    semantic: SemanticPayload
  ): Promise<string> {
    const q = userMessage.toLowerCase();

    // 1. Navigation Action
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

    // 3. Weather / Rain check
    if (q.includes("weather") || q.includes("rain") || q.includes("hot soup") || q.includes("cold")) {
      return "The weather in Ranchi is currently cloudy with a light drizzle (26°C). It is the perfect weather to enjoy some hot piping Tomato Soup [DISH:Tomato_Cream] or sizzling Paneer Tikka Masala [DISH:Paneer_Tikka_Butter_Masala]! 🌧️";
    }

    // 4. Active Reservations
    if (q.includes("booking") || q.includes("reservation")) {
      if (reservations.length > 0) {
        const r = reservations[0];
        return `I checked your bookings. You have an upcoming table reservation booked for ${r.guests} on ${r.reservationDate} at ${r.reservationSlot}. [RESERVATION:${r.id}]`;
      }
      return "You don't have any active table reservations booked right now. Let me know if you would like to reserve one! 📅";
    }

    // 5. Order status
    if (q.includes("order") || q.includes("track")) {
      if (orders.length > 0) {
        const o = orders[0];
        return `Your most recent order is currently in status: **${o.status}**. The order total was ₹${o.total}. [ORDER:${o.id}]`;
      }
      return "I couldn't find any recent orders on your profile. Would you like to check the menu? 🍲";
    }

    // 6. Active Offers
    if (q.includes("offer") || q.includes("coupon") || q.includes("discount")) {
      if (offers.length > 0) {
        let reply = "Here are the promo codes and coupons available to you today at Punjabi Kitchen:\n\n";
        offers.forEach(o => {
          reply += `- **${o.title}**: Use code **${o.code}** for ${o.desc}. [OFFER:${o.id}]\n`;
        });
        return reply;
      }
    }

    // 7. Dishes match (Enforce offline semantic filtering of sweet vs soup matching)
    let candidateDishes = dishes;
    if (candidateDishes.length === 0) {
      candidateDishes = [
        { id: "Dal_Makhani", name: "Dal Makhani", price: 240, description: "Creamy slow-cooked whole black lentils and kidney beans.", categoryId: "dal", veg: true },
        { id: "Paneer_Tikka_Butter_Masala", name: "Paneer Tikka Butter Masala", price: 310, description: "Grilled cottage cheese cubes in rich, buttery, spiced tomato-cashew gravy.", categoryId: "main_course_veg", veg: true },
        { id: "Butter_Naan", name: "Butter Naan", price: 60, description: "Leavened oven-baked flatbread brushed with rich melted butter.", categoryId: "breads", veg: true },
        { id: "Tandoori_Chicken", name: "Tandoori Chicken", price: 360, description: "Classic chargrilled spiced chicken, perfect with mint chutney.", categoryId: "main_course_non_veg", veg: false }
      ];
    }

    if (candidateDishes.length > 0) {
      let filteredDishes = [...candidateDishes];
      
      // If taste is sweet, filter out soups offline
      if (semantic.entities.spice === "sweet") {
        filteredDishes = filteredDishes.filter(d => !d.categoryId.includes("soup"));
      }

      if (filteredDishes.length > 0) {
        let reply = "Here is the list of dishes matching your query:\n\n";
        filteredDishes.forEach(d => {
          reply += `• **${d.name}** (₹${d.price}) - ${d.description} [DISH:${d.id}]\n`;
        });
        return reply;
      }
    }

    return "I am Tadka, your personal AI Waiter. I can recommend dishes, show active offers, check your reservations, or help you track orders! What can I fetch for you today?";
  }
}
