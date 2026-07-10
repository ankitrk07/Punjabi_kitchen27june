export interface SemanticPayload {
  intent: 
    | "menu_search"
    | "menu_recommendation"
    | "dish_details"
    | "offers"
    | "coupons"
    | "reservations"
    | "order_status"
    | "order_history"
    | "profile"
    | "payment"
    | "delivery"
    | "pickup"
    | "restaurant_info"
    | "navigation"
    | "faq"
    | "greeting"
    | "general_conversation";
  confidence: number;
  entities: {
    date?: string;
    time?: string;
    people?: number;
    category?: string;
    spice?: "spicy" | "mild" | "sweet" | string;
    maxPrice?: number;
    reference?: string;
    price?: "lower" | "higher" | string;
    dishName?: string;
    navigationTarget?: string;
    veg?: boolean;
  };
  missing: string[];
}

export class IntentDetector {
  /**
   * Analyzes the user's message along with the recent conversation history using the LLM.
   * Classifies the semantic intent, extracts entity parameters, calculates a confidence score,
   * and tracks any missing details required for the intent.
   * 
   * @param message Current user message
   * @param messagesHistory Array of recent chat turns
   * @param token Hugging Face API key token
   */
  async detectSemantic(
    message: string,
    messagesHistory: { role: string; content: string }[],
    token?: string
  ): Promise<SemanticPayload> {
    if (!token || token.trim() === "") {
      return this.fallbackLocalParser(message, messagesHistory);
    }

    const systemPrompt = `You are an expert restaurant AI intent classifier and entity extractor.
Analyze the current user message in the context of the recent conversation history. Output a single, raw, valid JSON response.
Do NOT output any markdown fences (like \`\`\`json), explanations, comments, or extra text.

Supported Intents:
- menu_search: Browsing or looking up menu items.
- menu_recommendation: Asking for recommendations ("Suggest a dish", "I want something sweet", "cheaper dishes").
- dish_details: Questions about specific dishes (ingredients, price, portion, taste).
- offers / coupons: Promos, active codes, discounts.
- reservations: Table bookings, timings, slot booking.
- order_status / order_history: Tracking a current order, ETA, or past order receipts.
- profile / payment / delivery / pickup: Checking address details, wallets, pickup timings, or profiles.
- restaurant_info: Store hours, contact details, address.
- navigation: Direct requests to open or navigate to screens ("open cart", "go to checkout").
- faq: General policies, refunds, delivery area queries.
- greeting: Namaste, hi, hello.
- general_conversation: General chit-chat or statements.

Output JSON format:
{
  "intent": "one_of_the_supported_intents",
  "confidence": 0.0 to 1.0,
  "entities": {
    "date": "tomorrow", "next Monday", or null,
    "time": "8 PM", "evening", or null,
    "people": number or null,
    "category": "paneer", "chicken", etc., or null,
    "spice": "spicy", "creamy", etc., or null,
    "maxPrice": number or null,
    "reference": "previous recommendations", "last order", or null,
    "price": "lower", "higher", or null,
    "dishName": "Paneer Tikka Butter Masala" or null,
    "navigationTarget": "/cart", "/(tabs)/profile", etc., or null
  },
  "missing": [
    // Array of fields required for the intent but missing in the conversation.
    // For "reservations": require "people" (number of guests), "date", and "time".
    // For other intents: keep empty.
  ]
}

Conversation Context (Oldest to Newest):
${messagesHistory.slice(-4).map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n")}
CURRENT USER MESSAGE: "${message}"`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

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
            { role: "user", content: message }
          ],
          max_tokens: 250,
          temperature: 0.1
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Stage 1 HF API status ${response.status}`);
      }

      const data = await response.json() as any;
      const rawText = data.choices?.[0]?.message?.content || "";
      
      const jsonText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      return JSON.parse(jsonText) as SemanticPayload;

    } catch (e: any) {
      clearTimeout(timeoutId);
      console.log("[Tadka IntentDetector] Semantic parsing failed, using local parser:", e.message);
      return this.fallbackLocalParser(message, messagesHistory);
    }
  }

  private fallbackLocalParser(message: string, messagesHistory: { role: string; content: string }[]): SemanticPayload {
    const q = message.toLowerCase();
    const payload: SemanticPayload = {
      intent: "general_conversation",
      confidence: 0.85,
      entities: {},
      missing: []
    };

    // Simple context tracking
    const lastAssistantMessage = messagesHistory.slice(-2).find(m => m.role === "assistant")?.content.toLowerCase() || "";
    
    // 1. Check if user is replying to table booking questions
    if (lastAssistantMessage.includes("people") || lastAssistantMessage.includes("guests")) {
      const match = q.match(/\b(\d+)\b/);
      if (match) {
        payload.intent = "reservations";
        payload.entities.people = parseInt(match[1]);
        return payload;
      }
    }

    // Intent detections
    if (q.includes("cart") || q.includes("checkout") || q.includes("basket")) {
      payload.intent = "navigation";
      payload.entities.navigationTarget = "/cart";
    } else if (q.includes("booking") || q.includes("reservation") || q.includes("table") || q.includes("dine") || q.includes("reserve")) {
      payload.intent = "reservations";
      
      const guestMatch = q.match(/\b(\d+)\s*(?:people|guests|person)\b/i) || q.match(/\b(?:for)\s*(\d+)\b/i);
      if (guestMatch) payload.entities.people = parseInt(guestMatch[1]);
      
      const dateMatch = q.match(/\b(tomorrow|today|tonight|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i);
      if (dateMatch) payload.entities.date = dateMatch[1];

      // Track missing
      if (!payload.entities.people) payload.missing.push("people");
      if (!payload.entities.date) payload.missing.push("date");
    } else if (q.includes("order") || q.includes("track") || q.includes("eta")) {
      payload.intent = "order_status";
    } else if (q.includes("offer") || q.includes("coupon") || q.includes("promo") || q.includes("deal")) {
      payload.intent = "offers";
    } else if (q.includes("hi") || q.includes("hello") || q.includes("namaste") || q.includes("hey")) {
      payload.intent = "greeting";
    } else if (q.includes("cheaper") || q.includes("less") || q.includes("cheapest")) {
      payload.intent = "menu_recommendation";
      payload.entities.reference = "previous recommendations";
      payload.entities.price = "lower";
    } else {
      payload.intent = "menu_recommendation";
    }

    // Ingredient/Category mapping
    if (q.includes("paneer")) {
      payload.entities.category = "paneer";
    } else if (q.includes("chicken")) {
      payload.entities.category = "chicken";
    }

    if (q.includes("spicy") || q.includes("hot")) {
      payload.entities.spice = "spicy";
    }

    const budgetMatch = q.match(/\b(?:under|below|less than|max|budget of)?\s*(?:rs\.?|inr|₹)?\s*(\d+)\b/i);
    if (budgetMatch) {
      payload.entities.maxPrice = parseInt(budgetMatch[1]);
    }

    if (q.includes("veg") && !q.includes("non-veg") && !q.includes("nonveg")) {
      payload.entities.veg = true;
    } else if (q.includes("non-veg") || q.includes("nonveg")) {
      payload.entities.veg = false;
    }

    return payload;
  }
}
