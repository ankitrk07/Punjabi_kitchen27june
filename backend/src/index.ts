import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Static Offers for Punjab Kitchen App
const OFFERS = [
  { id: "o1", title: "FLAT 20% OFF", code: "PUNJABI20", desc: "On orders above ₹499", color: "#D4AF37" },
  { id: "o2", title: "FREE DESSERT", code: "SWEETPK", desc: "On orders above ₹799", color: "#E58B22" },
  { id: "o3", title: "BUY 1 GET 1", code: "BOGO", desc: "On select Naans", color: "#D4AF37" },
  { id: "o4", title: "₹100 OFF", code: "FIRST100", desc: "First order on the app", color: "#F3C846" },
];

// Static Deal of the Day
const DEAL_OF_DAY = {
  title: "Deal of the Day",
  dishName: "Royal Punjabi Thali",
  price: 299,
  originalPrice: 480,
  image: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=800&q=80",
  desc: "Dal Makhani, Paneer, Naan, Jeera Rice, Salad, Gulab Jamun & Lassi",
};

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
app.get("/api/deal-of-day", (req, res) => {
  res.json(DEAL_OF_DAY);
});

// 6. User Profiles (sync or create)
app.post("/api/users", async (req, res) => {
  const { name, email, phone, gender } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: "Email and Name are required" });
  }
  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: { name, phone, gender },
      create: { name, email, phone, gender },
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

// 8. Place Order
app.post("/api/orders", async (req, res) => {
  const { id, items, total, status, mode } = req.body;
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
      },
    });
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save order" });
  }
});

// Get Order History
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Punjabi Kitchen API server running at http://localhost:${PORT}`);
});
