import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "@/src/components/ScreenHeader";
import { colors } from "@/src/theme";

const DEALS = [
  { code: "PUNJABI50", title: "50% OFF up to ₹150", minOrder: "₹299", desc: "Get 50% discount on all main course dishes. Valid once per user per day.", category: "DELIVERY", color: colors.gold },
  { code: "TANDOOR30", title: "30% OFF on Starters", minOrder: "₹199", desc: "Applicable only on tandoori kebabs, paneer tikka, and chaap.", category: "DINE-IN", color: "#34d399" },
  { code: "FREEKULCHA", title: "Free Kulcha on combos", minOrder: "₹399", desc: "Get a free butter Amritsari Kulcha with any family thali combo.", category: "DELIVERY", color: "#a78bfa" },
  { code: "UPI100", title: "Flat ₹100 Cashback", minOrder: "₹590", desc: "Use Google Pay or PhonePe to get flat cashback directly in your bank account.", category: "ALL ORDERS", color: "#f87171" },
];

export default function OffersScreen() {
  return (
    <ScreenHeader title="Offers & Promo Codes" backHref="/(tabs)/profile">
      <View style={styles.banner}>
        <View style={styles.iconCircle}>
          <Ionicons name="pricetags" size={32} color={colors.gold} />
        </View>
        <Text style={styles.bannerTitle}>Active Restaurant Promo Codes</Text>
        <Text style={styles.bannerSubtitle}>
          Use these codes during checkout to avail of discounts, free items, and cashbacks.
        </Text>
      </View>

      <Text style={styles.sectionLabel}>Available Promo Offers</Text>
      {DEALS.map((deal, idx) => (
        <View key={idx} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.codeBadge, { backgroundColor: `${deal.color}15` }]}>
              <Text style={[styles.codeText, { color: deal.color }]}>{deal.code}</Text>
            </View>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{deal.category}</Text>
            </View>
          </View>
          <Text style={styles.dealTitle}>{deal.title}</Text>
          <Text style={styles.descText}>{deal.desc}</Text>
          <Text style={styles.minOrderText}>* {deal.minOrder}</Text>
          <View style={styles.divider} />
          <TouchableOpacity
            style={[styles.copyBtn, { borderColor: deal.color }]}
            onPress={() => alert(`Code ${deal.code} copied!`)}
          >
            <Ionicons name="copy-outline" size={14} color={deal.color} />
            <Text style={[styles.copyBtnText, { color: deal.color }]}>Copy Promo Code</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScreenHeader>
  );
}

const styles = StyleSheet.create({
  banner: {
    alignItems: "center",
    marginVertical: 20,
    paddingHorizontal: 16,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(212, 175, 55, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 18,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.gold,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  codeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  codeText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  categoryBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryText: {
    fontSize: 9,
    fontWeight: "bold",
    color: colors.textSecondary,
  },
  dealTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 6,
  },
  descText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  minOrderText: {
    fontSize: 10,
    color: colors.gold,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  copyBtnText: {
    fontSize: 12,
    fontWeight: "bold",
  },
});
