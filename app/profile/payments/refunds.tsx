import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "@/src/components/ScreenHeader";
import { colors } from "@/src/theme";

const REFUNDS = [
  { id: "REF-049", order: "#ORD-7510 – Party Snacks Combo", amount: "₹870", method: "Paytm Wallet", reason: "Restaurant closed during delivery", status: "Processed", statusColor: colors.success, date: "22 Jun 2025", eta: "Credited" },
  { id: "REF-038", order: "#ORD-7210 – Paneer Tikka", amount: "₹248", method: "HDFC Credit Card ••4321", reason: "Wrong item delivered", status: "Under Review", statusColor: colors.gold, date: "18 Jun 2025", eta: "2–3 days" },
];

export default function RefundsScreen() {
  return (
    <ScreenHeader title="Refunds" backHref="/(tabs)/profile">
      <Text style={s.label}>Track your refund requests</Text>
      {REFUNDS.map((r) => (
        <View key={r.id} style={s.card}>
          <View style={s.topRow}>
            <View style={[s.statusCircle, { backgroundColor: `${r.statusColor}15` }]}>
              <Ionicons name={r.status === "Processed" ? "checkmark-circle" : "time-outline"} size={22} color={r.statusColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.orderId}>{r.order}</Text>
              <Text style={s.refundId}>Refund #{r.id}</Text>
            </View>
            <Text style={s.amount}>{r.amount}</Text>
          </View>
          <View style={s.divider} />
          <View style={s.detailGrid}>
            <View style={s.detailItem}>
              <Text style={s.detailLabel}>Method</Text>
              <Text style={s.detailValue}>{r.method}</Text>
            </View>
            <View style={s.detailItem}>
              <Text style={s.detailLabel}>Reason</Text>
              <Text style={s.detailValue}>{r.reason}</Text>
            </View>
            <View style={s.detailItem}>
              <Text style={s.detailLabel}>Requested</Text>
              <Text style={s.detailValue}>{r.date}</Text>
            </View>
            <View style={s.detailItem}>
              <Text style={s.detailLabel}>Expected by</Text>
              <Text style={s.detailValue}>{r.eta}</Text>
            </View>
          </View>
          <View style={[s.statusBadge, { backgroundColor: `${r.statusColor}12`, borderColor: `${r.statusColor}30` }]}>
            <Text style={[s.statusText, { color: r.statusColor }]}>{r.status}</Text>
          </View>
        </View>
      ))}
      <TouchableOpacity style={s.helpBtn} onPress={() => alert("Contacting support...")}>
        <Ionicons name="headset-outline" size={16} color="#000" />
        <Text style={s.helpBtnText}>Contact Support</Text>
      </TouchableOpacity>
    </ScreenHeader>
  );
}

const s = StyleSheet.create({
  label: { color: colors.textSecondary, fontSize: 13, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 10 },
  card: { backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 14 },
  topRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  statusCircle: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  orderId: { fontSize: 13, fontWeight: "700", color: colors.textPrimary },
  refundId: { fontSize: 10, color: colors.gold, marginTop: 2 },
  amount: { fontSize: 18, fontWeight: "900", color: colors.textPrimary },
  divider: { height: 1, backgroundColor: colors.border, marginBottom: 12 },
  detailGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 12 },
  detailItem: { width: "47%" },
  detailLabel: { fontSize: 10, color: colors.textSecondary, marginBottom: 2 },
  detailValue: { fontSize: 12, color: colors.textPrimary, fontWeight: "600" },
  statusBadge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  statusText: { fontSize: 11, fontWeight: "700" },
  helpBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: colors.gold, paddingVertical: 14, borderRadius: 25, marginTop: 10 },
  helpBtnText: { color: "#000", fontWeight: "700", fontSize: 14 },
});
