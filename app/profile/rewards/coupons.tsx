import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "@/src/components/ScreenHeader";
import { colors } from "@/src/theme";

const COUPONS = [
  { code: "PUNJABI50", title: "50% OFF up to ₹150", minOrder: "₹299", validTill: "30 Jun 2025", category: "All dishes", color: "#a78bfa" },
  { code: "FREEKULCHA", title: "Free Amritsari Kulcha", minOrder: "₹399", validTill: "28 Jun 2025", category: "Bread combos only", color: "#34d399" },
  { code: "DIWALIFEST", title: "Flat ₹100 Cashback", minOrder: "₹590", validTill: "15 Jul 2025", category: "UPI payments only", color: colors.gold },
  { code: "NEWUSER25", title: "25% OFF on first order", minOrder: "₹199", validTill: "Expired", category: "All categories", color: "#9ca3af", expired: true },
];

export default function CouponsScreen() {
  return (
    <ScreenHeader title="Coupons" backHref="/(tabs)/profile">
      <Text style={s.label}>{COUPONS.filter(c => !c.expired).length} active coupons available</Text>
      {COUPONS.map((c, i) => (
        <View key={i} style={[s.card, c.expired && s.expiredCard]}>
          <View style={[s.colorBar, { backgroundColor: c.color }]} />
          <View style={s.body}>
            <View style={s.topRow}>
              <View style={[s.codeTag, { backgroundColor: `${c.color}20` }]}>
                <Text style={[s.code, { color: c.color }]}>{c.code}</Text>
              </View>
              {c.expired && <View style={s.expiredBadge}><Text style={s.expiredText}>EXPIRED</Text></View>}
            </View>
            <Text style={s.title}>{c.title}</Text>
            <Text style={s.detail}>Min. Order: {c.minOrder} • {c.category}</Text>
            <View style={s.footer}>
              <View style={s.validRow}>
                <Ionicons name="calendar-outline" size={11} color={colors.textSecondary} />
                <Text style={s.validTill}>Valid till: {c.validTill}</Text>
              </View>
              {!c.expired && (
                <TouchableOpacity style={s.copyBtn} onPress={() => alert(`Copied: ${c.code}`)}>
                  <Ionicons name="copy-outline" size={12} color={c.color} />
                  <Text style={[s.copyText, { color: c.color }]}>Copy</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      ))}
    </ScreenHeader>
  );
}

const s = StyleSheet.create({
  label: { color: colors.textSecondary, fontSize: 13, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 10 },
  card: { flexDirection: "row", backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 12, overflow: "hidden" },
  expiredCard: { opacity: 0.5 },
  colorBar: { width: 5 },
  body: { flex: 1, padding: 14 },
  topRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  codeTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  code: { fontSize: 11, fontWeight: "800", letterSpacing: 0.5 },
  expiredBadge: { backgroundColor: "rgba(156,163,175,0.15)", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  expiredText: { fontSize: 9, color: "#9ca3af", fontWeight: "700" },
  title: { fontSize: 15, fontWeight: "700", color: colors.textPrimary, marginBottom: 3 },
  detail: { fontSize: 11, color: colors.textSecondary, marginBottom: 10 },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  validRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  validTill: { fontSize: 10, color: colors.textSecondary },
  copyBtn: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderColor: "currentColor", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  copyText: { fontSize: 11, fontWeight: "700" },
});
