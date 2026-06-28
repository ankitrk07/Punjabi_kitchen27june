import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "@/src/components/ScreenHeader";
import { colors } from "@/src/theme";

const UPIS = [
  { id: "sudip@okaxis", bank: "Axis Bank", icon: "🏦", verified: true, default: true },
  { id: "sudipsen@paytm", bank: "Paytm", icon: "💳", verified: true, default: false },
  { id: "9876543210@ybl", bank: "PhonePe / Yes Bank", icon: "📱", verified: true, default: false },
];

export default function UPIScreen() {
  return (
    <ScreenHeader title="UPI IDs" backHref="/(tabs)/profile">
      <Text style={s.label}>{UPIS.length} verified UPI handles</Text>
      {UPIS.map((upi, i) => (
        <View key={i} style={[s.card, upi.default && s.defaultCard]}>
          <Text style={s.icon}>{upi.icon}</Text>
          <View style={{ flex: 1 }}>
            <View style={s.nameRow}>
              <Text style={s.upiId}>{upi.id}</Text>
              {upi.default && <View style={s.defaultBadge}><Text style={s.defaultText}>DEFAULT</Text></View>}
            </View>
            <Text style={s.bank}>{upi.bank}</Text>
            <View style={s.verifiedRow}>
              <Ionicons name="shield-checkmark-outline" size={13} color={colors.success} />
              <Text style={s.verifiedText}>Verified</Text>
            </View>
          </View>
          <View style={s.actions}>
            {!upi.default && (
              <TouchableOpacity style={s.setDefaultBtn} onPress={() => alert("Set as default")}><Text style={s.setDefaultText}>Set Default</Text></TouchableOpacity>
            )}
            <TouchableOpacity style={s.deleteBtn} onPress={() => alert("Remove UPI")}><Ionicons name="trash-outline" size={16} color={colors.error} /></TouchableOpacity>
          </View>
        </View>
      ))}

      <View style={s.infoBox}>
        <Ionicons name="lock-closed-outline" size={16} color={colors.gold} />
        <Text style={s.infoText}>UPI handles are verified by NPCI. Payments are secured by your bank's PIN.</Text>
      </View>

      <TouchableOpacity style={s.addBtn}><Ionicons name="add-circle-outline" size={18} color="#000" /><Text style={s.addBtnText}>Add New UPI ID</Text></TouchableOpacity>
    </ScreenHeader>
  );
}

const s = StyleSheet.create({
  label: { color: colors.textSecondary, fontSize: 13, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 10 },
  card: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 12 },
  defaultCard: { borderColor: "rgba(212,175,55,0.4)" },
  icon: { fontSize: 28 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 3 },
  upiId: { fontSize: 14, fontWeight: "700", color: colors.textPrimary },
  defaultBadge: { backgroundColor: colors.gold, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5 },
  defaultText: { fontSize: 8, fontWeight: "800", color: "#000" },
  bank: { fontSize: 11, color: colors.textSecondary, marginBottom: 4 },
  verifiedRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  verifiedText: { fontSize: 11, color: colors.success, fontWeight: "600" },
  actions: { gap: 8, alignItems: "center" },
  setDefaultBtn: { backgroundColor: "rgba(212,175,55,0.1)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  setDefaultText: { fontSize: 10, color: colors.gold, fontWeight: "700" },
  deleteBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: "rgba(239,68,68,0.1)", alignItems: "center", justifyContent: "center" },
  infoBox: { flexDirection: "row", alignItems: "flex-start", gap: 10, backgroundColor: "rgba(212,175,55,0.06)", padding: 14, borderRadius: 12, marginBottom: 16 },
  infoText: { flex: 1, fontSize: 11, color: colors.textSecondary, lineHeight: 17 },
  addBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: colors.gold, paddingVertical: 14, borderRadius: 25 },
  addBtnText: { color: "#000", fontWeight: "700", fontSize: 14 },
});
