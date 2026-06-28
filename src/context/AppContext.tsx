import { CATEGORIES, DISHES } from "@/src/data/menu";
import type { Category, Dish } from "@/src/data/menu";
import { storage } from "@/src/utils/storage";
import { apiClient } from "@/src/utils/apiClient";
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Animated } from "react-native";

const TAB_BAR_HIDE_THRESHOLD = 22;
const TAB_BAR_SHOW_THRESHOLD = 14;

export type CartItem = Dish & { qty: number };

export type Address = { id: string; label: string; line: string };

export type OrderStatus = "Placed" | "Preparing" | "Ready" | "On the Way" | "Delivered" | "Cancelled";
export type Order = {
  id: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  refund?: { status: "None" | "Pending" | "Completed"; amount: number };
  createdAt: number;
  mode: "Dine In" | "Takeaway" | "Delivery";
};

export type User = {
  name: string;
  email: string;
  phone?: string;
  gender: "male" | "female";
};

type AppState = {
  user: User | null;
  cart: CartItem[];
  addresses: Address[];
  selectedAddressId: string | null;
  selectedAddress: Address | null;
  orders: Order[];
  dishes: Dish[];
  categories: Category[];
  cartBumpAnim: Animated.Value;
  signIn: (u: User) => Promise<void>;
  signOut: () => Promise<void>;
  addToCart: (d: Dish) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  placeOrder: (mode: Order["mode"]) => Order;
  cancelOrder: (id: string) => void;
  processRefund: (id: string) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  addItemsToOrder: (
    orderId: string,
    items: {
      id: string;
      qty: number;
      name?: string;
      price?: number;
      image?: string;
    }[]
  ) => void;
  addAddress: (a: Omit<Address, "id">) => void;
  removeAddress: (id: string) => void;
  selectAddress: (id: string) => void;
  updateUser: (u: Partial<User>) => Promise<void>;
};

const AppContext = createContext<AppState | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [dishes, setDishes] = useState<Dish[]>(DISHES);
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [addresses, setAddresses] = useState<Address[]>([
    { id: "a1", label: "Home", line: "Ajit Enclave, New Barhi Toli, Ranchi 834001" },
  ]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>("a1");
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "ORD-1150",
      items: [
        {
          id: "d-chk-1",
          name: "Butter Chicken",
          price: 320,
          qty: 1,
          description: "Creamy tomato gravy with succulent chicken.",
          image: "https://images.unsplash.com/photo-1603496987351-f84a3ba5ec85?w=600&q=80",
          veg: false,
          category: "chicken",
          rating: 4.9,
        },
        {
          id: "d-naan-2",
          name: "Garlic Naan",
          price: 80,
          qty: 2,
          description: "Naan topped with garlic & fresh coriander.",
          image: "https://images.unsplash.com/photo-1626500155913-d2d3b80b7e76?w=600&q=80",
          veg: true,
          category: "naan",
          rating: 4.9,
        },
      ],
      total: 480,
      status: "Preparing",
      createdAt: Date.now() - 600000, // 10 mins ago
      mode: "Delivery",
    },
    {
      id: "ORD-1041",
      items: [
        {
          id: "d-chk-1",
          name: "Butter Chicken",
          price: 320,
          qty: 1,
          description: "Creamy tomato gravy with succulent chicken.",
          image: "https://images.unsplash.com/photo-1603496987351-f84a3ba5ec85?w=600&q=80",
          veg: false,
          category: "chicken",
          rating: 4.9,
        },
        {
          id: "d-naan-2",
          name: "Garlic Naan",
          price: 80,
          qty: 2,
          description: "Naan topped with garlic & fresh coriander.",
          image: "https://images.unsplash.com/photo-1626500155913-d2d3b80b7e76?w=600&q=80",
          veg: true,
          category: "naan",
          rating: 4.9,
        },
      ],
      total: 520,
      status: "Delivered",
      createdAt: Date.now() - 3600000 * 2, // 2 hours ago
      mode: "Delivery",
    },
    {
      id: "ORD-0982",
      items: [
        {
          id: "d-bir-3",
          name: "Veg Biryani",
          price: 220,
          qty: 2,
          description: "Mixed veggies cooked dum-style.",
          image: "https://images.unsplash.com/photo-1599043513900-ed6fe01d3833?w=600&q=80",
          veg: true,
          category: "biryani",
          rating: 4.6,
        },
      ],
      total: 480,
      status: "Delivered",
      createdAt: Date.now() - 3600000 * 24 * 3, // 3 days ago
      mode: "Takeaway",
    },
    {
      id: "ORD-0847",
      items: [
        {
          id: "d-chk-1",
          name: "Butter Chicken",
          price: 320,
          qty: 2,
          description: "Creamy tomato gravy with succulent chicken.",
          image: "https://images.unsplash.com/photo-1603496987351-f84a3ba5ec85?w=600&q=80",
          veg: false,
          category: "chicken",
          rating: 4.9,
        },
      ],
      total: 680,
      status: "Cancelled",
      refund: { status: "Completed", amount: 680 },
      createdAt: Date.now() - 3600000 * 24 * 7, // 7 days ago
      mode: "Delivery",
    },
  ]);
  const cartBumpAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      // 1. Initial load from local storage
      const u = await storage.getItem<User | null>("pk_user", null);
      if (u) {
        setUser(u);
        // 2. Fetch fresh user & address profile from API in background
        try {
          const apiUser = await apiClient.getUserProfile(u.email);
          if (apiUser) {
            setUser({ name: apiUser.name, email: apiUser.email, phone: apiUser.phone ?? undefined, gender: apiUser.gender as any });
            setAddresses(apiUser.addresses);
            if (apiUser.cart) {
              setCart(apiUser.cart as CartItem[]);
            }
            await storage.setItem("pk_user", apiUser);
            await storage.setItem("pk_addresses", apiUser.addresses);
          }
        } catch (e) {
          console.log("Failed to sync profile on load:", e);
        }
      }

      const savedAddresses = await storage.getItem<Address[] | null>("pk_addresses", null);
      if (savedAddresses && savedAddresses.length > 0) {
        setAddresses(savedAddresses);
      }
      const savedAddressId = await storage.getItem<string | null>("pk_selected_address_id", "a1");
      if (savedAddressId) setSelectedAddressId(savedAddressId);

      // 3. Fetch orders list from API in background
      try {
        const apiOrders = await apiClient.getOrders();
        if (apiOrders && apiOrders.length > 0) {
          setOrders(apiOrders);
        }
      } catch (e) {
        console.log("Failed to sync orders on load:", e);
      }

      // 4. Fetch dynamic dishes and categories from API
      try {
        const [cats, dishs] = await Promise.all([
          apiClient.getCategories(),
          apiClient.getDishes(),
        ]);
        if (cats && cats.length > 0) setCategories(cats);
        if (dishs && dishs.length > 0) setDishes(dishs);
      } catch (e) {
        console.log("Failed to sync dishes/categories on load:", e);
      }
    })();
  }, []);

  useEffect(() => {
    if (user?.email && cart) {
      apiClient.saveCart(user.email, cart).catch((e) => {
        console.log("Failed to sync cart to database:", e);
      });
    }
  }, [cart, user?.email]);

  useEffect(() => {
    if (addresses.length === 0) {
      if (selectedAddressId !== null) {
        setSelectedAddressId(null);
        void storage.removeItem("pk_selected_address_id");
      }
      return;
    }

    const selectedExists = selectedAddressId ? addresses.some((address) => address.id === selectedAddressId) : false;
    const fallbackAddressId = addresses[0]?.id ?? null;

    if (!selectedExists && fallbackAddressId && selectedAddressId !== fallbackAddressId) {
      setSelectedAddressId(fallbackAddressId);
      void storage.setItem("pk_selected_address_id", fallbackAddressId);
    }
  }, [addresses, selectedAddressId]);

  const bump = () => {
    cartBumpAnim.setValue(0);
    Animated.sequence([
      Animated.timing(cartBumpAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.timing(cartBumpAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start();
  };



  const selectedAddress = useMemo(() => addresses.find((address) => address.id === selectedAddressId) ?? addresses[0] ?? null, [addresses, selectedAddressId]);

  const value = useMemo<AppState>(() => ({
    user,
    cart,
    addresses,
    selectedAddressId: selectedAddress?.id ?? null,
    selectedAddress,
    orders,
    cartBumpAnim,
    signIn: async (u) => {
      setUser(u);
      await storage.setItem("pk_user", u);
      try {
        const synced = await apiClient.syncUserProfile(u);
        if (synced) {
          setUser({ name: synced.name, email: synced.email, phone: synced.phone ?? undefined, gender: synced.gender as any });
          setAddresses(synced.addresses);
          await storage.setItem("pk_addresses", synced.addresses);
        }
      } catch (e) {
        console.log("Failed to sync user on signIn:", e);
      }
    },
    signOut: async () => {
      setUser(null);
      await storage.removeItem("pk_user");
    },
    addToCart: (d) => {
      setCart((prev) => {
        const existing = prev.find((p) => p.id === d.id);
        if (existing) {
          return prev.map((p) => (p.id === d.id ? { ...p, qty: p.qty + 1 } : p));
        }
        return [...prev, { ...d, qty: 1 }];
      });
      bump();
    },
    removeFromCart: (id) => setCart((prev) => prev.filter((p) => p.id !== id)),
    updateQty: (id, qty) =>
      setCart((prev) => (qty <= 0 ? prev.filter((p) => p.id !== id) : prev.map((p) => (p.id === id ? { ...p, qty } : p)))),
    clearCart: () => setCart([]),
    placeOrder: (mode) => {
      const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
      const order: Order = {
        id: `ORD-${Date.now()}`,
        items: cart,
        total,
        status: "Placed",
        refund: { status: "None", amount: 0 },
        createdAt: Date.now(),
        mode,
      };
      setOrders((prev) => [order, ...prev]);
      setCart([]);

      apiClient.createOrder(order).catch((e) => {
        console.log("Failed to save order to backend:", e);
      });

      return order;
    },
    cancelOrder: (id: string) => {
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: "Cancelled", refund: { status: "Pending", amount: o.total } } : o)));
    },
    processRefund: (id: string) => {
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, refund: { ...(o.refund ?? { status: "None", amount: 0 }), status: "Completed" } } : o)));
    },
    updateOrderStatus: (id: string, status: OrderStatus) => {
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    },
    addItemsToOrder: (orderId: string, itemsToAdd) => {
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== orderId) return o;
          // merge items
          const itemsMap: Record<string, any> = {};
          o.items.forEach((it) => { itemsMap[it.id] = { ...it }; });
          itemsToAdd.forEach((it) => {
            if (itemsMap[it.id]) itemsMap[it.id].qty += it.qty;
            else {
              itemsMap[it.id] = { id: it.id, name: it.name ?? it.id, price: it.price ?? 0, qty: it.qty, image: it.image ?? "" };
            }
          });
          const newItems = Object.values(itemsMap);
          const newTotal = newItems.reduce((s: number, i: any) => s + i.price * i.qty, 0);
          return { ...o, items: newItems, total: newTotal };
        })
      );
    },
    addAddress: (a) => {
      const tempId = `a-${Date.now()}`;
      const tempAddress = { ...a, id: tempId };
      setAddresses((prev) => [...prev, tempAddress]);

      if (user) {
        apiClient.addAddress(user.email, a).then((serverAddress) => {
          setAddresses((prev) => {
            const next = prev.map((addr) => (addr.id === tempId ? serverAddress : addr));
            void storage.setItem("pk_addresses", next);
            return next;
          });
          if (!selectedAddressId) {
            setSelectedAddressId(serverAddress.id);
            void storage.setItem("pk_selected_address_id", serverAddress.id);
          }
        }).catch((e) => {
          console.log("Failed to add address on backend:", e);
        });
      }
    },
    removeAddress: (id) => {
      setAddresses((prev) => {
        const nextAddresses = prev.filter((a) => a.id !== id);
        void storage.setItem("pk_addresses", nextAddresses);
        if (selectedAddressId === id) {
          const nextSelectedId = nextAddresses[0]?.id ?? null;
          setSelectedAddressId(nextSelectedId);
          if (nextSelectedId) {
            void storage.setItem("pk_selected_address_id", nextSelectedId);
          } else {
            void storage.removeItem("pk_selected_address_id");
          }
        }
        return nextAddresses;
      });

      apiClient.removeAddress(id).catch((e) => {
        console.log("Failed to remove address on backend:", e);
      });
    },
    selectAddress: (id) => {
      setSelectedAddressId(id);
      void storage.setItem("pk_selected_address_id", id);
    },
    updateUser: async (patch) => {
      if (!user) return;
      const nu = { ...user, ...patch };
      setUser(nu);
      await storage.setItem("pk_user", nu);
      try {
        await apiClient.syncUserProfile(nu);
      } catch (e) {
        console.log("Failed to sync profile update on backend:", e);
      }
    },
    dishes,
    categories,
  }), [
    user,
    cart,
    addresses,
    selectedAddress,
    selectedAddressId,
    orders,
    dishes,
    categories,
    cartBumpAnim,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};