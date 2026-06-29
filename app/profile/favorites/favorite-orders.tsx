import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "@/src/components/ScreenHeader";
import { colors } from "@/src/theme";
import { useApp } from "@/src/context/AppContext";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const VegNonVegMarker = ({ veg }: { veg: boolean }) => {
  const color = veg ? "#10B981" : "#EF4444";
  return (
    <View style={[s.markerContainer, { borderColor: color }]}>
      <View style={[s.markerDot, { backgroundColor: color }]} />
    </View>
  );
};

export default function FavoriteOrdersScreen() {
  const { orders, addToCart } = useApp();
  const router = useRouter();

  const handleReorder = (items: any[]) => {
    items.forEach((item) => {
      addToCart(item);
    });
    router.push("/cart");
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Delivered":
        return { color: colors.success, bg: "rgba(16, 185, 129, 0.08)", borderColor: "rgba(16, 185, 129, 0.2)", icon: "checkmark-circle" as const };
      case "Cancelled":
        return { color: colors.error, bg: "rgba(239, 68, 68, 0.08)", borderColor: "rgba(239, 68, 68, 0.2)", icon: "close-circle" as const };
      case "Preparing":
      case "Placed":
      case "Ready":
      case "On the Way":
        return { color: colors.gold, bg: "rgba(212, 175, 55, 0.08)", borderColor: "rgba(212, 175, 55, 0.2)", icon: "time" as const };
      default:
        return { color: colors.textSecondary, bg: "rgba(255, 255, 255, 0.05)", borderColor: "rgba(255, 255, 255, 0.1)", icon: "help-circle" as const };
    }
  };

  return (
    <ScreenHeader title="Favourite Orders" backHref="/(tabs)/profile">
      <LinearGradient
        colors={["rgba(212, 175, 55, 0.12)", "rgba(20, 20, 20, 0)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.heroCard}
      >
        <View style={s.heroLeft}>
          <LinearGradient
            colors={[colors.goldBright, colors.gold]}
            style={s.heroIconContainer}
          >
            <Ionicons name="heart" size={18} color={colors.bg} />
          </LinearGradient>
        </View>
        <View style={s.heroContent}>
          <Text style={s.heroTitle}>Your Starred Orders</Text>
          <Text style={s.heroSubtitle}>Quick-order your most loved Punjabi feasts with one tap.</Text>
        </View>
      </LinearGradient>

      <Text style={s.label}>Orders you've loved and starred ❤️</Text>

      {orders.length === 0 ? (
        <View style={s.emptyContainer}>
          <View style={s.emptyIconContainer}>
            <Ionicons name="heart-dislike-outline" size={48} color={colors.goldDim} />
          </View>
          <Text style={s.emptyText}>No favourite orders found yet.</Text>
          <Text style={s.emptySubText}>Star your next order history to place them here!</Text>
          <TouchableOpacity style={s.menuBtn} onPress={() => router.push("/(tabs)/menu")} activeOpacity={0.8}>
            <LinearGradient
              colors={[colors.goldBright, colors.gold]}
              style={s.menuBtnGradient}
            >
              <Text style={s.menuBtnText}>Explore Punjabi Kitchen</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        orders.map((order) => {
          const statusStyle = getStatusStyle(order.status);
          return (
            <View key={order.id} style={s.card}>
              {/* Card Header */}
              <View style={s.cardHeader}>
                <View style={s.restLogoContainer}>
                  <LinearGradient
                    colors={["#1C1C1C", "#141414"]}
                    style={s.restLogo}
                  >
                    <Ionicons name="restaurant-outline" size={18} color={colors.gold} />
                  </LinearGradient>
                </View>
                <View style={s.restInfo}>
                  <Text style={s.restName}>Punjabi Kitchen – CP</Text>
                  <Text style={s.orderId}>Order #{order.id}</Text>
                  <View style={s.dateRow}>
                    <Ionicons name="calendar-outline" size={11} color={colors.textSecondary} />
                    <Text style={s.date}>{formatDate(order.createdAt)}</Text>
                  </View>
                </View>
                <View style={[s.statusBadge, { backgroundColor: statusStyle.bg, borderColor: statusStyle.borderColor }]}>
                  <Ionicons name={statusStyle.icon} size={11} color={statusStyle.color} />
                  <Text style={[s.statusText, { color: statusStyle.color }]}>{order.status}</Text>
                </View>
              </View>

              <View style={s.divider} />

              {/* Items List */}
              <View style={s.itemsList}>
                {order.items.map((item, i) => (
                  <View key={i} style={s.itemRow}>
                    <View style={s.itemRowLeft}>
                      <VegNonVegMarker veg={item.veg} />
                      <Text style={s.itemName} numberOfLines={1}>{item.name}</Text>
                    </View>
                    <View style={s.itemRowRight}>
                      <Text style={s.itemQty}>x{item.qty}</Text>
                      {item.rating && (
                        <View style={s.ratingBadge}>
                          <Ionicons name="star" size={9} color={colors.gold} />
                          <Text style={s.ratingValue}>{item.rating}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>

              <View style={s.divider} />

              {/* Card Footer */}
              <View style={s.footer}>
                <View style={s.totalContainer}>
                  <Text style={s.totalLabel}>Total Bill</Text>
                  <Text style={s.totalAmt}>₹{order.total}</Text>
                </View>
                <TouchableOpacity style={s.btn} onPress={() => handleReorder(order.items)} activeOpacity={0.85}>
                  <LinearGradient
                    colors={[colors.goldBright, colors.gold]}
                    style={s.btnGradient}
                  >
                    <Ionicons name="refresh-outline" size={14} color={colors.textInverse} />
                    <Text style={s.btnText}>Quick Reorder</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}
    </ScreenHeader>
  );
}

const s = StyleSheet.create({
  heroCard: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)",
    padding: 16,
    marginBottom: 20,
    alignItems: "center",
  },
  heroLeft: {
    marginRight: 14,
  },
  heroIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  heroContent: {
    flex: 1,
  },
  heroTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 3,
  },
  heroSubtitle: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 15,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  restLogoContainer: {
    marginRight: 12,
  },
  restLogo: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  restInfo: {
    flex: 1,
  },
  restName: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  orderId: {
    fontSize: 10,
    color: colors.gold,
    fontWeight: "700",
    marginTop: 2,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3,
  },
  date: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  itemsList: {
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.03)",
    padding: 12,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  itemRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  itemName: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  itemRowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  itemQty: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "rgba(212, 175, 55, 0.08)",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingValue: {
    fontSize: 9,
    fontWeight: "800",
    color: colors.gold,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalContainer: {
    justifyContent: "center",
  },
  totalLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  totalAmt: {
    color: colors.goldBright,
    fontSize: 18,
    fontWeight: "900",
    marginTop: 2,
  },
  btn: {
    borderRadius: 12,
    overflow: "hidden",
  },
  btnGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  btnText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.textInverse,
  },
  markerContainer: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderRadius: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  markerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(212, 175, 55, 0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 4,
  },
  emptySubText: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  menuBtn: {
    borderRadius: 14,
    overflow: "hidden",
  },
  menuBtnGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  menuBtnText: {
    color: colors.textInverse,
    fontWeight: "800",
    fontSize: 13,
  },
});
