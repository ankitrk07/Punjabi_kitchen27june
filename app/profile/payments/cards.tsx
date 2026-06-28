import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "@/src/components/ScreenHeader";
import { colors } from "@/src/theme";

const CARDS = [
  { provider: "Axis Bank Credit Card", num: "**** **** **** 4321", exp: "12/29", holder: "SUDIP SEN", type: "VISA", bg1: "#0F2027", bg2: "#203A43" },
  { provider: "ICICI Debit Card", num: "**** **** **** 9876", exp: "05/28", holder: "SUDIP SEN", type: "MASTERCARD", bg1: "#141E30", bg2: "#243B55" },
];

export default function CardsScreen() {
  return (
    <ScreenHeader title="Saved Cards" backHref="/(tabs)/profile">
      <Text style={s.label}>{CARDS.length} cards saved securely</Text>

      {CARDS.map((card, i) => (
        <View key={i} style={[s.creditCard, { backgroundColor: card.bg1 }]}>
          <View style={s.ccTop}>
            <Text style={s.ccProvider}>{card.provider}</Text>
            <Text style={s.ccType}>{card.type}</Text>
          </View>
          <Text style={s.ccNum}>{card.num}</Text>
          <View style={s.ccBottom}>
            <View>
              <Text style={s.ccLabel}>CARDHOLDER</Text>
              <Text style={s.ccValue}>{card.holder}</Text>
            </View>
            <View>
              <Text style={s.ccLabel}>EXPIRES</Text>
              <Text style={s.ccValue}>{card.exp}</Text>
            </View>
            <View style={s.lockBadge}>
              <Ionicons name="lock-closed" size={14} color={colors.gold} />
            </View>
          </View>
          <View style={s.actions}>
            <TouchableOpacity style={s.actionBtn} onPress={() => alert("Set as default")}>
              <Ionicons name="star-outline" size={14} color={colors.gold} />
              <Text style={s.actionText}>Set Default</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.actionBtn, { borderColor: colors.error }]} onPress={() => alert("Remove card")}>
              <Ionicons name="trash-outline" size={14} color={colors.error} />
              <Text style={[s.actionText, { color: colors.error }]}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <TouchableOpacity style={s.addBtn}>
        <Ionicons name="add-circle-outline" size={18} color="#000" />
        <Text style={s.addBtnText}>Add New Card</Text>
      </TouchableOpacity>

      <View style={s.secureNote}>
        <Ionicons name="shield-checkmark-outline" size={16} color={colors.success} />
        <Text style={s.secureText}>Your card details are encrypted and stored securely via PCI-DSS compliance.</Text>
      </View>
    </ScreenHeader>
  );
}

const s = StyleSheet.create({
  label: { color: colors.textSecondary, fontSize: 13, marginBottom: 20, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 10 },
  creditCard: { borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  ccTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  ccProvider: { color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: "600" },
  ccType: { color: colors.gold, fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  ccNum: { fontSize: 20, color: "#fff", letterSpacing: 3, fontWeight: "700", marginBottom: 20 },
  ccBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  ccLabel: { fontSize: 8, color: "rgba(255,255,255,0.4)", marginBottom: 2, letterSpacing: 0.5 },
  ccValue: { fontSize: 12, color: "#fff", fontWeight: "600" },
  lockBadge: { width: 30, height: 30, borderRadius: 15, backgroundColor: "rgba(212,175,55,0.15)", alignItems: "center", justifyContent: "center" },
  actions: { flexDirection: "row", gap: 10, marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.08)" },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, borderWidth: 1, borderColor: colors.gold, paddingVertical: 7, borderRadius: 10 },
  actionText: { fontSize: 11, color: colors.gold, fontWeight: "600" },
  addBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: colors.gold, paddingVertical: 14, borderRadius: 25, marginTop: 4 },
  addBtnText: { color: "#000", fontWeight: "700", fontSize: 14 },
  secureNote: { flexDirection: "row", alignItems: "flex-start", gap: 8, backgroundColor: "rgba(16,185,129,0.06)", padding: 14, borderRadius: 12, marginTop: 16 },
  secureText: { fontSize: 11, color: colors.textSecondary, flex: 1, lineHeight: 17 },
});
