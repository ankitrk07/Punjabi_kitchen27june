import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "@/src/components/ScreenHeader";
import { colors } from "@/src/theme";

const WALLETS = [
  { name: "Paytm Wallet", balance: "₹1,200", linked: true, icon: "💳", lastUsed: "Today" },
  { name: "PhonePe Wallet", balance: "₹450", linked: true, icon: "📱", lastUsed: "20 Jun" },
  { name: "Amazon Pay", balance: "₹80", linked: false, icon: "🛒", lastUsed: "Never" },
];

export default function WalletsScreen() {
  return (
    <ScreenHeader title="Digital Wallets" backHref="/(tabs)/profile">
      <Text style={s.label}>Linked wallets for quick checkout</Text>
      {WALLETS.map((w, i) => (
        <View key={i} style={s.card}>
          <Text style={s.walletIcon}>{w.icon}</Text>
          <View style={{ flex: 1 }}>
            <View style={s.nameRow}>
              <Text style={s.walletName}>{w.name}</Text>
              {w.linked && (
                <View style={s.linkedBadge}><Ionicons name="link-outline" size={11} color={colors.success} /><Text style={s.linkedText}>Linked</Text></View>
              )}
            </View>
            <Text style={s.balance}>{w.balance} available</Text>
            <Text style={s.lastUsed}>Last used: {w.lastUsed}</Text>
          </View>
          <TouchableOpacity style={[s.actionBtn, !w.linked && s.linkBtn]} onPress={() => alert(w.linked ? `Manage ${w.name}` : `Link ${w.name}`)}>
            <Text style={[s.actionText, !w.linked && s.linkText]}>{w.linked ? "Manage" : "Link"}</Text>
          </TouchableOpacity>
        </View>
      ))}

      <View style={s.infoBox}>
        <Ionicons name="shield-checkmark-outline" size={18} color={colors.success} />
        <Text style={s.infoText}>Your wallet connections are protected by bank-grade security protocols.</Text>
      </View>

      <TouchableOpacity style={s.addBtn}><Ionicons name="add-circle-outline" size={18} color="#000" /><Text style={s.addBtnText}>Link Another Wallet</Text></TouchableOpacity>
    </ScreenHeader>
  );
}

const s = StyleSheet.create({
  label: { color: colors.textSecondary, fontSize: 13, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 10 },
  card: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 12 },
  walletIcon: { fontSize: 30 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 3 },
  walletName: { fontSize: 15, fontWeight: "700", color: colors.textPrimary },
  linkedBadge: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "rgba(16,185,129,0.1)", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  linkedText: { fontSize: 9, color: colors.success, fontWeight: "700" },
  balance: { fontSize: 13, color: colors.gold, fontWeight: "600", marginBottom: 2 },
  lastUsed: { fontSize: 10, color: colors.textSecondary },
  actionBtn: { borderWidth: 1, borderColor: colors.gold, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10 },
  linkBtn: { borderColor: colors.textSecondary },
  actionText: { fontSize: 12, color: colors.gold, fontWeight: "600" },
  linkText: { color: colors.textSecondary },
  infoBox: { flexDirection: "row", alignItems: "flex-start", gap: 10, backgroundColor: "rgba(16,185,129,0.06)", padding: 14, borderRadius: 12, marginBottom: 16 },
  infoText: { flex: 1, fontSize: 11, color: colors.textSecondary, lineHeight: 17 },
  addBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: colors.gold, paddingVertical: 14, borderRadius: 25 },
  addBtnText: { color: "#000", fontWeight: "700", fontSize: 14 },
});
