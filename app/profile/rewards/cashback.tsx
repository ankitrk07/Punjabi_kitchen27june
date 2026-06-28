import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "@/src/components/ScreenHeader";
import { colors } from "@/src/theme";

const CASHBACK = [
  { source: "Order #ORD-1041", date: "Today, 4:30 PM", amount: "+₹18.00", type: "earn", method: "UPI Cashback" },
  { source: "Paytm Monday Offer", date: "23 Jun, 10:00 AM", amount: "+₹75.00", type: "earn", method: "Promo Cashback" },
  { source: "Redeemed on Order #ORD-0960", date: "18 Jun, 7:00 PM", amount: "−₹50.00", type: "redeem", method: "Wallet Usage" },
  { source: "Order #ORD-0847", date: "15 Jun, 8:40 PM", amount: "+₹22.00", type: "earn", method: "Card Cashback" },
];

export default function CashbackScreen() {
  return (
    <ScreenHeader title="Cashback" backHref="/(tabs)/profile">
      {/* Wallet */}
      <View style={s.walletCard}>
        <Text style={s.walletLabel}>CASHBACK WALLET</Text>
        <Text style={s.walletBalance}>₹ 341.00</Text>
        <Text style={s.walletSub}>Available to redeem at checkout</Text>
        <View style={s.walletDivider} />
        <View style={s.walletRow}>
          <View>
            <Text style={s.miniLabel}>Total Earned</Text>
            <Text style={s.miniValue}>₹ 841.00</Text>
          </View>
          <View>
            <Text style={s.miniLabel}>Total Used</Text>
            <Text style={s.miniValue}>₹ 500.00</Text>
          </View>
          <View>
            <Text style={s.miniLabel}>Expiring Soon</Text>
            <Text style={[s.miniValue, { color: colors.error }]}>₹ 75.00</Text>
          </View>
        </View>
      </View>

      {/* Expiry Warning */}
      <View style={s.warningBox}>
        <Ionicons name="warning-outline" size={16} color={colors.error} />
        <Text style={s.warningText}>₹75.00 cashback expires on 30 Jun 2025. Use it before it's gone!</Text>
      </View>

      {/* History */}
      <Text style={s.sectionTitle}>Transaction History</Text>
      {CASHBACK.map((c, i) => (
        <View key={i} style={s.txnRow}>
          <View style={[s.txnDot, { backgroundColor: c.type === "earn" ? colors.success : colors.error }]} />
          <View style={{ flex: 1 }}>
            <Text style={s.txnSource}>{c.source}</Text>
            <Text style={s.txnMethod}>{c.method} • {c.date}</Text>
          </View>
          <Text style={[s.txnAmount, { color: c.type === "earn" ? colors.success : colors.error }]}>{c.amount}</Text>
        </View>
      ))}
    </ScreenHeader>
  );
}

const s = StyleSheet.create({
  walletCard: { backgroundColor: colors.gold, borderRadius: 20, padding: 22, marginBottom: 14 },
  walletLabel: { fontSize: 10, fontWeight: "800", color: "rgba(0,0,0,0.55)", letterSpacing: 1, marginBottom: 4 },
  walletBalance: { fontSize: 36, fontWeight: "900", color: "#000", marginBottom: 4 },
  walletSub: { fontSize: 11, color: "rgba(0,0,0,0.6)", marginBottom: 14 },
  walletDivider: { height: 1, backgroundColor: "rgba(0,0,0,0.1)", marginBottom: 14 },
  walletRow: { flexDirection: "row", justifyContent: "space-between" },
  miniLabel: { fontSize: 9, color: "rgba(0,0,0,0.55)", marginBottom: 2 },
  miniValue: { fontSize: 14, fontWeight: "800", color: "#000" },
  warningBox: { flexDirection: "row", gap: 8, alignItems: "flex-start", backgroundColor: "rgba(239,68,68,0.08)", padding: 12, borderRadius: 12, marginBottom: 20 },
  warningText: { flex: 1, fontSize: 11, color: colors.error, lineHeight: 17 },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: colors.gold, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 },
  txnRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  txnDot: { width: 8, height: 8, borderRadius: 4 },
  txnSource: { fontSize: 13, color: colors.textPrimary, fontWeight: "500" },
  txnMethod: { fontSize: 10, color: colors.textSecondary, marginTop: 2 },
  txnAmount: { fontSize: 14, fontWeight: "800" },
});
