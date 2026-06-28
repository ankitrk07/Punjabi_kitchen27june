import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "@/src/components/ScreenHeader";
import { colors } from "@/src/theme";

const UPDATES = [
  { id: "1", title: "Order Delivered 🎉", body: "Your order #ORD-1041 (Dal Makhani + Naan) has been delivered. Enjoy your meal!", time: "5 min ago", icon: "checkmark-circle", iconColor: colors.success, read: false },
  { id: "2", title: "Out for Delivery 🛵", body: "Your order #ORD-1041 is on the way! Your rider Ramesh is 3 mins away.", time: "18 min ago", icon: "bicycle-outline", iconColor: "#34d399", read: false },
  { id: "3", title: "Order Accepted ✅", body: "Order #ORD-1041 confirmed by Punjabi Kitchen – CP. Prep starts now.", time: "35 min ago", icon: "restaurant-outline", iconColor: colors.gold, read: true },
  { id: "4", title: "Refund Processed 💸", body: "₹870 for order #ORD-7510 has been refunded to your Paytm wallet.", time: "2 days ago", icon: "return-up-back-outline", iconColor: "#a78bfa", read: true },
];

export default function OrderUpdatesScreen() {
  return (
    <ScreenHeader title="Order Updates" backHref="/(tabs)/profile">
      <Text style={s.label}>{UPDATES.filter(u => !u.read).length} unread updates</Text>
      {UPDATES.map((n) => (
        <View key={n.id} style={[s.card, !n.read && s.unread]}>
          <View style={[s.iconCircle, { backgroundColor: `${n.iconColor}18` }]}>
            <Ionicons name={n.icon as any} size={22} color={n.iconColor} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={s.titleRow}>
              <Text style={s.title}>{n.title}</Text>
              {!n.read && <View style={s.dot} />}
            </View>
            <Text style={s.body}>{n.body}</Text>
            <Text style={s.time}>{n.time}</Text>
          </View>
        </View>
      ))}
    </ScreenHeader>
  );
}

const s = StyleSheet.create({
  label: { color: colors.textSecondary, fontSize: 13, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 10 },
  card: { flexDirection: "row", gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  unread: { backgroundColor: "rgba(212,175,55,0.04)", borderRadius: 12, paddingHorizontal: 10 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 3 },
  title: { fontSize: 14, fontWeight: "700", color: colors.textPrimary },
  dot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: colors.gold },
  body: { fontSize: 12, color: colors.textSecondary, lineHeight: 17, marginBottom: 4 },
  time: { fontSize: 10, color: colors.textSecondary },
});
