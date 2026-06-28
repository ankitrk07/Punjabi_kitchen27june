import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "@/src/components/ScreenHeader";
import { colors } from "@/src/theme";

const HISTORY = [
  { label: "Order #ORD-1041 Cashback", date: "Today, 4:30 PM", pts: "+150 pts", type: "earn" },
  { label: "Redeemed on Paneer Tikka", date: "22 Jun, 7:00 PM", pts: "−200 pts", type: "redeem" },
  { label: "Weekly Bonus Points", date: "20 Jun, 12:00 AM", pts: "+100 pts", type: "earn" },
  { label: "Order #ORD-0982 Cashback", date: "20 Jun, 1:20 PM", pts: "+90 pts", type: "earn" },
  { label: "Welcome Bonus", date: "01 Jun, 10:00 AM", pts: "+500 pts", type: "earn" },
];

export default function LoyaltyPointsScreen() {
  return (
    <ScreenHeader title="Loyalty Points" backHref="/(tabs)/profile">
      {/* Gold Wallet Card */}
      <View style={s.walletCard}>
        <View style={s.walletTop}>
          <View>
            <Text style={s.walletLabel}>TOTAL POINTS</Text>
            <Text style={s.walletPoints}>2,450</Text>
            <Text style={s.walletEq}>≈ ₹245.00 redeemable</Text>
          </View>
          <View style={s.crownCircle}>
            <Ionicons name="trophy" size={32} color="#000" />
          </View>
        </View>
        <View style={s.walletDivider} />
        <View style={s.tierRow}>
          <Text style={s.tierLabel}>GOLD TIER</Text>
          <Text style={s.tierProgress}>2,450 / 5,000 to PLATINUM</Text>
        </View>
        <View style={s.progressBg}>
          <View style={[s.progressFill, { width: "49%" }]} />
        </View>
      </View>

      <Text style={s.sectionTitle}>Earn More Points</Text>
      {[
        { icon: "cart-outline", label: "1 pt per ₹1 spent on orders", color: colors.gold },
        { icon: "gift-outline", label: "Bonus 200 pts on referral success", color: "#a78bfa" },
        { icon: "calendar-outline", label: "100 pts every Sunday (Weekend Bonus)", color: "#34d399" },
      ].map((tip, i) => (
        <View key={i} style={s.tipRow}>
          <Ionicons name={tip.icon as any} size={20} color={tip.color} />
          <Text style={s.tipText}>{tip.label}</Text>
        </View>
      ))}

      <Text style={s.sectionTitle}>Transaction History</Text>
      {HISTORY.map((h, i) => (
        <View key={i} style={s.txnRow}>
          <View style={[s.txnDot, { backgroundColor: h.type === "earn" ? colors.success : colors.error }]} />
          <View style={{ flex: 1 }}>
            <Text style={s.txnLabel}>{h.label}</Text>
            <Text style={s.txnDate}>{h.date}</Text>
          </View>
          <Text style={[s.txnPts, { color: h.type === "earn" ? colors.success : colors.error }]}>{h.pts}</Text>
        </View>
      ))}

      <TouchableOpacity style={s.redeemBtn}>
        <Text style={s.redeemBtnText}>Redeem Points</Text>
      </TouchableOpacity>
    </ScreenHeader>
  );
}

const s = StyleSheet.create({
  walletCard: { backgroundColor: colors.gold, borderRadius: 20, padding: 20, marginBottom: 24 },
  walletTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 },
  walletLabel: { fontSize: 10, color: "rgba(0,0,0,0.6)", fontWeight: "700", letterSpacing: 1 },
  walletPoints: { fontSize: 40, fontWeight: "900", color: "#000", lineHeight: 46 },
  walletEq: { fontSize: 11, color: "rgba(0,0,0,0.65)" },
  crownCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: "rgba(0,0,0,0.15)", alignItems: "center", justifyContent: "center" },
  walletDivider: { height: 1, backgroundColor: "rgba(0,0,0,0.1)", marginBottom: 12 },
  tierRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  tierLabel: { fontSize: 10, fontWeight: "800", color: "#000", letterSpacing: 0.5 },
  tierProgress: { fontSize: 10, color: "rgba(0,0,0,0.65)" },
  progressBg: { height: 6, backgroundColor: "rgba(0,0,0,0.15)", borderRadius: 3 },
  progressFill: { height: 6, backgroundColor: "#000", borderRadius: 3 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: colors.gold, marginBottom: 12, marginTop: 4 },
  tipRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  tipText: { fontSize: 13, color: colors.textPrimary },
  txnRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  txnDot: { width: 8, height: 8, borderRadius: 4 },
  txnLabel: { fontSize: 13, color: colors.textPrimary },
  txnDate: { fontSize: 10, color: colors.textSecondary, marginTop: 2 },
  txnPts: { fontSize: 13, fontWeight: "700" },
  redeemBtn: { backgroundColor: colors.gold, paddingVertical: 14, borderRadius: 25, alignItems: "center", marginTop: 20 },
  redeemBtnText: { color: "#000", fontWeight: "700", fontSize: 14 },
});
