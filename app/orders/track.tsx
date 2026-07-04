import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, ScrollView, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "@/src/components/ScreenHeader";
import { useApp } from "@/src/context/AppContext";
import { colors } from "@/src/theme";
import LottieView from "lottie-react-native";
// import placedStatusAnim from "@/assets/placed-status.json";

const STEPS = [
  { key: "Placed", label: "Order Placed", desc: "We've received your order", icon: "checkmark-circle-outline" },
  { key: "Preparing", label: "Preparing in Kitchen", desc: "Chef Vipul is cooking your meal", icon: "restaurant-outline" },
  { key: "Ready", label: "Packed & Ready", desc: "Order packed in thermal bag", icon: "cube-outline" },
  { key: "On the Way", label: "Out for Delivery", desc: "Rider Ramesh is riding to your location", icon: "bicycle-outline" },
  { key: "Delivered", label: "Delivered", desc: "Enjoy your fresh meal!", icon: "home-outline" },
];

const EMOJI_MAP: Record<string, string> = {
  "Placed": "📝",
  "Preparing": "🍳",
  "Ready": "🛍️",
  "On the Way": "🏍️",
  "Delivered": "🎉",
  "Cancelled": "❌"
};

export default function TrackOrder() {
  const { orders } = useApp();
  const active = orders.find((o) => o.status !== "Delivered" && o.status !== "Cancelled") || orders[0];
  
  const pulse = useRef(new Animated.Value(0)).current;
  const mapProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start();

    // Map translation animation
    Animated.loop(
      Animated.timing(mapProgress, { toValue: 1, duration: 12000, useNativeDriver: false })
    ).start();
  }, []);

  const activeIdx = active ? STEPS.findIndex((s) => s.key === active.status) : -1;
  const pulseScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.45] });
  const pulseOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] });

  // Map progress position
  const riderLeft = mapProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ["12%", "78%"],
  });

  if (!active) {
    return (
      <ScreenHeader title="Track Order">
        <View style={styles.empty}>
          <Ionicons name="receipt-outline" size={56} color={colors.textSecondary} />
          <Text style={styles.emptyText}>No active orders found</Text>
        </View>
      </ScreenHeader>
    );
  }

  // Set default ETA based on 30 mins after creation
  const eta = new Date(active.createdAt + 30 * 60 * 1000);
  const formattedEta = eta.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <ScreenHeader title="Track Order">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* ─── Premium ETA Header Card ─── */}
        <View style={styles.etaCard}>
          <View style={styles.etaGlow} />
          <View style={styles.etaHeader}>
            <View>
              <Text style={styles.etaLabel}>ESTIMATED ARRIVAL</Text>
              <Text style={styles.etaTime}>{formattedEta}</Text>
            </View>
            <View style={styles.etaPill}>
              <Animated.View style={[styles.etaPulse, { transform: [{ scale: pulseScale }], opacity: pulseOpacity }]} />
              <Ionicons name="flash" size={12} color="#000" />
              <Text style={styles.etaPillText}>Live tracking</Text>
            </View>
          </View>
          
          <View style={styles.etaDivider} />
          
          <View style={styles.etaFooter}>
            <View style={styles.etaFooterCol}>
              <Text style={styles.etaFooterLabel}>Order Ref</Text>
              <Text style={styles.etaFooterVal}>#{String(active.id).slice(-6).toUpperCase()}</Text>
            </View>
            <View style={[styles.etaFooterDivider]} />
            <View style={styles.etaFooterCol}>
              <Text style={styles.etaFooterLabel}>Delivery Mode</Text>
              <Text style={styles.etaFooterVal}>{active.mode}</Text>
            </View>
            <View style={[styles.etaFooterDivider]} />
            <View style={styles.etaFooterCol}>
            <Text style={styles.etaFooterLabel}>Status</Text>
            <View style={styles.statusRow}>
              {active.status === "Placed" ? (
                <LottieView
                  source={require("../../assets/placed-status.json")}
                  autoPlay
                  loop={false}
                  style={{ width: 24, height: 24 }}
                />
              ) : (
                <Text style={styles.emojiText}>{EMOJI_MAP[active.status] ?? ""}</Text>
              )}
              <Text style={[styles.etaFooterVal, { color: colors.gold, marginLeft: 4 }]}> {active.status}</Text>
            </View>
          </View>
          </View>
        </View>

        {/* ─── Map Route Simulator HUD (Only visible when Out for Delivery / On the Way) ─── */}
        {active.status === "On the Way" && (
          <View style={styles.mapCard}>
            <Text style={styles.mapTitle}>RIDER ROUTE STATUS</Text>
            <View style={styles.mapCanvas}>
              <Text style={styles.mapNodeIcon}>🏬</Text>
              
              <View style={styles.mapTrackLine}>
                <View style={styles.mapTrackDashes} />
              </View>

              {/* Rider moving indicator */}
              <Animated.View style={[styles.mapRider, { left: riderLeft }]}>
                <View style={styles.riderInnerBlob} />
                <Text style={styles.mapRiderEmoji}>🛵</Text>
              </Animated.View>

              <Text style={styles.mapNodeIcon}>🏠</Text>
            </View>
            <View style={styles.mapFooter}>
              <Text style={styles.mapFooterText}>Ramesh Singh is 1.4 km away from your location</Text>
            </View>
          </View>
        )}

        {/* ─── Delivery Partner Profile Card ─── */}
        <View style={styles.riderCard}>
          <Image 
            source={{ uri: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80" }} 
            style={styles.riderAvatar}
          />
          <View style={styles.riderInfo}>
            <Text style={styles.riderName}>Ramesh Singh</Text>
            <View style={styles.riderRatingRow}>
              <Ionicons name="star" size={12} color={colors.gold} />
              <Text style={styles.riderRatingText}>4.9 (240+ deliveries)</Text>
            </View>
          </View>
          
          <View style={styles.riderActions}>
            <TouchableOpacity 
              style={styles.riderCallBtn}
              onPress={() => alert("Calling Ramesh Singh... Connecting call via Punjabi Kitchen relay.")}
              activeOpacity={0.8}
            >
              <Ionicons name="call" size={16} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.riderMsgBtn}
              onPress={() => alert("Opening chat dashboard... Ramesh: 'I will reach in 10 mins.'")}
              activeOpacity={0.8}
            >
              <Ionicons name="chatbubble-ellipses" size={16} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── Tracking Steps Timeline ─── */}
        <View style={styles.timelineCard}>
          <Text style={styles.sectionLabel}>DELIVERY PIPELINE</Text>
          
          <View style={styles.timelineContent}>
            {STEPS.map((s, idx) => {
              const done = idx <= activeIdx;
              const isCurrent = idx === activeIdx;
              
              return (
                <View key={s.key} style={styles.timelineRow}>
                  <View style={styles.timelineNodeCol}>
                    {isCurrent && (
                      <Animated.View style={[styles.nodePulse, { transform: [{ scale: pulseScale }], opacity: pulseOpacity }]} />
                    )}
                    <View style={[styles.nodeCircle, done && styles.nodeCircleDone, isCurrent && styles.nodeCircleCurrent]}>
                      <Ionicons 
                        name={isCurrent ? "ellipse" : done ? "checkmark" : (s.icon as any)} 
                        size={isCurrent ? 8 : done ? 11 : 12} 
                        color={done || isCurrent ? "#fff" : colors.textSecondary} 
                      />
                    </View>
                    {idx < STEPS.length - 1 && (
                      <View style={[styles.timelineConnector, idx < activeIdx && styles.timelineConnectorDone]} />
                    )}
                  </View>
                  
                  <View style={styles.timelineTextCol}>
                    <Text style={[styles.stepLabelText, done && styles.stepLabelTextDone]}>{s.label}</Text>
                    <Text style={styles.stepDescText}>{s.desc}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* ─── Order Summary Card ─── */}
        <View style={styles.itemsCard}>
          <Text style={styles.sectionLabel}>ORDER BREAKDOWN</Text>
          <View style={styles.itemsList}>
            {active.items.map((it) => (
              <View key={it.id} style={styles.itemRow}>
                <Text style={styles.itemName}>{it.name} <Text style={{ color: colors.textSecondary }}>× {it.qty}</Text></Text>
                <Text style={styles.itemPrice}>₹{it.price * it.qty}</Text>
              </View>
            ))}
            
            <View style={styles.itemsDivider} />
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Grand Total</Text>
              <Text style={styles.totalVal}>₹{active.total}</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </ScreenHeader>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 100,
    gap: 12,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  
  // ETA Card
  etaCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.25)",
    padding: 18,
    marginBottom: 16,
    position: "relative",
    overflow: "hidden",
  },
  etaGlow: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(212,175,55,0.06)",
  },
  etaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  etaLabel: {
    fontSize: 9,
    color: colors.textSecondary,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  etaTime: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FFF",
    marginTop: 4,
  },
  etaPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.gold,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
    position: "relative",
  },
  etaPulse: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    backgroundColor: colors.gold,
  },
  etaPillText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#000",
  },
  etaDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 14,
  },
  etaFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  etaFooterCol: {
    flex: 1,
    alignItems: "center",
  },
  etaFooterLabel: {
    fontSize: 8,
    color: colors.textSecondary,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  etaFooterVal: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginTop: 4,
  },
  etaFooterDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },

  // Map HUD
  mapCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 16,
  },
  mapTitle: {
    fontSize: 9,
    color: colors.textSecondary,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 14,
  },
  mapCanvas: {
    height: 60,
    backgroundColor: "rgba(255,255,255,0.01)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.02)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    position: "relative",
  },
  mapNodeIcon: {
    fontSize: 22,
    zIndex: 2,
  },
  mapTrackLine: {
    position: "absolute",
    left: 44,
    right: 44,
    height: 4,
    justifyContent: "center",
  },
  mapTrackDashes: {
    height: 2,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.4)",
    borderRadius: 1,
  },
  mapRider: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
    zIndex: 3,
  },
  riderInnerBlob: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(212,175,55,0.22)",
  },
  mapRiderEmoji: {
    fontSize: 20,
    transform: [{ scaleX: -1 }], // Flips 🛵 to face right (direction of travel)
  },
  mapFooter: {
    marginTop: 12,
    alignItems: "center",
  },
  mapFooterText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "600",
  },

  // Rider Card
  riderCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 16,
    gap: 12,
  },
  riderAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  riderInfo: {
    flex: 1,
  },
  riderName: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  riderRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  riderRatingText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  riderActions: {
    flexDirection: "row",
    gap: 8,
  },
  riderCallBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  riderMsgBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  // Timeline Card
  timelineCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: "900",
    color: colors.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  timelineContent: {
    paddingLeft: 6,
  },
  timelineRow: {
    flexDirection: "row",
    gap: 16,
    minHeight: 56,
  },
  timelineNodeCol: {
    alignItems: "center",
    width: 20,
  },
  nodePulse: {
    position: "absolute",
    top: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(34,197,94,0.2)",
  },
  nodeCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  nodeCircleDone: {
    backgroundColor: "#16a34a",
    borderColor: "#16a34a",
  },
  nodeCircleCurrent: {
    backgroundColor: "#22c55e",
    borderColor: "#22c55e",
  },
  timelineConnector: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    marginVertical: 2,
  },
  timelineConnectorDone: {
    backgroundColor: "#22c55e",
  },
  timelineTextCol: {
    flex: 1,
    paddingBottom: 16,
  },
  stepLabelText: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.textSecondary,
  },
  stepLabelTextDone: {
    color: "#FFF",
  },
  stepDescText: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Items Card
  itemsCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  itemsList: {
    marginTop: 4,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  itemName: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  itemPrice: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  itemsDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFF",
  },
  totalVal: { fontSize: 18, fontWeight: "900", color: colors.gold, },
  statusRow: { flexDirection: "row", alignItems: "center" },
  emojiText: { fontSize: 16 }
});