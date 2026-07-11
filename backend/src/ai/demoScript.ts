/**
 * demoScript.ts
 * ---------------------------------------------------------------------------
 * Deterministic, hard-coded response set for the DEMO_MODE AI assistant.
 * No external API calls. Every entry includes the ACTUAL dish/offer/order
 * objects it references (not just [DISH:id] text tags) so that
 * responseFormatter.format() can build identical output to the real
 * production pipeline — meaning dish/offer/order cards render correctly
 * in the UI, not just formatted text.
 *
 * Matching rule: normalize input (lowercase, trim, strip .?! punctuation),
 * then check triggers in array order — first substring match wins.
 * Entries with `requiresPriorIntent` only match if the PREVIOUS response's
 * intentId equals that value (multi-turn booking confirmation flow).
 * ---------------------------------------------------------------------------
 */

export interface DemoDish {
  id: string;
  name: string;
  price: number;
  veg: boolean;
  description: string;
  categoryId: string;
  image?: string;
}

export interface DemoOffer {
  id: string;
  code: string;
  title: string;
  desc: string;
  minCart: number;
}

export interface DemoOrder {
  id: string;
  total: number;
  status: string;
  mode: string;
  createdAt: string;
}

export interface DemoScriptEntry {
  id: string;
  triggers: string[];
  responseText: string;
  dishes?: DemoDish[];
  offers?: DemoOffer[];
  orders?: DemoOrder[];
  navigation?: string | null;
  intentId?: string;
  requiresPriorIntent?: string;
}

/* ============================ SHARED DEMO DATA ============================ */

const DISH_CHILLI_CHICKEN: DemoDish = {
  id: "Chicken_Chilly_(Boneless)",
  name: "Chilli Chicken",
  price: 290,
  veg: false,
  description: "Spicy stir-fried chicken with bell peppers, Indo-Chinese style.",
  categoryId: "chinese_starter_non_veg",
  image: "/uploads/Chicken_Chilly__Boneless_.jpeg",
};

const DISH_CHICKEN_MANCHURIAN: DemoDish = {
  id: "Chicken_Manchurian",
  name: "Chicken Manchurian",
  price: 270,
  veg: false,
  description: "Fiery Indo-Chinese classic, deep-fried and tossed in spicy sauce.",
  categoryId: "chinese_starter_non_veg",
  image: "/uploads/Chicken_Manchurian.jpeg",
};

const DISH_PANEER_TIKKA: DemoDish = {
  id: "Paneer_Tikka",
  name: "Paneer Tikka",
  price: 260,
  veg: true,
  description: "Chargrilled cottage cheese, smoky and spiced.",
  categoryId: "tandoor_veg",
  image: "/uploads/Paneer_Tikka.jpeg",
};

const DISH_GULAB_JAMUN: DemoDish = {
  id: "Hot_Gulab_Jamun_(2_Pcs)",
  name: "Gulab Jamun",
  price: 120,
  veg: true,
  description: "Soft milk dumplings soaked in rose-cardamom syrup.",
  categoryId: "desserts_veg",
  image: "/uploads/Hot_Gulab_Jamun__2_Pcs_.jpeg",
};

const DISH_BROWNIE: DemoDish = {
  id: "Brownie_with_Chocolate_Sauce",
  name: "Chocolate Brownie",
  price: 180,
  veg: true,
  description: "Warm, fudgy brownie served with a scoop of vanilla ice cream.",
  categoryId: "desserts_veg",
  image: "/uploads/Brownie_with_Chocolate_Sauce.jpeg",
};

const DISH_DAL_MAKHANI: DemoDish = {
  id: "Dal_Makhani",
  name: "Dal Makhani",
  price: 240,
  veg: true,
  description: "Creamy slow-cooked black lentils and kidney beans.",
  categoryId: "dal",
  image: "/uploads/Dal_Makhani.jpeg",
};

const DISH_PANEER_BUTTER_MASALA: DemoDish = {
  id: "Paneer_Tikka_Butter_Masala",
  name: "Paneer Tikka Butter Masala",
  price: 310,
  veg: true,
  description: "Grilled cottage cheese cubes in rich, buttery, spiced tomato-cashew gravy.",
  categoryId: "main_course_veg",
  image: "/uploads/Paneer_Tikka_Butter_Masala.jpeg",
};

const DISH_VEG_PULAO: DemoDish = {
  id: "Veg_Pulao",
  name: "Veg Pulao",
  price: 220,
  veg: true,
  description: "Fragrant basmati rice cooked with mixed vegetables and aromatic spices.",
  categoryId: "rice_p5_veg",
  image: "/uploads/Veg_Pulao.jpeg",
};

const DISH_SAMOSA: DemoDish = {
  id: "Paneer_Pakora",
  name: "Samosa (2 pcs)",
  price: 80,
  veg: true,
  description: "Crispy pastry filled with spiced potato and peas mixture.",
  categoryId: "veg_starter",
  image: "/uploads/Paneer_Pakora.jpeg",
};

const DISH_BUTTER_NAAN: DemoDish = {
  id: "Butter_Naan",
  name: "Butter Naan",
  price: 60,
  veg: true,
  description: "Leavened oven-baked flatbread brushed with rich melted butter.",
  categoryId: "breads",
  image: "/uploads/Butter_Naan.jpeg",
};

const DISH_VEG_SANDWICH: DemoDish = {
  id: "Veg_Roll",
  name: "Veg Sandwich",
  price: 120,
  veg: true,
  description: "Grilled sandwich loaded with fresh vegetables and chutney.",
  categoryId: "starters",
  image: "/uploads/Veg_Roll.jpeg",
};

const DISH_BUTTER_CHICKEN: DemoDish = {
  id: "Chicken_Butter_Masala_(2_Pcs)",
  name: "Butter Chicken",
  price: 340,
  veg: false,
  description: "Rich, creamy tomato-based curry with tender tandoori chicken.",
  categoryId: "main_course_non_veg",
  image: "/uploads/Chicken_Butter_Masala__2_Pcs_.jpeg",
};

const DISH_CHICKEN_BIRYANI: DemoDish = {
  id: "Hyderabadi_Chicken_Biryani",
  name: "Hyderabadi Chicken Biryani",
  price: 280,
  veg: false,
  description: "Authentic aromatic basmati rice layered with tender chicken pieces and spices.",
  categoryId: "biryani",
  image: "/uploads/Hyderabadi_Chicken_Biryani.jpeg",
};

const DISH_LIME_SODA: DemoDish = {
  id: "Fresh_Lime_Soda_(Sweet__Sour)",
  name: "Fresh Lime Soda (Sweet & Sour)",
  price: 70,
  veg: true,
  description: "Tangy fresh lime juice in soda water, served sweet and sour.",
  categoryId: "beverages",
  image: "/uploads/Fresh_Lime_Soda__Sweet__Sour_.jpeg",
};

const DISH_MASALA_DRINK: DemoDish = {
  id: "Masala_Cold_Drink",
  name: "Masala Cold Drink",
  price: 83,
  veg: true,
  description: "Spiced masala soft drink, refreshing and flavorful.",
  categoryId: "beverages",
  image: "/uploads/Masala_Cold_Drink.jpeg",
};

const DISH_COLD_COFFEE: DemoDish = {
  id: "Cold_Coffee",
  name: "Cold Coffee",
  price: 100,
  veg: true,
  description: "Chilled blended whipped coffee milkshake.",
  categoryId: "shakes",
  image: "/uploads/Cold_Coffee.jpeg",
};

const DISH_CHOCO_SHAKE: DemoDish = {
  id: "Chocolate",
  name: "Chocolate Shake",
  price: 120,
  veg: true,
  description: "Rich chocolate milkshake topped with chocolate sauce.",
  categoryId: "shakes",
  image: "/uploads/Chocolate.jpeg",
};

const DISH_CHICKEN_FRIED_RICE: DemoDish = {
  id: "Chicken_Fried_Rice",
  name: "Chicken Fried Rice",
  price: 220,
  veg: false,
  description: "Classic stir-fried rice with chicken bits, egg, and vegetables.",
  categoryId: "rice_p5_non_veg",
  image: "/uploads/Chicken_Fried_Rice.jpeg",
};

const DISH_JEERA_RICE: DemoDish = {
  id: "Jeera_Rice",
  name: "Jeera Rice",
  price: 110,
  veg: true,
  description: "Fragrant basmati rice tempered with cumin seeds and clarified butter.",
  categoryId: "rice_p1",
  image: "/uploads/Jeera_Rice.jpeg",
};

const DISH_TANDOORI_CHICKEN: DemoDish = {
  id: "Tandoori_Chicken",
  name: "Tandoori Chicken",
  price: 280,
  veg: false,
  description: "Spiced chicken marinated in yogurt and charred in a clay oven.",
  categoryId: "tandoor_non_veg",
  image: "/uploads/Tandoori_Chicken.jpeg",
};

const DISH_GARLIC_NAAN: DemoDish = {
  id: "Garlic_Naan",
  name: "Garlic Naan",
  price: 80,
  veg: true,
  description: "Oven-baked flatbread topped with minced garlic and butter.",
  categoryId: "breads",
  image: "/uploads/Garlic_Naan.jpeg",
};

const DISH_VEG_ROLL: DemoDish = {
  id: "Veg_Roll",
  name: "Veg Roll",
  price: 80,
  veg: true,
  description: "Spiced vegetable filling rolled inside a thin wrap.",
  categoryId: "veg_starter",
  image: "/uploads/Veg_Roll.jpeg",
};

const DISH_CHICKEN_ROLL: DemoDish = {
  id: "Chicken_Roll",
  name: "Chicken Roll",
  price: 130,
  veg: false,
  description: "Shredded chicken tikka wrapped inside a flatbread.",
  categoryId: "non_veg_starter",
  image: "/uploads/Chicken_Roll.jpeg",
};

const DISH_EGG_ROLL: DemoDish = {
  id: "Egg_Roll",
  name: "Egg Roll",
  price: 70,
  veg: false,
  description: "Flatbread cooked with egg and wrapped with onions.",
  categoryId: "non_veg_starter",
  image: "/uploads/Egg_Roll.jpeg",
};

const DISH_SOYA_MALAI_CHAP: DemoDish = {
  id: "SOYA_MALAI_CHAP",
  name: "Soya Malai Chap",
  price: 220,
  veg: true,
  description: "Soya chunks marinated in rich cream and spices, baked in tandoor.",
  categoryId: "soya_chap",
  image: "/uploads/SOYA_MALAI_CHAP.jpeg",
};

const DISH_VEG_NOODLES: DemoDish = {
  id: "Veg_hakka_Noodles",
  name: "Veg Hakka Noodles",
  price: 170,
  veg: true,
  description: "Classic stir-fried hakka noodles with fresh vegetables.",
  categoryId: "noodles_veg",
  image: "/uploads/Veg_hakka_Noodles.jpeg",
};

const DISH_CHICKEN_NOODLES: DemoDish = {
  id: "Chicken_Hakka_Noodles",
  name: "Chicken Hakka Noodles",
  price: 210,
  veg: false,
  description: "Stir-fried noodles loaded with chicken shreds and vegetables.",
  categoryId: "noodles_non_veg",
  image: "/uploads/Chicken_Hakka_Noodles.jpeg",
};

const DISH_SHAHI_PANEER: DemoDish = {
  id: "Shahi_Paneer",
  name: "Shahi Paneer",
  price: 280,
  veg: true,
  description: "Cottage cheese in rich creamy gravy of tomatoes and cashew nuts.",
  categoryId: "main_course_veg",
  image: "/uploads/Shahi_Paneer.jpeg",
};

const DISH_KADAHI_PANEER: DemoDish = {
  id: "Paneer_Kadahi",
  name: "Kadahi Paneer",
  price: 290,
  veg: true,
  description: "Spicy cottage cheese cooked with bell peppers in kadahi gravy.",
  categoryId: "main_course_veg",
  image: "/uploads/Paneer_Kadahi.jpeg",
};

const DISH_KAJU_CURRY: DemoDish = {
  id: "Kaju_Curry",
  name: "Kaju Curry",
  price: 320,
  veg: true,
  description: "Rich roasted cashews cooked in creamy onion-tomato gravy.",
  categoryId: "main_course_veg",
  image: "/uploads/Kaju_Curry.jpeg",
};

const DISH_CUCUMBER_SALAD: DemoDish = {
  id: "Cucumber_Salad",
  name: "Cucumber Salad",
  price: 60,
  veg: true,
  description: "Fresh sliced cucumbers with seasoning.",
  categoryId: "salad",
  image: "/uploads/Cucumber_Salad.jpeg",
};

const DISH_BOONDI_RAITA: DemoDish = {
  id: "Boondi_Raita",
  name: "Boondi Raita",
  price: 90,
  veg: true,
  description: "Yogurt whisked with tiny fried chickpea flour balls.",
  categoryId: "raita",
  image: "/uploads/Boondi_Raita.jpeg",
};

const DISH_CHICKEN_CURRY: DemoDish = {
  id: "Chicken_Curry__2_Pcs_",
  name: "Chicken Curry (2 Pcs)",
  price: 240,
  veg: false,
  description: "Tender chicken cooked in homestyle Punjabi gravy.",
  categoryId: "main_course_non_veg",
  image: "/uploads/Chicken_Curry__2_Pcs_.jpeg",
};

const DISH_MUTTON_CURRY: DemoDish = {
  id: "Mutton_Curry__4_Pcs_",
  name: "Mutton Curry (4 Pcs)",
  price: 380,
  veg: false,
  description: "Slow-cooked tender mutton in rich traditional gravy.",
  categoryId: "main_course_non_veg",
  image: "/uploads/Mutton_Curry__4_Pcs_.jpeg",
};

const DISH_FISH_CURRY: DemoDish = {
  id: "Fish_Curry__2_Pcs_",
  name: "Fish Curry (2 Pcs)",
  price: 260,
  veg: false,
  description: "Fresh fish simmered in flavorful mustard-spiced gravy.",
  categoryId: "main_course_non_veg",
  image: "/uploads/Fish_Curry__2_Pcs_.jpeg",
};

const DISH_CHICKEN_SOUP: DemoDish = {
  id: "Chicken_Manchow",
  name: "Chicken Manchow Soup",
  price: 130,
  veg: false,
  description: "Hot and spicy Chinese soup served with crispy fried noodles.",
  categoryId: "soup_non_veg",
  image: "/uploads/Chicken_Manchow.jpeg",
};

const DISH_SWEET_CORN_SOUP: DemoDish = {
  id: "Veg_Sweet_Corn_Soup",
  name: "Veg Sweet Corn Soup",
  price: 110,
  veg: true,
  description: "Mildly sweet soup loaded with creamed corn and vegetables.",
  categoryId: "soup_veg",
  image: "/uploads/Veg_Sweet_Corn_Soup.jpg",
};

export const ALL_DEMO_DISHES: DemoDish[] = [
  DISH_CHILLI_CHICKEN,
  DISH_CHICKEN_MANCHURIAN,
  DISH_PANEER_TIKKA,
  DISH_GULAB_JAMUN,
  DISH_BROWNIE,
  DISH_DAL_MAKHANI,
  DISH_PANEER_BUTTER_MASALA,
  DISH_VEG_PULAO,
  DISH_SAMOSA,
  DISH_BUTTER_NAAN,
  DISH_VEG_SANDWICH,
  DISH_BUTTER_CHICKEN,
  DISH_CHICKEN_BIRYANI,
  DISH_LIME_SODA,
  DISH_MASALA_DRINK,
  DISH_COLD_COFFEE,
  DISH_CHOCO_SHAKE,
  DISH_CHICKEN_FRIED_RICE,
  DISH_JEERA_RICE,
  DISH_TANDOORI_CHICKEN,
  DISH_GARLIC_NAAN,
  DISH_VEG_ROLL,
  DISH_CHICKEN_ROLL,
  DISH_EGG_ROLL,
  DISH_SOYA_MALAI_CHAP,
  DISH_VEG_NOODLES,
  DISH_CHICKEN_NOODLES,
  DISH_SHAHI_PANEER,
  DISH_KADAHI_PANEER,
  DISH_KAJU_CURRY,
  DISH_CUCUMBER_SALAD,
  DISH_BOONDI_RAITA,
  DISH_CHICKEN_CURRY,
  DISH_MUTTON_CURRY,
  DISH_FISH_CURRY,
  DISH_CHICKEN_SOUP,
  DISH_SWEET_CORN_SOUP,
];

const OFFER_PKFEST15: DemoOffer = {
  id: "pkfest15",
  code: "PKFEST15",
  title: "15% Festival Off",
  desc: "Get 15% off on all orders above ₹500",
  minCart: 500,
};

const OFFER_LUNCH100: DemoOffer = {
  id: "lunch100",
  code: "LUNCH100",
  title: "Flat ₹100 Off",
  desc: "Save ₹100 flat on weekday lunch orders above ₹600",
  minCart: 600,
};

const OFFER_FREEDEL: DemoOffer = {
  id: "freedel",
  code: "FREEDEL",
  title: "Free Delivery",
  desc: "Enjoy zero delivery fees on orders above ₹400",
  minCart: 400,
};

const ORDER_4821: DemoOrder = {
  id: "4821",
  total: 560,
  status: "Out for Delivery",
  mode: "Delivery",
  createdAt: new Date().toISOString(),
};

/* ============================ THE SCRIPT ============================ */

export const demoResponses: DemoScriptEntry[] = [
  {
    id: "spicy_dishes",
    triggers: ["spicy"],
    responseText:
      "Here are our spiciest picks tonight 🌶️\n\n" +
      "1. **Chilli Chicken** 🍗 (₹290) — Spicy stir-fried chicken with bell peppers, Indo-Chinese style. [DISH:Chicken_Chilly_(Boneless)]\n" +
      "2. **Chicken Manchurian** 🍗 (₹270) — Fiery Indo-Chinese classic. [DISH:Chicken_Manchurian]\n" +
      "3. **Paneer Tikka** 🌱 (₹260) — Chargrilled, smoky, and spiced. [DISH:Paneer_Tikka]\n\n" +
      "Want me to add one to your cart?",
    dishes: [DISH_CHILLI_CHICKEN, DISH_CHICKEN_MANCHURIAN, DISH_PANEER_TIKKA],
  },

  {
    id: "chicken_under_300",
    triggers: ["chicken under 300", "chicken under 300 rs", "chicken under rs 300", "chicken below 300"],
    responseText:
      "Here are our delicious chicken options under ₹300 tonight 🍗\n\n" +
      "1. **Chilli Chicken** (₹290) [DISH:Chicken_Chilly_(Boneless)]\n" +
      "2. **Chicken Manchurian** (₹270) [DISH:Chicken_Manchurian]\n" +
      "3. **Hyderabadi Chicken Biryani** (₹280) [DISH:Hyderabadi_Chicken_Biryani]\n\n" +
      "Butter Chicken is ₹340, but these three are great within your budget!",
    dishes: [DISH_CHILLI_CHICKEN, DISH_CHICKEN_MANCHURIAN, DISH_CHICKEN_BIRYANI],
  },

  {
    id: "sweet_dishes",
    triggers: ["sweet", "dessert"],
    responseText:
      "Sweet tooth calling? 🍮\n\n" +
      "1. **Gulab Jamun** 🌱 (₹120) — Soft milk dumplings in rose-cardamom syrup. [DISH:Hot_Gulab_Jamun_(2_Pcs)]\n" +
      "2. **Chocolate Brownie** 🌱 (₹180) — Warm, fudgy, served with ice cream. [DISH:Brownie_with_Chocolate_Sauce]\n\n" +
      "Both are customer favorites!",
    dishes: [DISH_GULAB_JAMUN, DISH_BROWNIE],
  },

  {
    id: "veg_dishes",
    triggers: ["veg", "vegetarian"],
    responseText:
      "Here are our top vegetarian picks 🌱\n\n" +
      "1. **Dal Makhani** (₹240) [DISH:Dal_Makhani]\n" +
      "2. **Paneer Tikka Butter Masala** (₹310) [DISH:Paneer_Tikka_Butter_Masala]\n" +
      "3. **Veg Pulao** (₹220) [DISH:Veg_Pulao]",
    dishes: [DISH_DAL_MAKHANI, DISH_PANEER_BUTTER_MASALA, DISH_VEG_PULAO],
  },

  {
    id: "cold_drinks",
    triggers: ["drink", "beverage", "soda", "coffee", "tea", "masala drink", "shake", "coke", "pepsi"],
    responseText:
      "Quench your thirst! 🍹 Here are our popular drinks and beverages:\n\n" +
      "1. **Fresh Lime Soda (Sweet & Sour)** (₹70) [DISH:Fresh_Lime_Soda_(Sweet__Sour)]\n" +
      "2. **Masala Cold Drink** (₹83) [DISH:Masala_Cold_Drink]\n" +
      "3. **Cold Coffee** (₹100) [DISH:Cold_Coffee]\n" +
      "4. **Chocolate Shake** (₹120) [DISH:Chocolate]",
    dishes: [DISH_LIME_SODA, DISH_MASALA_DRINK, DISH_COLD_COFFEE, DISH_CHOCO_SHAKE],
  },

  {
    id: "rice_dishes",
    triggers: ["rice", "biryani", "pulao", "fried rice", "jeera rice"],
    responseText:
      "Here are our premium basmati rice and biryani specialties 🍚:\n\n" +
      "1. **Hyderabadi Chicken Biryani** (₹280) [DISH:Hyderabadi_Chicken_Biryani]\n" +
      "2. **Veg Pulao** (₹220) [DISH:Veg_Pulao]\n" +
      "3. **Chicken Fried Rice** (₹220) [DISH:Chicken_Fried_Rice]\n" +
      "4. **Jeera Rice** (₹110) [DISH:Jeera_Rice]",
    dishes: [DISH_CHICKEN_BIRYANI, DISH_VEG_PULAO, DISH_CHICKEN_FRIED_RICE, DISH_JEERA_RICE],
  },

  {
    id: "tandoori_dishes",
    triggers: ["tandoor", "tandoori", "roti", "naan", "paratha", "tikka", "kabab", "flatbread", "bread"],
    responseText:
      "Hot from our clay tandoor oven! 🔥 Check these out:\n\n" +
      "1. **Tandoori Chicken** (₹280) [DISH:Tandoori_Chicken]\n" +
      "2. **Paneer Tikka** (₹260) [DISH:Paneer_Tikka]\n" +
      "3. **Butter Naan** (₹60) [DISH:Butter_Naan]\n" +
      "4. **Garlic Naan** (₹80) [DISH:Garlic_Naan]",
    dishes: [DISH_TANDOORI_CHICKEN, DISH_PANEER_TIKKA, DISH_BUTTER_NAAN, DISH_GARLIC_NAAN],
  },

  {
    id: "budget_dishes",
    triggers: ["budget", "under 200", "under ₹200", "cheap", "affordable"],
    responseText:
      "Great options under ₹200 💰\n\n" +
      "1. **Samosa (2 pcs)** (₹80) [DISH:Paneer_Pakora]\n" +
      "2. **Butter Naan** (₹60) [DISH:Butter_Naan]\n" +
      "3. **Veg Sandwich** (₹120) [DISH:Veg_Roll]",
    dishes: [DISH_SAMOSA, DISH_BUTTER_NAAN, DISH_VEG_SANDWICH],
  },

  {
    id: "popular_dishes",
    triggers: ["popular", "recommend", "best seller", "top dish", "favorite"],
    responseText:
      "Our most-loved dishes ⭐\n\n" +
      "1. **Butter Chicken** (₹340) [DISH:Chicken_Butter_Masala_(2_Pcs)]\n" +
      "2. **Dal Makhani** (₹240) [DISH:Dal_Makhani]\n" +
      "3. **Chicken Biryani** (₹280) [DISH:Hyderabadi_Chicken_Biryani]",
    dishes: [DISH_BUTTER_CHICKEN, DISH_DAL_MAKHANI, DISH_CHICKEN_BIRYANI],
  },

  {
    id: "offers",
    triggers: ["offer", "discount", "coupon", "deal", "promo"],
    responseText:
      "Here's what's live right now 🎉\n\n" +
      "🎁 **15% Festival Off** — code **PKFEST15** on orders above ₹500 [OFFER:pkfest15]\n" +
      "🎁 **Flat ₹100 Off** — code **LUNCH100** on weekday lunch above ₹600 [OFFER:lunch100]\n" +
      "🎁 **Free Delivery** — code **FREEDEL** above ₹400 [OFFER:freedel]",
    offers: [OFFER_PKFEST15, OFFER_LUNCH100, OFFER_FREEDEL],
  },

  {
    id: "book_table_ask",
    triggers: ["book a table", "reserve a table", "reservation", "book table", "book seat"],
    responseText:
      "I'd love to help you book a table! Could you tell me:\n" +
      "• How many guests? 👥\n" +
      "• What date? 📅\n" +
      "• What time? ⏰",
    intentId: "book_table_ask",
  },

  {
    id: "book_table_suggest",
    triggers: [
      "table for",
      "book for",
      "people",
      "guests",
      "tonight",
      "tomorrow",
      "pm",
      "am",
      "evening",
      "afternoon"
    ],
    responseText:
      "Great news — Table #12 is available for 2 guests tomorrow at 8:00 PM! 🎉 Shall I confirm this reservation for you?",
    intentId: "book_table_suggest",
  },

  {
    id: "book_table_confirm",
    triggers: ["yes", "confirm", "sure", "ok", "please", "yep", "yeah", "correct", "fine"],
    requiresPriorIntent: "book_table_suggest",
    responseText:
      "Booked! ✅ Table #12, 2 guests, tomorrow at 8:00 PM. You'll get a confirmation on your registered email. See you soon! 🙏",
    intentId: "book_table_confirmed",
  },

  {
    id: "order_status",
    triggers: ["track", "status", "where is my order", "where's my order", "where is my food", "order status"],
    responseText:
      "Your last order **#4821** is currently **Out for Delivery** 🛵 — Total ₹560, should arrive in ~15 minutes! [ORDER:4821]",
    orders: [ORDER_4821],
  },

  {
    id: "nav_cart",
    triggers: ["cart", "checkout"],
    responseText: "On it! Taking you to your cart now. [NAV:/cart]",
    navigation: "/cart",
  },

  {
    id: "nav_profile",
    triggers: ["profile", "account", "settings"],
    responseText: "Sure! Heading to your profile. [NAV:/(tabs)/profile]",
    navigation: "/(tabs)/profile",
  },

  {
    id: "greeting",
    triggers: ["hi", "hello", "hey", "namaste", "good morning", "good evening", "good afternoon"],
    responseText:
      "Namaste! 🙏 I'm Tadka, your AI waiter at Punjabi Kitchen. Ask me about our menu, today's offers, or let me help you book a table!",
  },

  {
    id: "help",
    triggers: ["what can you do", "help", "how can you help", "features"],
    responseText:
      "I can help you:\n🍽️ Find the perfect dish\n🎁 Show active offers\n📅 Book a table\n📦 Track your order\n\n" +
      "Just ask naturally, like you would a real waiter!",
  },

  {
    id: "fallback",
    triggers: [],
    responseText:
      "I want to make sure I get this right — could you tell me if you're looking for a dish recommendation, " +
      "checking offers, booking a table, or tracking an order?",
  },
];

/**
 * Matches user input against demoResponses.
 * Call order: try requiresPriorIntent-gated entries FIRST (so "yes confirm"
 * only matches when lastIntentId is correct), then ungated entries in
 * declared order, then fallback last.
 */
export function matchDemoEntry(rawInput: string, lastIntentId?: string): DemoScriptEntry {
  const normalized = rawInput.toLowerCase().trim().replace(/[?.!]/g, "");
  
  // Extract budget/maxPrice threshold (e.g. "under 200", "below 300", "under rs 250")
  let maxPrice: number | null = null;
  const budgetMatch = normalized.match(/(?:under|below|less\s+than|under\s+rs|below\s+rs|budget|under\s+rs\s*|below\s+rs\s*)\s*(\d+)/i) || 
                      normalized.match(/(\d+)\s*(?:rs\.?\s*)?\s*(?:or\s+)?(?:under|below|less)/i);
  if (budgetMatch) {
    maxPrice = parseInt(budgetMatch[1], 10);
  }

  console.log("-----------------------------------------");
  console.log("[demoScript] matchDemoEntry rawInput:", rawInput);
  console.log("[demoScript] matchDemoEntry normalized:", normalized);
  console.log("[demoScript] matchDemoEntry maxPrice:", maxPrice);
  console.log("[demoScript] matchDemoEntry lastIntentId:", lastIntentId);
  console.log("-----------------------------------------");

  // 1. Try requiresPriorIntent-gated entries first (e.g. confirming booking)
  for (const entry of demoResponses) {
    if (entry.requiresPriorIntent) {
      if (entry.requiresPriorIntent !== lastIntentId) continue;
      if (entry.triggers.some((t) => normalized.includes(t))) return entry;
    }
  }

  // Smart state-aware override: if the user was just asked for booking details,
  // and their message contains numbers or typical slot-related terms, direct them
  // to the suggestion response even if they typed something not exactly matched by trigger lists.
  if (lastIntentId === "book_table_ask") {
    const hasBookingDetails = /\d+/.test(normalized) || 
                             ["tomorrow", "tonight", "pm", "am", "people", "guest", "seat", "table", "clock", "date"].some(w => normalized.includes(w));
    if (hasBookingDetails) {
      const suggestEntry = demoResponses.find((e) => e.id === "book_table_suggest");
      if (suggestEntry) return suggestEntry;
    }
  }

  // 2. Try matching direct system/action intents first (offers, table booking, order tracking, navigation, greeting, help)
  const systemIntentIds = ["offers", "book_table_ask", "order_status", "nav_cart", "nav_profile", "greeting", "help"];
  for (const entry of demoResponses) {
    if (systemIntentIds.includes(entry.id)) {
      if (entry.triggers.some((t) => normalized.includes(t))) return entry;
    }
  }

  // 3. Try matching specific preset food search triggers next (spicy, desserts, under 300, etc.)
  const presetFoodIntentIds = ["spicy_dishes", "chicken_under_300", "sweet_dishes", "veg_dishes", "budget_dishes", "popular_dishes", "cold_drinks", "rice_dishes", "tandoori_dishes"];
  for (const entry of demoResponses) {
    if (presetFoodIntentIds.includes(entry.id)) {
      if (entry.triggers.some((t) => normalized.includes(t))) return entry;
    }
  }

  // 4. Fallback to DYNAMIC search: match tokens in query against the database of 37 dishes
  const stopWords = ["the", "and", "for", "with", "this", "that", "want", "some", "have", "need", "please", "show", "give", "like", "find", "menu", "dishes", "food", "order", "dish", "items", "item", "get", "under", "below", "less", "than", "budget", "price", "cost", "rs"];
  const queryWords = normalized
    .split(/[\s,_\-\/\(\)]+/)
    .map(w => w.trim())
    .filter(w => w.length > 2 && !stopWords.includes(w) && isNaN(Number(w))); // Exclude numbers from keywords list

  if (queryWords.length > 0 || maxPrice !== null) {
    const scoredDishes = ALL_DEMO_DISHES.map(dish => {
      const name = dish.name.toLowerCase();
      const desc = dish.description.toLowerCase();
      const cat = dish.categoryId.toLowerCase();
      let score = 0;
      
      // If there are query words, score dishes. If only maxPrice is present, 
      // give a base score to all dishes so we can filter them by price.
      if (queryWords.length === 0 && maxPrice !== null) {
        score = 1;
      } else {
        for (const word of queryWords) {
          if (name.includes(word)) score += 5;
          if (name === word || name.split(/\s+/).includes(word)) score += 10;
          if (desc.includes(word)) score += 2;
          if (cat.includes(word)) score += 3;
        }
      }
      
      return { dish, score };
    })
    .filter(item => {
      if (item.score <= 0) return false;
      // Filter out dishes that exceed maxPrice budget restriction
      if (maxPrice !== null && item.dish.price > maxPrice) return false;
      return true;
    })
    .sort((a, b) => b.score - a.score)
    .map(item => item.dish);

    if (scoredDishes.length > 0) {
      const topDishes = scoredDishes.slice(0, 4);
      
      let responseText = maxPrice !== null 
        ? `Here are some options matching your request under ₹${maxPrice} 💰:\n\n`
        : "Here are some delicious options I found matching your request 🍽️:\n\n";
        
      topDishes.forEach((d, idx) => {
        responseText += `${idx + 1}. **${d.name}** ${d.veg ? '🌱' : '🍗'} (₹${d.price}) — ${d.description} [DISH:${d.id}]\n`;
      });
      responseText += "\nWould you like me to add one of these to your cart?";

      return {
        id: "dynamic_dish_search",
        triggers: [],
        responseText,
        dishes: topDishes
      };
    } else {
      // Professional response when no matches are found in the menu (not demotivating for business)
      const responseText = maxPrice !== null
        ? `I couldn't find any options under ₹${maxPrice} matching those details in our kitchen tonight. However, we have a wonderful selection of affordable Punjabi delicacies, tandoori starters, and fresh breads! Would you like to check out our other budget-friendly options?`
        : `I couldn't find any items matching those details on our menu tonight. However, our chefs have prepared a wide range of authentic Punjabi curries, fresh clay-oven breads, and delicious starters! Feel free to explore our menu or ask me for our popular recommendations.`;
      
      return {
        id: "dynamic_dish_search_no_results",
        triggers: [],
        responseText,
        dishes: []
      };
    }
  }

  // 5. Ultimate Fallback
  return demoResponses.find((e) => e.id === "fallback")!;
}
