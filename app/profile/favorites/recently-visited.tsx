import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "@/src/components/ScreenHeader";
import { colors } from "@/src/theme";

const HISTORY = [
  { id: "1", name: "Punjabi Kitchen – CP", visitDate: "Today, 1:30 PM", spent: "₹640", items: "Dal Makhani, 2x Naan, Lassi", visits: 12, emoji: "🏛️" },
  { id: "2", name: "Dhaba 29 – Lajpat Nagar", visitDate: "Yesterday, 8:15 PM", spent: "₹430", items: "Sarson da Saag, Makki Roti, Lassi", visits: 5, emoji: "🏕️" },
  { id: "3", name: "Spice Garden – Saket", visitDate: "18 Jun, 2:00 PM", spent: "₹870", items: "Butter Chicken, Garlic Naan, Raita", visits: 3, emoji: "🌿" },
];

export default function RecentlyVisitedScreen() {
  return (
    <ScreenHeader title="Recently Visited" backHref="/(tabs)/profile">
      <Text style={s.label}>Your restaurant visit history</Text>
      {HISTORY.map((r) => (
        <View key={r.id} style={s.card}>
          <View style={s.topRow}>
            <Text style={s.emoji}>{r.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.name}>{r.name}</Text>
              <View style={s.dateRow}>
                <Ionicons name="time-outline" size={11} color={colors.textSecondary} />
                <Text style={s.date}>{r.visitDate}</Text>
              </View>
            </View>
            <View style={s.visitsBadge}>
              <Text style={s.visitsNum}>{r.visits}</Text>
              <Text style={s.visitsLabel}>visits</Text>
            </View>
          </View>
          <View style={s.divider} />
          <Text style={s.items}>🍽 {r.items}</Text>
          <View style={s.footer}>
            <Text style={s.spent}>Total spent: <Text style={s.spentAmt}>{r.spent}</Text></Text>
            <TouchableOpacity style={s.btn}><Text style={s.btnText}>Visit Again</Text></TouchableOpacity>
          </View>
        </View>
      ))}
    </ScreenHeader>
  );
}

const s = StyleSheet.create({
  label: { color: colors.textSecondary, fontSize: 13, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 10 },
  card: { backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 12 },
  topRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  emoji: { fontSize: 34 },
  name: { fontSize: 15, fontWeight: "700", color: colors.textPrimary, marginBottom: 3 },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  date: { fontSize: 11, color: colors.textSecondary },
  visitsBadge: { backgroundColor: "rgba(212,175,55,0.1)", borderRadius: 10, padding: 8, alignItems: "center" },
  visitsNum: { fontSize: 18, fontWeight: "800", color: colors.gold },
  visitsLabel: { fontSize: 9, color: colors.textSecondary, fontWeight: "600" },
  divider: { height: 1, backgroundColor: colors.border, marginBottom: 10 },
  items: { fontSize: 12, color: colors.textSecondary, marginBottom: 10, lineHeight: 18 },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  spent: { fontSize: 12, color: colors.textSecondary },
  spentAmt: { color: colors.gold, fontWeight: "700" },
  btn: { backgroundColor: colors.gold, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 12 },
  btnText: { fontSize: 11, fontWeight: "700", color: "#000" },
});
