import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(cors());
// Set high payload limits for Base64 image uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Serve static uploaded dish images
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Static Offers for Punjab Kitchen App
const OFFERS = [
  { id: "o1", title: "FLAT 20% OFF", code: "PUNJABI20", desc: "On orders above ₹499", color: "#D4AF37" },
  { id: "o2", title: "FREE DESSERT", code: "SWEETPK", desc: "On orders above ₹799", color: "#E58B22" },
  { id: "o3", title: "BUY 1 GET 1", code: "BOGO", desc: "On select Naans", color: "#D4AF37" },
  { id: "o4", title: "₹100 OFF", code: "FIRST100", desc: "First order on the app", color: "#F3C846" },
];

// Static Deal of the Day states
let manualDeal: any = null;
let cachedRandomDeal: any = null;
let randomDealExpiry: number = 0; // timestamp

const staticFallbackDeals = [
  {
    id: "Dal_Makhani",
    title: "Deal of the Day",
    dishName: "Dal Makhani",
    price: 180,
    originalPrice: 240,
    image: "/uploads/Menu 15/Dal/Dal Makhani.jpeg",
    desc: "Creamy slow-cooked whole black lentils and kidney beans, a Punjabi classic."
  },
  {
    id: "Paneer_Tikka_Butter_Masala",
    title: "Deal of the Day",
    dishName: "Paneer Tikka Butter Masala",
    price: 232,
    originalPrice: 310,
    image: "/uploads/20260701_000047.jpeg",
    desc: "Grilled cottage cheese cubes in rich, buttery, spiced tomato-cashew gravy."
  },
  {
    id: "Butter_Naan",
    title: "Deal of the Day",
    dishName: "Butter Naan",
    price: 45,
    originalPrice: 60,
    image: "/uploads/Menu 15/Breads/Butter Naan.jpeg",
    desc: "Leavened oven-baked flatbread brushed with rich melted butter."
  },
  {
    id: "Double_Leg_Biryani",
    title: "Deal of the Day",
    dishName: "Double Leg Chicken Biryani",
    price: 225,
    originalPrice: 300,
    image: "/uploads/Menu 15/Rice/Double Leg Chicken Biryani.jpg",
    desc: "Aromatic layered basmati rice served with two juicy tandoori chicken legs."
  },
  {
    id: "Hot_Gulab_Jamun_(2_Pcs)",
    title: "Deal of the Day",
    dishName: "Hot Gulab Jamun (2 Pcs)",
    price: 63,
    originalPrice: 84,
    image: "/uploads/Menu 15/Desserts/Hot Gulab Jamun (2 Pcs).jpeg",
    desc: "Warm golden-brown cottage cheese dumplings dipped in sugary cardamom syrup."
  }
];

/* ─── API Routes ─── */

// 1. Categories
app.get("/api/categories", async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

app.post("/api/categories", async (req, res) => {
  const { id, name, icon, image, parentId } = req.body;
  if (!id || !name) {
    return res.status(400).json({ error: "Missing required category fields (id, name)" });
  }
  try {
    const category = await prisma.category.create({
      data: {
        id,
        name,
        icon: icon || "restaurant",
        image: image || "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80",
        parentId: parentId || null,
      },
    });
    res.json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create category" });
  }
});

app.put("/api/categories/:id", async (req, res) => {
  const { name, icon, image, parentId } = req.body;
  try {
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: {
        name,
        icon,
        image,
        parentId: parentId !== undefined ? (parentId || null) : undefined,
      },
    });
    res.json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update category" });
  }
});

app.delete("/api/categories/:id", async (req, res) => {
  try {
    await prisma.category.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete category" });
  }
});

// 2. Dishes
app.get("/api/dishes", async (req, res) => {
  try {
    const dishes = await prisma.dish.findMany();
    const mapped = dishes.map((d) => ({
      ...d,
      category: d.categoryId,
    }));
    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch dishes" });
  }
});

// 3. Reviews
app.get("/api/reviews", async (req, res) => {
  try {
    const reviews = await prisma.review.findMany();
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// 4. Offers
app.get("/api/offers", (req, res) => {
  res.json(OFFERS);
});

// 5. Deal of the Day
app.get("/api/deal-of-day", async (req, res) => {
  try {
    if (manualDeal) {
      return res.json({ isAuto: false, deals: [manualDeal] });
    }

    const count = await prisma.dish.count();
    if (count > 0) {
      const dishes = await prisma.dish.findMany();
      if (dishes.length > 0) {
        // Select up to 5 random dishes to show in the slideshow
        const shuffled = [...dishes].sort(() => 0.5 - Math.random());
        const selectedDishes = shuffled.slice(0, Math.min(5, shuffled.length));

        const dealsList = selectedDishes.map((randomDish) => {
          const originalPrice = randomDish.price;
          const price = Math.round(originalPrice * 0.75); // 25% discount
          return {
            id: randomDish.id,
            title: "Deal of the Day",
            dishName: randomDish.name,
            price,
            originalPrice,
            image: randomDish.image,
            desc: randomDish.description || "Limited time deal of the day! Get 25% OFF."
          };
        });

        return res.json({ isAuto: true, deals: dealsList });
      }
    }

    res.json({ isAuto: true, deals: staticFallbackDeals });
  } catch (error) {
    console.error("Failed to fetch deal of the day:", error);
    res.json({ isAuto: true, deals: staticFallbackDeals });
  }
});

// Admin endpoint to override or reset Deal of the Day
app.post("/api/admin/deal-of-day", (req, res) => {
  try {
    const { title, dishName, price, originalPrice, image, desc, isAuto } = req.body;
    if (isAuto) {
      manualDeal = null;
      cachedRandomDeal = null; // force regeneration
      randomDealExpiry = 0;
      return res.json({ success: true, mode: "auto" });
    }

    manualDeal = {
      title: title || "Deal of the Day",
      dishName,
      price: Number(price),
      originalPrice: Number(originalPrice),
      image,
      desc
    };
    res.json({ success: true, mode: "manual", deal: manualDeal });
  } catch (error: any) {
    console.error("Failed to set manual deal:", error);
    res.status(500).json({ error: error.message || "Failed to update deal" });
  }
});

app.get("/api/admin/deal-of-day-status", async (req, res) => {
  try {
    const now = Date.now();
    if (!manualDeal && (!cachedRandomDeal || now > randomDealExpiry)) {
      const count = await prisma.dish.count();
      if (count > 0) {
        const randomIndex = Math.floor(Math.random() * count);
        const randomDish = await prisma.dish.findFirst({
          skip: randomIndex,
        });
        if (randomDish) {
          const originalPrice = randomDish.price;
          const price = Math.round(originalPrice * 0.75); // 25% discount
          cachedRandomDeal = {
            title: "Deal of the Day",
            dishName: randomDish.name,
            price,
            originalPrice,
            image: randomDish.image,
            desc: randomDish.description || "Limited time deal of the day! Get 25% OFF."
          };
          randomDealExpiry = now + 60 * 60 * 1000;
        }
      }
    }

    res.json({
      isAuto: !manualDeal,
      manualDeal,
      currentDeal: manualDeal || cachedRandomDeal || staticFallbackDeals[0]
    });
  } catch (error) {
    console.error("Status endpoint error:", error);
    res.json({
      isAuto: !manualDeal,
      manualDeal,
      currentDeal: manualDeal || staticFallbackDeals[0]
    });
  }
});

// Helper to map DB Order model to Frontend Order type
const mapOrder = (o: any) => ({
  id: o.id,
  items: o.items,
  total: o.total,
  status: o.status,
  refund: {
    status: o.refundStatus,
    amount: o.refundAmount,
  },
  createdAt: new Date(o.createdAt).getTime(),
  mode: o.mode,
  userEmail: o.userEmail,
});

// 6. User Profiles (sync or create with favorites)
app.post("/api/users", async (req, res) => {
  const { name, email, phone, gender, favorites, password } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: "Email and Name are required" });
  }
  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        phone,
        gender,
        ...(favorites !== undefined ? { favorites } : {}),
        ...(password !== undefined ? { password } : {}),
      },
      create: {
        name,
        email,
        phone,
        gender,
        password: password || "123456",
        favorites: favorites || [],
      },
      include: { addresses: true },
    });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to sync user profile" });
  }
});

// Get User Profile with Addresses and Cart
app.get("/api/users/:email", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: req.params.email },
      include: { addresses: true },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Authenticate User / Admin
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const trimmedEmail = email.trim().toLowerCase();
  
  // 1. Admin login path
  if (trimmedEmail === "admin@punjabikitchen.com") {
    if (password === "admin123") {
      return res.json({
        id: "admin-id",
        email: "admin@punjabikitchen.com",
        name: "Restaurant Manager",
        gender: "male",
        membershipTier: "Gold",
        loyaltyPoints: 5000,
        addresses: [],
        favorites: [],
      });
    } else {
      return res.status(401).json({ error: "Invalid admin password" });
    }
  }

  // 2. Regular user login path
  try {
    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail },
      include: { addresses: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User account does not exist. Please sign up first." });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to authenticate" });
  }
});

// Update User active cart in database
app.post("/api/users/:email/cart", async (req, res) => {
  const { cart } = req.body;
  try {
    const user = await prisma.user.update({
      where: { email: req.params.email },
      data: { cart: cart || null },
    });
    res.json({ success: true, cart: user.cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update cart" });
  }
});

// 7. Add Address
app.post("/api/addresses", async (req, res) => {
  const { email, label, line } = req.body;
  if (!email || !label || !line) {
    return res.status(400).json({ error: "Missing address fields" });
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const address = await prisma.address.create({
      data: { label, line, userId: user.id },
    });
    res.json(address);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add address" });
  }
});

// Delete Address
app.delete("/api/addresses/:id", async (req, res) => {
  try {
    await prisma.address.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete address" });
  }
});

// 8. Place Order (linked to userEmail)
app.post("/api/orders", async (req, res) => {
  const { id, items, total, status, mode, userEmail, refund } = req.body;
  if (!id || !items || !total || !status || !mode) {
    return res.status(400).json({ error: "Missing order fields" });
  }
  try {
    const order = await prisma.order.create({
      data: {
        id,
        items,
        total,
        status,
        mode,
        userEmail: userEmail || null,
        refundStatus: refund?.status || "None",
        refundAmount: refund?.amount || 0,
        createdAt: new Date(),
      },
    });

    // Loyalty Points progression logic
    if (userEmail) {
      const userObj = await prisma.user.findUnique({ where: { email: userEmail } });
      if (userObj) {
        const pointsEarned = Math.floor(Number(total) / 10);
        const nextPoints = userObj.loyaltyPoints + pointsEarned;
        let nextTier = userObj.membershipTier;
        if (nextPoints >= 2000) {
          nextTier = "Platinum";
        } else if (nextPoints >= 1000) {
          nextTier = "Gold";
        } else {
          nextTier = "Classic";
        }
        await prisma.user.update({
          where: { email: userEmail },
          data: {
            loyaltyPoints: nextPoints,
            membershipTier: nextTier,
          },
        });
      }
    }

    res.json(mapOrder(order));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save order" });
  }
});

// Get Order History (optionally filtered by user email)
app.get("/api/orders", async (req, res) => {
  const { email } = req.query;
  try {
    const orders = await prisma.order.findMany({
      where: email ? { userEmail: String(email) } : {},
      orderBy: { createdAt: "desc" },
    });
    res.json(orders.map(mapOrder));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Cancel Order endpoint
app.post("/api/orders/:id/cancel", async (req, res) => {
  try {
    const existingOrder = await prisma.order.findUnique({
      where: { id: req.params.id },
    });
    if (!existingOrder) {
      return res.status(404).json({ error: "Order not found" });
    }
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: {
        status: "Cancelled",
        refundStatus: "Pending",
        refundAmount: existingOrder.total,
      },
    });
    res.json(mapOrder(order));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to cancel order" });
  }
});

// Process Order Refund
app.post("/api/orders/:id/refund", async (req, res) => {
  try {
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { refundStatus: "Completed" },
    });
    res.json(mapOrder(order));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to process refund" });
  }
});

// Update Order Status (admin/system simulation)
app.patch("/api/orders/:id/status", async (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: "Status is required" });
  try {
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json(mapOrder(order));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

// 9. Add Order Review
app.post("/api/reviews", async (req, res) => {
  const { name, avatar, rating, text } = req.body;
  if (!name || rating === undefined || !text) {
    return res.status(400).json({ error: "Missing review fields" });
  }
  try {
    const review = await prisma.review.create({
      data: {
        name,
        avatar: avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80",
        rating: Number(rating),
        text,
      },
    });
    res.json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save review" });
  }
});

// 10. Table Reservations with table seat allocations
// Get reservations (optionally filtered by email, date, slot)
app.get("/api/reservations", async (req, res) => {
  const { email, date, slot } = req.query;
  try {
    const reservations = await prisma.reservation.findMany({
      where: {
        ...(email ? { userEmail: String(email) } : {}),
        ...(date ? { reservationDate: String(date) } : {}),
        ...(slot ? { reservationSlot: String(slot) } : {}),
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(reservations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch reservations" });
  }
});

// Book a table
app.post("/api/reservations", async (req, res) => {
  const {
    customerName,
    customerPhone,
    reservationDate,
    reservationSlot,
    guests,
    guestCount,
    userEmail,
    tableNumber,
    occasion,
    specialRequests,
    seatingType,
  } = req.body;

  if (!customerName || !customerPhone || !reservationDate || !reservationSlot || !guests) {
    return res.status(400).json({ error: "Missing reservation fields" });
  }

  try {
    if (tableNumber) {
      const existing = await prisma.reservation.findFirst({
        where: {
          reservationDate,
          reservationSlot,
          tableNumber: Number(tableNumber),
          status: "Active",
        },
      });
      if (existing) {
        return res.status(400).json({ error: `Table ${tableNumber} is already booked for this slot.` });
      }
    }

    // If occasion is Anniversary, capture the reservationDate as occasionDate to detect it next year
    const occasionDate = occasion === "Anniversary" ? reservationDate : null;

    const reservation = await prisma.reservation.create({
      data: {
        customerName,
        customerPhone,
        reservationDate,
        reservationSlot,
        guests,
        guestCount: Number(guestCount) || 1,
        tableNumber: tableNumber ? Number(tableNumber) : 1,
        userEmail: userEmail || null,
        occasion: occasion || null,
        specialRequests: specialRequests || null,
        seatingType: seatingType || null,
        occasionDate: occasionDate || null,
      },
    });
    res.json(reservation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to book table" });
  }
});

// Cancel a table reservation
app.post("/api/reservations/:id/cancel", async (req, res) => {
  try {
    const reservation = await prisma.reservation.update({
      where: { id: req.params.id },
      data: { status: "Cancelled" },
    });
    res.json(reservation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to cancel reservation" });
  }
});

// 11. Dishes CRUD
app.post("/api/dishes", async (req, res) => {
  const { id, name, price, description, image, veg, categoryId, category, rating } = req.body;
  const targetCategoryId = categoryId || category;
  if (!id || !name || price === undefined || !targetCategoryId) {
    return res.status(400).json({ error: "Missing required dish fields" });
  }
  try {
    const dish = await prisma.dish.create({
      data: {
        id,
        name,
        price: Number(price),
        description: description || "",
        image: image || "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80",
        veg: Boolean(veg),
        categoryId: targetCategoryId,
        rating: Number(rating) || 4.5,
      },
    });
    res.json(dish);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create dish" });
  }
});

app.put("/api/dishes/:id", async (req, res) => {
  const { name, price, description, image, veg, categoryId, category, rating } = req.body;
  const targetCategoryId = categoryId || category;
  try {
    const dish = await prisma.dish.update({
      where: { id: req.params.id },
      data: {
        name,
        price: price !== undefined ? Number(price) : undefined,
        description,
        image,
        veg: veg !== undefined ? Boolean(veg) : undefined,
        categoryId: targetCategoryId,
        rating: rating !== undefined ? Number(rating) : undefined,
      },
    });
    res.json(dish);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update dish" });
  }
});

app.delete("/api/dishes/:id", async (req, res) => {
  try {
    await prisma.dish.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete dish" });
  }
});

// 12. Admin Metrics and User management
app.get("/api/admin/metrics", async (req, res) => {
  try {
    const [totalUsers, totalOrders, orders, totalReservations, totalCatering, openTickets] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.order.findMany({ select: { total: true } }),
      prisma.reservation.count({ where: { status: "Active" } }),
      prisma.cateringRequest.count(),
      prisma.supportTicket.count({ where: { status: "In Progress" } }),
    ]);

    const totalSales = orders.reduce((sum, order) => sum + order.total, 0);

    res.json({
      totalUsers,
      totalOrders,
      totalSales,
      totalReservations,
      totalCatering,
      openTickets,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch metrics" });
  }
});

app.get("/api/admin/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        orders: true,
        reservations: true,
        supportTickets: true,
      },
      orderBy: { email: "asc" },
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// 13. Catering requests
app.get("/api/catering", async (req, res) => {
  const { email } = req.query;
  try {
    const requests = await prisma.cateringRequest.findMany({
      where: email ? { userEmail: String(email) } : {},
      orderBy: { createdAt: "desc" },
    });
    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch catering requests" });
  }
});

app.post("/api/catering", async (req, res) => {
  const { eventType, guests, date, phone, address, package: pkgName, details, userEmail } = req.body;
  if (!eventType || !guests || !date || !phone || !address || !pkgName) {
    return res.status(400).json({ error: "Missing catering request fields" });
  }
  try {
    const request = await prisma.cateringRequest.create({
      data: {
        eventType,
        guests: Number(guests),
        date,
        phone,
        address,
        package: pkgName,
        details: details || null,
        userEmail: userEmail || null,
      },
    });
    res.json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create catering request" });
  }
});

app.patch("/api/catering/:id/status", async (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: "Status is required" });
  try {
    const request = await prisma.cateringRequest.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update catering request status" });
  }
});

// 14. Customer Support tickets
app.get("/api/support/tickets", async (req, res) => {
  const { email } = req.query;
  try {
    const tickets = await prisma.supportTicket.findMany({
      where: email ? { userEmail: String(email) } : {},
      orderBy: { createdAt: "desc" },
    });
    res.json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch support tickets" });
  }
});

app.post("/api/support/tickets", async (req, res) => {
  const { subject, description, priority, userEmail } = req.body;
  if (!subject || !description || !userEmail) {
    return res.status(400).json({ error: "Missing support ticket fields" });
  }
  try {
    const ticket = await prisma.supportTicket.create({
      data: {
        subject,
        description,
        priority: priority || "Medium",
        userEmail,
        lastUpdate: "Ticket received. Our support team is reviewing it.",
      },
    });
    res.json(ticket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create support ticket" });
  }
});

app.patch("/api/support/tickets/:id", async (req, res) => {
  const { status, lastUpdate } = req.body;
  try {
    const ticket = await prisma.supportTicket.update({
      where: { id: req.params.id },
      data: {
        status,
        lastUpdate,
      },
    });
    res.json(ticket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update support ticket" });
  }
});

// 15. Broadcast Announcements/Notifications
app.get("/api/notifications", async (req, res) => {
  const { email } = req.query;
  try {
    const notifications = await prisma.notification.findMany({
      where: email
        ? {
            OR: [
              { userEmail: null },
              { userEmail: String(email) },
            ],
          }
        : { userEmail: null },
      orderBy: { createdAt: "desc" },
    });
    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

app.post("/api/notifications", async (req, res) => {
  const { title, message, type, userEmail } = req.body;
  if (!title || !message) {
    return res.status(400).json({ error: "Title and message are required" });
  }
  try {
    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type: type || "Announcement",
        userEmail: userEmail || null,
      },
    });
    res.json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create notification" });
  }
});

// 16. Local Image Upload
app.post("/api/upload", async (req, res) => {
  const { name, base64 } = req.body;
  if (!name || !base64) {
    return res.status(400).json({ error: "Name and base64 image data are required" });
  }

  try {
    const uploadsDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const cleanBase64 = base64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(cleanBase64, "base64");

    const sanitizedName = name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const uniqueFileName = `${Date.now()}-${sanitizedName}`;
    const filePath = path.join(uploadsDir, uniqueFileName);

    fs.writeFileSync(filePath, buffer);

    res.json({ imageUrl: `/uploads/${uniqueFileName}` });
  } catch (error) {
    console.error("Image upload failed:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Punjabi Kitchen API server running at http://localhost:${PORT}`);
});
