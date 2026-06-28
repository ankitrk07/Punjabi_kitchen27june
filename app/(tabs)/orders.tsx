import React, { useState, useEffect, useMemo, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Reanimated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, withDelay, withRepeat, withSequence, Easing } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "@/src/context/AppContext";
import { useTabBarAnimation } from "@/src/context/TabBarAnimationContext";
import { useTabBarScrollHandler } from "@/src/hooks/useTabBarScrollHandler";
import { DISHES } from "@/src/data/menu";
import { colors } from "@/src/theme";
import TopBar from "@/src/components/TopBar";
import DailyOffersCarousel from "@/src/components/DailyOffersCarousel";
import { storage } from "@/src/utils/storage";



// Sample offers for the carousel
const SAMPLE_OFFERS = [
  {
    id: "offer-1",
    title: "Butter Chicken Feast",
    subtitle: "25% off + complimentary naan",
    price: 499,
    image: "https://images.unsplash.com/photo-1604908177226-5c7b6a3a1b7b?q=80&w=1200&auto=format&fit=crop",
    badge: "HOT",
  },
  {
    id: "offer-2",
    title: "Green Garden Bowl",
    subtitle: "Buy 1 Get 1 (Veg Special)",
    price: 299,
    image: "https://images.unsplash.com/photo-1543352634-6f3d6f8b8b2c?q=80&w=1200&auto=format&fit=crop",
    badge: "VEG",
  },
  {
    id: "offer-3",
    title: "Decadent Chocolate Lava",
    subtitle: "Free scoop on orders above ₹399",
    price: 149,
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=1200&auto=format&fit=crop",
    badge: "DESSERT",
  },
];

type StatusKey = "Delivered" | "On the Way" | "Preparing" | "Ready" | string;

const STATUS_CONFIG: Record<StatusKey, { color: string; bg: string; icon: string }> = {
  "Delivered":  { color: colors.success, bg: "rgba(16,185,129,0.12)",  icon: "checkmark-circle-outline" },
  "On the Way": { color: colors.gold,    bg: "rgba(212,175,55,0.12)",   icon: "bicycle-outline"          },
  "Preparing":  { color: "#FF9F43",      bg: "rgba(255,159,67,0.12)",   icon: "flame-outline"            },
  "Ready":      { color: "#54A0FF",      bg: "rgba(84,160,255,0.12)",   icon: "bag-check-outline"        },
  "Cancelled":  { color: colors.error,   bg: "rgba(239,68,68,0.12)",    icon: "close-circle-outline"     },
};

const getStatus = (s: string) =>
  STATUS_CONFIG[s] ?? { color: colors.textSecondary, bg: "rgba(255,255,255,0.06)", icon: "ellipse-outline" };

const STEPS = ["Placed", "Preparing", "Ready", "On the Way", "Delivered"];
function stepIndex(status: string) {
  const idx = STEPS.indexOf(status);
  return idx === -1 ? 1 : idx;
}

const EMOJI_MAP: Record<string, string> = {
  "Placed": "📝",
  "Preparing": "🍳",
  "Ready": "🛍️",
  "On the Way": "🏍️",
  "Delivered": "🎉",
  "Cancelled": "❌"
};

// ─── Live Order progress card ────────────────────────────────────────────────
const LiveOrderCard = React.memo(function LiveOrderCard({ order, onPress }: { order: any; onPress: () => void }) {
  const { updateOrderStatus } = useApp();
  const pulseAnim = useSharedValue(1);
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(-15);
  
  // Emoji animations
  const emojiScale = useSharedValue(1);
  const emojiY = useSharedValue(0);

  // Interaction states
  const [showTimeline, setShowTimeline] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [cutlery, setCutlery] = useState(false);
  const [deliveryNote, setDeliveryNote] = useState("");
  const [gateCodeOpen, setGateCodeOpen] = useState(false);

  const currentStep = stepIndex(order.status);

  useEffect(() => {
    fadeAnim.value = withTiming(1, { duration: 400 });
    slideAnim.value = withSpring(0, { damping: 15 });
    pulseAnim.value = withTiming(1.3, { duration: 800 });
  }, [fadeAnim, slideAnim, pulseAnim]);

  useEffect(() => {
    // Pulse animation on status transition
    emojiScale.value = 0.5;
    emojiScale.value = withSpring(1, { damping: 10, stiffness: 180 });

    // Loop floating bob animation
    emojiY.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [order.status]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: slideAnim.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  const emojiAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: emojiScale.value },
      { translateY: emojiY.value }
    ]
  }));

  const handleNextStep = () => {
    const currentIdx = STEPS.indexOf(order.status);
    if (currentIdx < STEPS.length - 1) {
      const nextStatus = STEPS[currentIdx + 1];
      updateOrderStatus(order.id, nextStatus as any);
    }
  };

  const handlePrevStep = () => {
    const currentIdx = STEPS.indexOf(order.status);
    if (currentIdx > 0) {
      const prevStatus = STEPS[currentIdx - 1];
      updateOrderStatus(order.id, prevStatus as any);
    }
  };

  const handleResetSimulation = () => {
    updateOrderStatus(order.id, "Placed");
  };

  return (
    <Reanimated.View style={[s.liveCardContainer, animatedStyle]}>
      <TouchableOpacity style={s.liveCard} onPress={() => setShowTimeline(!showTimeline)} activeOpacity={0.95}>
        <View style={[s.bracket, s.bTL]} />
        <View style={[s.bracket, s.bTR]} />
        <View style={[s.bracket, s.bBL]} />
        <View style={[s.bracket, s.bBR]} />
        <View style={s.liveGlow} />

        <View style={s.liveHead}>
          <View style={s.livePillWrap}>
            <Reanimated.View style={[s.livePulseDot, pulseStyle]} />
            <View style={s.liveDotInner} />
            <Text style={s.liveLabel}>LIVE ORDER PROGRESS</Text>
            <Ionicons name={showTimeline ? "chevron-up" : "chevron-down"} size={11} color={colors.success} style={{ marginLeft: 4 }} />
          </View>
          <Text style={s.liveId}>#{String(order.id).slice(-6).toUpperCase()}</Text>
        </View>

        {/* Steps track */}
        <View style={s.progressWrap}>
          {STEPS.map((step, i) => {
            const done = i <= currentStep;
            const current = i === currentStep;
            return (
              <React.Fragment key={step}>
                <View style={s.stepCol}>
                  <View style={[s.stepDot, done && s.stepDotDone, current && s.stepDotCurrent]}>
                    {done && !current && <Ionicons name="checkmark" size={8} color="#000" />}
                    {current && <View style={s.stepDotInner} />}
                  </View>
                  <Text style={[s.stepLabel, done && s.stepLabelDone]}>{step}</Text>
                </View>
                {i < STEPS.length - 1 && (
                  <View style={[s.stepLine, i < currentStep && s.stepLineDone]} />
                )}
              </React.Fragment>
            );
          })}
        </View>

        {/* Support helper and quick actions */}
        <View style={s.helperRow}>
          <TouchableOpacity 
            style={[s.helperChip, cutlery && s.helperChipActive]} 
            onPress={() => {
              setCutlery(!cutlery);
              alert(cutlery ? "Eco-friendly cutlery removed." : "Eco-friendly cutlery added to your order.");
            }}
          >
            <Ionicons name="restaurant-outline" size={12} color={cutlery ? "#000" : colors.gold} />
            <Text style={[s.helperChipText, cutlery && s.helperChipTextActive]}>
              {cutlery ? "Cutlery Added" : "Add Cutlery"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[s.helperChip, !!deliveryNote && s.helperChipActive]} 
            onPress={() => {
              setGateCodeOpen(true);
            }}
          >
            <Ionicons name="chatbox-ellipses-outline" size={12} color={deliveryNote ? "#000" : colors.gold} />
            <Text style={[s.helperChipText, !!deliveryNote && s.helperChipTextActive]}>
              {deliveryNote ? "Note Added" : "Delivery Note"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={s.helperChip} 
            onPress={() => {
              alert("Calling Rider Ramesh... Please look out for a call from +91 98765 43210.");
            }}
          >
            <Ionicons name="call-outline" size={12} color={colors.gold} />
            <Text style={s.helperChipText}>Call Rider</Text>
          </TouchableOpacity>
        </View>

        {showTimeline && (
          <View style={s.timelineContainer}>
            <View style={s.timelineLine} />
            {[
              { time: "04:32 PM", title: "Order Confirmed", desc: "Punjabi Kitchen Connaught Place accepted your order.", done: currentStep >= 0 },
              { time: "04:35 PM", title: "Cooking Started", desc: "Chef Vipul is slow-cooking your Butter Chicken.", done: currentStep >= 1 },
              { time: "04:38 PM", title: "Food Packed", desc: "Tandoori items packed in thermal insulated bag.", done: currentStep >= 2 },
              { time: "04:40 PM", title: "Out for Delivery", desc: "Rider Ramesh picked up your hot order.", done: currentStep >= 3 },
              { time: "04:45 PM", title: "Delivered", desc: "Order delivered by Ramesh. Enjoy your meal!", done: currentStep >= 4 },
            ].map((t, idx) => (
              <View key={idx} style={s.timelineRow}>
                <View style={[s.timelineDot, t.done && s.timelineDotDone]} />
                <View style={{ flex: 1 }}>
                  <View style={s.timelineHeader}>
                    <Text style={[s.timelineTitle, t.done && s.timelineTitleDone]}>{t.title}</Text>
                    <Text style={s.timelineTime}>{t.time}</Text>
                  </View>
                  <Text style={[s.timelineDesc, t.done && s.timelineDescDone]}>{t.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={s.liveInfo}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Reanimated.Text style={[s.liveEmoji, emojiAnimatedStyle]}>
              {EMOJI_MAP[order.status] ?? "✨"}
            </Reanimated.Text>
            <View>
              <Text style={s.liveStatusLabel}>CURRENT STATUS</Text>
              <Text style={[s.liveStatus, { color: getStatus(order.status).color }]}>{order.status}</Text>
            </View>
          </View>
          <View style={s.liveTotalCol}>
            <Text style={s.liveTotalLabel}>TOTAL AMOUNT</Text>
            <Text style={s.liveTotal}>₹{order.total}</Text>
          </View>
        </View>

        <TouchableOpacity style={s.consoleToggle} onPress={() => setShowConsole(!showConsole)} activeOpacity={0.8}>
          <Ionicons name="construct-outline" size={13} color={colors.gold} />
          <Text style={s.consoleToggleText}>
            {showConsole ? "Hide Simulation Console" : "Open Simulation Console"}
          </Text>
          <Ionicons name={showConsole ? "chevron-up" : "chevron-down"} size={12} color={colors.gold} />
        </TouchableOpacity>

        {showConsole && (
          <View style={s.consoleContainer}>
            <Text style={s.consoleTitle}>ORDER SIMULATOR (TEST PANEL)</Text>
            <View style={s.consoleBtnRow}>
              <TouchableOpacity 
                style={[s.consoleBtn, currentStep === 0 && s.consoleBtnDisabled]} 
                onPress={handlePrevStep}
                disabled={currentStep === 0}
              >
                <Ionicons name="arrow-back-outline" size={12} color="#000" />
                <Text style={s.consoleBtnText}>Prev Stage</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[s.consoleBtn, currentStep === STEPS.length - 1 && s.consoleBtnDisabled]} 
                onPress={handleNextStep}
                disabled={currentStep === STEPS.length - 1}
              >
                <Text style={s.consoleBtnText}>Next Stage</Text>
                <Ionicons name="arrow-forward-outline" size={12} color="#000" />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={s.consoleResetBtn} 
              onPress={handleResetSimulation}
            >
              <Ionicons name="refresh-outline" size={12} color={colors.gold} />
              <Text style={s.consoleResetText}>Reset Order to Placed</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={s.trackBtnRow} onPress={onPress}>
          <Ionicons name="navigate-outline" size={14} color="#000" />
          <Text style={s.trackBtnText}>Track Delivery Executive</Text>
          <Ionicons name="arrow-forward" size={12} color="#000" style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Delivery Note Modal */}
      <Modal visible={gateCodeOpen} transparent animationType="fade" onRequestClose={() => setGateCodeOpen(false)}>
        <View style={styles.popupOverlay}>
          <View style={styles.ratingCard}>
            <Text style={styles.ratingTitle}>Add Delivery Instructions</Text>
            <Text style={styles.ratingSub}>Tell Rider Ramesh where to leave your food</Text>
            
            <TextInput
              style={styles.ratingInput}
              placeholder="e.g. Leave at gate, ring doorbell twice, etc."
              placeholderTextColor={colors.textSecondary}
              value={deliveryNote}
              onChangeText={setDeliveryNote}
            />

            <View style={styles.ratingActions}>
              <TouchableOpacity 
                style={styles.ratingSubmitBtn} 
                onPress={() => {
                  setGateCodeOpen(false);
                  if (deliveryNote.trim()) {
                    alert(`Delivery instruction saved: "${deliveryNote}"`);
                  }
                }}
              >
                <Text style={styles.ratingSubmitText}>Save Instruction</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.ratingCancelBtn} 
                onPress={() => {
                  setDeliveryNote("");
                  setGateCodeOpen(false);
                }}
              >
                <Text style={styles.ratingCancelText}>Clear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Reanimated.View>
  );
});

// ─── Order History Card ─────────────────────────────────────────────────────
const OrderCard = React.memo(function OrderCard({
  order,
  index,
  onCancel,
  onReorder,
  onRate,
  onInvoice,
  ratingValue,
}: {
  order: any;
  index: number;
  onCancel?: (id: string) => void;
  onReorder: (order: any) => void;
  onRate: (id: string) => void;
  onInvoice: (order: any) => void;
  ratingValue?: number;
}) {
  const router = useRouter();
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(20);
  const cfg = getStatus(order.status);

  useEffect(() => {
    fadeAnim.value = withDelay(index * 50, withTiming(1, { duration: 300 }));
    slideAnim.value = withSpring(0, { damping: 16, stiffness: 100 });
  }, [index, fadeAnim, slideAnim]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: slideAnim.value }],
  }));

  const dateObj = new Date(order.createdAt);
  const dateFmt = dateObj.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const timeFmt = dateObj.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const refCode = `#${String(order.id).slice(-6).toUpperCase()}`;

  const isCancellable = stepIndex(order.status) < 3 && order.status !== "Delivered" && order.status !== "Cancelled";

  return (
    <Reanimated.View style={[s.orderCardContainer, animatedStyle]}>
      <View style={s.orderCard}>
        <View style={[s.orderBar, { backgroundColor: cfg.color }]} />
        <View style={s.orderContent}>
          
          {/* Header Row */}
          <View style={s.orderHead}>
            <View style={s.orderIconWrap}>
              <Ionicons name={cfg.icon as any} size={14} color={cfg.color} />
            </View>
            <Text style={s.orderRef}>{refCode}</Text>
            <View style={[s.orderStatusPill, { backgroundColor: cfg.bg, borderColor: `${cfg.color}30` }]}>
              <Text style={[s.orderStatusText, { color: cfg.color }]}>{order.status}</Text>
            </View>
          </View>

          {/* Time & Mode Info */}
          <View style={s.metaRow}>
            <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
            <Text style={s.metaText}>{dateFmt} • {timeFmt}</Text>
            <View style={styles.modePill}>
              <Text style={styles.modeText}>{order.mode}</Text>
            </View>
          </View>

          {/* Ordered Items list */}
          <View style={s.itemsBlock}>
            {order.items.slice(0, 3).map((it: any, i: number) => (
              <View key={i} style={s.itemRow}>
                <View style={s.itemDot} />
                <Text style={s.itemName} numberOfLines={1}>{it.name}</Text>
                <Text style={s.itemQty}>x{it.qty}</Text>
              </View>
            ))}
            {order.items.length > 3 && (
              <Text style={s.itemMore}>+{order.items.length - 3} more items</Text>
            )}
          </View>

          {/* Divider */}
          <View style={s.cardDivider} />

          {/* Footer Pricing & Interactive Action Options */}
          <View style={s.orderFooter}>
            <View>
              <Text style={s.totalLabel}>TOTAL PRICE</Text>
              <Text style={s.orderTotal}>₹{order.total}</Text>
            </View>

            <View style={s.actionsContainer}>
              {order.status === "Delivered" && (
                <>
                  <TouchableOpacity style={s.secondaryActionBtn} onPress={() => onInvoice(order)}>
                    <Text style={s.secondaryActionText}>Receipt</Text>
                  </TouchableOpacity>
                  {ratingValue ? (
                    <View style={s.ratedBadge}>
                      <Ionicons name="star" size={11} color={colors.gold} />
                      <Text style={s.ratedText}>{ratingValue}.0 Rated</Text>
                    </View>
                  ) : (
                    <TouchableOpacity style={s.secondaryActionBtn} onPress={() => onRate(order.id)}>
                      <Text style={s.secondaryActionText}>Rate</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={s.secondaryActionBtn} onPress={() => router.push("/profile/support/live-chat")}>
                    <Text style={s.secondaryActionText}>Help</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.primaryActionBtn} onPress={() => onReorder(order)}>
                    <Ionicons name="refresh-outline" size={13} color="#000" />
                    <Text style={s.primaryActionText}>Reorder</Text>
                  </TouchableOpacity>
                </>
              )}

              {isCancellable && onCancel && (
                <TouchableOpacity style={s.cancelBtn} onPress={() => onCancel(order.id)}>
                  <Text style={s.cancelBtnText}>Cancel Order</Text>
                </TouchableOpacity>
              )}

              {order.status === "Cancelled" && order.refund && order.refund.status !== "None" && (
                <View style={s.refundBadge}>
                  <Text style={s.refundText}>Refund: {order.refund.status}</Text>
                </View>
              )}
            </View>
          </View>

        </View>
      </View>
    </Reanimated.View>
  );
});

// ─── Main Screen component ──────────────────────────────────────────────────
export default function Orders() {
  const router = useRouter();
  const { orders, addToCart, cancelOrder, updateOrderStatus } = useApp();
  const { animatedTranslateY, hiddenOffset } = useTabBarAnimation();
  const { onScroll } = useTabBarScrollHandler(animatedTranslateY, hiddenOffset);

  // States
  const [favoritesIds, setFavoritesIds] = useState<string[]>([]);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [ordersFilter, setOrdersFilter] = useState<"all"|"active"|"completed"|"cancelled">("all");
  const [statsExpanded, setStatsExpanded] = useState(false);
  const [configuratorOrder, setConfiguratorOrder] = useState<any | null>(null);
  const [configuratorItems, setConfiguratorItems] = useState<Record<string, { selected: boolean; qty: number }>>({});
  
  // Custom Modals
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [ratingId, setRatingId] = useState<string | null>(null);
  const [ratingsMap, setRatingsMap] = useState<Record<string, number>>({});
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingText, setRatingText] = useState("");
  
  // Stats Dashboard values
  const totalSpent = useMemo(() => orders.reduce((acc, o) => acc + o.total, 0), [orders]);
  const activeOrder = useMemo(() => orders.find((o) => o.status !== "Delivered" && o.status !== "Cancelled"), [orders]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const saved = await storage.getItem<string[]>("pk_favorites", []);
      if (mounted && saved && saved.length > 0) {
        setFavoritesIds(saved);
        return;
      }
      const freq: Record<string, number> = {};
      orders.forEach((o) => o.items.forEach((it: any) => { freq[it.id] = (freq[it.id] || 0) + (it.qty || 1); }));
      const popular = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([id]) => id);
      if (mounted && popular.length > 0) setFavoritesIds(popular);
    })();
    return () => { mounted = false; };
  }, [orders]);

  const toggleFavorite = async (id: string) => {
    setFavoritesIds((prev) => {
      const next = prev.includes(id) ? prev.filter((p) => p !== id) : [id, ...prev];
      void storage.setItem("pk_favorites", next);
      return next;
    });
  };

  const handleReorder = useCallback((order: any) => {
    order.items.forEach((it: any) => {
      addToCart({
        id: it.id,
        name: it.name,
        price: it.price,
        image: it.image || "",
        category: it.category || "Main",
        rating: it.rating || 4.8,
        veg: it.veg ?? true,
        description: it.description || "",
      });
    });
    alert("Reorder successful! All items added to your cart.");
  }, [addToCart]);

  const openReorderConfigurator = useCallback((order: any) => {
    const itemsState: Record<string, { selected: boolean; qty: number }> = {};
    order.items.forEach((it: any) => {
      itemsState[it.id] = { selected: true, qty: it.qty };
    });
    setConfiguratorItems(itemsState);
    setConfiguratorOrder(order);
  }, []);

  const handleRatingSubmit = () => {
    if (ratingId) {
      setRatingsMap((prev) => ({ ...prev, [ratingId]: ratingStars }));
    }
    alert(`Thank you for rating order with ${ratingStars} Stars!`);
    setRatingId(null);
    setRatingText("");
    setRatingStars(5);
  };

  const filteredOrders = useMemo(() => {
    if (ordersFilter === "all") return orders;
    if (ordersFilter === "active") return orders.filter((o) => o.status !== "Delivered" && o.status !== "Cancelled");
    if (ordersFilter === "completed") return orders.filter((o) => o.status === "Delivered");
    if (ordersFilter === "cancelled") return orders.filter((o) => o.status === "Cancelled");
    return orders;
  }, [orders, ordersFilter]);

  const avgOrderValue = useMemo(() => {
    if (orders.length === 0) return 0;
    return Math.round(totalSpent / orders.length);
  }, [orders.length, totalSpent]);

  const { vegCount, nonVegCount } = useMemo(() => {
    let veg = 0;
    let nonVeg = 0;
    orders.forEach((o) => {
      o.items.forEach((it) => {
        if (it.veg) veg += it.qty;
        else nonVeg += it.qty;
      });
    });
    if (veg === 0 && nonVeg === 0) {
      veg = 14;
      nonVeg = 8;
    }
    return { vegCount: veg, nonVegCount: nonVeg };
  }, [orders]);

  const vegPercentage = useMemo(() => {
    const total = vegCount + nonVegCount;
    if (total === 0) return 50;
    return Math.round((vegCount / total) * 100);
  }, [vegCount, nonVegCount]);

  const estimatedSavings = useMemo(() => {
    if (orders.length === 0) return 0;
    return Math.round(totalSpent * 0.15);
  }, [totalSpent, orders.length]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.ambientBlob1} />
      <View style={styles.ambientBlob2} />

      <TopBar variant="minimal" />

      <Reanimated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {/* Visual Hero Heading */}
        <View style={styles.heroRow}>
          <View>
            <Text style={styles.kicker}>TASTY RECORDS</Text>
            <Text style={styles.heroTitle}>Your Orders</Text>
          </View>
          <TouchableOpacity style={styles.heroFavBtn} activeOpacity={0.8} onPress={() => setFavoritesOpen(true)}>
            <Ionicons name="heart" size={14} color={colors.gold} />
            <Text style={styles.heroFavText}>Favorites</Text>
          </TouchableOpacity>
        </View>

        {/* Active Live Order status */}
        {activeOrder && (
          <View style={{ marginBottom: 20 }}>
            <Text style={styles.sectionLabel}>Active Order Tracking</Text>
            <LiveOrderCard order={activeOrder} onPress={() => router.push("/orders/track")} />
          </View>
        )}

        {/* Dynamic Order Stats Dashboard Banner */}
        <View style={styles.statsCardContainer}>
          <TouchableOpacity 
            style={styles.statsCard} 
            activeOpacity={0.9} 
            onPress={() => setStatsExpanded(!statsExpanded)}
          >
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{orders.length}</Text>
                <Text style={styles.statLabel}>Total Orders</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statValue}>₹{totalSpent}</Text>
                <Text style={styles.statLabel}>Total Spent</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: colors.gold }]}>Gold</Text>
                <Text style={styles.statLabel}>Tier Level</Text>
              </View>
            </View>

            <View style={styles.expandHeader}>
              <Text style={styles.expandText}>{statsExpanded ? "Hide Analytics Dashboard" : "Show Analytics Dashboard"}</Text>
              <Ionicons 
                name={statsExpanded ? "chevron-up" : "chevron-down"} 
                size={12} 
                color={colors.gold} 
              />
            </View>
          </TouchableOpacity>

          {statsExpanded && (
            <View style={styles.insightsContainer}>
              <View style={styles.insightsDivider} />
              
              <Text style={styles.insightTitle}>TASTY INSIGHTS</Text>
              
              {/* Stat breakdown */}
              <View style={styles.insightsRow}>
                <View style={styles.insightStatBox}>
                  <Text style={styles.insightStatValue}>₹{avgOrderValue}</Text>
                  <Text style={styles.insightStatLabel}>Avg Order Value</Text>
                </View>
                <View style={styles.insightStatBox}>
                  <Text style={styles.insightStatValue}>₹{estimatedSavings}</Text>
                  <Text style={styles.insightStatLabel}>Estimated Savings</Text>
                </View>
              </View>

              {/* Progress bars Veg/Non Veg */}
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Diet Preference</Text>
                  <Text style={styles.progressValue}>
                    {vegPercentage}% Veg / {100 - vegPercentage}% Non-Veg
                  </Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.vegProgressBar, { width: `${vegPercentage}%` }]} />
                  <View style={[styles.nonVegProgressBar, { width: `${100 - vegPercentage}%` }]} />
                </View>
              </View>

              {/* Tier Progress bar */}
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Platinum Upgrade Progress</Text>
                  <Text style={styles.progressValue}>{totalSpent} / 5,000 pts</Text>
                </View>
                <View style={styles.tierProgressBarBg}>
                  <View style={[styles.tierProgressBarFill, { width: `${Math.min(100, Math.round((totalSpent / 5000) * 100))}%` }]} />
                </View>
                <Text style={styles.progressSubText}>
                  {totalSpent >= 5000 
                    ? "🎉 Congratulations! You have reached Platinum level!" 
                    : `Order for ₹${Math.max(0, 5000 - totalSpent)} more to upgrade to Platinum and unlock Free Delivery.`}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Daily Dish Offers */}
        <View style={{ marginBottom: 24 }}>
          <Text style={styles.sectionLabel}>Special Daily Offers</Text>
          <DailyOffersCarousel offers={SAMPLE_OFFERS} />
        </View>



        {/* Orders list and Filter tab options */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>Order History</Text>
          <View style={styles.badge}><Text style={styles.badgeText}>{filteredOrders.length}</Text></View>
        </View>

        {/* Filter Slider */}
        <View style={styles.filterRow}>
          {([
            ["all", "All"],
            ["active", "Active"],
            ["completed", "Completed"],
            ["cancelled", "Cancelled"],
          ] as const).map(([key, label]) => (
            <TouchableOpacity
              key={key}
              style={[styles.filterChip, ordersFilter === key && styles.filterChipSelected]}
              onPress={() => setOrdersFilter(key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterChipText, ordersFilter === key && styles.filterChipTextSelected]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {filteredOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color={colors.gold} />
            <Text style={styles.emptyText}>No matching orders found</Text>
            <TouchableOpacity style={styles.browseBtn} onPress={() => router.push("/(tabs)/menu")}>
              <Text style={styles.browseBtnText}>Browse Fresh Menu</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredOrders.map((order, idx) => (
            <OrderCard
              key={order.id}
              order={order}
              index={idx}
              onCancel={cancelOrder}
              onReorder={openReorderConfigurator}
              onRate={setRatingId}
              onInvoice={setSelectedInvoice}
              ratingValue={ratingsMap[order.id]}
            />
          ))
        )}
      </Reanimated.ScrollView>

      {/* ─── Favorites Modal ─── */}
      <Modal visible={favoritesOpen} transparent animationType="fade" onRequestClose={() => setFavoritesOpen(false)}>
        <View style={styles.popupOverlay}>
          <View style={styles.popupCard}>
            <View style={styles.popupHeader}>
              <Text style={styles.popupTitle}>Saved Favorites</Text>
              <TouchableOpacity onPress={() => setFavoritesOpen(false)} style={styles.popupCloseBtn}>
                <Ionicons name="close" size={18} color="#FFF" />
              </TouchableOpacity>
            </View>
            {favoritesIds.length === 0 ? (
              <View style={styles.popupEmpty}>
                <Ionicons name="heart-dislike-outline" size={32} color={colors.gold} />
                <Text style={styles.popupEmptyText}>No favorites saved yet.</Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {favoritesIds.map((id) => {
                  const dish = DISHES.find((d) => d.id === id);
                  if (!dish) return null;
                  return (
                    <View key={dish.id} style={styles.popupItem}>
                      <Image source={{ uri: dish.image }} style={styles.popupItemImg} />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.popupItemTitle} numberOfLines={1}>{dish.name}</Text>
                        <Text style={styles.popupItemPrice}>₹{dish.price}</Text>
                      </View>
                      <TouchableOpacity onPress={() => toggleFavorite(dish.id)} style={{ marginRight: 10 }}>
                        <Ionicons name="heart" size={20} color={colors.gold} />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.popupAddBtn} onPress={() => addToCart(dish)}>
                        <Ionicons name="add" size={14} color="#000" />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* ─── View Invoice Modal ─── */}
      <Modal visible={!!selectedInvoice} transparent animationType="slide" onRequestClose={() => setSelectedInvoice(null)}>
        <View style={styles.invoiceOverlay}>
          <View style={styles.invoiceCard}>
            <View style={styles.popupHeader}>
              <Text style={styles.popupTitle}>Payment Receipt</Text>
              <TouchableOpacity onPress={() => setSelectedInvoice(null)} style={styles.popupCloseBtn}>
                <Ionicons name="close" size={18} color="#FFF" />
              </TouchableOpacity>
            </View>
            {selectedInvoice && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.invoiceRef}>Transaction ID: TXN-{String(selectedInvoice.id).slice(-8).toUpperCase()}</Text>
                <Text style={styles.invoiceDate}>Placed: {new Date(selectedInvoice.createdAt).toLocaleString("en-IN")}</Text>
                
                <View style={styles.invoiceDivider} />
                <Text style={styles.invoiceLabel}>Items Summary</Text>
                {selectedInvoice.items.map((it: any, i: number) => (
                  <View key={i} style={styles.invoiceItemRow}>
                    <Text style={styles.invoiceItemText}>{it.name} x {it.qty}</Text>
                    <Text style={styles.invoiceItemVal}>₹{it.price * it.qty}</Text>
                  </View>
                ))}

                <View style={styles.invoiceDivider} />
                <View style={styles.invoiceItemRow}>
                  <Text style={styles.invoiceMetaText}>Subtotal</Text>
                  <Text style={styles.invoiceMetaText}>₹{selectedInvoice.total - 40}</Text>
                </View>
                <View style={styles.invoiceItemRow}>
                  <Text style={styles.invoiceMetaText}>GST & Restaurant Taxes</Text>
                  <Text style={styles.invoiceMetaText}>₹25</Text>
                </View>
                <View style={styles.invoiceItemRow}>
                  <Text style={styles.invoiceMetaText}>Delivery Partner Fee</Text>
                  <Text style={styles.invoiceMetaText}>₹15</Text>
                </View>
                
                <View style={styles.invoiceDivider} />
                <View style={styles.invoiceItemRow}>
                  <Text style={[styles.invoiceItemText, { color: colors.gold }]}>Net Paid Amount</Text>
                  <Text style={styles.invoiceTotal}>₹{selectedInvoice.total}</Text>
                </View>

                {/* PDF download receipt button option */}
                <TouchableOpacity
                  style={styles.invoiceDownloadBtn}
                  onPress={() => alert("Downloading PDF Invoice...")}
                  activeOpacity={0.8}
                >
                  <Ionicons name="download-outline" size={14} color="#000" />
                  <Text style={styles.invoiceDownloadText}>Download PDF Receipt</Text>
                </TouchableOpacity>

                <View style={styles.secureBadge}>
                  <Ionicons name="shield-checkmark-outline" size={14} color={colors.success} />
                  <Text style={styles.secureText}>Paid securely via Digital UPI</Text>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* ─── Rate Order Modal ─── */}
      <Modal visible={!!ratingId} transparent animationType="fade" onRequestClose={() => setRatingId(null)}>
        <View style={styles.popupOverlay}>
          <View style={styles.ratingCard}>
            <Text style={styles.ratingTitle}>Rate Your Meal Experience</Text>
            <Text style={styles.ratingSub}>How was the quality of Punjabi Kitchen dishes?</Text>
            
            {/* Stars Row */}
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRatingStars(star)}>
                  <Ionicons name={star <= ratingStars ? "star" : "star-outline"} size={36} color={colors.gold} />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.ratingInput}
              placeholder="Write a comment about our delivery or taste... (Optional)"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
              value={ratingText}
              onChangeText={setRatingText}
            />

            <View style={styles.ratingActions}>
              <TouchableOpacity style={styles.ratingSubmitBtn} onPress={handleRatingSubmit}>
                <Text style={styles.ratingSubmitText}>Submit Feedback</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.ratingCancelBtn} onPress={() => setRatingId(null)}>
                <Text style={styles.ratingCancelText}>Skip</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ─── Advanced Reorder Configurator Modal ─── */}
      <Modal visible={!!configuratorOrder} transparent animationType="slide" onRequestClose={() => setConfiguratorOrder(null)}>
        <View style={styles.invoiceOverlay}>
          <View style={styles.invoiceCard}>
            <View style={styles.popupHeader}>
              <Text style={styles.popupTitle}>Customize Reorder</Text>
              <TouchableOpacity onPress={() => setConfiguratorOrder(null)} style={styles.popupCloseBtn}>
                <Ionicons name="close" size={18} color="#FFF" />
              </TouchableOpacity>
            </View>

            {configuratorOrder && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.invoiceRef}>Order ref: #{String(configuratorOrder.id).slice(-6).toUpperCase()}</Text>
                <Text style={styles.invoiceDate}>Choose which items you'd like to reorder:</Text>

                <View style={styles.invoiceDivider} />

                {configuratorOrder.items.map((it: any) => {
                  const state = configuratorItems[it.id] || { selected: false, qty: 0 };
                  return (
                    <View key={it.id} style={styles.configItemRow}>
                      <TouchableOpacity 
                        style={styles.configCheckbox} 
                        onPress={() => setConfiguratorItems(prev => ({
                          ...prev,
                          [it.id]: { ...prev[it.id], selected: !prev[it.id].selected }
                        }))}
                      >
                        <Ionicons 
                          name={state.selected ? "checkbox" : "square-outline"} 
                          size={20} 
                          color={state.selected ? colors.gold : colors.textSecondary} 
                        />
                      </TouchableOpacity>

                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={[styles.configItemName, !state.selected && { color: colors.textSecondary }]}>
                          {it.name}
                        </Text>
                        <Text style={styles.configItemPrice}>₹{it.price}</Text>
                      </View>

                      {state.selected && (
                        <View style={styles.configQtyContainer}>
                          <TouchableOpacity 
                            style={styles.configQtyBtn}
                            onPress={() => {
                              if (state.qty > 1) {
                                setConfiguratorItems(prev => ({
                                  ...prev,
                                  [it.id]: { ...prev[it.id], qty: prev[it.id].qty - 1 }
                                }));
                              }
                            }}
                          >
                            <Ionicons name="remove" size={12} color="#FFF" />
                          </TouchableOpacity>
                          <Text style={styles.configQtyText}>{state.qty}</Text>
                          <TouchableOpacity 
                            style={styles.configQtyBtn}
                            onPress={() => {
                              setConfiguratorItems(prev => ({
                                ...prev,
                                [it.id]: { ...prev[it.id], qty: prev[it.id].qty + 1 }
                              }));
                            }}
                          >
                            <Ionicons name="add" size={12} color="#FFF" />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  );
                })}

                <View style={styles.invoiceDivider} />

                {/* Compute total of selected items */}
                {(() => {
                  const total = configuratorOrder.items.reduce((sum: number, it: any) => {
                    const state = configuratorItems[it.id];
                    if (state && state.selected) {
                      return sum + it.price * state.qty;
                    }
                    return sum;
                  }, 0);

                  return (
                    <>
                      <View style={styles.invoiceItemRow}>
                        <Text style={styles.invoiceItemText}>Selected Items Total</Text>
                        <Text style={styles.invoiceTotal}>₹{total}</Text>
                      </View>

                      <TouchableOpacity
                        style={[styles.invoiceDownloadBtn, total === 0 && { opacity: 0.5 }]}
                        disabled={total === 0}
                        onPress={() => {
                          // Add items to cart
                          configuratorOrder.items.forEach((it: any) => {
                            const state = configuratorItems[it.id];
                            if (state && state.selected) {
                              // Add multiple quantity of this item
                              for (let count = 0; count < state.qty; count++) {
                                addToCart({
                                  id: it.id,
                                  name: it.name,
                                  price: it.price,
                                  image: it.image || "",
                                  category: it.category || "Main",
                                  rating: it.rating || 4.8,
                                  veg: it.veg ?? true,
                                  description: it.description || "",
                                });
                              }
                            }
                          });
                          alert("Reorder successful! Selected items added to your cart.");
                          setConfiguratorOrder(null);
                        }}
                      >
                        <Ionicons name="cart-outline" size={16} color="#000" />
                        <Text style={styles.invoiceDownloadText}>Add Selected Items to Cart</Text>
                      </TouchableOpacity>
                    </>
                  );
                })()}

              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

// ─── Style Configurations ──────────────────────────────────────────────────
const s = StyleSheet.create({
  liveCardContainer: {
    marginBottom: 20,
  },
  liveCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "rgba(212,175,55,0.4)",
    padding: 16,
    overflow: "hidden",
    position: "relative",
  },
  bracket: {
    position: "absolute",
    width: 14,
    height: 14,
    borderColor: colors.gold,
  },
  bTL: { top: 10, left: 10, borderTopWidth: 1.5, borderLeftWidth: 1.5 },
  bTR: { top: 10, right: 10, borderTopWidth: 1.5, borderRightWidth: 1.5 },
  bBL: { bottom: 10, left: 10, borderBottomWidth: 1.5, borderLeftWidth: 1.5 },
  bBR: { bottom: 10, right: 10, borderBottomWidth: 1.5, borderRightWidth: 1.5 },
  liveGlow: {
    position: "absolute",
    top: -50,
    left: "20%",
    width: "60%",
    height: 100,
    backgroundColor: "rgba(212, 175, 55, 0.08)",
    borderRadius: 50,
  },
  liveHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  livePillWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16,185,129,0.12)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.22)",
    position: "relative",
  },
  livePulseDot: {
    position: "absolute",
    left: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(16,185,129,0.3)",
  },
  liveDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  liveLabel: {
    color: colors.success,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginLeft: 12,
  },
  liveId: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: "700",
  },
  progressWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  stepCol: {
    alignItems: "center",
  },
  stepDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#181818",
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotDone: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  stepDotCurrent: {
    backgroundColor: "#22c55e",
    borderColor: "#22c55e",
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  stepDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#fff",
  },
  stepLabel: {
    fontSize: 8,
    color: colors.textSecondary,
    fontWeight: "600",
    marginTop: 4,
  },
  stepLabelDone: {
    color: colors.textPrimary,
  },
  stepLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: colors.border,
    marginBottom: 10,
  },
  stepLineDone: {
    backgroundColor: colors.gold,
  },
  liveInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 14,
    marginBottom: 14,
  },
  liveStatusLabel: {
    fontSize: 8,
    color: colors.textSecondary,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  liveStatus: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 2,
  },
  liveTotalCol: {
    alignItems: "flex-end",
  },
  liveTotalLabel: {
    fontSize: 8,
    color: colors.textSecondary,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  liveTotal: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.gold,
    marginTop: 2,
  },
  trackBtnRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gold,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  trackBtnText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "bold",
  },
  orderCardContainer: {
    marginBottom: 12,
  },
  orderCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    overflow: "hidden",
  },
  orderBar: {
    width: 4,
  },
  orderContent: {
    flex: 1,
    padding: 14,
  },
  orderHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  orderIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.03)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  orderRef: {
    flex: 1,
    fontSize: 12,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginLeft: 10,
  },
  orderStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  orderStatusText: {
    fontSize: 9,
    fontWeight: "bold",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 6,
  },
  metaText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  itemsBlock: {
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 8,
  },
  itemDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gold,
  },
  itemName: {
    flex: 1,
    fontSize: 12,
    color: colors.textPrimary,
  },
  itemQty: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  itemMore: {
    fontSize: 10,
    color: colors.textSecondary,
    fontStyle: "italic",
    marginTop: 2,
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 10,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 8,
    color: colors.textSecondary,
    fontWeight: "bold",
  },
  orderTotal: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginTop: 2,
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  primaryActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.gold,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  primaryActionText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#000",
  },
  secondaryActionBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    justifyContent: "center",
  },
  secondaryActionText: {
    fontSize: 11,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: colors.error,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  cancelBtnText: {
    fontSize: 11,
    color: colors.error,
    fontWeight: "bold",
  },
  refundBadge: {
    backgroundColor: "rgba(239,68,68,0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  refundText: {
    fontSize: 10,
    color: colors.error,
    fontWeight: "700",
  },
  timelineContainer: {
    marginTop: 10,
    marginBottom: 16,
    paddingLeft: 12,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    marginLeft: 6,
    gap: 12,
  },
  timelineLine: {
    position: "absolute",
    top: 4,
    bottom: 4,
    left: -1,
    width: 1,
    backgroundColor: colors.border,
  },
  timelineRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  timelineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
    marginLeft: -15,
    marginTop: 5,
  },
  timelineDotDone: {
    backgroundColor: colors.success,
  },
  timelineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  timelineTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  timelineTime: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  timelineDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  ratedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(212,175,55,0.08)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.2)",
    gap: 3,
  },
  ratedText: {
    fontSize: 10,
    color: colors.gold,
    fontWeight: "700",
  },
  helperRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 14,
  },
  helperChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.02)",
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  helperChipActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  helperChipText: {
    fontSize: 9,
    color: colors.textPrimary,
    fontWeight: "bold",
  },
  helperChipTextActive: {
    color: "#000",
  },
  consoleToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 6,
    marginBottom: 10,
  },
  consoleToggleText: {
    fontSize: 10,
    color: colors.gold,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  consoleContainer: {
    backgroundColor: "rgba(255,255,255,0.01)",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.2)",
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
    alignItems: "center",
  },
  consoleTitle: {
    fontSize: 8,
    fontWeight: "900",
    color: colors.gold,
    letterSpacing: 1,
    marginBottom: 8,
  },
  consoleBtnRow: {
    flexDirection: "row",
    gap: 8,
    width: "100%",
  },
  consoleBtn: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: colors.gold,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  consoleBtnDisabled: {
    backgroundColor: "rgba(255,255,255,0.05)",
    opacity: 0.5,
  },
  consoleBtnText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#000",
  },
  consoleResetBtn: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  consoleResetText: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.gold,
  },
  timelineTitleDone: {
    color: colors.textPrimary,
    fontWeight: "900",
  },
  timelineDescDone: {
    color: colors.textPrimary,
  },
  liveEmoji: {
    fontSize: 28,
  },
  riderContainer: {
    position: "absolute",
    top: -4,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  riderEmoji: {
    fontSize: 16,
  },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0A0A0A" },
  scroll: { padding: 16, paddingBottom: 130 },
  ambientBlob1: {
    position: "absolute", top: -80, right: -80,
    width: 260, height: 260, borderRadius: 130,
    backgroundColor: "rgba(212,175,55,0.04)",
  },
  ambientBlob2: {
    position: "absolute", bottom: 120, left: -90,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: "rgba(212,175,55,0.03)",
  },
  heroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  kicker: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 4,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFF",
    marginTop: 4,
  },
  heroFavBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    gap: 6,
  },
  heroFavText: {
    fontSize: 11,
    color: "#FFF",
    fontWeight: "bold",
  },
  statsCardContainer: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    overflow: "hidden",
  },
  statsCard: {
    paddingTop: 12,
    paddingBottom: 8,
  },
  statsRow: {
    flexDirection: "row",
  },
  expandHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    gap: 4,
  },
  expandText: {
    fontSize: 10,
    color: colors.gold,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  insightsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  insightsDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 14,
  },
  insightTitle: {
    fontSize: 9,
    fontWeight: "900",
    color: colors.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  insightsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },
  insightStatBox: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.02)",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
  },
  insightStatValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFF",
  },
  insightStatLabel: {
    fontSize: 9,
    color: colors.textSecondary,
    marginTop: 2,
  },
  progressSection: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  progressValue: {
    fontSize: 9,
    color: colors.gold,
    fontWeight: "700",
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.04)",
    flexDirection: "row",
    overflow: "hidden",
  },
  vegProgressBar: {
    height: "100%",
    backgroundColor: colors.success,
  },
  nonVegProgressBar: {
    height: "100%",
    backgroundColor: colors.error,
  },
  tierProgressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.04)",
    overflow: "hidden",
  },
  tierProgressBarFill: {
    height: "100%",
    backgroundColor: colors.gold,
  },
  progressSubText: {
    fontSize: 9,
    color: colors.textSecondary,
    marginTop: 6,
    lineHeight: 12,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 9,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    height: "100%",
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.gold,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  badge: {
    backgroundColor: "rgba(212,175,55,0.12)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.25)",
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: colors.gold,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: "center",
  },
  filterChipSelected: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: "bold",
    color: colors.textSecondary,
  },
  filterChipTextSelected: {
    color: "#000",
  },
  modePill: {
    backgroundColor: "rgba(255,255,255,0.03)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modeText: {
    fontSize: 9,
    color: colors.gold,
    fontWeight: "700",
  },
  emptyState: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 30,
    alignItems: "center",
    marginTop: 10,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 16,
  },
  browseBtn: {
    backgroundColor: colors.gold,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  browseBtnText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 12,
  },
  popupOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  popupCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    maxHeight: "70%",
  },
  popupHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  popupTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  popupCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  popupEmpty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 8,
  },
  popupEmptyText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  popupItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  popupItemImg: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  popupItemTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  popupItemPrice: {
    fontSize: 12,
    color: colors.gold,
    fontWeight: "bold",
    marginTop: 2,
  },
  popupAddBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  invoiceOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "flex-end",
  },
  invoiceCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    maxHeight: "80%",
  },
  invoiceRef: {
    fontSize: 12,
    color: colors.gold,
    fontWeight: "bold",
    marginBottom: 4,
  },
  invoiceDate: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  invoiceDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  invoiceLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 10,
  },
  invoiceItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  invoiceItemText: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  invoiceItemVal: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: "bold",
  },
  invoiceMetaText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  invoiceTotal: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.gold,
  },
  secureBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    justifyContent: "center",
    backgroundColor: "rgba(16,185,129,0.06)",
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 20,
  },
  secureText: {
    fontSize: 11,
    color: colors.success,
    fontWeight: "600",
  },
  ratingCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    alignItems: "center",
    width: "100%",
  },
  ratingTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  ratingSub: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 20,
  },
  starsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  ratingInput: {
    backgroundColor: "rgba(255,255,255,0.02)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
    padding: 12,
    width: "100%",
    height: 80,
    textAlignVertical: "top",
    fontSize: 13,
    marginBottom: 20,
  },
  ratingActions: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  ratingSubmitBtn: {
    flex: 2,
    backgroundColor: colors.gold,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
  },
  ratingSubmitText: {
    color: "#000",
    fontSize: 13,
    fontWeight: "bold",
  },
  ratingCancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
  },
  ratingCancelText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "bold",
  },
  invoiceDownloadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gold,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    marginTop: 14,
  },
  invoiceDownloadText: {
    fontSize: 12,
    color: "#000",
    fontWeight: "bold",
  },
  configItemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  configCheckbox: {
    padding: 4,
  },
  configItemName: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  configItemPrice: {
    fontSize: 12,
    color: colors.gold,
    fontWeight: "bold",
    marginTop: 2,
  },
  configQtyContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 4,
    paddingVertical: 2,
    gap: 8,
  },
  configQtyBtn: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  configQtyText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
    minWidth: 14,
    textAlign: "center",
  },
});