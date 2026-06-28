import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "@/src/components/ScreenHeader";
import { colors } from "@/src/theme";

export default function ReferralScreen() {
  const code = "KITCHEN100";
  const earnings = [
    { friend: "Priya S.", date: "15 Jun 2025", earned: "+₹100" },
    { friend: "Rahul M.", date: "10 Jun 2025", earned: "+₹100" },
    { friend: "Aanya K.", date: "02 Jun 2025", earned: "+₹100" },
  ];

  return (
    <ScreenHeader title="Refer & Earn" backHref="/(tabs)/profile">
      {/* Referral Banner */}
      <View style={s.banner}>
        <Ionicons name="gift" size={40} color="#000" style={s.bannerIcon} />
        <Text style={s.bannerTitle}>Invite Friends, Earn ₹100!</Text>
        <Text style={s.bannerDesc}>For every friend who places their first order of ₹199+, you both get ₹100 cashback.</Text>
      </View>

      {/* Code */}
      <Text style={s.sectionTitle}>Your Referral Code</Text>
      <View style={s.codeBox}>
        <Text style={s.code}>{code}</Text>
        <TouchableOpacity style={s.copyBtn} onPress={() => alert(`Copied: ${code}`)}>
          <Ionicons name="copy-outline" size={16} color={colors.gold} />
          <Text style={s.copyText}>Copy</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={s.shareBtn} onPress={() => alert("Share link!")}>
        <Ionicons name="share-social-outline" size={16} color="#000" />
        <Text style={s.shareBtnText}>Share Referral Link</Text>
      </TouchableOpacity>

      {/* Stats */}
      <View style={s.statsRow}>
        {[{ label: "Total Invites", value: "3" }, { label: "Successful", value: "3" }, { label: "Total Earned", value: "₹300" }].map((st, i) => (
          <View key={i} style={s.statCard}>
            <Text style={s.statValue}>{st.value}</Text>
            <Text style={s.statLabel}>{st.label}</Text>
          </View>
        ))}
      </View>

      {/* Earnings History */}
      <Text style={s.sectionTitle}>Earnings History</Text>
      {earnings.map((e, i) => (
        <View key={i} style={s.earnRow}>
          <View style={s.friendCircle}><Text style={s.friendInitial}>{e.friend[0]}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={s.friendName}>{e.friend} joined</Text>
            <Text style={s.earnDate}>{e.date}</Text>
          </View>
          <Text style={s.earned}>{e.earned}</Text>
        </View>
      ))}
    </ScreenHeader>
  );
}

const s = StyleSheet.create({
  banner: { backgroundColor: colors.gold, borderRadius: 20, padding: 20, marginBottom: 22, alignItems: "center" },
  bannerIcon: { marginBottom: 10 },
  bannerTitle: { fontSize: 18, fontWeight: "900", color: "#000", marginBottom: 6, textAlign: "center" },
  bannerDesc: { fontSize: 12, color: "rgba(0,0,0,0.65)", textAlign: "center", lineHeight: 18 },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: colors.gold, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 },
  codeBox: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: "rgba(212,175,55,0.3)", borderStyle: "dashed", padding: 16, marginBottom: 12 },
  code: { fontSize: 22, fontWeight: "900", color: colors.gold, letterSpacing: 2 },
  copyBtn: { flexDirection: "row", alignItems: "center", gap: 5 },
  copyText: { fontSize: 12, color: colors.gold, fontWeight: "700" },
  shareBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: colors.gold, paddingVertical: 12, borderRadius: 25, marginBottom: 24 },
  shareBtnText: { color: "#000", fontWeight: "700", fontSize: 14 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 22 },
  statCard: { flex: 1, backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 14, alignItems: "center" },
  statValue: { fontSize: 20, fontWeight: "900", color: colors.textPrimary, marginBottom: 4 },
  statLabel: { fontSize: 10, color: colors.textSecondary },
  earnRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  friendCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(212,175,55,0.15)", alignItems: "center", justifyContent: "center" },
  friendInitial: { fontSize: 16, fontWeight: "800", color: colors.gold },
  friendName: { fontSize: 13, color: colors.textPrimary, fontWeight: "500" },
  earnDate: { fontSize: 10, color: colors.textSecondary, marginTop: 2 },
  earned: { fontSize: 16, fontWeight: "800", color: colors.success },
});
