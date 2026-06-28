import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "@/src/components/ScreenHeader";
import { colors } from "@/src/theme";

const GIFT_CARDS = [
  { id: "GC-001", balance: "₹500", originalValue: "₹500", code: "PKGIFT-XKJH-2025", purchased: "10 Jun 2025", expiry: "10 Jun 2026", status: "Active" },
  { id: "GC-002", balance: "₹0", originalValue: "₹200", code: "PKGIFT-MMKL-2024", purchased: "01 Jan 2025", expiry: "31 Dec 2025", status: "Fully Used" },
];

export default function GiftCardsScreen() {
  return (
    <ScreenHeader title="Gift Cards" backHref="/(tabs)/profile">
      <Text style={s.label}>{GIFT_CARDS.filter(g => g.status === "Active").length} active gift card(s)</Text>

      {GIFT_CARDS.map((gc, i) => (
        <View key={i} style={[s.gcCard, gc.status !== "Active" && s.gcUsed]}>
          <View style={s.gcTop}>
            <View>
              <Text style={s.gcBalance}>{gc.balance}</Text>
              <Text style={s.gcOriginal}>of {gc.originalValue} gift card</Text>
            </View>
            <View style={[s.gcStatusBadge, { backgroundColor: gc.status === "Active" ? "rgba(16,185,129,0.2)" : "rgba(100,100,100,0.2)" }]}>
              <Text style={[s.gcStatusText, { color: gc.status === "Active" ? colors.success : "#888" }]}>{gc.status}</Text>
            </View>
          </View>
          <View style={s.gcDivider} />
          <View style={s.codeRow}>
            <Text style={s.gcCode}>{gc.code}</Text>
            <TouchableOpacity onPress={() => alert(`Copied: ${gc.code}`)}><Ionicons name="copy-outline" size={16} color={gc.status === "Active" ? colors.gold : "#666"} /></TouchableOpacity>
          </View>
          <View style={s.gcMeta}>
            <Text style={s.gcMetaText}>Purchased: {gc.purchased}</Text>
            <Text style={s.gcMetaText}>Expires: {gc.expiry}</Text>
          </View>
          {gc.status === "Active" && (
            <TouchableOpacity style={s.redeemBtn}><Text style={s.redeemText}>Apply at Checkout</Text></TouchableOpacity>
          )}
        </View>
      ))}

      <TouchableOpacity style={s.buyBtn}>
        <Ionicons name="gift-outline" size={18} color="#000" />
        <Text style={s.buyBtnText}>Buy a Gift Card</Text>
      </TouchableOpacity>
    </ScreenHeader>
  );
}

const s = StyleSheet.create({
  label: { color: colors.textSecondary, fontSize: 13, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 10 },
  gcCard: { backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: "rgba(212,175,55,0.3)", padding: 18, marginBottom: 14 },
  gcUsed: { borderColor: colors.border, opacity: 0.7 },
  gcTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  gcBalance: { fontSize: 32, fontWeight: "900", color: colors.gold },
  gcOriginal: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  gcStatusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  gcStatusText: { fontSize: 11, fontWeight: "700" },
  gcDivider: { height: 1, backgroundColor: colors.border, borderStyle: "dashed", marginBottom: 12 },
  codeRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "rgba(255,255,255,0.03)", padding: 10, borderRadius: 10, marginBottom: 10 },
  gcCode: { fontSize: 13, fontWeight: "600", color: colors.textPrimary, letterSpacing: 0.5 },
  gcMeta: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  gcMetaText: { fontSize: 10, color: colors.textSecondary },
  redeemBtn: { backgroundColor: colors.gold, paddingVertical: 10, borderRadius: 12, alignItems: "center" },
  redeemText: { fontSize: 12, fontWeight: "700", color: "#000" },
  buyBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: colors.gold, paddingVertical: 14, borderRadius: 25, marginTop: 10 },
  buyBtnText: { color: "#000", fontWeight: "700", fontSize: 14 },
});
