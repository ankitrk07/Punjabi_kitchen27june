import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "@/src/components/ScreenHeader";
import { colors } from "@/src/theme";

const TXNS = [
  { id: "TXN-7649", label: "Dal Makhani + Naan Combo", date: "Today, 4:28 PM", amount: "₹580", method: "UPI – sudip@okaxis", status: "Success", color: colors.success },
  { id: "TXN-7621", label: "Butter Chicken Thali", date: "20 Jun, 1:15 PM", amount: "₹520", method: "HDFC Credit Card ••4321", status: "Success", color: colors.success },
  { id: "TXN-7510", label: "Party Snacks Combo", date: "15 Jun, 8:40 PM", amount: "₹870", method: "Paytm Wallet", status: "Refunded", color: "#a78bfa" },
  { id: "TXN-7480", label: "Amritsari Kulcha Set", date: "10 Jun, 12:30 PM", amount: "₹180", method: "UPI – sudip@okaxis", status: "Failed", color: colors.error },
];

export default function PaymentHistoryScreen() {
  return (
    <ScreenHeader title="Payment History" backHref="/(tabs)/profile">
      <Text style={s.label}>All your transactions at a glance</Text>
      <View style={s.summaryRow}>
        {[{ label: "Total Spent", value: "₹6,840", icon: "card-outline", c: colors.gold }, { label: "Refunds", value: "₹870", icon: "return-up-back-outline", c: "#a78bfa" }].map((m, i) => (
          <View key={i} style={s.summaryCard}>
            <Ionicons name={m.icon as any} size={20} color={m.c} />
            <Text style={s.summaryValue}>{m.value}</Text>
            <Text style={s.summaryLabel}>{m.label}</Text>
          </View>
        ))}
      </View>

      {TXNS.map((t) => (
        <View key={t.id} style={s.card}>
          <View style={[s.statusBar, { backgroundColor: t.color }]} />
          <View style={s.body}>
            <View style={s.topRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.txnLabel}>{t.label}</Text>
                <Text style={s.method}>{t.method}</Text>
                <Text style={s.date}>{t.date}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={s.amount}>{t.amount}</Text>
                <View style={[s.statusBadge, { backgroundColor: `${t.color}18` }]}>
                  <Text style={[s.statusText, { color: t.color }]}>{t.status}</Text>
                </View>
              </View>
            </View>
            <Text style={s.txnId}>ID: {t.id}</Text>
          </View>
        </View>
      ))}
    </ScreenHeader>
  );
}

const s = StyleSheet.create({
  label: { color: colors.textSecondary, fontSize: 13, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 10 },
  summaryRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  summaryCard: { flex: 1, backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 14, alignItems: "center", gap: 4 },
  summaryValue: { fontSize: 18, fontWeight: "800", color: colors.textPrimary },
  summaryLabel: { fontSize: 10, color: colors.textSecondary },
  card: { flexDirection: "row", backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 12, overflow: "hidden" },
  statusBar: { width: 4 },
  body: { flex: 1, padding: 14 },
  topRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  txnLabel: { fontSize: 14, fontWeight: "700", color: colors.textPrimary, marginBottom: 2 },
  method: { fontSize: 11, color: colors.textSecondary, marginBottom: 2 },
  date: { fontSize: 10, color: colors.textSecondary },
  amount: { fontSize: 15, fontWeight: "800", color: colors.textPrimary, marginBottom: 4 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: "700" },
  txnId: { fontSize: 10, color: colors.gold },
});
