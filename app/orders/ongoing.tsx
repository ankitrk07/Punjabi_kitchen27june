import ScreenHeader from "@/src/components/ScreenHeader";
import { colors } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const ongoingOrders = [
  {
    id: "ORD-1042",
    title: "Paneer Tikka Wrap",
    eta: "Arriving in 12 mins",
    status: "Cooking",
    amount: "₹248",
  },
  {
    id: "ORD-1045",
    title: "Butter Chicken Combo",
    eta: "Out for delivery",
    status: "On the way",
    amount: "₹520",
  },
];

export default function OngoingOrdersScreen() {
  return (
    <ScreenHeader title="Ongoing Orders" backHref="/(tabs)/profile">
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="timer-outline" size={20} color={colors.gold} />
        </View>
        <Text style={styles.heroTitle}>Your current orders</Text>
        <Text style={styles.heroText}>Track what is being prepared and on its way to you.</Text>
      </View>

      {ongoingOrders.map((order) => (
        <View key={order.id} style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.orderId}>{order.id}</Text>
            <View style={styles.statusPill}>
              <Text style={styles.statusText}>{order.status}</Text>
            </View>
          </View>

          <Text style={styles.orderTitle}>{order.title}</Text>
          <Text style={styles.orderEta}>{order.eta}</Text>

          <View style={styles.cardFooter}>
            <Text style={styles.orderAmount}>{order.amount}</Text>
            <View style={styles.trackRow}>
              <Ionicons name="location-outline" size={16} color={colors.gold} />
              <Text style={styles.trackText}>Track order</Text>
            </View>
          </View>
        </View>
      ))}
    </ScreenHeader>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderGold,
    padding: 16,
    marginBottom: 14,
  },
  heroIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(212,175,55,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  heroTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: "800", marginBottom: 4 },
  heroText: { color: colors.textSecondary, lineHeight: 20 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 12,
  },
  cardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  orderId: { color: colors.textPrimary, fontWeight: "700" },
  statusPill: {
    backgroundColor: "rgba(212,175,55,0.16)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: { color: colors.gold, fontSize: 11, fontWeight: "700" },
  orderTitle: { color: colors.textPrimary, fontSize: 15, fontWeight: "700", marginBottom: 4 },
  orderEta: { color: colors.textSecondary, marginBottom: 10 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  orderAmount: { color: colors.gold, fontWeight: "800" },
  trackRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  trackText: { color: colors.textPrimary, fontWeight: "600" },
});
