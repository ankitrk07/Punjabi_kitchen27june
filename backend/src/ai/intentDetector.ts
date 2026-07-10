export interface SemanticPayload {
  intent: "menu_recommendation" | "offers" | "reservations" | "order_status" | "navigation" | "faq" | "greeting" | "general_conversation";
  category: "starter" | "dessert" | "soup" | "beverage" | "main" | "bread" | null;
  veg: boolean | null;
  maxPrice: number | null;
  taste: "sweet" | "spicy" | "creamy" | "light" | "sour" | null;
  navigation: string | null;
  faqTopic: string | null;
}

export class IntentDetector {
  async detectSemantic(message: string, token?: string): Promise<SemanticPayload> {
    if (!token || token.trim() === "") {
      return this.fallbackLocalParser(message);
    }

    const systemPrompt = `You are a restaurant assistant semantic analyzer. You must parse the user message and return a structured JSON response matching the specifications.
Do NOT return any explanation, code fences, markdown blocks, or extra text. Return ONLY valid raw JSON.

Output JSON format:
{
  "intent": "menu_recommendation" | "offers" | "reservations" | "order_status" | "navigation" | "faq" | "greeting" | "general_conversation",
  "category": "starter" | "dessert" | "soup" | "beverage" | "main" | "bread" | null,
  "veg": true | false | null,
  "maxPrice": number | null,
  "taste": "sweet" | "spicy" | "creamy" | "light" | "sour" | null,
  "navigation": string | null,
  "faqTopic": string | null
}`;

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
          max_tokens: 150,
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
      
      // Clean up potential markdown code fences from LLM output
      const jsonText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      return JSON.parse(jsonText) as SemanticPayload;

    } catch (e: any) {
      clearTimeout(timeoutId);
      console.log("[Tadka IntentDetector] Stage 1 semantic parsing failed, using local parser:", e.message);
      return this.fallbackLocalParser(message);
    }
  }

  private fallbackLocalParser(message: string): SemanticPayload {
    const q = message.toLowerCase();
    const payload: SemanticPayload = {
      intent: "general_conversation",
      category: null,
      veg: null,
      maxPrice: null,
      taste: null,
      navigation: null,
      faqTopic: null
    };

    // Intent detection fallbacks
    if (q.includes("cart") || q.includes("profile") || q.includes("offers") || q.includes("checkout")) {
      payload.intent = "navigation";
      payload.navigation = q.includes("cart") ? "/cart" : q.includes("profile") ? "/(tabs)/profile" : "/profile/offers";
    } else if (q.includes("booking") || q.includes("reservation") || q.includes("table")) {
      payload.intent = "reservations";
    } else if (q.includes("order") || q.includes("track")) {
      payload.intent = "order_status";
    } else if (q.includes("offer") || q.includes("deal") || q.includes("coupon")) {
      payload.intent = "offers";
    } else if (q.includes("timing") || q.includes("refund") || q.includes("delivery") || q.includes("contact")) {
      payload.intent = "faq";
      payload.faqTopic = q.includes("timing") ? "timings" : q.includes("refund") ? "refund" : "delivery";
    } else if (q.includes("hi") || q.includes("hello") || q.includes("hey") || q.includes("namaste")) {
      payload.intent = "greeting";
    } else {
      payload.intent = "menu_recommendation";
    }

    // Category / Taste fallbacks
    if (q.includes("sweet") || q.includes("dessert") || q.includes("sugar") || q.includes("gulab") || q.includes("ice cream")) {
      payload.category = "dessert";
      payload.taste = "sweet";
    } else if (q.includes("soup")) {
      payload.category = "soup";
    } else if (q.includes("drink") || q.includes("shake") || q.includes("beverage") || q.includes("soda")) {
      payload.category = "beverage";
    } else if (q.includes("starter") || q.includes("tikka") || q.includes("kabab") || q.includes("roll")) {
      payload.category = "starter";
    } else if (q.includes("bread") || q.includes("roti") || q.includes("naan") || q.includes("kulcha")) {
      payload.category = "bread";
    } else if (q.includes("main") || q.includes("dinner") || q.includes("lunch") || q.includes("curry") || q.includes("dal")) {
      payload.category = "main";
    }

    if (q.includes("spicy") || q.includes("hot") || q.includes("chilli")) {
      payload.taste = "spicy";
    } else if (q.includes("creamy") || q.includes("butter")) {
      payload.taste = "creamy";
    } else if (q.includes("light") || q.includes("healthy") || q.includes("diet")) {
      payload.taste = "light";
    }

    if (q.includes("veg") && !q.includes("non-veg") && !q.includes("nonveg")) {
      payload.veg = true;
    } else if (q.includes("non-veg") || q.includes("nonveg")) {
      payload.veg = false;
    }

    const budgetMatch = q.match(/\b(?:under|below|less than|max|budget of)?\s*(?:rs\.?|inr|₹)?\s*(\d+)\b/i);
    if (budgetMatch) {
      payload.maxPrice = parseInt(budgetMatch[1]);
    }

    return payload;
  }
}
