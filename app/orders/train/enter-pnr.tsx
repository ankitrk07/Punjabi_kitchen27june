import ScreenHeader from "@/src/components/ScreenHeader";
import { colors } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const SUGGESTED_STOPS = ["Ranchi Jn", "Hatia", "Namkum", "Tatisilwai"];

export default function EnterPNRScreen() {
  const router = useRouter();
  const [pnr, setPnr] = useState("");
  const [station, setStation] = useState("Ranchi Jn");

  const isValid = pnr.replace(/\s/g, "").length >= 10;

  const nextSteps = useMemo(
    () => [
      "Verify your journey details for Ranchi-bound trains",
      "Select the Ranchi station where you want food delivered",
      "Browse the menu and place the order for your seat",
    ],
    []
  );

  return (
    <ScreenHeader title="Enter PNR" backHref="/orders/train">
      <LinearGradient colors={["rgba(212,175,55,0.16)", "rgba(20,20,20,1)"]} style={styles.hero}>
        <View style={styles.badge}>
          <Ionicons name="ticket-outline" size={16} color={colors.gold} />
          <Text style={styles.badgeText}>Ranchi PNR ordering</Text>
        </View>
        <Text style={styles.title}>Enter your PNR to unlock Ranchi train food delivery</Text>
        <Text style={styles.copy}>Use your journey details to choose a Ranchi station and order food before your train arrives.</Text>
      </LinearGradient>

      <View style={styles.card}>
        <Text style={styles.label}>PNR Number</Text>
        <TextInput
          value={pnr}
          onChangeText={setPnr}
          placeholder="Enter 10-digit PNR"
          placeholderTextColor={colors.textSecondary}
          keyboardType="number-pad"
          maxLength={10}
          style={styles.input}
        />

        <Text style={[styles.label, { marginTop: 14 }]}>Delivery Station in Ranchi</Text>
        <View style={styles.stationRow}>
          {SUGGESTED_STOPS.map((item) => (
            <TouchableOpacity key={item} activeOpacity={0.85} onPress={() => setStation(item)} style={[styles.stationChip, station === item && styles.stationChipActive]}>
              <Text style={[styles.stationChipText, station === item && styles.stationChipTextActive]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.primaryBtn, !isValid && { opacity: 0.45 }]}
          disabled={!isValid}
          onPress={() => router.push({ pathname: "/(tabs)/menu", params: { pnr, station } } as any)}
        >
          <Ionicons name="restaurant-outline" size={18} color="#000" />
          <Text style={styles.primaryText}>Continue to Menu</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>What happens next</Text>
        {nextSteps.map((step, index) => (
          <View key={step} style={styles.stepRow}>
            <View style={styles.stepDot}><Text style={styles.stepNum}>{index + 1}</Text></View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>
    </ScreenHeader>
  );
}

const styles = StyleSheet.create({
  hero: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderGold,
    marginBottom: 14,
  },
  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(212,175,55,0.08)",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.24)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 14,
  },
  badgeText: { color: colors.gold, fontSize: 12, fontWeight: "700" },
  title: { color: colors.textPrimary, fontSize: 22, fontWeight: "800", lineHeight: 28 },
  copy: { color: colors.textSecondary, marginTop: 10, lineHeight: 20 },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  label: { color: colors.textPrimary, fontWeight: "700", marginBottom: 8 },
  input: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.borderGold,
    borderRadius: 14,
    color: colors.textPrimary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    letterSpacing: 1.2,
  },
  stationRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  stationChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stationChipActive: {
    backgroundColor: "rgba(212,175,55,0.14)",
    borderColor: colors.borderGold,
  },
  stationChipText: { color: colors.textSecondary, fontSize: 12, fontWeight: "600" },
  stationChipTextActive: { color: colors.gold },
  primaryBtn: {
    marginTop: 16,
    backgroundColor: colors.gold,
    borderRadius: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryText: { color: "#000", fontWeight: "800" },
  sectionTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: "700", marginBottom: 12 },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 12 },
  stepDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(212,175,55,0.15)",
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  stepNum: { color: colors.gold, fontSize: 12, fontWeight: "800" },
  stepText: { flex: 1, color: colors.textSecondary, lineHeight: 18 },
});