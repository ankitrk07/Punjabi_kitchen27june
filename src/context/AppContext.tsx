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
  userEmail?: string;
};

export type User = {
  name: string;
  email: string;
  phone?: string;
  gender: "male" | "female";
  avatar?: string;
  favorites?: string[];
  membershipTier?: string;
  loyaltyPoints?: number;
  password?: string;
};

export type Reservation = {
  id: string;
  customerName: string;
  customerPhone: string;
  reservationDate: string;
  reservationSlot: string;
  guests: string;
  guestCount: number;
  status: "Active" | "Cancelled";
  tableNumber: number;
  occasion?: string;
  specialRequests?: string | null;
  seatingType?: string | null;
  occasionDate?: string | null;
  createdAt?: string;
  userEmail?: string;
};

export type CateringItem = {
  id: string;
  isOrder?: boolean;
  eventType?: string;
  eventName?: string;
  guests: number;
  date: string;
  phone?: string;
  address?: string;
  package?: string;
  details?: string;
  status: "Pending" | "Approved" | "Denied" | string;
  items?: { name: string; qty: number }[];
  total?: string;
  manager?: string;
  createdAt?: string;
  userEmail?: string;
};

export type SupportTicket = {
  id: string;
  subject: string;
  description: string;
  status: "In Progress" | "Resolved";
  priority: "High" | "Medium" | "Low";
  lastUpdate: string;
  createdAt: string;
  userEmail: string;
};

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: "Announcement" | "Offer" | "OrderUpdate";
  createdAt: string;
  userEmail?: string;
};

type AppState = {
  user: User | null;
  isAdmin: boolean;
  cart: CartItem[];
  addresses: Address[];
  selectedAddressId: string | null;
  selectedAddress: Address | null;
  orders: Order[];
  reservations: Reservation[];
  favorites: string[];
  highlightedDishId: string | null;
  setHighlightedDishId: (id: string | null) => void;
  // setHighlightedDishId duplicate removed
  cateringRequests: CateringItem[];
  supportTickets: SupportTicket[];
  notifications: NotificationItem[];
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
  toggleFavorite: (dishId: string) => Promise<void>;
  bookTable: (data: Omit<Reservation, "id" | "status" | "guestCount" | "tableNumber"> & { guestCount: number, tableNumber?: number }) => Promise<void>;
  cancelReservation: (id: string) => Promise<void>;

  // Admin & User Operations Functions
  addDish: (dish: Omit<Dish, "rating"> & { rating?: number }) => Promise<void>;
  updateDish: (id: string, dish: Partial<Dish>) => Promise<void>;
  deleteDish: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, "icon" | "image"> & { icon?: string, image?: string, parentId?: string | null }) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  createCateringRequest: (req: Omit<CateringItem, "id" | "status" | "isOrder">) => Promise<void>;
  updateCateringStatus: (id: string, status: "Approved" | "Denied") => Promise<void>;
  createSupportTicket: (ticket: Omit<SupportTicket, "id" | "status" | "createdAt" | "lastUpdate">) => Promise<void>;
  updateTicketStatus: (id: string, update: { status: "Resolved" | "In Progress"; lastUpdate: string }) => Promise<void>;
  broadcastNotification: (notif: Omit<NotificationItem, "id" | "createdAt">) => Promise<void>;
  refreshAllData: () => Promise<void>;
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  // ID of a dish that should be highlighted after navigation from Favorites
  const [highlightedDishId, setHighlightedDishId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [cateringRequests, setCateringRequests] = useState<CateringItem[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const cartBumpAnim = useRef(new Animated.Value(0)).current;

  const loadData = async (u: User) => {
    const isUserAdmin = u.email === "admin@punjabikitchen.com";
    setIsAdmin(isUserAdmin);

    try {
      // 1. Load menu categories & dishes
      const [cats, dishs] = await Promise.all([
        apiClient.getCategories().catch(() => []),
        apiClient.getDishes().catch(() => []),
      ]);
      if (cats.length > 0) setCategories(cats);
      if (dishs.length > 0) setDishes(dishs);

      // 2. Load orders (Admin loads all, user loads filtered)
      const apiOrders = await apiClient.getOrders(isUserAdmin ? undefined : u.email).catch(() => []);
      setOrders(apiOrders);

      // 3. Load reservations (Admin loads all, user loads filtered)
      const apiRes = await apiClient.getReservations(isUserAdmin ? undefined : u.email).catch(() => []);
      setReservations(apiRes);
      void storage.setItem("pk_reservations", apiRes);

      // 4. Load catering requests (Admin loads all, user loads filtered)
      const apiCatering = await apiClient.getCateringRequests(isUserAdmin ? undefined : u.email).catch(() => []);
      setCateringRequests(apiCatering);

      // 5. Load support tickets (Admin loads all, user loads filtered)
      const apiTickets = await apiClient.getSupportTickets(isUserAdmin ? undefined : u.email).catch(() => []);
      setSupportTickets(apiTickets);

      // 6. Load notifications (Admin loads all, user loads public+targeted)
      const apiNotifs = await apiClient.getNotifications(isUserAdmin ? undefined : u.email).catch(() => []);
      setNotifications(apiNotifs);
    } catch (err) {
      console.log("Error loading fresh app data:", err);
    }
  };

  useEffect(() => {
    (async () => {
      // WIPE favorites initially so dishes are never pre-liked
      await storage.setItem("pk_favorites", []);
      setFavorites([]);

      // 1. Initial load from local storage
      const savedRes = await storage.getItem<Reservation[] | null>("pk_reservations", null);
      if (savedRes && savedRes.length > 0) {
        setReservations(savedRes);
      }

      const u = await storage.getItem<User | null>("pk_user", null);
      if (u) {
        setUser(u);
        await loadData(u);

        // Fetch fresh profile details from server
        try {
          const apiUser = await apiClient.getUserProfile(u.email);
          if (apiUser) {
            const mergedUser: User = {
              name: apiUser.name,
              email: apiUser.email,
              phone: apiUser.phone ?? undefined,
              gender: apiUser.gender as any,
              avatar: apiUser.avatar || u.avatar,
              favorites: apiUser.favorites || [],
              membershipTier: apiUser.membershipTier,
              loyaltyPoints: apiUser.loyaltyPoints,
            };
            setUser(mergedUser);
            setAddresses(apiUser.addresses);
            if (apiUser.cart) {
              setCart(apiUser.cart as CartItem[]);
            }
            await storage.setItem("pk_user", mergedUser);
            await storage.setItem("pk_addresses", apiUser.addresses);
          }
        } catch (e) {
          console.log("Failed to sync profile in background on load:", e);
        }
      } else {
        // Not logged in: fetch public content
        try {
          const [cats, dishs, apiOrders, apiNotifs] = await Promise.all([
            apiClient.getCategories().catch(() => []),
            apiClient.getDishes().catch(() => []),
            apiClient.getOrders().catch(() => []),
            apiClient.getNotifications().catch(() => []),
          ]);
          if (cats.length > 0) setCategories(cats);
          if (dishs.length > 0) setDishes(dishs);
          setOrders(apiOrders);
          setNotifications(apiNotifs);
        } catch (e) {
          console.log("Failed to sync public dynamic content:", e);
        }
      }

      const savedAddresses = await storage.getItem<Address[] | null>("pk_addresses", null);
      if (savedAddresses && savedAddresses.length > 0) {
        setAddresses(savedAddresses);
      }
      const savedAddressId = await storage.getItem<string | null>("pk_selected_address_id", "a1");
      if (savedAddressId) setSelectedAddressId(savedAddressId);
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
    isAdmin,
    cart,
    addresses,
    selectedAddressId: selectedAddress?.id ?? null,
    selectedAddress,
    orders,
    reservations,
    favorites,
    cateringRequests,
    supportTickets,
    notifications,
    dishes,
    categories,
    cartBumpAnim,
    highlightedDishId,
    setHighlightedDishId,
    signIn: async (u) => {
      setUser(u);
      setIsAdmin(u.email === "admin@punjabikitchen.com");
      await storage.setItem("pk_user", u);
      try {
        const synced = await apiClient.syncUserProfile(u);
        if (synced) {
          const mergedUser: User = {
            name: synced.name,
            email: synced.email,
            phone: synced.phone ?? undefined,
            gender: synced.gender as any,
            avatar: synced.avatar || u.avatar,
            favorites: synced.favorites || [],
            membershipTier: synced.membershipTier,
            loyaltyPoints: synced.loyaltyPoints,
          };
          setUser(mergedUser);
          setAddresses(synced.addresses);
          if (synced.favorites) {
            setFavorites(synced.favorites);
            await storage.setItem("pk_favorites", synced.favorites);
          }
          await storage.setItem("pk_user", mergedUser);
          await storage.setItem("pk_addresses", synced.addresses);
        }

        // Fetch fresh data in backend based on role
        await loadData(u);
      } catch (e) {
        console.log("Failed to sync user on signIn:", e);
      }
    },
    signOut: async () => {
      setUser(null);
      setIsAdmin(false);
      setCart([]);
      setOrders([]);
      setReservations([]);
      setFavorites([]);
      setCateringRequests([]);
      setSupportTickets([]);
      setNotifications([]);
      await storage.removeItem("pk_user");
      await storage.removeItem("pk_addresses");
      await storage.removeItem("pk_selected_address_id");
      await storage.removeItem("pk_favorites");
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
        userEmail: user?.email ?? undefined,
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
      apiClient.cancelOrder(id).then((updated) => {
        setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
      }).catch((e) => {
        console.log("Failed to cancel order on backend:", e);
      });
    },
    processRefund: (id: string) => {
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, refund: { ...(o.refund ?? { status: "None", amount: 0 }), status: "Completed" } } : o)));
      apiClient.updateOrderStatus(id, "Cancelled").catch((e) => {
        console.log("Failed to process refund status on backend:", e);
      });
    },
    updateOrderStatus: (id: string, status: OrderStatus) => {
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
      apiClient.updateOrderStatus(id, status).catch((e) => {
        console.log("Failed to update status on backend:", e);
      });
    },
    addItemsToOrder: (orderId: string, itemsToAdd) => {
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== orderId) return o;
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
          const updatedOrder = { ...o, items: newItems, total: newTotal };
          
          apiClient.createOrder(updatedOrder).catch((e) => {
            console.log("Failed to sync modified order items to backend:", e);
          });
          
          return updatedOrder;
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
    toggleFavorite: async (dishId: string) => {
      setFavorites((prev) => {
        const next = prev.includes(dishId) ? prev.filter((id) => id !== dishId) : [...prev, dishId];
        void storage.setItem("pk_favorites", next);
        if (user) {
          apiClient.syncUserProfile({ email: user.email, favorites: next }).catch((e) => {
            console.log("Failed to sync favorites to backend:", e);
          });
        }
        return next;
      });
    },
    bookTable: async (data) => {
      const reservationData = {
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        reservationDate: data.reservationDate,
        reservationSlot: data.reservationSlot,
        guests: data.guests,
        guestCount: data.guestCount,
        tableNumber: data.tableNumber || 1,
        userEmail: user?.email ?? undefined,
        occasion: data.occasion,
        specialRequests: data.specialRequests,
        seatingType: data.seatingType,
      };

      try {
        const created = await apiClient.createReservation(reservationData);
        setReservations((prev) => {
          const next = [created, ...prev];
          void storage.setItem("pk_reservations", next);
          return next;
        });
      } catch (e) {
        console.log("Failed to book table on backend:", e);
        const fallback = {
          ...reservationData,
          id: `local-${Date.now()}`,
          status: "Active" as const,
          tableNumber: data.tableNumber || 1,
        };
        setReservations((prev) => {
          const next = [fallback, ...prev];
          void storage.setItem("pk_reservations", next);
          return next;
        });
      }
    },
    cancelReservation: async (id: string) => {
      setReservations((prev) => {
        const next = prev.map((r) => (r.id === id ? { ...r, status: "Cancelled" as const } : r));
        void storage.setItem("pk_reservations", next);
        return next;
      });
      try {
        await apiClient.cancelReservation(id);
      } catch (e) {
        console.log("Failed to cancel reservation on backend:", e);
      }
    },

    // Admin Operations
    addDish: async (dish) => {
      try {
        const created = await apiClient.addDish(dish);
        const mapped = { ...created, category: created.category || created.categoryId };
        setDishes((prev) => [...prev, mapped]);
      } catch (e) {
        console.log("Failed to add dish:", e);
      }
    },
    updateDish: async (id, dishData) => {
      try {
        const updated = await apiClient.updateDish(id, dishData);
        const mapped = { ...updated, category: updated.category || updated.categoryId };
        setDishes((prev) => prev.map((d) => (d.id === id ? mapped : d)));
      } catch (e) {
        console.log("Failed to update dish:", e);
      }
    },
    deleteDish: async (id) => {
      try {
        await apiClient.deleteDish(id);
        setDishes((prev) => prev.filter((d) => d.id !== id));
      } catch (e) {
        console.log("Failed to delete dish:", e);
      }
    },
    addCategory: async (category) => {
      try {
        const created = await apiClient.addCategory(category);
        setCategories((prev) => [...prev, created]);
      } catch (e) {
        console.log("Failed to add category:", e);
      }
    },
    updateCategory: async (id, categoryData) => {
      try {
        const updated = await apiClient.updateCategory(id, categoryData);
        setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
      } catch (e) {
        console.log("Failed to update category:", e);
      }
    },
    deleteCategory: async (id) => {
      try {
        await apiClient.deleteCategory(id);
        // Find all subcategories (including nested ones) to clean them up from local state
        const getSubcategoryIds = (catId: string): string[] => {
          const direct = categories.filter((c) => c.parentId === catId).map((c) => c.id);
          let all = [...direct];
          for (const dId of direct) {
            all = [...all, ...getSubcategoryIds(dId)];
          }
          return all;
        };
        const allIdsToDelete = [id, ...getSubcategoryIds(id)];

        setCategories((prev) => prev.filter((c) => !allIdsToDelete.includes(c.id)));
        setDishes((prev) => prev.filter((d) => !allIdsToDelete.includes(d.category)));
      } catch (e) {
        console.log("Failed to delete category:", e);
      }
    },
    createCateringRequest: async (reqData) => {
      try {
        const created = await apiClient.createCateringRequest({
          ...reqData,
          userEmail: user?.email,
        });
        setCateringRequests((prev) => [created, ...prev]);
      } catch (e) {
        console.log("Failed to create catering request:", e);
      }
    },
    updateCateringStatus: async (id, status) => {
      try {
        const updated = await apiClient.updateCateringStatus(id, status);
        setCateringRequests((prev) => prev.map((c) => (c.id === id ? updated : c)));
      } catch (e) {
        console.log("Failed to update catering request status:", e);
      }
    },
    createSupportTicket: async (ticketData) => {
      try {
        const created = await apiClient.createSupportTicket({
          ...ticketData,
          userEmail: user?.email || ticketData.userEmail,
        });
        setSupportTickets((prev) => [created, ...prev]);
      } catch (e) {
        console.log("Failed to create support ticket:", e);
      }
    },
    updateTicketStatus: async (id, update) => {
      try {
        const updated = await apiClient.updateTicketStatus(id, update);
        setSupportTickets((prev) => prev.map((t) => (t.id === id ? updated : t)));
      } catch (e) {
        console.log("Failed to update support ticket status:", e);
      }
    },
    broadcastNotification: async (notifData) => {
      try {
        const created = await apiClient.createNotification(notifData);
        setNotifications((prev) => [created, ...prev]);
      } catch (e) {
        console.log("Failed to broadcast notification:", e);
      }
    },
    refreshAllData: async () => {
      if (user) {
        await loadData(user);
      } else {
        try {
          const [cats, dishs, apiOrders, apiNotifs] = await Promise.all([
            apiClient.getCategories().catch(() => []),
            apiClient.getDishes().catch(() => []),
            apiClient.getOrders().catch(() => []),
            apiClient.getNotifications().catch(() => []),
          ]);
          if (cats.length > 0) setCategories(cats);
          if (dishs.length > 0) setDishes(dishs);
          setOrders(apiOrders);
          setNotifications(apiNotifs);
        } catch (e) {
          console.log("Failed to refresh guest content:", e);
        }
      }
    },
  }), [
    user,
    isAdmin,
    cart,
    addresses,
    selectedAddress,
    selectedAddressId,
    orders,
    reservations,
    favorites,
    cateringRequests,
    supportTickets,
    notifications,
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