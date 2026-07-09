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

// 17. Dish Image Upload & Database Sync (Admin Dev Tool)
app.post("/api/dishes/:id/upload-image", async (req, res) => {
  const { id } = req.params;
  const { base64, fileName } = req.body;

  if (!base64) {
    return res.status(400).json({ error: "Base64 image data is required" });
  }

  try {
    const uploadsDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const cleanBase64 = base64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(cleanBase64, "base64");

    let ext = ".jpeg";
    if (fileName) {
      const parsedExt = path.extname(fileName);
      if (parsedExt) ext = parsedExt.toLowerCase();
    }

    const sanitizedId = id.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const uniqueFileName = `${sanitizedId}${ext}`;
    const filePath = path.join(uploadsDir, uniqueFileName);

    fs.writeFileSync(filePath, buffer);

    const relativeUrl = `/uploads/${uniqueFileName}`;

    // Update Prisma database
    const updatedDish = await prisma.dish.update({
      where: { id },
      data: { image: relativeUrl }
    });

    console.log(`[Admin Upload Tool] Updated image for ${id} to ${relativeUrl}`);
    res.json({ success: true, dish: updatedDish });
  } catch (error: any) {
    console.error("Image upload/db sync failed:", error);
    res.status(500).json({ error: error.message || "Failed to save image" });
  }
});

// 18. Serve the Development Image Upload web page
app.get("/upload-tool", (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Punjab Kitchen | Master Image Upload Tool</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0A0806;
      --card-bg: #130F0C;
      --border: #241B15;
      --gold: #D4AF37;
      --gold-hover: #F3C846;
      --text: #F4ECE6;
      --text-muted: #9E9187;
      --success: #10B981;
      --error: #EF4444;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: 'Outfit', sans-serif;
      padding-bottom: 80px;
      min-height: 100vh;
      position: relative;
    }
    
    .ambient-glow {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at 10% 20%, rgba(212,175,55,0.04) 0%, transparent 40%),
                  radial-gradient(circle at 90% 80%, rgba(212,175,55,0.03) 0%, transparent 40%);
      pointer-events: none;
      z-index: 0;
    }
    
    header {
      background: rgba(19, 15, 12, 0.7);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 100;
      padding: 24px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
    }
    
    .brand {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    
    .brand-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, var(--gold), #8A6F27);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      color: #000;
      font-size: 22px;
      box-shadow: 0 4px 20px rgba(212, 175, 55, 0.25);
    }
    
    .brand-text h1 {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.5px;
      background: linear-gradient(to right, #FFF, #EAD699);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .brand-text p {
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 1px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    
    .header-controls {
      display: flex;
      gap: 16px;
      flex-grow: 1;
      justify-content: flex-end;
      max-width: 800px;
    }
    
    .search-input-wrapper {
      position: relative;
      flex-grow: 1;
      max-width: 400px;
    }
    
    .search-input-wrapper input {
      width: 100%;
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid var(--border);
      padding: 12px 18px;
      border-radius: 12px;
      color: #FFF;
      font-family: inherit;
      font-size: 14px;
      outline: none;
      transition: all 0.3s;
    }
    
    .search-input-wrapper input:focus {
      border-color: var(--gold);
      box-shadow: 0 0 12px rgba(212, 175, 55, 0.15);
      background: rgba(0, 0, 0, 0.6);
    }
    
    .select-dropdown {
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid var(--border);
      padding: 12px 18px;
      border-radius: 12px;
      color: #FFF;
      font-family: inherit;
      font-size: 14px;
      outline: none;
      cursor: pointer;
      transition: all 0.3s;
      min-width: 180px;
    }
    
    .select-dropdown:focus {
      border-color: var(--gold);
    }
    
    .container {
      max-width: 1440px;
      margin: 40px auto 0;
      padding: 0 40px;
      position: relative;
      z-index: 1;
    }
    
    .stats-bar {
      display: flex;
      gap: 24px;
      margin-bottom: 30px;
      background: rgba(19, 15, 12, 0.5);
      border: 1px solid var(--border);
      padding: 18px 24px;
      border-radius: 16px;
      backdrop-filter: blur(10px);
    }
    
    .stat-item {
      display: flex;
      flex-direction: column;
    }
    
    .stat-label {
      font-size: 11px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .stat-value {
      font-size: 20px;
      font-weight: 700;
      color: var(--gold);
      margin-top: 4px;
    }
    
    .category-section {
      background: rgba(19, 15, 12, 0.2);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 24px;
      margin-bottom: 40px;
      position: relative;
    }
    
    .category-title {
      font-size: 16px;
      font-weight: 800;
      color: var(--gold);
      margin-bottom: 24px;
      text-transform: uppercase;
      letter-spacing: 0.7px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .category-dish-count {
      font-size: 11px;
      color: var(--text-muted);
      font-weight: 500;
      background: rgba(212, 175, 55, 0.06);
      padding: 4px 10px;
      border-radius: 12px;
      border: 1px solid rgba(212, 175, 55, 0.15);
    }
    
    .category-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 20px;
    }
    
    .dish-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      position: relative;
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
    
    .dish-card:hover {
      transform: translateY(-4px);
      border-color: var(--gold);
      box-shadow: 0 8px 24px rgba(212, 175, 55, 0.1);
    }
    
    .preview-box {
      height: 120px;
      position: relative;
      background-color: #080605;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      border-bottom: 1px solid var(--border);
    }
    
    .preview-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
    
    .dish-card:hover .preview-box img {
      transform: scale(1.06);
    }
    
    .no-img-text {
      color: var(--text-muted);
      font-size: 11px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }
    
    .no-img-text svg {
      width: 24px;
      height: 24px;
      fill: none;
      stroke: var(--text-muted);
      stroke-width: 1.5;
    }
    
    .hud-hint {
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(0, 0, 0, 0.75);
      border: 1px solid var(--border);
      border-radius: 5px;
      padding: 3px 6px;
      font-size: 9px;
      color: var(--gold);
      font-weight: 500;
      pointer-events: none;
      z-index: 5;
    }
    
    .card-drop-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(10, 8, 6, 0.9);
      border: 2px dashed var(--gold);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease-in-out;
      z-index: 10;
      color: var(--gold);
      font-weight: 600;
      font-size: 13px;
      gap: 8px;
    }
    
    .dish-card.drag-over .card-drop-overlay {
      opacity: 1;
    }
    
    .card-info {
      padding: 14px;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      gap: 8px;
    }
    
    .dish-details {
      display: flex;
      flex-direction: column;
    }
    
    .dish-name {
      font-size: 14px;
      font-weight: 700;
      color: #FFF;
      line-height: 1.3;
    }
    
    .dish-id {
      font-size: 10px;
      color: var(--text-muted);
      margin-top: 1px;
    }
    
    .dish-desc {
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 4px;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .meta-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 4px;
    }
    
    .meta-badge {
      font-size: 9px;
      padding: 2px 6px;
      border-radius: 20px;
      font-weight: 600;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    
    .meta-badge-cat {
      background: rgba(212, 175, 55, 0.06);
      color: var(--gold);
      border: 1px solid rgba(212, 175, 55, 0.12);
    }
    
    .meta-badge-veg {
      background: rgba(16, 185, 129, 0.06);
      color: var(--success);
      border: 1px solid rgba(16, 185, 129, 0.12);
    }
    
    .meta-badge-nonveg {
      background: rgba(239, 68, 68, 0.06);
      color: var(--error);
      border: 1px solid rgba(239, 68, 68, 0.12);
    }
    
    .actions-panel {
      margin-top: auto;
      display: flex;
      gap: 8px;
    }
    
    .action-btn {
      flex: 1;
      padding: 8px;
      border-radius: 8px;
      border: none;
      font-family: inherit;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
    
    .action-btn-primary {
      background: var(--gold);
      color: #000;
    }
    
    .action-btn-primary:hover {
      background: var(--gold-hover);
      box-shadow: 0 4px 10px rgba(212, 175, 55, 0.2);
    }
    
    .card-upload-spinner {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(19, 15, 12, 0.85);
      z-index: 20;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s;
      gap: 12px;
    }
    
    .dish-card.uploading .card-upload-spinner {
      opacity: 1;
      pointer-events: auto;
    }
    
    .loader {
      width: 28px;
      height: 28px;
      border: 3px solid rgba(212, 175, 55, 0.1);
      border-top-color: var(--gold);
      border-radius: 50%;
      animation: rotating 0.8s linear infinite;
    }
    
    @keyframes rotating {
      to { transform: rotate(360deg); }
    }
    
    .card-success-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(16, 185, 129, 0.95);
      z-index: 30;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s;
      color: #000;
      font-weight: 800;
      gap: 10px;
    }
    
    .dish-card.success-flash .card-success-overlay {
      opacity: 1;
    }
    
    .dish-card.active-paste-target {
      border-color: var(--gold);
      box-shadow: 0 0 15px rgba(212, 175, 55, 0.35);
    }
  </style>
</head>
<body>
  <div class="ambient-glow"></div>
  
  <header>
    <div class="brand">
      <div class="brand-icon">PK</div>
      <div class="brand-text">
        <h1>Master Image Upload Tool</h1>
        <p>Development & Content Sync Environment</p>
      </div>
    </div>
    
    <div class="header-controls">
      <div class="search-input-wrapper">
        <input type="text" id="searchBar" placeholder="Search dishes by name or id...">
      </div>
      
      <select id="categoryFilter" class="select-dropdown">
        <option value="all">All Categories</option>
      </select>
    </div>
  </header>
  
  <div class="container">
    <div class="stats-bar">
      <div class="stat-item">
        <span class="stat-label">Total Dishes</span>
        <span class="stat-value" id="statTotal">0</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Has Local Image</span>
        <span class="stat-value" id="statHasImage">0</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Missing/Unsplash</span>
        <span class="stat-value" id="statMissing">0</span>
      </div>
    </div>
    
    <div id="dishesContainer"></div>
  </div>
  
  <script>
    let dishesList = [];
    let categoriesList = [];
    const dishesContainer = document.getElementById('dishesContainer');
    const searchBar = document.getElementById('searchBar');
    const categoryFilter = document.getElementById('categoryFilter');
    
    const API_BASE = window.location.origin;
    let selectedPasteTarget = null;

    async function loadData() {
      try {
        const [dishesRes, categoriesRes] = await Promise.all([
          fetch(API_BASE + '/api/dishes'),
          fetch(API_BASE + '/api/categories')
        ]);
        
        dishesList = await dishesRes.json();
        categoriesList = await categoriesRes.json();
        
        categoryFilter.innerHTML = '<option value="all">All Categories</option>';
        
        const roots = categoriesList.filter(c => !c.parentId);
        roots.forEach(root => {
          const opt = document.createElement('option');
          opt.value = root.id;
          opt.textContent = '📦 ' + root.name.replace(/Page \\d+:\\s*/i, '');
          categoryFilter.appendChild(opt);
          
          const subCats = categoriesList.filter(c => c.parentId === root.id);
          subCats.forEach(sub => {
            const optSub = document.createElement('option');
            optSub.value = sub.id;
            optSub.textContent = '    ├─ ' + sub.name;
            categoryFilter.appendChild(optSub);
            
            const grandCats = categoriesList.filter(c => c.parentId === sub.id);
            grandCats.forEach(grand => {
              const optGrand = document.createElement('option');
              optGrand.value = grand.id;
              optGrand.textContent = '        └─ ' + grand.name;
              categoryFilter.appendChild(optGrand);
            });
          });
        });
        
        renderDishes();
        updateStats();
      } catch (err) {
        console.error('Failed to load upload-tool data:', err);
      }
    }

    function isCategoryDescendant(childCatId, parentCatId) {
      if (childCatId === parentCatId) return true;
      const parentCat = categoriesList.find(c => c.id === childCatId);
      if (!parentCat || !parentCat.parentId) return false;
      return isCategoryDescendant(parentCat.parentId, parentCatId);
    }

    function updateStats() {
      const total = dishesList.length;
      const withLocal = dishesList.filter(d => d.image && d.image.startsWith('/uploads/')).length;
      const missing = total - withLocal;
      
      document.getElementById('statTotal').textContent = total;
      document.getElementById('statHasImage').textContent = withLocal;
      document.getElementById('statMissing').textContent = missing;
    }

    function renderDishes() {
      const term = searchBar.value.toLowerCase().trim();
      const selectedCat = categoryFilter.value;
      
      dishesContainer.innerHTML = '';
      
      const filtered = dishesList.filter(d => {
        const matchesSearch = d.name.toLowerCase().includes(term) || d.id.toLowerCase().includes(term);
        const matchesCat = selectedCat === 'all' || isCategoryDescendant(d.category, selectedCat);
        return matchesSearch && matchesCat;
      });

      const dishesGrouped = {};
      filtered.forEach(dish => {
        const catId = dish.category || 'uncategorized';
        if (!dishesGrouped[catId]) {
          dishesGrouped[catId] = [];
        }
        dishesGrouped[catId].push(dish);
      });

      categoriesList.forEach(category => {
        const categoryDishes = dishesGrouped[category.id];
        if (!categoryDishes || categoryDishes.length === 0) return;

        createCategorySection(category.name, category.id, categoryDishes);
      });

      const uncategorizedDishes = dishesGrouped['uncategorized'];
      if (uncategorizedDishes && uncategorizedDishes.length > 0) {
        createCategorySection('Uncategorized', 'uncategorized', uncategorizedDishes);
      }

      if (filtered.length === 0) {
        dishesContainer.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 40px;">No dishes matched your search criteria.</div>';
      }
    }

    function createCategorySection(catName, catId, dishes) {
      const section = document.createElement('div');
      section.className = 'category-section';
      section.id = 'section-' + catId;

      section.innerHTML = \'<div class="category-title"><span>\' + catName + \'</span><span class="category-dish-count">\' + dishes.length + \' \' + (dishes.length === 1 ? \'item\' : \'items\') + \'</span></div><div class="category-grid" id="grid-\' + catId + \'"></div>\';

      dishesContainer.appendChild(section);
      const grid = document.getElementById('grid-' + catId);

      dishes.forEach(dish => {
        const isLocal = dish.image && dish.image.startsWith('/uploads/');
        const imgUrl = isLocal ? (API_BASE + dish.image) : dish.image;
        
        const card = document.createElement('div');
        card.className = 'dish-card';
        card.id = 'card-' + dish.id;
        card.dataset.dishId = dish.id;
        if (selectedPasteTarget === dish.id) {
          card.classList.add('active-paste-target');
        }

        const previewHtml = dish.image 
          ? \'<img src="\' + imgUrl + \'" alt="\' + dish.name + \'">\'
          : \'<div class="no-img-text"><svg viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 5H5l3.5-4.5z" stroke-linecap="round" stroke-linejoin="round"/></svg><span>No Image Set</span></div>\';

        card.innerHTML = 
          \'<div class="preview-box">\' +
            previewHtml +
            \'<div class="hud-hint">PASTE OR DROP</div>\' +
          \'</div>\' +
          \'<div class="card-drop-overlay">\' +
            \'<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14" stroke-linecap="round"/></svg>\' +
            \'<span>Drop image</span>\' +
          \'</div>\' +
          \'<div class="card-upload-spinner">\' +
            \'<div class="loader"></div>\' +
            \'<span style="font-size: 11px; font-weight: 500;">Uploading...</span>\' +
          \'</div>\' +
          \'<div class="card-success-overlay">\' +
            \'<svg width="24" height="24" fill="none" stroke="#000" stroke-width="3"><path d="M20 6L9 17l-5-5" stroke-linecap="round"/></svg>\' +
            \'<span style="font-size: 12px; margin-top: 4px;">Saved!</span>\' +
          \'</div>\' +
          \'<div class="card-info">\' +
            \'<div class="dish-details">\' +
              \'<span class="dish-name">\' + dish.name + \'</span>\' +
              \'<span class="dish-id">ID: \' + dish.id + \'</span>\' +
              \'<span class="dish-desc">\' + dish.description + \'</span>\' +
            \'</div>\' +
            \'<div class="meta-badges">\' +
              \'<span class="meta-badge meta-badge-cat">\' + dish.category + \'</span>\' +
              \'<span class="meta-badge \' + (dish.veg ? \'meta-badge-veg\' : \'meta-badge-nonveg\') + \'">\' +
                (dish.veg ? \'Veg\' : \'Non-Veg\') +
              \'</span>\' +
            \'</div>\' +
            \'<div class="actions-panel">\' +
              \'<button class="action-btn action-btn-primary" onclick="triggerFileInput(\\\'\' + dish.id + \'\\\')">\' +
                \'Choose File\' +
              \'</button>\' +
            \'</div>\' +
            \'<input type="file" id="file-\' + dish.id + \'" accept="image/*" style="display: none;" onchange="handleFileSelect(event, \\\'\' + dish.id + \'\\\')">\' +
          \'</div>\';
        
        card.addEventListener(\'dragover\', (e) => {
          e.preventDefault();
          card.classList.add(\'drag-over\');
        });
        
        card.addEventListener(\'dragleave\', () => {
          card.classList.remove(\'drag-over\');
        });
        
        card.addEventListener(\'drop\', (e) => {
          e.preventDefault();
          card.classList.remove(\'drag-over\');
          const file = e.dataTransfer.files[0];
          if (file && file.type.startsWith(\'image/\')) {
            uploadFile(file, dish.id);
          }
        });
        
        card.addEventListener(\'click\', () => {
          document.querySelectorAll(\'.dish-card\').forEach(c => c.classList.remove(\'active-paste-target\'));
          card.classList.add(\'active-paste-target\');
          selectedPasteTarget = dish.id;
        });
        
        grid.appendChild(card);
      });
    }

    document.addEventListener(\'paste\', (e) => {
      if (!selectedPasteTarget) return;
      
      const items = (e.clipboardData || e.originalEvent.clipboardData).items;
      for (const item of items) {
        if (item.type.indexOf(\'image\') !== -1) {
          const file = item.getAsFile();
          uploadFile(file, selectedPasteTarget);
          break;
        }
      }
    });

    function triggerFileInput(dishId) {
      document.getElementById(\'file-\' + dishId).click();
    }

    function handleFileSelect(e, dishId) {
      const file = e.target.files[0];
      if (file) {
        uploadFile(file, dishId);
      }
    }

    async function uploadFile(file, dishId) {
      const card = document.getElementById(\'card-\' + dishId);
      card.classList.add(\'uploading\');
      
      const reader = new FileReader();
      reader.onload = async function(evt) {
        const base64 = evt.target.result;
        try {
          const res = await fetch(API_BASE + \'/api/dishes/\' + dishId + \'/upload-image\', {
            method: \'POST\',
            headers: { \'Content-Type\': \'application/json\' },
            body: JSON.stringify({
              base64: base64,
              fileName: file.name
            })
          });
          
          const data = await res.json();
          if (data.success) {
            const idx = dishesList.findIndex(d => d.id === dishId);
            if (idx !== -1) {
              dishesList[idx].image = data.dish.image;
            }
            
            card.classList.remove(\'uploading\');
            card.classList.add(\'success-flash\');
            
            setTimeout(() => {
              card.classList.remove(\'success-flash\');
              renderDishes();
              updateStats();
            }, 1000);
          } else {
            alert(\'Upload failed: \' + (data.error || \'Unknown error\'));
            card.classList.remove(\'uploading\');
          }
        } catch (err) {
          console.error(err);
          alert(\'Upload request failed.\');
          card.classList.remove(\'uploading\');
        }
      };
      reader.readAsDataURL(file);
    }

    searchBar.addEventListener(\'input\', renderDishes);
    categoryFilter.addEventListener(\'change\', renderDishes);

    window.onload = loadData;
  </script>
</body>
</html>`);
});

app.listen(PORT, () => {
  console.log(`🚀 Punjabi Kitchen API server running at http://localhost:${PORT}`);
});
