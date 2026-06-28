import ScreenHeader from "@/src/components/ScreenHeader";
import { colors } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const pastOrders = [
  { id: "ORD-1008", title: "Chicken Biryani", date: "12 Jun", amount: "₹420", status: "Delivered" },
  { id: "ORD-0994", title: "Dal Makhani Plate", date: "09 Jun", amount: "₹280", status: "Delivered" },
  { id: "ORD-0956", title: "Masala Dosa", date: "02 Jun", amount: "₹180", status: "Cancelled" },
];

export default function PastOrdersScreen() {
  return (
    <ScreenHeader title="Past Orders" backHref="/(tabs)/profile">
      <View style={styles.hero}>
        <Ionicons name="checkmark-done-circle-outline" size={22} color={colors.gold} />
        <View style={{ flex: 1 }}>
          <Text style={styles.heroTitle}>Your recent history</Text>
          <Text style={styles.heroText}>Review previous orders and reorder your favorites anytime.</Text>
        </View>
      </View>

      {pastOrders.map((order) => (
        <View key={order.id} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.orderId}>{order.id}</Text>
            <View style={[styles.badge, order.status === "Delivered" ? styles.badgeDelivered : styles.badgeCancelled]}>
              <Text style={styles.badgeText}>{order.status}</Text>
            </View>
          </View>
          <Text style={styles.title}>{order.title}</Text>
          <Text style={styles.meta}>{order.date} • {order.amount}</Text>
        </View>
      ))}
    </ScreenHeader>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: "row", gap: 12, alignItems: "center", backgroundColor: colors.surface, borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: colors.borderGold },
  heroTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: "800" },
  heroText: { color: colors.textSecondary, marginTop: 4, lineHeight: 18 },
  card: { backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  orderId: { color: colors.textPrimary, fontWeight: "700" },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  badgeDelivered: { backgroundColor: "rgba(76,217,123,0.16)" },
  badgeCancelled: { backgroundColor: "rgba(232,85,85,0.16)" },
  badgeText: { color: colors.gold, fontSize: 11, fontWeight: "700" },
  title: { color: colors.textPrimary, fontWeight: "700", marginBottom: 4 },
  meta: { color: colors.textSecondary },
});
