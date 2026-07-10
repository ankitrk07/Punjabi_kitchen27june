import { PrismaClient } from "@prisma/client";

export class MenuRetriever {
  private prisma: PrismaClient;
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async retrieveSemantic(filters: {
    category: "starter" | "dessert" | "soup" | "beverage" | "main" | "bread" | null;
    veg: boolean | null;
    maxPrice: number | null;
    taste: "sweet" | "spicy" | "creamy" | "light" | "sour" | null;
  }) {
    const allDishes = await this.prisma.dish.findMany();
    let results = [...allDishes];

    // 1. Category ID Mapping
    if (filters.category) {
      let targetCategoryIds: string[] = [];
      switch (filters.category) {
        case "dessert":
          targetCategoryIds = ["desserts", "desserts_veg"];
          break;
        case "starter":
          targetCategoryIds = [
            "veg_starter", "non_veg_starter", 
            "chinese_starter", "chinese_starter_veg", "chinese_starter_non_veg", 
            "tandoor", "tandoor_veg", "tandoor_non_veg"
          ];
          break;
        case "soup":
          targetCategoryIds = ["soup", "soup_veg", "soup_non_veg"];
          break;
        case "beverage":
          targetCategoryIds = ["beverages", "shakes"];
          break;
        case "bread":
          targetCategoryIds = ["breads"];
          break;
        case "main":
          targetCategoryIds = [
            "main_course", "main_course_veg", "main_course_non_veg", 
            "soya_chap", "dal", "rice_p1", "rice_p5", "rice_p5_veg", "rice_p5_non_veg"
          ];
          break;
      }
      results = results.filter(d => targetCategoryIds.includes(d.categoryId));
    } else if (filters.taste === "sweet") {
      // If sweet taste was inferred without explicit category, prioritize desserts/shakes
      results = results.filter(d => ["desserts", "desserts_veg", "shakes"].includes(d.categoryId));
    }

    // 2. Veg / Non-Veg structured filtering
    if (filters.veg !== null && filters.veg !== undefined) {
      results = results.filter(d => d.veg === filters.veg);
    }

    // 3. Price structured filtering
    if (filters.maxPrice !== null && filters.maxPrice !== undefined) {
      results = results.filter(d => d.price <= filters.maxPrice!);
    }

    // Sort by rating desc to get high-quality candidates
    results.sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5));

    // Return a generous list of candidates (up to 15) so the Stage 2 LLM can perform semantic reasoning and ranking!
    return results.slice(0, 15);
  }
}

export class OfferRetriever {
  async retrieve() {
    return [
      { id: "pkfest15", code: "PKFEST15", title: "15% Festival Off", desc: "Get 15% off on all orders above ₹500", minCart: 500 },
      { id: "lunch100", code: "LUNCH100", title: "Flat ₹100 Off", desc: "Save ₹100 flat on weekday lunch orders above ₹600", minCart: 600 },
      { id: "freedel", code: "FREEDEL", title: "Free Delivery", desc: "Enjoy zero delivery fees on orders above ₹400", minCart: 400 }
    ];
  }
}

export class OrderRetriever {
  private prisma: PrismaClient;
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async retrieve(userEmail: string) {
    if (!userEmail) return [];
    return await this.prisma.order.findMany({
      where: { userEmail },
      orderBy: { createdAt: "desc" },
      take: 2
    });
  }
}

export class ReservationRetriever {
  private prisma: PrismaClient;
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async retrieve(userEmail: string) {
    if (!userEmail) return [];
    return await this.prisma.reservation.findMany({
      where: { userEmail, status: "Active" },
      orderBy: { createdAt: "desc" },
      take: 2
    });
  }
}

export class UserRetriever {
  private prisma: PrismaClient;
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async retrieve(userEmail: string) {
    if (!userEmail) return null;
    return await this.prisma.user.findUnique({
      where: { email: userEmail }
    });
  }
}

export class NavigationRetriever {
  private routes = [
    { phrase: "cart", route: "/cart" },
    { phrase: "basket", route: "/cart" },
    { phrase: "profile", route: "/(tabs)/profile" },
    { phrase: "account", route: "/(tabs)/profile" },
    { phrase: "home", route: "/(tabs)/home" },
    { phrase: "menu", route: "/(tabs)/home" },
    { phrase: "bookings", route: "/(tabs)/profile" },
    { phrase: "reservations", route: "/(tabs)/profile" },
    { phrase: "offers", route: "/profile/offers" },
    { phrase: "coupon", route: "/profile/offers" }
  ];

  retrieve(query: string) {
    const q = query.toLowerCase();
    const match = this.routes.find(r => q.includes(r.phrase));
    return match ? { route: match.route, action: `Navigate to ${match.phrase}` } : null;
  }
}

export class FAQRetriever {
  private faqs = [
    { q: "timings", a: "Punjabi Kitchen is open daily from 11:00 AM to 11:00 PM." },
    { q: "hours", a: "We serve customers between 11:00 AM and 11:00 PM every day of the week." },
    { q: "refund", a: "Refunds for cancelled orders are processed back to the original payment method within 5-7 business days." },
    { q: "delivery", a: "We deliver within a 8km radius of रांची Opp. Kashyap Eye Hospital. Delivery is free for orders above ₹400." },
    { q: "contact", a: "You can call us directly at +91 99887 76655 or email support@punjabikitchen.com." }
  ];

  retrieve(query: string) {
    const q = query.toLowerCase();
    const match = this.faqs.find(f => q.includes(f.q));
    return match ? match.a : null;
  }
}
