# AI Assistant Demo Guide - Tadka (Punjabi Kitchen)

This guide provides the exact queries to demonstrate the AI assistant's capabilities for bookings, dishes, and offers.

## 🎯 DEMONSTRATION QUERIES

### 1. **DISH RECOMMENDATIONS**

#### Basic Menu Query
- **Query:** "Suggest some dishes"
- **Expected Result:** Shows a variety of dishes with prices and descriptions

#### Vegetarian Dishes
- **Query:** "Show me vegetarian dishes"
- **Expected Result:** Filters and shows only veg dishes with 🌱 emoji

#### Non-Vegetarian Dishes
- **Query:** "I want non-veg food"
- **Expected Result:** Shows chicken and meat dishes with 🍗 emoji

#### Budget-Conscious Query
- **Query:** "Show me dishes under 300"
- **Expected Result:** Shows dishes priced at ₹300 or below

#### Spicy Food Request
- **Query:** "I want something spicy"
- **Expected Result:** Shows spicy dishes like Chilli Chicken, Tandoori Chicken

#### Category-Specific Query
- **Query:** "Show me biryani options"
- **Expected Result:** Shows biryani dishes (Veg Pulao, Chicken Biryani)

#### Combined Filters
- **Query:** "Suggest spicy vegetarian dishes under 250"
- **Expected Result:** Shows veg spicy dishes within budget

---

### 2. **BOOKINGS & RESERVATIONS**

#### Check Existing Bookings
- **Query:** "Show my bookings"
- **Expected Result:** Displays upcoming table reservations with date, time, guests, and table number

#### Table Reservation Request
- **Query:** "I want to book a table"
- **Expected Result:** Offers to help book a table, asks for date, time, and number of guests

#### Reservation Status
- **Query:** "Check my reservation status"
- **Expected Result:** Shows current reservation details if any exist

---

### 3. **OFFERS & COUPONS**

#### View Active Offers
- **Query:** "Show me available offers"
- **Expected Result:** Displays all active promo codes with titles and descriptions

#### Discount Codes
- **Query:** "What coupons are available?"
- **Expected Result:** Shows coupon codes and how to use them

#### Promotions
- **Query:** "Any current deals?"
- **Expected Result:** Lists current promotional offers

---

### 4. **ORDER TRACKING**

#### Check Order Status
- **Query:** "Track my order"
- **Expected Result:** Shows recent order status, total, and delivery mode

#### Order History
- **Query:** "Show my order history"
- **Expected Result:** Displays past orders with details

---

### 5. **GENERAL QUERIES**

#### Greeting
- **Query:** "Hello" or "Hi" or "Namaste"
- **Expected Result:** Friendly greeting with AI introduction

#### Weather-Based Suggestions
- **Query:** "What should I eat in this weather?"
- **Expected Result:** Weather-appropriate food suggestions

#### Navigation
- **Query:** "Go to cart" or "Open checkout"
- **Expected Result:** Navigation to specified screen

---

## 📋 DEMONSTRATION SEQUENCE (Recommended)

### Step 1: Introduction
1. Send: "Hello"
2. **Result:** AI introduces itself as Tadka

### Step 2: Menu Exploration
1. Send: "Suggest some dishes under 300"
2. **Result:** Shows budget-friendly dishes with prices

### Step 3: Specific Preferences
1. Send: "Show me vegetarian dishes"
2. **Result:** Filters to veg options only

### Step 4: Spicy Food Request
1. Send: "I want something spicy"
2. **Result:** Shows spicy dishes

### Step 5: Offers Display
1. Send: "Show me available offers"
2. **Result:** Displays promo codes and discounts

### Step 6: Booking Check
1. Send: "Show my bookings"
2. **Result:** Shows reservation details (if any exist)

### Step 7: Order Tracking
1. Send: "Track my order"
2. **Result:** Shows recent order status

---

## 🎨 WHAT TO EXPECT

### Response Format
- **Dishes:** Numbered list with name, emoji (🌱/🍗), price, description, and [DISH:ID] tag
- **Offers:** Title, promo code, description, and [OFFER:ID] tag
- **Bookings:** Date, time, guests, table number, and [RESERVATION:ID] tag
- **Orders:** Order ID, status, total, delivery mode, and [ORDER:ID] tag

### UI Features
- **No flickering:** Messages appear instantly
- **Structured data:** Cards for dishes, offers, and bookings
- **Natural language:** AI-like conversational responses
- **Emoji indicators:** 🌱 for vegetarian, 🍗 for non-vegetarian

---

## 🔧 TECHNICAL NOTES

### Hardcoded Data Included
- **8 demo dishes:** Dal Makhani, Paneer Tikka, Butter Naan, Tandoori Chicken, Chicken Biryani, Veg Pulao, Samosa, Chilli Chicken
- **Enhanced filtering:** By price, veg/non-veg, category, spice level
- **Natural responses:** Varied introductions and closings
- **Fallback data:** Used when database has no dishes

### Response Formatting
- Markdown-style formatting with **bold** text
- Structured numbered lists
- Context-aware responses
- Actionable suggestions

---

## 💡 TIPS FOR DEMONSTRATION

1. **Start simple:** Begin with "Hello" to introduce the AI
2. **Show variety:** Demonstrate different query types
3. **Highlight filtering:** Show budget and dietary preference filtering
4. **Display offers:** Show the promo code system
5. **Check data:** Demonstrate booking and order tracking
6. **Natural flow:** Use conversational queries

---

## 🚀 READY TO DEMONSTRATE

The AI assistant is now ready with enhanced hardcoded logic for:
✅ Dish recommendations with smart filtering
✅ Booking and reservation management
✅ Offer and coupon display
✅ Order tracking and history
✅ Natural, conversational responses
✅ No UI flickering issues

Just use the queries above to demonstrate each feature!
