export type Dish = {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  veg: boolean;
  category: string;
  rating?: number;
};

export type Category = {
  id: string;
  name: string;
  icon: string;
  image: string;
  parentId?: string | null;
};

export const CATEGORIES: Category[] = [
  // Root Pages
  { id: "page_1", name: "Page 1: Breads & Rice", icon: "book-outline", image: "https://images.unsplash.com/photo-1764699486820-30a00e6ded7a?w=400&q=80", parentId: null },
  { id: "page_2", name: "Page 2: Main Course", icon: "restaurant-outline", image: "https://images.unsplash.com/photo-1603496987351-f84a3ba5ec85?w=400&q=80", parentId: null },
  { id: "page_3", name: "Page 3: Chinese & Noodles", icon: "fast-food-outline", image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80", parentId: null },
  { id: "page_4", name: "Page 4: Starters & Beverages", icon: "cafe-outline", image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&q=80", parentId: null },
  { id: "page_5", name: "Page 5: Fried Rice & Desserts", icon: "ice-cream-outline", image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&q=80", parentId: null },

  // Page 1 children
  { id: "soya_chap", name: "Soya Chap", icon: "leaf", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80", parentId: "page_1" },
  { id: "dal", name: "Dal", icon: "cafe", image: "https://images.unsplash.com/photo-1708782340380-536df8cf6784?w=400&q=80", parentId: "page_1" },
  { id: "rice_p1", name: "Rice & Biryani", icon: "restaurant", image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&q=80", parentId: "page_1" },
  { id: "breads", name: "Breads", icon: "pizza", image: "https://images.unsplash.com/photo-1764699486820-30a00e6ded7a?w=400&q=80", parentId: "page_1" },
  { id: "salad", name: "Salad", icon: "leaf", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80", parentId: "page_1" },
  { id: "raita", name: "Raita", icon: "water", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80", parentId: "page_1" },
  { id: "papad", name: "Papad", icon: "gift", image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=80", parentId: "page_1" },

  // Page 2 children (Main Course -> Veg / Non-Veg)
  { id: "main_course", name: "Main Course", icon: "pizza", image: "https://images.unsplash.com/photo-1603496987351-f84a3ba5ec85?w=400&q=80", parentId: "page_2" },
  { id: "main_course_veg", name: "Veg Main Course", icon: "leaf", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80", parentId: "main_course" },
  { id: "main_course_non_veg", name: "Non-Veg Main Course", icon: "flame", image: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=400&q=80", parentId: "main_course" },

  // Page 3 children
  { id: "chinese_starter", name: "Chinese Starter", icon: "fast-food", image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80", parentId: "page_3" },
  { id: "chinese_starter_veg", name: "Veg Starters", icon: "leaf", image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80", parentId: "chinese_starter" },
  { id: "chinese_starter_non_veg", name: "Non-Veg Starters", icon: "flame", image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80", parentId: "chinese_starter" },

  { id: "noodles", name: "Noodles", icon: "restaurant", image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80", parentId: "page_3" },
  { id: "noodles_veg", name: "Veg Noodles", icon: "leaf", image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80", parentId: "noodles" },
  { id: "noodles_non_veg", name: "Non-Veg Noodles", icon: "flame", image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80", parentId: "noodles" },

  { id: "shanghai", name: "Shanghai", icon: "star", image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80", parentId: "page_3" },
  { id: "shanghai_veg", name: "Veg Shanghai", icon: "leaf", image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80", parentId: "shanghai" },
  { id: "shanghai_non_veg", name: "Non-Veg Shanghai", icon: "flame", image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80", parentId: "shanghai" },

  // Page 4 children
  { id: "beverages", name: "Beverages", icon: "wine", image: "https://images.unsplash.com/photo-1437418747212-8d9709afab22?w=400&q=80", parentId: "page_4" },
  { id: "shakes", name: "Shakes", icon: "ice-cream", image: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400&q=80", parentId: "page_4" },
  { id: "veg_starter", name: "Veg Starter", icon: "leaf", image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&q=80", parentId: "page_4" },
  { id: "non_veg_starter", name: "Non-Veg Starter", icon: "flame", image: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=400&q=80", parentId: "page_4" },

  { id: "soup", name: "Soup", icon: "cafe", image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80", parentId: "page_4" },
  { id: "soup_veg", name: "Veg Soups", icon: "leaf", image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80", parentId: "soup" },
  { id: "soup_non_veg", name: "Non-Veg Soups", icon: "flame", image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80", parentId: "soup" },

  { id: "tandoor", name: "Tandoor", icon: "flame", image: "https://images.unsplash.com/photo-1727280376746-b89107a5b0df?w=400&q=80", parentId: "page_4" },
  { id: "tandoor_veg", name: "Veg Tandoor", icon: "leaf", image: "https://images.unsplash.com/photo-1727280376746-b89107a5b0df?w=400&q=80", parentId: "tandoor" },
  { id: "tandoor_non_veg", name: "Non-Veg Tandoor", icon: "flame", image: "https://images.unsplash.com/photo-1727280376746-b89107a5b0df?w=400&q=80", parentId: "tandoor" },

  // Page 5 children
  { id: "rice_p5", name: "Rice (Fried)", icon: "restaurant", image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&q=80", parentId: "page_5" },
  { id: "rice_p5_veg", name: "Veg Fried Rice", icon: "leaf", image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&q=80", parentId: "rice_p5" },
  { id: "rice_p5_non_veg", name: "Non-Veg Fried Rice", icon: "flame", image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&q=80", parentId: "rice_p5" },

  { id: "desserts", name: "Desserts", icon: "ice-cream", image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&q=80", parentId: "page_5" },
  { id: "desserts_veg", name: "Veg Desserts", icon: "leaf", image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&q=80", parentId: "desserts" },
];

export const DISHES: Dish[] = [
  // Bread / Naan
  { id: "d-naan-1", name: "Butter Naan", price: 60, description: "Soft tandoor-baked bread brushed with desi butter.", image: "https://images.unsplash.com/photo-1764699486820-30a00e6ded7a?w=600&q=80", veg: true, category: "naan", rating: 4.8 },
  { id: "d-naan-2", name: "Garlic Naan", price: 80, description: "Naan topped with garlic & fresh coriander.", image: "https://images.unsplash.com/photo-1626500155913-d2d3b80b7e76?w=600&q=80", veg: true, category: "naan", rating: 4.9 },
  { id: "d-naan-3", name: "Cheese Naan", price: 120, description: "Stuffed with melted mozzarella cheese.", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80", veg: true, category: "naan", rating: 4.7 },

  // Biryani
  { id: "d-bir-1", name: "Hyderabadi Dum Biryani", price: 280, description: "Slow-cooked aromatic basmati with spices.", image: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=600&q=80", veg: false, category: "biryani", rating: 4.9 },
  { id: "d-bir-2", name: "Chicken Biryani", price: 260, description: "Tender chicken layered with fragrant rice.", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&q=80", veg: false, category: "biryani", rating: 4.8 },
  { id: "d-bir-3", name: "Veg Biryani", price: 220, description: "Mixed veggies cooked dum-style.", image: "https://images.unsplash.com/photo-1599043513900-ed6fe01d3833?w=600&q=80", veg: true, category: "biryani", rating: 4.6 },

  // Chicken
  { id: "d-chk-1", name: "Butter Chicken", price: 320, description: "Creamy tomato gravy with succulent chicken.", image: "https://images.unsplash.com/photo-1603496987351-f84a3ba5ec85?w=600&q=80", veg: false, category: "chicken", rating: 4.9 },
  { id: "d-chk-2", name: "Tandoori Chicken", price: 380, description: "Smoky chargrilled chicken marinated in yogurt.", image: "https://images.unsplash.com/photo-1727280376746-b89107a5b0df?w=600&q=80", veg: false, category: "tandoori", rating: 4.8 },
  { id: "d-chk-3", name: "Chicken Tikka", price: 340, description: "Spiced boneless chicken skewers.", image: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600&q=80", veg: false, category: "starters", rating: 4.8 },

  // Paneer
  { id: "d-pan-1", name: "Paneer Tikka", price: 280, description: "Cottage cheese cubes grilled with spices.", image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80", veg: true, category: "paneer", rating: 4.8 },
  { id: "d-pan-2", name: "Paneer Butter Masala", price: 290, description: "Paneer in rich butter-tomato gravy.", image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80", veg: true, category: "paneer", rating: 4.9 },
  { id: "d-pan-3", name: "Kadai Paneer", price: 270, description: "Spicy paneer with capsicum & onions.", image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80", veg: true, category: "paneer", rating: 4.7 },

  // Mushroom
  { id: "d-mush-1", name: "Mushroom Masala", price: 240, description: "Button mushrooms in onion-tomato gravy.", image: "https://images.unsplash.com/photo-1607301406259-dfb186e15de4?w=600&q=80", veg: true, category: "mushroom", rating: 4.5 },
  { id: "d-mush-2", name: "Kadai Mushroom", price: 250, description: "Mushrooms tossed in kadai spices.", image: "https://images.unsplash.com/photo-1607301406259-dfb186e15de4?w=600&q=80", veg: true, category: "mushroom", rating: 4.6 },

  // Egg
  { id: "d-egg-1", name: "Egg Curry", price: 180, description: "Boiled eggs in spiced gravy.", image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&q=80", veg: false, category: "egg", rating: 4.4 },
  { id: "d-egg-2", name: "Egg Bhurji", price: 160, description: "Scrambled spiced eggs Punjabi style.", image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&q=80", veg: false, category: "egg", rating: 4.5 },

  // Dal
  { id: "d-dal-1", name: "Dal Makhani", price: 240, description: "Slow-cooked black lentils with cream.", image: "https://images.unsplash.com/photo-1708782340380-536df8cf6784?w=600&q=80", veg: true, category: "dal", rating: 4.9 },
  { id: "d-dal-2", name: "Dal Tadka", price: 180, description: "Yellow dal with smoky tadka.", image: "https://images.unsplash.com/photo-1708782340380-536df8cf6784?w=600&q=80", veg: true, category: "dal", rating: 4.7 },

  // Rice
  { id: "d-rice-1", name: "Jeera Rice", price: 150, description: "Cumin-tempered basmati rice.", image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&q=80", veg: true, category: "rice", rating: 4.6 },
  { id: "d-rice-2", name: "Veg Pulao", price: 180, description: "Mixed veggie aromatic pulao.", image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&q=80", veg: true, category: "rice", rating: 4.5 },

  // Chinese
  { id: "d-chi-1", name: "Veg Hakka Noodles", price: 180, description: "Wok-tossed noodles with vegetables.", image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&q=80", veg: true, category: "chinese", rating: 4.6 },
  { id: "d-chi-2", name: "Chilli Chicken", price: 240, description: "Indo-Chinese spicy chicken.", image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&q=80", veg: false, category: "chinese", rating: 4.7 },

  // Soup
  { id: "d-soup-1", name: "Hot & Sour Soup", price: 120, description: "Tangy spicy veg soup.", image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80", veg: true, category: "soup", rating: 4.4 },
  { id: "d-soup-2", name: "Tomato Shorba", price: 110, description: "Rich tomato lentil soup.", image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80", veg: true, category: "soup", rating: 4.5 },

  // Raita
  { id: "d-rai-1", name: "Boondi Raita", price: 70, description: "Yogurt with crispy boondi.", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80", veg: true, category: "raita", rating: 4.5 },
  { id: "d-rai-2", name: "Cucumber Raita", price: 60, description: "Cooling yogurt with cucumber.", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80", veg: true, category: "raita", rating: 4.4 },

  // Desserts / Sweets / Ice cream
  { id: "d-des-1", name: "Gulab Jamun", price: 80, description: "Soft milk dumplings in sugar syrup.", image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&q=80", veg: true, category: "sweets", rating: 4.9 },
  { id: "d-des-2", name: "Rasmalai", price: 100, description: "Cottage cheese discs in saffron milk.", image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&q=80", veg: true, category: "sweets", rating: 4.8 },
  { id: "d-des-3", name: "Kulfi Falooda", price: 120, description: "Traditional Indian ice cream with falooda.", image: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=600&q=80", veg: true, category: "ice-cream", rating: 4.7 },
  { id: "d-des-4", name: "Gajar Halwa", price: 110, description: "Carrot pudding with dry fruits.", image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&q=80", veg: true, category: "desserts", rating: 4.8 },

  // Drinks / Coffee / Cold
  { id: "d-drk-1", name: "Masala Chai", price: 40, description: "Authentic Indian spiced tea.", image: "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=600&q=80", veg: true, category: "coffee", rating: 4.8 },
  { id: "d-drk-2", name: "Filter Coffee", price: 60, description: "South Indian style filter coffee.", image: "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=600&q=80", veg: true, category: "coffee", rating: 4.7 },
  { id: "d-drk-3", name: "Sweet Lassi", price: 80, description: "Punjabi yogurt drink with sugar.", image: "https://images.unsplash.com/photo-1437418747212-8d9709afab22?w=600&q=80", veg: true, category: "drinks", rating: 4.9 },
  { id: "d-drk-4", name: "Mango Shake", price: 110, description: "Thick alphonso mango shake.", image: "https://images.unsplash.com/photo-1437418747212-8d9709afab22?w=600&q=80", veg: true, category: "cold-drink", rating: 4.8 },
  { id: "d-drk-5", name: "Fresh Lime Soda", price: 70, description: "Tangy lime with soda water.", image: "https://images.unsplash.com/photo-1437418747212-8d9709afab22?w=600&q=80", veg: true, category: "beverages", rating: 4.5 },

  // Chef's Special / Main course
  { id: "d-cs-1", name: "Punjabi Thali", price: 380, description: "Chef's signature platter — dal, sabzi, paneer, naan, rice, sweet.", image: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=600&q=80", veg: true, category: "chefs-special", rating: 5.0 },
  { id: "d-cs-2", name: "Sarson Da Saag & Makki Roti", price: 290, description: "Winter Punjabi classic with butter.", image: "https://images.unsplash.com/photo-1708782340380-536df8cf6784?w=600&q=80", veg: true, category: "chefs-special", rating: 4.9 },
  { id: "d-cs-3", name: "Mutton Rogan Josh", price: 420, description: "Tender mutton in aromatic Kashmiri gravy.", image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80", veg: false, category: "chefs-special", rating: 4.9 },

  // Veg / Non-Veg umbrella (alias)
  { id: "d-v-1", name: "Mix Veg Curry", price: 210, description: "Seasonal vegetables in spiced gravy.", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80", veg: true, category: "veg", rating: 4.5 },
  { id: "d-v-2", name: "Chana Masala", price: 200, description: "Punjabi chickpea curry.", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80", veg: true, category: "veg", rating: 4.7 },
  { id: "d-nv-1", name: "Fish Tikka", price: 360, description: "Marinated fish from the tandoor.", image: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600&q=80", veg: false, category: "non-veg", rating: 4.7 },
  { id: "d-nv-2", name: "Mutton Curry", price: 400, description: "Slow-cooked mutton in spiced gravy.", image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80", veg: false, category: "non-veg", rating: 4.8 },

  // Main course catch-all
  { id: "d-mc-1", name: "Shahi Paneer", price: 280, description: "Royal paneer in creamy cashew gravy.", image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80", veg: true, category: "main-course", rating: 4.8 },
  { id: "d-mc-2", name: "Chicken Curry", price: 300, description: "Home-style Punjabi chicken curry.", image: "https://images.unsplash.com/photo-1603496987351-f84a3ba5ec85?w=600&q=80", veg: false, category: "main-course", rating: 4.7 },
];

export const REVIEWS = [
  { id: "r1", name: "Aarav Sharma", rating: 5, text: "The Dum Biryani is legendary. Best in Ranchi!", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80" },
  { id: "r2", name: "Priya Singh", rating: 5, text: "Paneer Butter Masala melts in your mouth. Absolutely divine.", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80" },
  { id: "r3", name: "Rohit Kumar", rating: 4, text: "Authentic Punjabi flavors. The kulcha is heavenly!", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80" },
  { id: "r4", name: "Anita Verma", rating: 5, text: "Gulab Jamuns were the highlight of our dinner.", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80" },
  { id: "r5", name: "Vikram Mehta", rating: 5, text: "Royal ambience, royal taste. Highly recommend.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80" },
];

export const OFFERS = [
  { id: "o1", title: "FLAT 20% OFF", code: "PUNJABI20", desc: "On orders above ₹499", color: "#D4AF37" },
  { id: "o2", title: "FREE DESSERT", code: "SWEETPK", desc: "On orders above ₹799", color: "#E58B22" },
  { id: "o3", title: "BUY 1 GET 1", code: "BOGO", desc: "On select Naans", color: "#D4AF37" },
  { id: "o4", title: "₹100 OFF", code: "FIRST100", desc: "First order on the app", color: "#F3C846" },
];

export const DEAL_OF_DAY = {
  title: "Deal of the Day",
  dishName: "Royal Punjabi Thali",
  price: 299,
  originalPrice: 480,
  image: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=800&q=80",
  desc: "Dal Makhani, Paneer, Naan, Jeera Rice, Salad, Gulab Jamun & Lassi",
};
