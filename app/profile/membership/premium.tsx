import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "@/src/components/ScreenHeader";
import { colors } from "@/src/theme";

export default function MembershipPremiumScreen() {
  return (
    <ScreenHeader title="Membership" backHref="/(tabs)/profile">
      {/* Gold Member Card */}
      <View style={s.memberCard}>
        <View style={s.memberTop}>
          <View>
            <Text style={s.memberTier}>GOLD MEMBER</Text>
            <Text style={s.memberName}>Sudip Sen</Text>
            <Text style={s.memberSince}>Member since Feb 2025</Text>
          </View>
          <View style={s.crownCircle}>
            <Ionicons name="trophy" size={34} color="#000" />
          </View>
        </View>
        <View style={s.memberDivider} />
        <View style={s.memberStats}>
          {[{ label: "Total Orders", value: "84" }, { label: "Points Earned", value: "6.2K" }, { label: "Total Saved", value: "₹1,840" }].map((s2, i) => (
            <View key={i} style={{ alignItems: "center" }}>
              <Text style={s.statValue}>{s2.value}</Text>
              <Text style={s.statLabel}>{s2.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Tier Progress */}
      <View style={s.section}>
        <View style={s.tierRow}>
          <Text style={s.tierLabel}>GOLD  →  PLATINUM</Text>
          <Text style={s.tierProgress}>2,450 / 5,000 pts</Text>
        </View>
        <View style={s.progressBg}>
          <View style={[s.progressFill, { width: "49%" }]} />
        </View>
        <Text style={s.tierNote}>Earn 2,550 more points to reach Platinum Tier</Text>
      </View>

      {/* Benefits */}
      <Text style={s.sectionTitle}>Your Gold Benefits</Text>
      {[
        { icon: "bicycle-outline", title: "Free Delivery", desc: "No charges on orders above ₹199", color: "#34d399" },
        { icon: "gift-outline", title: "2x Loyalty Points", desc: "Double rewards on every order", color: "#a78bfa" },
        { icon: "headset-outline", title: "Priority Support", desc: "Skip the queue in live chat & calls", color: colors.gold },
        { icon: "pricetag-outline", title: "Exclusive Offers", desc: "Member-only coupons every week", color: "#f87171" },
      ].map((b, i) => (
        <View key={i} style={s.benefitRow}>
          <View style={[s.benefitIcon, { backgroundColor: `${b.color}18` }]}>
            <Ionicons name={b.icon as any} size={22} color={b.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.benefitTitle}>{b.title}</Text>
            <Text style={s.benefitDesc}>{b.desc}</Text>
          </View>
          <Ionicons name="checkmark-circle" size={18} color={colors.success} />
        </View>
      ))}

      <TouchableOpacity style={s.upgradeBtn}>
        <Ionicons name="diamond-outline" size={16} color="#000" />
        <Text style={s.upgradeBtnText}>Upgrade to Platinum</Text>
      </TouchableOpacity>
    </ScreenHeader>
  );
}

const s = StyleSheet.create({
  memberCard: { backgroundColor: colors.gold, borderRadius: 22, padding: 22, marginBottom: 22 },
  memberTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  memberTier: { fontSize: 10, fontWeight: "800", color: "rgba(0,0,0,0.55)", letterSpacing: 1.5, marginBottom: 4 },
  memberName: { fontSize: 22, fontWeight: "900", color: "#000" },
  memberSince: { fontSize: 10, color: "rgba(0,0,0,0.6)", marginTop: 2 },
  crownCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(0,0,0,0.15)", alignItems: "center", justifyContent: "center" },
  memberDivider: { height: 1, backgroundColor: "rgba(0,0,0,0.12)", marginBottom: 16 },
  memberStats: { flexDirection: "row", justifyContent: "space-around" },
  statValue: { fontSize: 18, fontWeight: "900", color: "#000" },
  statLabel: { fontSize: 9, color: "rgba(0,0,0,0.6)", fontWeight: "600", marginTop: 2 },
  section: { backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 22 },
  tierRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  tierLabel: { fontSize: 11, fontWeight: "700", color: colors.textPrimary },
  tierProgress: { fontSize: 11, color: colors.textSecondary },
  progressBg: { height: 8, backgroundColor: colors.border, borderRadius: 4, marginBottom: 8 },
  progressFill: { height: 8, backgroundColor: colors.gold, borderRadius: 4 },
  tierNote: { fontSize: 11, color: colors.textSecondary },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: colors.gold, marginBottom: 14, textTransform: "uppercase", letterSpacing: 0.5 },
  benefitRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  benefitIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  benefitTitle: { fontSize: 14, fontWeight: "700", color: colors.textPrimary, marginBottom: 2 },
  benefitDesc: { fontSize: 11, color: colors.textSecondary },
  upgradeBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: colors.gold, paddingVertical: 14, borderRadius: 25, marginTop: 20 },
  upgradeBtnText: { color: "#000", fontWeight: "700", fontSize: 14 },
});
