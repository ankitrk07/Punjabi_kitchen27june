import { PrismaClient } from "@prisma/client";

export class MenuRetriever {
  private prisma: PrismaClient;
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async retrieve(filters: {
    query?: string;
    maxBudget?: number;
    veg?: boolean;
    spicy?: boolean;
  }) {
    const allDishes = await this.prisma.dish.findMany();
    let results = [...allDishes];

    if (filters.veg !== undefined) {
      results = results.filter(d => d.veg === filters.veg);
    }
    if (filters.maxBudget !== undefined) {
      results = results.filter(d => d.price <= filters.maxBudget!);
    }
    if (filters.spicy !== undefined) {
      results = results.filter(d => {
        const matchesSpicy = d.description.toLowerCase().match(/(spicy|hot|chilly|chili|schezwan|pepper)/i);
        return filters.spicy ? !!matchesSpicy : !matchesSpicy;
      });
    }
    if (filters.query) {
      const q = filters.query.toLowerCase();
      results = results.filter(d => {
        const dishNameLower = d.name.toLowerCase();
        // Check if the query contains the full dish name or ingredients/words of the dish name
        if (q.includes(dishNameLower)) return true;
        
        const words = dishNameLower.split(/[\s_\-\(\)]+/).filter(w => w.length > 2);
        return words.some(w => q.includes(w));
      });
    }

    // Sort by rating desc
    results.sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5));
    return results.slice(0, 3);
  }
}

export class OfferRetriever {
  async retrieve() {
    // Dynamic offers list
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
