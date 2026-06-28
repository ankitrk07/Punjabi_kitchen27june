import ScreenHeader from "@/src/components/ScreenHeader";
import { colors } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const QUICK_CARDS = [
  {
    title: "Enter PNR",
    desc: "Add your PNR, pick a Ranchi station, and move into the food ordering flow.",
    icon: "ticket-outline",
    route: "/orders/train/enter-pnr",
  },
  {
    title: "Track Train Order",
    desc: "Check the live status of train-delivered food across Ranchi routes.",
    icon: "locate-outline",
    route: "/orders/train/track",
  },
];

export default function TrainOrderHome() {
  const router = useRouter();

  return (
    <ScreenHeader title="Order on Train" backHref="/(tabs)/profile">
      <LinearGradient colors={["rgba(212,175,55,0.18)", "rgba(20,20,20,1)"]} style={styles.hero}>
        <View style={styles.heroBadge}>
          <Ionicons name="train-outline" size={16} color={colors.gold} />
          <Text style={styles.heroBadgeText}>Ranchi Travel Dining</Text>
        </View>
        <Text style={styles.heroTitle}>Fresh food delivered to your seat in Ranchi</Text>
        <Text style={styles.heroCopy}>
          Enter your PNR to discover Ranchi station stops and place an order for your journey.
        </Text>

        <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.85} onPress={() => router.push("/orders/train/enter-pnr")}>
          <Ionicons name="ticket-outline" size={18} color="#000" />
          <Text style={styles.primaryText}>Start with PNR</Text>
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>What you can do</Text>
        {QUICK_CARDS.map((card) => (
          <TouchableOpacity key={card.title} style={styles.quickRow} activeOpacity={0.8} onPress={() => router.push(card.route as any)}>
            <View style={styles.quickIcon}>
              <Ionicons name={card.icon as any} size={18} color={colors.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.quickTitle}>{card.title}</Text>
              <Text style={styles.quickDesc}>{card.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>How it works</Text>
        <View style={styles.stepRow}>
          <View style={styles.stepDot}><Text style={styles.stepNum}>1</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.stepTitle}>Enter your PNR</Text>
            <Text style={styles.stepCopy}>We use it to find your journey details and delivery stops.</Text>
          </View>
        </View>
        <View style={styles.stepRow}>
          <View style={styles.stepDot}><Text style={styles.stepNum}>2</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.stepTitle}>Choose dishes</Text>
            <Text style={styles.stepCopy}>Select from the menu available for your route and station.</Text>
          </View>
        </View>
        <View style={styles.stepRow}>
          <View style={styles.stepDot}><Text style={styles.stepNum}>3</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.stepTitle}>Track your delivery</Text>
            <Text style={styles.stepCopy}>Follow the order from confirmation until it reaches your seat.</Text>
          </View>
        </View>
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
    overflow: "hidden",
  },
  heroBadge: {
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
  heroBadgeText: { color: colors.gold, fontSize: 12, fontWeight: "700" },
  heroTitle: { color: colors.textPrimary, fontSize: 24, fontWeight: "800", lineHeight: 30 },
  heroCopy: { color: colors.textSecondary, marginTop: 10, lineHeight: 20 },
  primaryBtn: {
    marginTop: 16,
    backgroundColor: colors.gold,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryText: { color: "#000", fontWeight: "800", fontSize: 15 },
  sectionCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: "700", marginBottom: 12 },
  quickRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  quickIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(212,175,55,0.08)",
  },
  quickTitle: { color: colors.textPrimary, fontWeight: "700" },
  quickDesc: { color: colors.textSecondary, marginTop: 3, lineHeight: 18 },
  stepRow: { flexDirection: "row", gap: 12, marginBottom: 14 },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(212,175,55,0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  stepNum: { color: colors.gold, fontWeight: "800" },
  stepTitle: { color: colors.textPrimary, fontWeight: "700" },
  stepCopy: { color: colors.textSecondary, marginTop: 3, lineHeight: 18 },
});