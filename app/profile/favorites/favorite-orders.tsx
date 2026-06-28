import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "@/src/components/ScreenHeader";
import { colors } from "@/src/theme";

const ORDERS = [
  { id: "ORD-1041", rest: "Punjabi Kitchen – CP", date: "Today, 4:28 PM", items: ["Dal Makhani", "Butter Naan x2", "Masala Lassi"], total: "₹580", status: "Delivered", emoji: "🏛️" },
  { id: "ORD-0982", rest: "Dhaba 29 – Lajpat Nagar", date: "20 Jun, 1:15 PM", items: ["Sarson da Saag", "Makki Roti x3", "Chaach"], total: "₹430", status: "Delivered", emoji: "🏕️" },
  { id: "ORD-0847", rest: "Punjabi Kitchen – CP", date: "15 Jun, 7:40 PM", items: ["Butter Chicken", "Garlic Naan x2", "Raita"], total: "₹660", status: "Delivered", emoji: "🏛️" },
];

export default function FavoriteOrdersScreen() {
  return (
    <ScreenHeader title="Favourite Orders" backHref="/(tabs)/profile">
      <Text style={s.label}>Orders you've loved and starred ❤️</Text>
      {ORDERS.map((order) => (
        <View key={order.id} style={s.card}>
          <View style={s.topRow}>
            <Text style={s.emoji}>{order.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.rest}>{order.rest}</Text>
              <Text style={s.orderId}>Order #{order.id}</Text>
              <View style={s.dateRow}>
                <Ionicons name="time-outline" size={11} color={colors.textSecondary} />
                <Text style={s.date}>{order.date}</Text>
              </View>
            </View>
            <View style={s.deliveredBadge}>
              <Ionicons name="checkmark-circle" size={14} color={colors.success} />
              <Text style={s.deliveredText}>{order.status}</Text>
            </View>
          </View>
          <View style={s.itemsList}>
            {order.items.map((item, i) => (
              <Text key={i} style={s.item}>• {item}</Text>
            ))}
          </View>
          <View style={s.footer}>
            <Text style={s.total}>Total: <Text style={s.totalAmt}>{order.total}</Text></Text>
            <TouchableOpacity style={s.btn}><Ionicons name="refresh-outline" size={13} color="#000" /><Text style={s.btnText}>Reorder</Text></TouchableOpacity>
          </View>
        </View>
      ))}
    </ScreenHeader>
  );
}

const s = StyleSheet.create({
  label: { color: colors.textSecondary, fontSize: 13, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 10 },
  card: { backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 12 },
  topRow: { flexDirection: "row", gap: 12, marginBottom: 10, alignItems: "flex-start" },
  emoji: { fontSize: 32 },
  rest: { fontSize: 15, fontWeight: "700", color: colors.textPrimary },
  orderId: { fontSize: 10, color: colors.gold, fontWeight: "600", marginTop: 2 },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  date: { fontSize: 11, color: colors.textSecondary },
  deliveredBadge: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "rgba(16,185,129,0.1)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  deliveredText: { fontSize: 10, color: colors.success, fontWeight: "700" },
  itemsList: { backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 10, marginBottom: 12 },
  item: { fontSize: 12, color: colors.textSecondary, paddingVertical: 2 },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  total: { fontSize: 13, color: colors.textSecondary },
  totalAmt: { color: colors.gold, fontWeight: "800" },
  btn: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: colors.gold, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  btnText: { fontSize: 11, fontWeight: "700", color: "#000" },
});
