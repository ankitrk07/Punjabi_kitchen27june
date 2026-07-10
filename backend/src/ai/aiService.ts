import { PrismaClient } from "@prisma/client";
import { IntentDetector } from "./intentDetector";
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
    // 1. Intent Detection
    const intents = this.intentDetector.detect(userMessage);
    console.log('[Tadka AI Service] Processing message:', { userMessage, userEmail, intents });

    // 2. Business Retrieval Layer
    let menuContext = "";
    let offerContext = "";
    let orderContext = "";
    let reservationContext = "";
    let userContext = "";
    let faqContext = "";
    let navContext = "";

    // Data structures to pass to response formatter
    let allDishesList: any[] = [];
    let allOffersList: any[] = [];
    let allOrdersList: any[] = [];
    let allReservationsList: any[] = [];

    // Trigger retrievers based on detected intent
    if (intents.includes("menu_search") || intents.includes("menu_recommendation")) {
      const q = userMessage.toLowerCase();
      const veg = q.includes("veg") && !q.includes("non-veg") && !q.includes("nonveg") ? true : q.includes("non-veg") || q.includes("nonveg") ? false : undefined;
      const budgetMatch = q.match(/\b(?:under|below|less than|max|budget of)?\s*(?:rs\.?|inr|₹)?\s*(\d+)\b/i);
      const maxBudget = budgetMatch ? parseInt(budgetMatch[1]) : undefined;
      const spicy = q.includes("spicy") || q.includes("hot") ? true : q.includes("mild") || q.includes("sweet") ? false : undefined;

      const dishes = await this.menuRetriever.retrieve({
        query: userMessage,
        maxBudget,
        veg,
        spicy
      });
      console.log('[Tadka AI Service] Dishes retrieved count:', dishes.length);
      allDishesList = dishes;
      menuContext = dishes.map(d => `- ID: ${d.id} | Name: ${d.name} | Price: ₹${d.price} | Veg: ${d.veg} | Description: ${d.description}`).join("\n");
    }

    if (intents.includes("offers")) {
      const offers = await this.offerRetriever.retrieve();
      allOffersList = offers;
      offerContext = offers.map(o => `- Code: ${o.code} | Title: ${o.title} | Desc: ${o.desc}`).join("\n");
    }

    if (intents.includes("order_status") && userEmail) {
      const orders = await this.orderRetriever.retrieve(userEmail);
      allOrdersList = orders;
      orderContext = orders.map(o => `- Order ID: ${o.id} | Total: ₹${o.total} | Status: ${o.status} | CreatedAt: ${o.createdAt}`).join("\n");
    }

    if (intents.includes("reservations") && userEmail) {
      const reservations = await this.reservationRetriever.retrieve(userEmail);
      allReservationsList = reservations;
      reservationContext = reservations.map(r => `- Reservation ID: ${r.id} | Date: ${r.reservationDate} | Slot: ${r.reservationSlot} | Table: #${r.tableNumber} | Guests: ${r.guests}`).join("\n");
    }

    if (userEmail) {
      const user = await this.userRetriever.retrieve(userEmail);
      if (user) {
        userContext = `- Name: ${user.name} | Email: ${user.email} | Tier: ${user.membershipTier} | Favorites: ${user.favorites.join(", ")}`;
        // If they ask for favorites, fetch matching dishes
        if (userMessage.toLowerCase().includes("favorite") || userMessage.toLowerCase().includes("favourite")) {
          const favDishes = await this.prisma.dish.findMany({
            where: { id: { in: user.favorites } }
          });
          allDishesList = [...allDishesList, ...favDishes];
        }
      }
    }

    if (intents.includes("faq")) {
      const faq = this.faqRetriever.retrieve(userMessage);
      if (faq) faqContext = faq;
    }

    if (intents.includes("navigation")) {
      const nav = this.navigationRetriever.retrieve(userMessage);
      if (nav) navContext = `- Action: ${nav.action} | Target Route: ${nav.route}`;
    }

    // 3. Prompt Builder
    const systemPrompt = this.promptBuilder.build({
      menuContext,
      offerContext,
      orderContext,
      reservationContext,
      userContext,
      faqContext,
      navContext
    });

    const token = process.env.HF_API_TOKEN;

    // Check if token exists
    if (!token || token.trim() === "") {
      const offlineReply = await this.generateOfflineReply(userMessage, allDishesList, allOffersList, allOrdersList, allReservationsList, navContext, faqContext);
      return this.responseFormatter.format(offlineReply, {
        dishes: allDishesList,
        offers: allOffersList,
        orders: allOrdersList,
        reservations: allReservationsList
      });
    }

    // Call Hugging Face Gemma API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          model: "google/gemma-3-12b-it",
          messages: [
            { role: "system", content: systemPrompt },
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
      console.log("[Tadka AI Service] Falling back to offline generation:", err.message);
      const offlineReply = await this.generateOfflineReply(userMessage, allDishesList, allOffersList, allOrdersList, allReservationsList, navContext, faqContext);
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
    faqContext: string
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

    // 3. Active Reservations
    if (q.includes("booking") || q.includes("reservation")) {
      if (reservations.length > 0) {
        const r = reservations[0];
        return `I checked your bookings. You have an upcoming table reservation booked for ${r.guests} on ${r.reservationDate} at ${r.reservationSlot}. [RESERVATION:${r.id}]`;
      }
      return "You don't have any active table reservations booked right now. Let me know if you would like to reserve one! 📅";
    }

    // 4. Order status
    if (q.includes("order") || q.includes("track")) {
      if (orders.length > 0) {
        const o = orders[0];
        return `Your most recent order is currently in status: **${o.status}**. The order total was ₹${o.total}. [ORDER:${o.id}]`;
      }
      return "I couldn't find any recent orders on your profile. Would you like to check the menu? 🍲";
    }

    // 5. Active Offers
    if (q.includes("offer") || q.includes("coupon") || q.includes("discount")) {
      if (offers.length > 0) {
        let reply = "Here are the promo codes and coupons available to you today at Punjabi Kitchen:\n\n";
        offers.forEach(o => {
          reply += `- **${o.title}**: Use code **${o.code}** for ${o.desc}. [OFFER:${o.id}]\n`;
        });
        return reply;
      }
    }

    // 6. Dishes match
    if (dishes.length > 0) {
      let reply = "I found some delicious options on our menu for you:\n\n";
      dishes.forEach(d => {
        reply += `Our **${d.name}** features ${d.description.toLowerCase()} and is priced at ₹${d.price}. [DISH:${d.id}]\n\n`;
      });
      return reply;
    }

    return "I am Tadka, your personal AI Waiter. I can recommend dishes, show active offers, check your reservations, or help you track orders! What can I fetch for you today?";
  }
}
