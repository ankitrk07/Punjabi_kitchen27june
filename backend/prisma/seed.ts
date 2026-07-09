import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ROOT_PAGES = [
  { id: "page_1", name: "Page 1: Breads & Rice", icon: "book-outline", image: "https://images.unsplash.com/photo-1764699486820-30a00e6ded7a?w=400&q=80", parentId: null },
  { id: "page_2", name: "Page 2: Main Course", icon: "restaurant-outline", image: "https://images.unsplash.com/photo-1603496987351-f84a3ba5ec85?w=400&q=80", parentId: null },
  { id: "page_3", name: "Page 3: Chinese & Noodles", icon: "fast-food-outline", image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80", parentId: null },
  { id: "page_4", name: "Page 4: Starters & Beverages", icon: "cafe-outline", image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&q=80", parentId: null },
  { id: "page_5", name: "Page 5: Fried Rice & Desserts", icon: "ice-cream-outline", image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&q=80", parentId: null },
];

const CATEGORIES = [
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

  // Page 3 children (Chinese Starter, Noodles, Shanghai -> Veg / Non-Veg)
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

const DISHES = [
  { id: "Chicken_Egg_Noodles", name: "Chicken Egg Noodles", price: 210, description: "Tossed noodles combining both egg and chicken shreds.", image: "/uploads/Chicken_Egg_Noodles.jpeg", veg: false, categoryId: "noodles_non_veg", rating: 4.7 },
  { id: "Mix_Hakka_Noodles", name: "Mix Hakka Noodles", price: 230, description: "Mixed hakka noodles containing egg, chicken, and prawns.", image: "/uploads/Mix_Hakka_Noodles.jpeg", veg: false, categoryId: "noodles_non_veg", rating: 4.8 },
  { id: "Chicken_Garlic_Chwomin", name: "Chicken Garlic Chowmein", price: 210, description: "Garlic infused stir-fried chicken chowmein.", image: "/uploads/Chicken_Garlic_Chwomin.jpeg", veg: false, categoryId: "noodles_non_veg", rating: 4.6 },
  { id: "Mix_Garlic_Chwomin", name: "Mix Garlic Chowmein", price: 240, description: "Combination chowmein loaded with garlic, egg, and chicken.", image: "/uploads/Mix_Garlic_Chwomin.jpeg", veg: false, categoryId: "noodles_non_veg", rating: 4.7 },
  { id: "Chicken_Gravy_Noodles", name: "Chicken Gravy Noodles", price: 220, description: "Boiled noodles served underneath hot chicken and vegetable gravy.", image: "/uploads/Chicken_Gravy_Noodles.jpeg", veg: false, categoryId: "noodles_non_veg", rating: 4.6 },
  { id: "American_Choupsey_(Chicken)", name: "American Chopsuey Chicken", price: 250, description: "Crispy fried noodles topped with sweet and sour chicken glaze and a fried egg.", image: "/uploads/American_Choupsey__Chicken_.jpeg", veg: false, categoryId: "noodles_non_veg", rating: 4.8 },
  { id: "Vegetable_Shanghai", name: "Vegetable Shanghai", price: 180, description: "Veggies cooked Shanghai style with sweet, sour, and mildly spicy sauce.", image: "/uploads/Vegetable_Shanghai.jpeg", veg: true, categoryId: "shanghai_veg", rating: 4.5 },
  { id: "Panner_Shanghai", name: "Paneer Shanghai", price: 210, description: "Paneer chunks cooked in Shanghai sweet-spicy brown glaze.", image: "/uploads/Panner_Shanghai.jpeg", veg: true, categoryId: "shanghai_veg", rating: 4.6 },
  { id: "Mushroom_Shanghai", name: "Mushroom Shanghai", price: 210, description: "Fresh button mushrooms tossed in Shanghai sweet-soy sauce.", image: "/uploads/Mushroom_Shanghai.jpeg", veg: true, categoryId: "shanghai_veg", rating: 4.5 },
  { id: "Mix_Shanghai", name: "Mix Shanghai Veg", price: 230, description: "Mixed veggies and paneer tossed together Shanghai style.", image: "/uploads/Mix_Shanghai.jpeg", veg: true, categoryId: "shanghai_veg", rating: 4.6 },
  { id: "Egg_Shanghai", name: "Egg Shanghai", price: 190, description: "Shanghai style boiled eggs in sweet-spicy sauce.", image: "/uploads/Egg_Shanghai.jpeg", veg: false, categoryId: "shanghai_non_veg", rating: 4.5 },
  { id: "Chicken_Shanghai", name: "Chicken Shanghai", price: 230, description: "Shanghai-style chicken pieces coated in rich brown sauce.", image: "/uploads/Chicken_Shanghai.jpeg", veg: false, categoryId: "shanghai_non_veg", rating: 4.7 },
  { id: "Egg_Chicken_Shanghai", name: "Egg Chicken Shanghai", price: 240, description: "Mixed chicken and eggs tossed in Shanghai sauce.", image: "/uploads/Egg_Chicken_Shanghai.jpeg", veg: false, categoryId: "shanghai_non_veg", rating: 4.7 },
  { id: "Mix_Shanghai_NV", name: "Mix Shanghai Non-Veg", price: 260, description: "House combination Shanghai platter containing chicken, egg, and vegetables.", image: "/uploads/Mix_Shanghai_NV.jpeg", veg: false, categoryId: "shanghai_non_veg", rating: 4.8 },
  { id: "Fresh_Lime_Soda_(Sweet__Sour)", name: "Fresh Lime Soda (Sweet & Sour)", price: 70, description: "Tangy fresh lime juice in soda water, served sweet and sour.", image: "/uploads/Fresh_Lime_Soda__Sweet__Sour_.jpeg", veg: true, categoryId: "beverages", rating: 4.7 },
  { id: "Tea", name: "Tea", price: 30, description: "Freshly brewed hot milk tea.", image: "/uploads/Menu 12/Beverages/Tea.jpeg", veg: true, categoryId: "beverages", rating: 4.5 },
  { id: "Coffee", name: "Coffee", price: 50, description: "Hot frothy whipped coffee.", image: "/uploads/Coffee.jpeg", veg: true, categoryId: "beverages", rating: 4.6 },
  { id: "Strawberry", name: "Strawberry Shake", price: 120, description: "Thick milk shake loaded with strawberry pulp and syrup.", image: "/uploads/Strawberry.jpeg", veg: true, categoryId: "shakes", rating: 4.6 },
  { id: "Chocolate", name: "Chocolate Shake", price: 120, description: "Rich chocolate milkshake topped with chocolate sauce.", image: "/uploads/Chocolate.jpeg", veg: true, categoryId: "shakes", rating: 4.7 },
  { id: "Vanilla", name: "Vanilla Shake", price: 110, description: "Classic cold sweet vanilla milk shake.", image: "/uploads/Vanilla.jpg", veg: true, categoryId: "shakes", rating: 4.5 },
  { id: "Cold_Coffee", name: "Cold Coffee", price: 100, description: "Chilled blended whipped coffee milkshake.", image: "/uploads/Cold_Coffee.jpeg", veg: true, categoryId: "shakes", rating: 4.7 },
  { id: "Cold_Coffee_with_Ice-cream", name: "Cold Coffee with Ice-cream", price: 130, description: "Cold coffee topped with a generous scoop of vanilla ice cream.", image: "/uploads/Cold_Coffee_with_Ice_cream.jpeg", veg: true, categoryId: "shakes", rating: 4.8 },
  { id: "Veg_Roll", name: "Veg Roll", price: 80, description: "Spiced vegetable filling rolled inside a thin wrap.", image: "/uploads/Veg_Roll.jpeg", veg: true, categoryId: "veg_starter", rating: 4.5 },
  { id: "Paneer_Roll", name: "Paneer Roll", price: 120, description: "Grated spiced paneer filled wraps.", image: "/uploads/Paneer_Roll.jpeg", veg: true, categoryId: "veg_starter", rating: 4.7 },
  { id: "Mushroom_Roll", name: "Mushroom Roll", price: 110, description: "Sautéed mushrooms and onions rolled inside a flatbread.", image: "/uploads/Mushroom_Roll.jpeg", veg: true, categoryId: "veg_starter", rating: 4.6 },
  { id: "Mushroom_Paneer_Roll", name: "Mushroom Paneer Roll", price: 140, description: "Delicious filling of both paneer and mushrooms inside a roll.", image: "/uploads/Mushroom_Paneer_Roll.jpeg", veg: true, categoryId: "veg_starter", rating: 4.8 },
  { id: "French_Fries", name: "French Fries", price: 90, description: "Salted crispy potato fingers.", image: "/uploads/French_Fries.jpeg", veg: true, categoryId: "veg_starter", rating: 4.5 },
  { id: "Paneer_Pakora", name: "Paneer Pakora", price: 160, description: "Cottage cheese slices dipped in batter and deep-fried.", image: "/uploads/Paneer_Pakora.jpeg", veg: true, categoryId: "veg_starter", rating: 4.7 },
  { id: "Egg_Pakora_(2_Pcs)", name: "Egg Pakora (2 Pcs)", price: 100, description: "Hard-boiled eggs dipped in spiced gram flour batter and fried.", image: "/uploads/Egg_Pakora__2_Pcs_.jpeg", veg: false, categoryId: "non_veg_starter", rating: 4.6 },
  { id: "Omelette", name: "Omelette", price: 60, description: "Pan-fried whisked eggs with onions and green chillies.", image: "/uploads/Menu 12/Non-veg starter/Omelette.jpeg", veg: false, categoryId: "non_veg_starter", rating: 4.5 },
  { id: "Cheese_Omlelette", name: "Cheese Omelette", price: 100, description: "Omelette stuffed with melted processed cheese.", image: "/uploads/Cheese_Omlelette.jpeg", veg: false, categoryId: "non_veg_starter", rating: 4.7 },
  { id: "Egg_Roll", name: "Egg Roll", price: 70, description: "Flatbread cooked with egg and wrapped with onions.", image: "/uploads/Egg_Roll.jpeg", veg: false, categoryId: "non_veg_starter", rating: 4.6 },
  { id: "Chicken_Roll", name: "Chicken Roll", price: 130, description: "Shredded chicken tikka wrapped inside a flatbread.", image: "/uploads/Chicken_Roll.jpeg", veg: false, categoryId: "non_veg_starter", rating: 4.8 },
  { id: "Chicken_Egg_Roll", name: "Chicken Egg Roll", price: 150, description: "Layered egg roll with chicken stuffing.", image: "/uploads/Chicken_Egg_Roll.jpeg", veg: false, categoryId: "non_veg_starter", rating: 4.8 },
  { id: "Double_Egg_Chicken_Roll", name: "Double Egg Chicken Roll", price: 170, description: "Chicken roll wrapped in a double layer of fried eggs.", image: "/uploads/Double_Egg_Chicken_Roll.jpeg", veg: false, categoryId: "non_veg_starter", rating: 4.9 },
  { id: "Double_Chicken_Egg_Roll", name: "Double Chicken Egg Roll", price: 200, description: "Loaded chicken egg roll with double chicken pieces.", image: "/uploads/Double_Chicken_Egg_Roll.jpeg", veg: false, categoryId: "non_veg_starter", rating: 4.9 },
  { id: "Mineral_Water", name: "Mineral Water", price: 30, description: "Packaged chilled mineral water bottle.", image: "/uploads/Menu 12/Beverages/Mineral water.jpeg", veg: true, categoryId: "beverages", rating: 4.4 },
  { id: "Paneer_Fried_Rice", name: "Paneer Fried Rice", price: 190, description: "Fried rice tossed with soft paneer cubes.", image: "/uploads/Paneer_Fried_Rice.jpeg", veg: true, categoryId: "rice_p5_veg", rating: 4.7 },
  { id: "Mushroom_Fried_Rice", name: "Mushroom Fried Rice", price: 190, description: "Wok-fried rice tossed with button mushroom slices.", image: "/uploads/Mushroom_Fried_Rice.jpeg", veg: true, categoryId: "rice_p5_veg", rating: 4.6 },
  { id: "Lemon_Rice", name: "Lemon Rice", price: 150, description: "Yellow rice tempered with curry leaves, mustard seeds, peanuts, and lemon.", image: "/uploads/Lemon_Rice.jpeg", veg: true, categoryId: "rice_p5_veg", rating: 4.5 },
  { id: "Egg_Fried_Rice", name: "Egg Fried Rice", price: 170, description: "Wok-fried rice scrambled with eggs and spring onions.", image: "/uploads/Egg_Fried_Rice.jpeg", veg: false, categoryId: "rice_p5_non_veg", rating: 4.6 },
  { id: "Chicken_Fried_Rice", name: "Chicken Fried Rice", price: 210, description: "Fried rice tossed with chicken pieces.", image: "/uploads/Chicken_Fried_Rice.jpeg", veg: false, categoryId: "rice_p5_non_veg", rating: 4.8 },
  { id: "Chicken_Egg_Fried_Rice", name: "Chicken Egg Fried Rice", price: 230, description: "Combined fried rice loaded with egg and chicken cuts.", image: "/uploads/Chicken_Egg_Fried_Rice.jpeg", veg: false, categoryId: "rice_p5_non_veg", rating: 4.8 },
  { id: "Mix_Fried_Rice", name: "Mix Fried Rice", price: 250, description: "Premium fried rice containing egg, prawns, and chicken shreds.", image: "/uploads/Mix_Fried_Rice.jpeg", veg: false, categoryId: "rice_p5_non_veg", rating: 4.9 },
  { id: "Veg_Sweet_Corn_Soup", name: "Veg Sweet Corn Soup", price: 110, description: "Sweet and creamy sweet corn soup with green peas.", image: "/uploads/Veg_Sweet_Corn_Soup.jpg", veg: true, categoryId: "soup_veg", rating: 4.5 },
  { id: "Veg_Hot___Sour_Soup", name: "Veg Hot & Sour Soup", price: 120, description: "Tangy and spicy broth loaded with minced veggies.", image: "/uploads/Veg_Hot___Sour_Soup.jpeg", veg: true, categoryId: "soup_veg", rating: 4.5 },
  { id: "Veg_Coriander", name: "Veg Coriander Soup", price: 110, description: "Fresh coriander soup in light vegetable broth.", image: "/uploads/Veg_Coriander.jpeg", veg: true, categoryId: "soup_veg", rating: 4.4 },
  { id: "Lemon_Coriander", name: "Lemon Coriander Soup", price: 110, description: "Zesty lemon and fresh coriander soup.", image: "/uploads/Lemon_Coriander.jpeg", veg: true, categoryId: "soup_veg", rating: 4.5 },
  { id: "Cream_of_Mushroom", name: "Cream of Mushroom Soup", price: 130, description: "Thick creamy soup loaded with button mushrooms.", image: "/uploads/Cream_of_Mushroom.jpeg", veg: true, categoryId: "soup_veg", rating: 4.6 },
  { id: "Veg_Manchow", name: "Veg Manchow Soup", price: 120, description: "Spicy garlic and ginger soup topped with crispy noodles.", image: "/uploads/Veg_Manchow.jpeg", veg: true, categoryId: "soup_veg", rating: 4.5 },
  { id: "Tomato_Cream", name: "Tomato Cream Soup", price: 110, description: "Creamy warm soup made from fresh local tomatoes.", image: "/uploads/Tomato_Cream.jpeg", veg: true, categoryId: "soup_veg", rating: 4.5 },
  { id: "Chicken_Sweet_Corn", name: "Chicken Sweet Corn Soup", price: 130, description: "Shredded chicken and sweet corn kernels in egg drop broth.", image: "/uploads/Chicken_Sweet_Corn.jpeg", veg: false, categoryId: "soup_non_veg", rating: 4.7 },
  { id: "Chicken_Mushroom", name: "Chicken Mushroom Soup", price: 140, description: "Warm broth with chicken slices and button mushrooms.", image: "/uploads/Chicken_Mushroom.jpeg", veg: false, categoryId: "soup_non_veg", rating: 4.6 },
  { id: "Chicken_Lemon_Coriander", name: "Chicken Lemon Coriander Soup", price: 130, description: "Sour lemon-coriander soup with chicken strips.", image: "/uploads/Chicken_Lemon_Coriander.jpeg", veg: false, categoryId: "soup_non_veg", rating: 4.7 },
  { id: "Chicken_Hot_n_Sour", name: "Chicken Hot & Sour Soup", price: 140, description: "Spicy and sour chicken broth.", image: "/uploads/Chicken_Hot_n_Sour.jpeg", veg: false, categoryId: "soup_non_veg", rating: 4.7 },
  { id: "Chicken_Manchow", name: "Chicken Manchow Soup", price: 140, description: "Spicy hot chicken soup topped with fried noodles.", image: "/uploads/Chicken_Manchow.jpeg", veg: false, categoryId: "soup_non_veg", rating: 4.7 },
  { id: "Veg_Hara_Bhara_Kabab", name: "Veg Hara Bhara Kabab", price: 180, description: "Crispy grilled patties made of spinach, peas, and potatoes.", image: "/uploads/Veg_Hara_Bhara_Kabab.jpeg", veg: true, categoryId: "tandoor_veg", rating: 4.5 },
  { id: "Malai_Paneer_Tikka", name: "Malai Paneer Tikka", price: 260, description: "Cottage cheese grilled in tandoor with cream and mild spices.", image: "/uploads/Malai_Paneer_Tikka.jpeg", veg: true, categoryId: "tandoor_veg", rating: 4.8 },
  { id: "Hariyali_Paneer_Tikka", name: "Hariyali Paneer Tikka", price: 250, description: "Paneer blocks marinated in green mint-coriander paste and grilled.", image: "/uploads/Hariyali_Paneer_Tikka.jpeg", veg: true, categoryId: "tandoor_veg", rating: 4.7 },
  { id: "Paneer_Tikka", name: "Paneer Tikka", price: 240, description: "Spiced tandoori grilled cottage cheese cubes.", image: "/uploads/Paneer_Tikka.jpeg", veg: true, categoryId: "tandoor_veg", rating: 4.8 },
  { id: "Paneer_Achari_Tikka", name: "Paneer Achari Tikka", price: 250, description: "Paneer marinated in pickling spices.", image: "/uploads/Paneer_Achari_Tikka.jpeg", veg: true, categoryId: "tandoor_veg", rating: 4.8 },
  { id: "Mushroom_Tikka", name: "Mushroom Tikka", price: 220, description: "Whole button mushrooms marinated in yogurt and spices and grilled.", image: "/uploads/Mushroom_Tikka.jpeg", veg: true, categoryId: "tandoor_veg", rating: 4.6 },
  { id: "Mushroom_Achari_Tikka", name: "Mushroom Achari Tikka", price: 230, description: "Spicy pickled mushrooms grilled skewered.", image: "/uploads/Mushroom_Achari_Tikka.jpeg", veg: true, categoryId: "tandoor_veg", rating: 4.6 },
  { id: "Tandoori_Chicken", name: "Tandoori Chicken", price: 360, description: "Whole chicken pieces marinated in yogurt-spice mix and chargrilled.", image: "/uploads/Tandoori_Chicken.jpeg", veg: false, categoryId: "tandoor_non_veg", rating: 4.9 },
  { id: "Chicken_Leg_Kabab", name: "Chicken Leg Kabab", price: 340, description: "Chargrilled chicken leg drumsticks with mild spices.", image: "/uploads/Chicken_Leg_Kabab.jpeg", veg: false, categoryId: "tandoor_non_veg", rating: 4.8 },
  { id: "Lashooni_Kabab", name: "Lasooni Kabab", price: 320, description: "Skewered chicken chunks flavored heavily with roasted garlic paste.", image: "/uploads/Lashooni_Kabab.jpeg", veg: false, categoryId: "tandoor_non_veg", rating: 4.8 },
  { id: "Reshmi_Kabab", name: "Reshmi Kabab", price: 320, description: "Silky soft skewered chicken bites marinated in cream, eggs, and cashews.", image: "/uploads/Reshmi_Kabab.jpeg", veg: false, categoryId: "tandoor_non_veg", rating: 4.8 },
  { id: "Chicken_Tikka", name: "Chicken Tikka", price: 300, description: "Spiced chargrilled boneless chicken pieces.", image: "/uploads/Chicken_Tikka.jpeg", veg: false, categoryId: "tandoor_non_veg", rating: 4.8 },
  { id: "Chicken_Achari_Tikka", name: "Chicken Achari Tikka", price: 310, description: "Chicken tikka chunks with sour pickling spices.", image: "/uploads/Chicken_Achari_Tikka.jpeg", veg: false, categoryId: "tandoor_non_veg", rating: 4.7 },
  { id: "Malai_Tikka", name: "Malai Tikka", price: 320, description: "Mildly spiced chicken bites coated with cream and cheese.", image: "/uploads/Malai_Tikka.jpeg", veg: false, categoryId: "tandoor_non_veg", rating: 4.8 },
  { id: "Chicken_Tikka_Kalimirch", name: "Chicken Tikka Kalimirch", price: 330, description: "Chicken tikka spiced strongly with cracked black pepper.", image: "/uploads/Chicken_Tikka_Kalimirch.jpeg", veg: false, categoryId: "tandoor_non_veg", rating: 4.8 },
  { id: "Mix_Veg_Fried_Rice", name: "Mix Veg Fried Rice", price: 200, description: "Delicious wok-fried rice combining vegetables and paneer.", image: "/uploads/Mix_Veg_Fried_Rice.jpeg", veg: true, categoryId: "rice_p5_veg", rating: 4.7 },
  { id: "Veg_Schezewan_Rice", name: "Veg Schezwan Rice", price: 180, description: "Spicy wok-fried rice in red Schezwan sauce.", image: "/uploads/Veg_Schezewan_Rice.jpeg", veg: true, categoryId: "rice_p5_veg", rating: 4.6 },
  { id: "Chicken_Schezewan_Rice", name: "Chicken Schezwan Rice", price: 220, description: "Spicy fried rice with chicken chunks in hot Schezwan sauce.", image: "/uploads/Chicken_Schezewan_Rice.jpeg", veg: false, categoryId: "rice_p5_non_veg", rating: 4.7 },
  { id: "Veg_Fried_Rice", name: "Veg Fried Rice", price: 160, description: "Wok-fried rice with finely chopped seasonal vegetables.", image: "/uploads/Veg_Fried_Rice.jpeg", veg: true, categoryId: "rice_p5_veg", rating: 4.5 },
  { id: "Brownie_with_Chocolate_Sauce", name: "Brownie with Chocolate Sauce", price: 140, description: "Fudgy hot chocolate brownie drizzled with chocolate fudge.", image: "/uploads/Brownie_with_Chocolate_Sauce.jpeg", veg: true, categoryId: "desserts_veg", rating: 4.8 },
  { id: "Brownie_with_Ice_-_cream", name: "Brownie with Ice-cream", price: 160, description: "Hot brownie served alongside a cold scoop of vanilla ice cream.", image: "/uploads/Brownie_with_Ice___cream.jpeg", veg: true, categoryId: "desserts_veg", rating: 4.9 },
  { id: "Hot_Gulab_Jamun_(2_Pcs)", name: "Hot Gulab Jamun (2 Pcs)", price: 80, description: "Sweet milk solids dumplings soaked in rose flavored warm sugar syrup.", image: "/uploads/Hot_Gulab_Jamun__2_Pcs_.jpeg", veg: true, categoryId: "desserts_veg", rating: 4.9 },
  { id: "Tutty_Fruity", name: "Tutty Fruity", price: 100, description: "A colorful sweet dynamic dessert containing mixed fruit bits and ice cream.", image: "/uploads/Tutty_Fruity.jpeg", veg: true, categoryId: "desserts_veg", rating: 4.6 },
  { id: "Ice_-_Cream_(Two_Scoops)", name: "Ice-Cream (Two Scoops)", price: 90, description: "Choose any two scoops from Vanilla, Chocolate, or Strawberry.", image: "/uploads/Ice___Cream__Two_Scoops_.jpeg", veg: true, categoryId: "desserts_veg", rating: 4.7 },
  { id: "SOYA_MALAI_CHAP", name: "Soya Malai Chaap", price: 230, description: "Milky, creamy, tandoor grilled soya chaap seasoned with cardamom and black pepper.", image: "/uploads/SOYA_MALAI_CHAP.jpeg", veg: true, categoryId: "soya_chap", rating: 4.8 },
  { id: "Masala_Cold_Drink", name: "Masala Cold Drink", price: 60, description: "Chilled cold drink topped with house spices and lemon.", image: "/uploads/Masala_Cold_Drink.jpeg", veg: true, categoryId: "beverages", rating: 4.5 },
  { id: "Cold_Drinks_(All_Flavours)", name: "Cold Drinks (All Flavours)", price: 40, description: "Assorted cold drinks served chilled.", image: "/uploads/Cold_Drinks__All_Flavours_.jpeg", veg: true, categoryId: "beverages", rating: 4.5 },
  { id: "SOYA_AFGANI_CHAP", name: "Soya Afghani Chaap", price: 220, description: "Succulent soya chunks marinated in rich cream, cashew paste, and light spices grilled in tandoor.", image: "/uploads/SOYA_AFGANI_CHAP.jpeg", veg: true, categoryId: "soya_chap", rating: 4.8 },
  { id: "SOYA_ACHARI_CHAP", name: "Soya Achari Chaap", price: 210, description: "Soya chaap chunks cooked with tangy pickled spices, yogurt, and mustard oil.", image: "/uploads/SOYA_ACHARI_CHAP.jpeg", veg: true, categoryId: "soya_chap", rating: 4.7 },
  { id: "SOYA_BUTTER_MASALA", name: "Soya Butter Masala", price: 240, description: "Grilled soya pieces in rich tomato, butter, and cashew onion gravy.", image: "/uploads/SOYA_BUTTER_MASALA.jpeg", veg: true, categoryId: "soya_chap", rating: 4.9 },
  { id: "SOYA_DO_PYAZA", name: "Soya Do Pyaaza", price: 230, description: "Savory soya chunks cooked with onions added at two stages for a sweet crunch.", image: "/uploads/SOYA_DO_PYAZA.jpeg", veg: true, categoryId: "soya_chap", rating: 4.6 },
  { id: "SOYA_MASALA", name: "Soya Masala", price: 220, description: "Semi-dry spicy Punjabi style soya chaap curry.", image: "/uploads/SOYA_MASALA.jpeg", veg: true, categoryId: "soya_chap", rating: 4.7 },
  { id: "Dal_Tadka", name: "Dal Tadka", price: 180, description: "Tempered yellow lentils with cumin, garlic, red chillies, and ghee.", image: "/uploads/Dal_Tadka.jpeg", veg: true, categoryId: "dal", rating: 4.7 },
  { id: "Dal_Fry_(Yellow)", name: "Dal Fry (Yellow)", price: 160, description: "Comforting yellow dal cooked with tomatoes and spices.", image: "/uploads/Dal_Fry__Yellow_.jpeg", veg: true, categoryId: "dal", rating: 4.5 },
  { id: "Dal_Amritsari", name: "Dal Amritsari", price: 200, description: "Traditional split black urad dal and chana dal from Amritsar.", image: "/uploads/Dal_Amritsari.jpeg", veg: true, categoryId: "dal", rating: 4.7 },
  { id: "Dal_Mughlai_(Non-Veg.)", name: "Dal Mughlai (Non-Veg.)", price: 260, description: "Rich dal cooked with egg or minced chicken Mughlai style.", image: "/uploads/Menu 15/Dal/Dal Mughlai (Non-Veg.).jpeg", veg: false, categoryId: "dal", rating: 4.8 },
  { id: "Dal_Makhani", name: "Dal Makhani", price: 240, description: "Creamy slow-cooked whole black lentils and kidney beans.", image: "/uploads/Dal_Makhani.jpeg", veg: true, categoryId: "dal", rating: 4.9 },
  { id: "Steamed_Rice", name: "Steamed Rice", price: 120, description: "Fluffy aromatic basmati rice cooked to perfection.", image: "/uploads/Steamed_Rice.jpeg", veg: true, categoryId: "rice_p1", rating: 4.4 },
  { id: "Jeera_Rice", name: "Jeera Rice", price: 150, description: "Basmati rice tempered with ghee and cumin seeds.", image: "/uploads/Jeera_Rice.jpeg", veg: true, categoryId: "rice_p1", rating: 4.6 },
  { id: "Veg_Pulao", name: "Veg Pulao", price: 180, description: "Rice cooked with assorted vegetables and spices.", image: "/uploads/Veg_Pulao.jpeg", veg: true, categoryId: "rice_p1", rating: 4.5 },
  { id: "Green_Peas_Pulao", name: "Green Peas Pulao", price: 190, description: "Basmati rice cooked with fresh green peas.", image: "/uploads/Green_Peas_Pulao.jpeg", veg: true, categoryId: "rice_p1", rating: 4.6 },
  { id: "Veg_Biryani", name: "Veg Biryani", price: 220, description: "Layered basmati rice with mixed vegetables and direct dum cooking.", image: "/uploads/Veg_Biryani.jpeg", veg: true, categoryId: "rice_p1", rating: 4.6 },
  { id: "Mix_Veg_Biryani", name: "Mix Veg Biryani", price: 230, description: "Exquisite layered biryani loaded with premium veggies.", image: "/uploads/Mix_Veg_Biryani.jpeg", veg: true, categoryId: "rice_p1", rating: 4.7 },
  { id: "Hyderabadi_Chicken_Biryani", name: "Hyderabadi Chicken Biryani", price: 280, description: "Authentic spicy layered chicken biryani.", image: "/uploads/Hyderabadi_Chicken_Biryani.jpeg", veg: false, categoryId: "rice_p1", rating: 4.9 },
  { id: "Chicken_Dum_Briyani", name: "Chicken Dum Biryani", price: 260, description: "Classic dum cooked chicken biryani.", image: "/uploads/Chicken_Dum_Briyani.jpeg", veg: false, categoryId: "rice_p1", rating: 4.8 },
  { id: "Double_Leg_Biryani", name: "Double Leg Chicken Biryani", price: 300, description: "Biryani served with two juicy tandoori chicken legs.", image: "/uploads/Double_Leg_Biryani.jpg", veg: false, categoryId: "rice_p1", rating: 4.9 },
  { id: "Chicken_Matki_Biryani", name: "Chicken Matki Biryani", price: 290, description: "Aromatic chicken biryani cooked and served in a clay pot.", image: "/uploads/Chicken_Matki_Biryani.jpeg", veg: false, categoryId: "rice_p1", rating: 4.8 },
  { id: "Tandoori_Roti", name: "Tandoori Roti", price: 20, description: "Whole wheat unleavened bread baked in tandoor clay oven.", image: "/uploads/Tandoori_Roti.jpeg", veg: true, categoryId: "breads", rating: 4.5 },
  { id: "Butter_Tandoori_Roti", name: "Butter Tandoori Roti", price: 25, description: "Whole wheat clay oven flatbread coated with butter.", image: "/uploads/Butter_Tandoori_Roti.jpeg", veg: true, categoryId: "breads", rating: 4.6 },
  { id: "Naan", name: "Plain Naan", price: 50, description: "Refined flour flatbread baked in the clay oven.", image: "/uploads/Naan.jpeg", veg: true, categoryId: "breads", rating: 4.6 },
  { id: "Butter_Naan", name: "Butter Naan", price: 60, description: "Leavened flatbread brushed with rich melted butter.", image: "/uploads/Butter_Naan.jpeg", veg: true, categoryId: "breads", rating: 4.8 },
  { id: "Stuffed_Kulcha", name: "Stuffed Kulcha", price: 100, description: "Stuffed flatbread with potato and mild spices.", image: "/uploads/Stuffed_Kulcha.jpeg", veg: true, categoryId: "breads", rating: 4.7 },
  { id: "Aloo_Paratha", name: "Aloo Paratha", price: 70, description: "Stuffed whole wheat paratha with spiced potatoes.", image: "/uploads/Aloo_Paratha.jpeg", veg: true, categoryId: "breads", rating: 4.8 },
  { id: "Shahi_Naan", name: "Shahi Naan", price: 90, description: "Rich royal naan topped with nuts, raisins, and sesame seeds.", image: "/uploads/Shahi_Naan.jpeg", veg: true, categoryId: "breads", rating: 4.7 },
  { id: "Garlic_Naan", name: "Garlic Naan", price: 80, description: "Naan bread infused with garlic and fresh coriander.", image: "/uploads/Garlic_Naan.jpeg", veg: true, categoryId: "breads", rating: 4.9 },
  { id: "Panner_Kulcha", name: "Paneer Kulcha", price: 110, description: "Soft leavened bread stuffed with cottage cheese.", image: "/uploads/Panner_Kulcha.jpeg", veg: true, categoryId: "breads", rating: 4.8 },
  { id: "Laccha_Paratha", name: "Laccha Paratha", price: 80, description: "Multi-layered crispy tandoori flatbread.", image: "/uploads/Laccha_Paratha.jpeg", veg: true, categoryId: "breads", rating: 4.7 },
  { id: "Garden_Fresh", name: "Garden Fresh Salad", price: 80, description: "Assorted sliced fresh cucumber, tomatoes, carrots, and beetroot.", image: "/uploads/Garden_Fresh.jpeg", veg: true, categoryId: "salad", rating: 4.5 },
  { id: "Cucumber_Salad", name: "Cucumber Salad", price: 70, description: "Refreshing sliced cucumbers with salt and lemon.", image: "/uploads/Cucumber_Salad.jpeg", veg: true, categoryId: "salad", rating: 4.4 },
  { id: "Onion_Salad", name: "Onion Salad", price: 50, description: "Sliced onion rings with green chillies and lemon.", image: "/uploads/Onion_Salad.jpeg", veg: true, categoryId: "salad", rating: 4.3 },
  { id: "Mix_Salad", name: "Mix Salad", price: 75, description: "A combination of sliced onions, tomatoes, and cucumbers.", image: "/uploads/Mix_Salad.jpeg", veg: true, categoryId: "salad", rating: 4.4 },
  { id: "Veg_Navratan_Korma", name: "Veg Navratan Korma", price: 260, description: "Mild, sweet, and rich gravy with 9 gems of vegetables and nuts.", image: "/uploads/Veg_Navratan_Korma.jpeg", veg: true, categoryId: "main_course_veg", rating: 4.6 },
  { id: "Veg_Hydrabadi", name: "Veg Hyderabadi", price: 250, description: "Mixed veggies cooked in rich green spinach-mint-coriander gravy.", image: "/uploads/Veg_Hydrabadi.jpeg", veg: true, categoryId: "main_course_veg", rating: 4.6 },
  { id: "Chicken_Do_Pyaza_(2_Pcs)", name: "Chicken Do Pyaza (2 Pcs)", price: 210, description: "Chicken cooked with double amount of crunchy onions.", image: "/uploads/Chicken_Do_Pyaza__2_Pcs_.jpeg", veg: false, categoryId: "main_course_non_veg", rating: 4.6 },
  { id: "Chicken_Handi_(4_Pcs)", name: "Chicken Handi (4 Pcs)", price: 340, description: "Creamy chicken curry cooked in traditional clay pot.", image: "/uploads/Chicken_Handi__4_Pcs_.jpeg", veg: false, categoryId: "main_course_non_veg", rating: 4.8 },
  { id: "Makhani_Chicken_(4_Pcs)", name: "Makhani Chicken (4 Pcs)", price: 350, description: "Shredded and grilled tandoori chicken cooked in rich buttery sauce.", image: "/uploads/Makhani_Chicken__4_Pcs_.jpeg", veg: false, categoryId: "main_course_non_veg", rating: 4.9 },
  { id: "Chicken_Maharaja_Full(8_Pcs)", name: "Chicken Maharaja Full (8 Pcs)", price: 560, description: "Royal style chicken cooked in two layers of gravies with boiled eggs.", image: "/uploads/Chicken_Maharaja_Full_8_Pcs_.jpeg", veg: false, categoryId: "main_course_non_veg", rating: 4.9 },
  { id: "Omellete_Masala_(2_Pcs)", name: "Omelette Masala (2 Pcs)", price: 120, description: "Spiced double-egg omelette cooked with onions and chillies.", image: "/uploads/Omellete_Masala__2_Pcs_.jpeg", veg: false, categoryId: "main_course_non_veg", rating: 4.5 },
  { id: "Curd", name: "Curd", price: 50, description: "Plain house-made fresh yogurt.", image: "/uploads/Curd.jpeg", veg: true, categoryId: "raita", rating: 4.5 },
  { id: "Boondi_Raita", name: "Boondi Raita", price: 70, description: "Yogurt mixed with crispy tiny fried chickpea flour balls.", image: "/uploads/Boondi_Raita.jpeg", veg: true, categoryId: "raita", rating: 4.5 },
  { id: "Kheera_Raita", name: "Cucumber Raita", price: 60, description: "Chilled yogurt seasoned with grated cucumber and roasted cumin.", image: "/uploads/Kheera_Raita.jpeg", veg: true, categoryId: "raita", rating: 4.4 },
  { id: "Mix_Raita", name: "Mix Raita", price: 80, description: "Yogurt loaded with onion, tomato, and cucumber.", image: "/uploads/Mix_Raita.jpeg", veg: true, categoryId: "raita", rating: 4.5 },
  { id: "Pineapple_Raita", name: "Pineapple Raita", price: 100, description: "Sweet and sour yogurt with juicy pineapple pieces.", image: "/uploads/Pineapple_Raita.jpg", veg: true, categoryId: "raita", rating: 4.6 },
  { id: "Roasted_Papad", name: "Roasted Papad", price: 20, description: "Crispy roasted papadom.", image: "/uploads/Roasted_Papad.jpg", veg: true, categoryId: "papad", rating: 4.4 },
  { id: "Fry_Papad", name: "Fried Papad", price: 25, description: "Deep-fried crispy papadom.", image: "/uploads/Fry_Papad.jpeg", veg: true, categoryId: "papad", rating: 4.3 },
  { id: "Masala_Papad", name: "Masala Papad", price: 40, description: "Crispy papad topped with chopped onions, tomatoes, and herbs.", image: "/uploads/Masala_Papad.jpeg", veg: true, categoryId: "papad", rating: 4.6 },
  { id: "Veg_Jhalfrezi", name: "Veg Jhalfrezi", price: 240, description: "Tangy and spicy stir-fried vegetables with onions and bell peppers.", image: "/uploads/Veg_Jhalfrezi.jpeg", veg: true, categoryId: "main_course_veg", rating: 4.5 },
  { id: "Veg-do-pyaza", name: "Veg Do Pyaza", price: 230, description: "Seasonal vegetables cooked in spicy onion-based gravy.", image: "/uploads/Veg_do_pyaza.jpeg", veg: true, categoryId: "main_course_veg", rating: 4.4 },
  { id: "Veg_Kadahi", name: "Veg Kadahi", price: 250, description: "Veggies cooked in wok with fresh kadai spices.", image: "/uploads/Veg_Kadahi.jpeg", veg: true, categoryId: "main_course_veg", rating: 4.6 },
  { id: "Veg_Jaipuri", name: "Veg Jaipuri", price: 260, description: "Jaipuri-style mixed veg curry topped with papad.", image: "/uploads/Veg_Jaipuri.jpeg", veg: true, categoryId: "main_course_veg", rating: 4.5 },
  { id: "Veg_Handi", name: "Veg Handi", price: 255, description: "Creamy mixed vegetables slow-cooked in a clay handi.", image: "/uploads/Veg_Handi.jpeg", veg: true, categoryId: "main_course_veg", rating: 4.5 },
  { id: "Veg_Dahi_Wala", name: "Veg Dahi Wala", price: 240, description: "Vegetables simmered in rich yogurt-based mild gravy.", image: "/uploads/Veg_Dahi_Wala.jpeg", veg: true, categoryId: "main_course_veg", rating: 4.4 },
  { id: "Veg_Tawa", name: "Veg Tawa", price: 250, description: "Dry, spicy vegetables sizzled on a iron griddle (tawa).", image: "/uploads/Veg_Tawa.jpeg", veg: true, categoryId: "main_course_veg", rating: 4.5 },
  { id: "Veg_Lababdar", name: "Veg Lababdar", price: 260, description: "Mixed veg cooked in thick creamy tomato gravy with cheese.", image: "/uploads/Veg_Lababdar.jpeg", veg: true, categoryId: "main_course_veg", rating: 4.7 },
  { id: "Mix_Vegetable", name: "Mix Vegetable", price: 210, description: "Assorted vegetables cooked in a simple onion-tomato base.", image: "/uploads/Mix_Vegetable.jpeg", veg: true, categoryId: "main_course_veg", rating: 4.5 },
  { id: "Panner_Butter_Masala", name: "Paneer Butter Masala", price: 290, description: "Paneer chunks in a creamy, butter-enriched tomato sauce.", image: "/uploads/Panner_Butter_Masala.jpeg", veg: true, categoryId: "main_course_veg", rating: 4.9 },
  { id: "Paneer_Korma", name: "Paneer Korma", price: 280, description: "Cottage cheese in white cashew nut gravy.", image: "/uploads/Paneer_Korma.jpeg", veg: true, categoryId: "main_course_veg", rating: 4.7 },
  { id: "Paneer_Keema", name: "Paneer Keema", price: 270, description: "Scrambled paneer with onions, tomatoes, and spices.", image: "/uploads/Paneer_Keema.jpeg", veg: true, categoryId: "main_course_veg", rating: 4.8 },
  { id: "Paneer_Tikka_Butter_Masala", name: "Paneer Tikka Butter Masala", price: 310, description: "Grilled paneer tikka skewered and cooked in masala gravy.", image: "/uploads/Paneer_Tikka_Butter_Masala.jpeg", veg: true, categoryId: "main_course_veg", rating: 4.9 },
  { id: "Paneer_Kadahi", name: "Kadai Paneer", price: 270, description: "Spicy paneer sautéed with bell peppers in a wok.", image: "/uploads/Paneer_Kadahi.jpeg", veg: true, categoryId: "main_course_veg", rating: 4.8 },
  { id: "Paneer_Handi", name: "Paneer Handi", price: 280, description: "Paneer cooked in a clay pot with creamy gravy.", image: "/uploads/Paneer_Handi.jpeg", veg: true, categoryId: "main_course_veg", rating: 4.7 },
  { id: "Paneer_Hydrabadi", name: "Paneer Hyderabadi", price: 280, description: "Paneer cooked in rich spinach-mint Hyderabadi gravy.", image: "/uploads/Paneer_Hydrabadi.jpeg", veg: true, categoryId: "main_course_veg", rating: 4.7 },
  { id: "Paneer_Maharaja", name: "Paneer Maharaja", price: 320, description: "Chef's special double-layered royal paneer gravy.", image: "/uploads/Paneer_Maharaja.jpeg", veg: true, categoryId: "main_course_veg", rating: 4.9 },
  { id: "Panner_Makhan_Wala", name: "Paneer Makhan Wala", price: 290, description: "Paneer pieces loaded in rich, buttery, velvety tomato sauce.", image: "/uploads/Panner_Makhan_Wala.jpeg", veg: true, categoryId: "main_course_veg", rating: 4.8 },
  { id: "Panner_Dahi_Wala", name: "Paneer Dahi Wala", price: 275, description: "Cottage cheese cooked in a smooth curd base.", image: "/uploads/Panner_Dahi_Wala.jpeg", veg: true, categoryId: "main_course_veg", rating: 4.6 },
  { id: "Paneer_Kholapuri", name: "Paneer Kolhapuri", price: 285, description: "Fiery spicy paneer dish with Kolhapuri ground spices.", image: "/uploads/Paneer_Kholapuri.jpeg", veg: true, categoryId: "main_course_veg", rating: 4.8 },
  { id: "Paneer_Corn_Palak_Masala", name: "Paneer Corn Palak Masala", price: 290, description: "Paneer and sweet corn cooked in spiced spinach puree.", image: "/uploads/Paneer_Corn_Palak_Masala.jpeg", veg: true, categoryId: "main_course_veg", rating: 4.7 },
  { id: "Panner_Mushroom_Taj_(Special)", name: "Paneer Mushroom Taj (Special)", price: 340, description: "House special combining grilled paneer and button mushrooms in a majestic gravy.", image: "/uploads/Panner_Mushroom_Taj__Special_.jpeg", veg: true, categoryId: "main_course_veg", rating: 4.9 },
  { id: "Shahi_Paneer", name: "Shahi Paneer", price: 280, description: "Royal paneer dish in sweet creamy onion-cashew sauce.", image: "/uploads/Shahi_Paneer.jpeg", veg: true, categoryId: "main_course_veg", rating: 4.8 },
  { id: "Matar_Paneer", name: "Matar Paneer", price: 260, description: "Classic combination of paneer and fresh green peas in gravy.", image: "/uploads/Matar_Paneer.jpeg", veg: true, categoryId: "main_course_veg", rating: 4.7 },
  { id: "Paneer_Kofta", name: "Paneer Kofta", price: 270, description: "Cottage cheese balls served in thick spiced curry.", image: "/uploads/Paneer_Kofta.jpeg", veg: true, categoryId: "main_course_veg", rating: 4.6 },
  { id: "Matki_Paneer", name: "Matki Paneer", price: 290, description: "Paneer cooked inside clay pot with special Punjabi herbs.", image: "/uploads/Matki_Paneer.jpeg", veg: true, categoryId: "main_course_veg", rating: 4.7 },
  { id: "Kaju_Curry", name: "Kaju Curry", price: 300, description: "Roasted cashew nuts cooked in rich creamy onion-tomato gravy.", image: "/uploads/Kaju_Curry.jpeg", veg: true, categoryId: "main_course_veg", rating: 4.8 },
  { id: "Palak_Corn", name: "Palak Corn", price: 240, description: "Sweet corn kernels inside seasoned spinach cream.", image: "/uploads/Palak_Corn.jpeg", veg: true, categoryId: "main_course_veg", rating: 4.6 },
  { id: "Mushroom_Matar_Masala", name: "Mushroom Matar Masala", price: 260, description: "Fresh button mushrooms and green peas in red masala gravy.", image: "/uploads/Mushroom_Matar_Masala.jpeg", veg: true, categoryId: "main_course_veg", rating: 4.6 },
  { id: "Mushroom_Butter_Masala", name: "Mushroom Butter Masala", price: 270, description: "Mushrooms in rich tomato butter gravy.", image: "/uploads/Mushroom_Butter_Masala.jpeg", veg: true, categoryId: "main_course_veg", rating: 4.7 },
  { id: "Mushroom_Do_Pyaza", name: "Mushroom Do Pyaza", price: 265, description: "Button mushrooms sautéed with lots of onions.", image: "/uploads/Mushroom_Do_Pyaza.jpeg", veg: true, categoryId: "main_course_veg", rating: 4.6 },
  { id: "Mushroom_Tawa", name: "Mushroom Tawa", price: 270, description: "Spicy mushroom cooked dry on tawa griddle.", image: "/uploads/Mushroom_Tawa.jpeg", veg: true, categoryId: "main_course_veg", rating: 4.5 },
  { id: "Mushroom_Palak", name: "Mushroom Palak", price: 250, description: "Mushrooms cooked in healthy spiced spinach gravy.", image: "/uploads/Mushroom_Palak.jpeg", veg: true, categoryId: "main_course_veg", rating: 4.5 },
  { id: "Veg_Kofta", name: "Veg Kofta", price: 220, description: "Deep-fried mixed vegetable balls in gravy.", image: "/uploads/Veg_Kofta.jpeg", veg: true, categoryId: "main_course_veg", rating: 4.5 },
  { id: "Malai_Kofta", name: "Malai Kofta", price: 260, description: "Potato paneer dumplings in sweet cashew cream gravy.", image: "/uploads/Malai_Kofta.jpeg", veg: true, categoryId: "main_course_veg", rating: 4.8 },
  { id: "Baby_Corn_Masala", name: "Baby Corn Masala", price: 240, description: "Crisp baby corn cuts in spiced onion-tomato curry.", image: "/uploads/Baby_Corn_Masala.jpeg", veg: true, categoryId: "main_course_veg", rating: 4.5 },
  { id: "Corn_Masala", name: "Corn Masala", price: 230, description: "Sweet corn kernels cooked in warm Indian gravy.", image: "/uploads/Corn_Masala.jpeg", veg: true, categoryId: "main_course_veg", rating: 4.4 },
  { id: "Green_Peace_Masala", name: "Green Peas Masala", price: 220, description: "Fresh green peas in spiced onion-tomato gravy.", image: "/uploads/Green_Peace_Masala.jpeg", veg: true, categoryId: "main_course_veg", rating: 4.5 },
  { id: "Chicken_Curry_(2_Pcs)", name: "Chicken Curry (2 Pcs)", price: 180, description: "Home-style traditional chicken curry cooked in thin gravy.", image: "/uploads/Chicken_Curry__2_Pcs_.jpeg", veg: false, categoryId: "main_course_non_veg", rating: 4.7 },
  { id: "Chicken_Masala_(2_Pcs)", name: "Chicken Masala (2 Pcs)", price: 200, description: "Spicy chicken pieces in a thick masala paste.", image: "/uploads/Chicken_Masala__2_Pcs_.jpeg", veg: false, categoryId: "main_course_non_veg", rating: 4.7 },
  { id: "Chicken_Butter_Masala_(2_Pcs)", name: "Chicken Butter Masala (2 Pcs)", price: 220, description: "Tender chicken pieces cooked in butter-tomato-cashew gravy.", image: "/uploads/Chicken_Butter_Masala__2_Pcs_.jpeg", veg: false, categoryId: "main_course_non_veg", rating: 4.8 },
  { id: "Chicken_Korma_(2_Pcs)", name: "Chicken Korma (2 Pcs)", price: 210, description: "Chicken slow cooked in royal cashew-yogurt sauce.", image: "/uploads/Chicken_Korma__2_Pcs_.jpeg", veg: false, categoryId: "main_course_non_veg", rating: 4.6 },
  { id: "Chicken_Bharta", name: "Chicken Bharta", price: 260, description: "Shredded chicken cooked in egg, butter, and cashew onion paste.", image: "/uploads/Chicken_Bharta.jpeg", veg: false, categoryId: "main_course_non_veg", rating: 4.8 },
  { id: "Chicken_Kadahi_(4_Pcs)", name: "Chicken Kadai (4 Pcs)", price: 340, description: "Wok-cooked chicken with chunky onions, tomatoes, and bell peppers.", image: "/uploads/Chicken_Kadahi__4_Pcs_.jpeg", veg: false, categoryId: "main_course_non_veg", rating: 4.7 },
  { id: "Chicken_Peshawari_(4_Pcs)", name: "Chicken Peshawari (4 Pcs)", price: 360, description: "Rich, mildly spiced chicken dish from Peshawar region.", image: "/uploads/Chicken_Peshawari__4_Pcs_.jpeg", veg: false, categoryId: "main_course_non_veg", rating: 4.8 },
  { id: "Chicken_Kolhapuri_(4_Pcs)", name: "Chicken Kolhapuri (4 Pcs)", price: 350, description: "Extremely spicy chicken dish with dry coconut and chillies.", image: "/uploads/Chicken_Kolhapuri__4_Pcs_.jpeg", veg: false, categoryId: "main_course_non_veg", rating: 4.7 },
  { id: "Chicken_Methi_Malai_(4_Pcs)", name: "Chicken Methi Malai (4 Pcs)", price: 370, description: "Rich white chicken gravy flavored with fresh fenugreek leaves (methi) and cream.", image: "/uploads/Chicken_Methi_Malai__4_Pcs_.jpeg", veg: false, categoryId: "main_course_non_veg", rating: 4.8 },
  { id: "Chicken_Saagwala_(4_Pcs)", name: "Chicken Saagwala (4 Pcs)", price: 340, description: "Chicken cooked in a green dynamic spinach puree.", image: "/uploads/Chicken_Saagwala__4_Pcs_.jpeg", veg: false, categoryId: "main_course_non_veg", rating: 4.6 },
  { id: "Chicken_Lucknawi_(4_Pcs)", name: "Chicken Lucknawi (4 Pcs)", price: 380, description: "Delicately flavored white chicken curry Lucknow-style.", image: "/uploads/Chicken_Lucknawi__4_Pcs_.jpeg", veg: false, categoryId: "main_course_non_veg", rating: 4.8 },
  { id: "Tawa_Chicken_(4_Pcs)", name: "Tawa Chicken (4 Pcs)", price: 360, description: "Spiced chicken stir-fried on large iron griddle.", image: "/uploads/Tawa_Chicken__4_Pcs_.jpeg", veg: false, categoryId: "main_course_non_veg", rating: 4.8 },
  { id: "Chicken_Tikka_Butter_Masala_(8_Pcs)", name: "Chicken Tikka Butter Masala (8 Pcs)", price: 480, description: "Skewered chicken tikka cooked in hot spiced butter gravy.", image: "/uploads/Chicken_Tikka_Butter_Masala__8_Pcs_.jpeg", veg: false, categoryId: "main_course_non_veg", rating: 4.9 },
  { id: "Chicken_Kassa_(8_Pcs)", name: "Chicken Kassa (8 Pcs)", price: 440, description: "Bengali style slow-cooked dry spicy chicken.", image: "/uploads/Chicken_Kassa__8_Pcs_.jpeg", veg: false, categoryId: "main_course_non_veg", rating: 4.7 },
  { id: "Chicken_Lababdar_(8_Pcs)", name: "Chicken Lababdar (8 Pcs)", price: 460, description: "Creamy sweet and tangy chicken gravy with cheese.", image: "/uploads/Chicken_Lababdar__8_Pcs_.jpeg", veg: false, categoryId: "main_course_non_veg", rating: 4.8 },
  { id: "Chicken_Patiyala_(8_Pcs)", name: "Chicken Patiala (8 Pcs)", price: 490, description: "Punjabi special chicken wrapped inside egg omelette served in yellow gravy.", image: "/uploads/Chicken_Patiyala__8_Pcs_.jpeg", veg: false, categoryId: "main_course_non_veg", rating: 4.9 },
  { id: "Chicken_Dehati_Full_(8_Pcs)", name: "Chicken Dehati Full (8 Pcs)", price: 520, description: "Rustic country-style chicken curry with whole garlic bulbs.", image: "/uploads/Chicken_Dehati_Full__8_Pcs_.jpeg", veg: false, categoryId: "main_course_non_veg", rating: 4.8 },
  { id: "Punjabi_Kitchen_Special_(8_Pcs)", name: "Punjabi Kitchen Special (8 Pcs)", price: 580, description: "Chef's signature chicken curry using rare herbs and spices.", image: "/uploads/Punjabi_Kitchen_Special__8_Pcs_.jpeg", veg: false, categoryId: "main_course_non_veg", rating: 5 },
  { id: "Matka_Chicken_Full(8_Pcs)", name: "Matka Chicken Full (8 Pcs)", price: 570, description: "Juicy chicken cooked inside clay pot with special spices.", image: "/uploads/Matka_Chicken_Full_8_Pcs_.jpeg", veg: false, categoryId: "main_course_non_veg", rating: 4.9 },
  { id: "Murg_Musalam_Full_(8_Pcs)", name: "Murg Musallam Full (8 Pcs)", price: 590, description: "Whole roasted tandoori chicken stuffed with eggs and minced mutton in thick gravy.", image: "/uploads/Murg_Musalam_Full__8_Pcs_.jpeg", veg: false, categoryId: "main_course_non_veg", rating: 5 },
  { id: "Mutton_Curry_(4_Pcs)", name: "Mutton Curry (4 Pcs)", price: 400, description: "Home-style tender goat mutton curry cooked in spicy broth.", image: "/uploads/Mutton_Curry__4_Pcs_.jpeg", veg: false, categoryId: "main_course_non_veg", rating: 4.8 },
  { id: "Mutton_Masala_(4_Pcs)", name: "Mutton Masala (4 Pcs)", price: 420, description: "Slow-cooked mutton pieces in a thick, semi-dry spice masala.", image: "/uploads/Mutton_Masala__4_Pcs_.jpeg", veg: false, categoryId: "main_course_non_veg", rating: 4.8 },
  { id: "Mutton_Rogan_Josh_(4_Pcs)", name: "Mutton Rogan Josh (4 Pcs)", price: 420, description: "Kashmiri style aromatic goat mutton cooked with alkanet root.", image: "/uploads/Mutton_Rogan_Josh__4_Pcs_.jpeg", veg: false, categoryId: "main_course_non_veg", rating: 4.9 },
  { id: "Fish_Curry_(2_Pcs)", name: "Fish Curry (2 Pcs)", price: 280, description: "Fresh fish cooked in mustard-onion curry.", image: "/uploads/Fish_Curry__2_Pcs_.jpeg", veg: false, categoryId: "main_course_non_veg", rating: 4.6 },
  { id: "Fish_Masala_(2_Pcs)", name: "Fish Masala (2 Pcs)", price: 300, description: "Pan fried fish coated in hot masala sauce.", image: "/uploads/Fish_Masala__2_Pcs_.jpeg", veg: false, categoryId: "main_course_non_veg", rating: 4.7 },
  { id: "Fish_Do_Pyaza_(2_Pcs)", name: "Fish Do Pyaza (2 Pcs)", price: 300, description: "Fish pieces cooked with caramelized onion gravy.", image: "/uploads/Fish_Do_Pyaza__2_Pcs_.jpeg", veg: false, categoryId: "main_course_non_veg", rating: 4.6 },
  { id: "Fish_Fry_(2_Pcs)", name: "Fish Fry (2 Pcs)", price: 260, description: "Crispy batter-fried fish fillets seasoned with chaat masala.", image: "/uploads/Fish_Fry__2_Pcs_.jpeg", veg: false, categoryId: "main_course_non_veg", rating: 4.7 },
  { id: "Egg_Curry_(2_Pcs)", name: "Egg Curry (2 Pcs)", price: 180, description: "Boiled and pan-fried eggs served in spicy curry.", image: "/uploads/Egg_Curry__2_Pcs_.jpeg", veg: false, categoryId: "main_course_non_veg", rating: 4.5 },
  { id: "Egg_Masala_(2_Pcs)", name: "Egg Masala (2 Pcs)", price: 200, description: "Eggs cooked inside heavily spiced thick dry masala gravy.", image: "/uploads/Egg_Masala__2_Pcs_.jpeg", veg: false, categoryId: "main_course_non_veg", rating: 4.6 },
  { id: "Egg_Do_Pyaza_(2_Pcs)", name: "Egg Do Pyaza (2 Pcs)", price: 200, description: "Boiled eggs cooked in onion-rich sauce.", image: "/uploads/Egg_Do_Pyaza__2_Pcs_.jpeg", veg: false, categoryId: "main_course_non_veg", rating: 4.5 },
  { id: "Veg_Chilly", name: "Veg Chilli", price: 180, description: "Mixed vegetable dumplings tossed in tangy chilli sauce.", image: "/uploads/Veg_Chilly.jpeg", veg: true, categoryId: "chinese_starter_veg", rating: 4.5 },
  { id: "Paneer_Chilly", name: "Paneer Chilli", price: 220, description: "Cottage cheese cubes tossed with capsicum, onion, and dark soy sauce.", image: "/uploads/Paneer_Chilly.jpeg", veg: true, categoryId: "chinese_starter_veg", rating: 4.7 },
  { id: "Mushroom_Chilly", name: "Mushroom Chilli", price: 210, description: "Crispy batter-fried button mushrooms in sweet/sour chilli sauce.", image: "/uploads/Mushroom_Chilly.jpeg", veg: true, categoryId: "chinese_starter_veg", rating: 4.6 },
  { id: "Baby_Corn_Chilly", name: "Baby Corn Chilli", price: 200, description: "Baby corn cuts tossed in hot Schezwan chilli sauce.", image: "/uploads/Baby_Corn_Chilly.jpeg", veg: true, categoryId: "chinese_starter_veg", rating: 4.5 },
  { id: "Honey_Potato_Chilly", name: "Honey Chilli Potato", price: 170, description: "Crispy potato fingers tossed in honey, sesame, and sweet chilli sauce.", image: "/uploads/Honey_Potato_Chilly.jpeg", veg: true, categoryId: "chinese_starter_veg", rating: 4.6 },
  { id: "Chana_Chilly", name: "Chana Chilli", price: 160, description: "Boiled chickpeas crispy fried and tossed Chinese style.", image: "/uploads/Chana_Chilly.jpeg", veg: true, categoryId: "chinese_starter_veg", rating: 4.5 },
  { id: "Cheese_Chilly", name: "Cheese Chilli", price: 240, description: "Rich cheese chunks tossed in hot spicy soy sauce.", image: "/uploads/Cheese_Chilly.jpeg", veg: true, categoryId: "chinese_starter_veg", rating: 4.6 },
  { id: "Veg_Manchurian", name: "Veg Manchurian", price: 170, description: "Deep fried vegetable balls served in thick Manchurian sauce.", image: "/uploads/Veg_Manchurian.jpeg", veg: true, categoryId: "chinese_starter_veg", rating: 4.6 },
  { id: "Paneer_Manchurian", name: "Paneer Manchurian", price: 210, description: "Paneer cubes dipped in batter and cooked in garlic Manchurian gravy.", image: "/uploads/Paneer_Manchurian.jpeg", veg: true, categoryId: "chinese_starter_veg", rating: 4.6 },
  { id: "Mushroom_Manchurian", name: "Mushroom Manchurian", price: 200, description: "Crispy button mushrooms cooked inside dynamic Manchurian sauce.", image: "/uploads/Mushroom_Manchurian.jpeg", veg: true, categoryId: "chinese_starter_veg", rating: 4.5 },
  { id: "Corn_Salt_n_Pepper", name: "Corn Salt & Pepper", price: 190, description: "Sweet corn kernels crispy fried and seasoned with salt and pepper.", image: "/uploads/Corn_Salt_n_Pepper.jpeg", veg: true, categoryId: "chinese_starter_veg", rating: 4.6 },
  { id: "Panner_65", name: "Paneer 65", price: 230, description: "Spicy, deep-fried paneer starter flavored with curry leaves and yogurt.", image: "/uploads/Panner_65.jpeg", veg: true, categoryId: "chinese_starter_veg", rating: 4.8 },
  { id: "Chicken_Chilly_(Boneless)", name: "Chicken Chilli (Boneless)", price: 240, description: "Boneless chicken chunks tossed in dark soy sauce, chillies, and bell peppers.", image: "/uploads/Chicken_Chilly__Boneless_.jpeg", veg: false, categoryId: "chinese_starter_non_veg", rating: 4.8 },
  { id: "Chicken_Chilly_(with_Bone)", name: "Chicken Chilli (with Bone)", price: 220, description: "Bone-in chicken cuts tossed in Chinese chilli sauce.", image: "/uploads/Chicken_Chilly__with_Bone_.jpeg", veg: false, categoryId: "chinese_starter_non_veg", rating: 4.7 },
  { id: "Chicken_Schezewan", name: "Chicken Schezwan", price: 255, description: "Chicken chunks sautéed in hot spicy Schezwan sauce.", image: "/uploads/Chicken_Schezewan.jpeg", veg: false, categoryId: "chinese_starter_non_veg", rating: 4.7 },
  { id: "Chicken_Salt_N_Pepper", name: "Chicken Salt & Pepper", price: 250, description: "Crispy chicken strips seasoned with cracked black pepper and rock salt.", image: "/uploads/Chicken_Salt_N_Pepper.jpeg", veg: false, categoryId: "chinese_starter_non_veg", rating: 4.7 },
  { id: "Lemon_Chicken", name: "Lemon Chicken", price: 260, description: "Battered chicken slices cooked in sweet and tangy lemon sauce.", image: "/uploads/Lemon_Chicken.jpeg", veg: false, categoryId: "chinese_starter_non_veg", rating: 4.6 },
  { id: "Pepper_Chicken", name: "Pepper Chicken", price: 250, description: "Dry stir-fried chicken seasoned with black pepper, garlic, and onions.", image: "/uploads/Pepper_Chicken.jpeg", veg: false, categoryId: "chinese_starter_non_veg", rating: 4.6 },
  { id: "Chicken_Manchurian", name: "Chicken Manchurian", price: 240, description: "Fried chicken balls in dark garlic-infused Manchurian sauce.", image: "/uploads/Chicken_Manchurian.jpeg", veg: false, categoryId: "chinese_starter_non_veg", rating: 4.7 },
  { id: "Chicken_65", name: "Chicken 65", price: 250, description: "Spicy deep-fried chicken bites flavored with curry leaves, ginger, and garlic.", image: "/uploads/Chicken_65.jpeg", veg: false, categoryId: "chinese_starter_non_veg", rating: 4.8 },
  { id: "Chicken_Lollypop_(6_Pcs)", name: "Chicken Lollipop (6 Pcs)", price: 280, description: "Spiced chicken wings pulled back to resemble lollipops, deep fried.", image: "/uploads/Chicken_Lollypop__6_Pcs_.jpeg", veg: false, categoryId: "chinese_starter_non_veg", rating: 4.8 },
  { id: "Crispy_Chicken", name: "Crispy Chicken", price: 260, description: "Battered and deep-fried chicken strips served with hot sauce.", image: "/uploads/Crispy_Chicken.jpeg", veg: false, categoryId: "chinese_starter_non_veg", rating: 4.6 },
  { id: "Dragon_Chicken", name: "Dragon Chicken", price: 270, description: "Sweet, spicy, and crunchy chicken strips tossed with cashew nuts.", image: "/uploads/Dragon_Chicken.jpeg", veg: false, categoryId: "chinese_starter_non_veg", rating: 4.7 },
  { id: "Veg_hakka_Noodles", name: "Veg Hakka Noodles", price: 150, description: "Wok-tossed noodles with mixed vegetables and light soy sauce.", image: "/uploads/Veg_hakka_Noodles.jpeg", veg: true, categoryId: "noodles_veg", rating: 4.6 },
  { id: "Paneer_Hakka_Noodles", name: "Paneer Hakka Noodles", price: 180, description: "Noodles tossed with soft cottage cheese strips.", image: "/uploads/Paneer_Hakka_Noodles.jpeg", veg: true, categoryId: "noodles_veg", rating: 4.6 },
  { id: "Mushroom_Hakka_Noodles", name: "Mushroom Hakka Noodles", price: 180, description: "Wok-tossed noodles with mushrooms and fresh veggies.", image: "/uploads/Mushroom_Hakka_Noodles.jpeg", veg: true, categoryId: "noodles_veg", rating: 4.5 },
  { id: "Mix_Veg_Noodles", name: "Mix Veg Noodles", price: 190, description: "Noodles with special house-selected vegetables.", image: "/uploads/Mix_Veg_Noodles.jpeg", veg: true, categoryId: "noodles_veg", rating: 4.6 },
  { id: "American_Choupsey", name: "American Chopsuey Veg", price: 220, description: "Crispy fried noodles topped with sweet and sour vegetable glaze.", image: "/uploads/American_Choupsey.jpeg", veg: true, categoryId: "noodles_veg", rating: 4.7 },
  { id: "Egg_Hakka_Noodles", name: "Egg Hakka Noodles", price: 160, description: "Noodles tossed with scrambled eggs and fresh greens.", image: "/uploads/Egg_Hakka_Noodles.jpeg", veg: false, categoryId: "noodles_non_veg", rating: 4.6 },
  { id: "Chicken_Hakka_Noodles", name: "Chicken Hakka Noodles", price: 200, description: "Noodles wok-tossed with juicy shredded chicken cuts.", image: "/uploads/Chicken_Hakka_Noodles.jpeg", veg: false, categoryId: "noodles_non_veg", rating: 4.8 },
];

const REVIEWS = [
  { name: "Aarav Sharma", rating: 5, text: "The Dum Biryani is legendary. Best in Ranchi!", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80" },
  { name: "Priya Singh", rating: 5, text: "Paneer Butter Masala melts in your mouth. Absolutely divine.", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80" },
  { name: "Rohit Kumar", rating: 4, text: "Authentic Punjabi flavors. The kulcha is heavenly!", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80" },
  { name: "Anita Verma", rating: 5, text: "Gulab Jamuns were the highlight of our dinner.", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80" },
  { name: "Vikram Mehta", rating: 5, text: "Royal ambience, royal taste. Highly recommend.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80" },
];

async function main() {
  console.log("Cleaning up database...");
  await prisma.cateringRequest.deleteMany({});
  await prisma.supportTicket.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.reservation.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.dish.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.review.deleteMany({});

  console.log("Seeding root categories (pages)...");
  for (const page of ROOT_PAGES) {
    await prisma.category.create({ data: page });
  }

  console.log("Seeding subcategories...");
  for (const cat of CATEGORIES) {
    await prisma.category.create({ data: cat });
  }

  console.log("Seeding dishes...");
  for (const d of DISHES) {
    // Check if category exists before creating to prevent errors
    const cat = await prisma.category.findUnique({ where: { id: d.categoryId } });
    if (!cat) {
      console.warn(`WARNING: Category "${d.categoryId}" not found for dish "${d.name}". Skipping.`);
      continue;
    }
    await prisma.dish.create({ data: d });
  }

  console.log("Seeding reviews...");
  for (const rev of REVIEWS) {
    await prisma.review.create({ data: rev });
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
