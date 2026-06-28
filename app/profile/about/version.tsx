import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "@/src/components/ScreenHeader";
import { colors } from "@/src/theme";

export default function VersionScreen() {
  return (
    <ScreenHeader title="App Version" backHref="/(tabs)/profile">
      <View style={s.versionCard}>
        <View style={s.logo}><Text style={s.logoText}>PK</Text></View>
        <Text style={s.appName}>Punjabi Kitchen</Text>
        <Text style={s.version}>Version 2.5.0</Text>
        <Text style={s.build}>Build #9042 • Released 22 Jun 2025</Text>
        <View style={s.upToDateBadge}>
          <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          <Text style={s.upToDateText}>You're on the latest version</Text>
        </View>
      </View>

      <Text style={s.sectionTitle}>What's New in 2.5.0</Text>
      {[
        "🎉 Redesigned Profile page with section-wise navigation",
        "🚀 Faster checkout with saved UPI & Card auto-fill",
        "🍛 New Train Food Delivery feature with PNR tracking",
        "🔔 Smart notification preferences per category",
        "🐛 Bug fixes for cart crash on checkout page",
      ].map((item, i) => (
        <View key={i} style={s.changelogRow}>
          <Text style={s.changelogItem}>{item}</Text>
        </View>
      ))}

      <View style={s.infoGrid}>
        {[
          { label: "Platform", value: "Android" },
          { label: "Min OS", value: "Android 8.0+" },
          { label: "Size", value: "48 MB" },
          { label: "Last Updated", value: "22 Jun 2025" },
        ].map((info, i) => (
          <View key={i} style={s.infoItem}>
            <Text style={s.infoLabel}>{info.label}</Text>
            <Text style={s.infoValue}>{info.value}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={s.checkUpdateBtn} onPress={() => alert("Already on latest version!")}>
        <Ionicons name="refresh-outline" size={16} color="#000" />
        <Text style={s.checkUpdateText}>Check for Updates</Text>
      </TouchableOpacity>
    </ScreenHeader>
  );
}

const s = StyleSheet.create({
  versionCard: { backgroundColor: colors.surface, borderRadius: 20, borderWidth: 1, borderColor: colors.border, padding: 24, alignItems: "center", marginBottom: 24 },
  logo: { width: 72, height: 72, borderRadius: 18, backgroundColor: colors.gold, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  logoText: { fontSize: 26, fontWeight: "900", color: "#000" },
  appName: { fontSize: 20, fontWeight: "800", color: colors.textPrimary, marginBottom: 4 },
  version: { fontSize: 16, fontWeight: "700", color: colors.gold, marginBottom: 2 },
  build: { fontSize: 11, color: colors.textSecondary, marginBottom: 12 },
  upToDateBadge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(16,185,129,0.1)", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  upToDateText: { fontSize: 12, color: colors.success, fontWeight: "600" },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: colors.gold, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 },
  changelogRow: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  changelogItem: { fontSize: 13, color: colors.textPrimary, lineHeight: 18 },
  infoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginVertical: 20 },
  infoItem: { width: "47%", backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 12 },
  infoLabel: { fontSize: 10, color: colors.textSecondary, marginBottom: 4 },
  infoValue: { fontSize: 13, fontWeight: "700", color: colors.textPrimary },
  checkUpdateBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: colors.gold, paddingVertical: 14, borderRadius: 25 },
  checkUpdateText: { color: "#000", fontWeight: "700", fontSize: 14 },
});
