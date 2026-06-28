import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "@/src/components/ScreenHeader";
import { colors } from "@/src/theme";

const RESTAURANTS = [
  { id: "1", name: "Punjabi Kitchen – CP", cuisine: "North Indian • Tandoori • Mughlai", rating: "4.9", dist: "2.4 km", eta: "28 min", offer: "20% OFF upto ₹120", icon: "🏛️", open: true },
  { id: "2", name: "Dhaba 29 – Lajpat Nagar", cuisine: "Authentic Dhaba • Lassi Bar", rating: "4.7", dist: "4.1 km", eta: "35 min", offer: "Free Raita on ₹499+", icon: "🏕️", open: true },
  { id: "3", name: "The Grill Lounge", cuisine: "Kebabs • Grills • Cocktails", rating: "4.6", dist: "3.8 km", eta: "32 min", offer: "₹100 Cashback via UPI", icon: "🔥", open: false },
];

export default function SavedRestaurantsScreen() {
  return (
    <ScreenHeader title="Saved Restaurants" backHref="/(tabs)/profile">
      <Text style={s.sectionLabel}>{RESTAURANTS.length} Saved Restaurants</Text>
      {RESTAURANTS.map((r) => (
        <View key={r.id} style={s.card}>
          <View style={s.topRow}>
            <Text style={s.icon}>{r.icon}</Text>
            <View style={{ flex: 1 }}>
              <View style={s.nameRow}>
                <Text style={s.name}>{r.name}</Text>
                <View style={[s.badge, r.open ? s.openBadge : s.closedBadge]}>
                  <Text style={[s.badgeText, { color: r.open ? colors.success : colors.error }]}>{r.open ? "Open" : "Closed"}</Text>
                </View>
              </View>
              <Text style={s.cuisine}>{r.cuisine}</Text>
            </View>
          </View>
          <View style={s.infoRow}>
            <View style={s.infoItem}><Ionicons name="star" size={12} color={colors.gold} /><Text style={s.infoText}>{r.rating}</Text></View>
            <View style={s.infoItem}><Ionicons name="location-outline" size={12} color={colors.textSecondary} /><Text style={s.infoText}>{r.dist}</Text></View>
            <View style={s.infoItem}><Ionicons name="time-outline" size={12} color={colors.textSecondary} /><Text style={s.infoText}>{r.eta}</Text></View>
          </View>
          <View style={s.offerRow}>
            <Ionicons name="pricetag-outline" size={12} color={colors.success} />
            <Text style={s.offerText}>{r.offer}</Text>
          </View>
          <View style={s.actions}>
            <TouchableOpacity style={s.btn}><Text style={s.btnText}>View Menu</Text></TouchableOpacity>
            <TouchableOpacity style={s.outlineBtn}><Ionicons name="heart-dislike-outline" size={14} color={colors.error} /><Text style={s.outlineBtnText}>Remove</Text></TouchableOpacity>
          </View>
        </View>
      ))}
    </ScreenHeader>
  );
}

const s = StyleSheet.create({
  sectionLabel: { color: colors.textSecondary, fontSize: 13, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 10 },
  card: { backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 12 },
  topRow: { flexDirection: "row", gap: 12, marginBottom: 10 },
  icon: { fontSize: 36 },
  nameRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  name: { fontSize: 15, fontWeight: "700", color: colors.textPrimary, flex: 1 },
  cuisine: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  openBadge: { backgroundColor: "rgba(16,185,129,0.12)" },
  closedBadge: { backgroundColor: "rgba(239,68,68,0.12)" },
  badgeText: { fontSize: 10, fontWeight: "700" },
  infoRow: { flexDirection: "row", gap: 14, marginBottom: 10 },
  infoItem: { flexDirection: "row", alignItems: "center", gap: 3 },
  infoText: { fontSize: 11, color: colors.textSecondary },
  offerRow: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(16,185,129,0.06)", padding: 8, borderRadius: 8, marginBottom: 12 },
  offerText: { fontSize: 11, color: colors.success, fontWeight: "600" },
  actions: { flexDirection: "row", gap: 10 },
  btn: { backgroundColor: colors.gold, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12, flex: 1, alignItems: "center" },
  btnText: { fontSize: 12, fontWeight: "700", color: "#000" },
  outlineBtn: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderColor: colors.error, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12 },
  outlineBtnText: { fontSize: 12, color: colors.error, fontWeight: "600" },
});
