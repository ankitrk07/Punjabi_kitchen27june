import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "@/src/components/ScreenHeader";
import { colors } from "@/src/theme";
import { useTabBarAnimation } from "@/src/context/TabBarAnimationContext";
import { useTabBarScrollHandler } from "@/src/hooks/useTabBarScrollHandler";

const DEALS = [
  { code: "PUNJABI20", title: "20% OFF First Order", minOrder: "₹499", desc: "Welcome to Punjabi Kitchen! Enjoy 20% discount on your very first order.", category: "FIRST ORDER", color: "#F0C850" },
  { code: "FREEDEL", title: "Free Delivery Today", minOrder: "₹399", desc: "Hungry? Get free delivery on all orders above ₹399. Fast delivery straight to your doorstep.", category: "DELIVERY", color: "#E8A838" },
  { code: "BOGO", title: "Buy 1 Get 1 Naan", minOrder: "₹199", desc: "Buy any Naan and get the second one completely free. Fresh butter & garlic naans.", category: "DINE-IN", color: colors.gold },
  { code: "SWEETPK", title: "Free Gulab Jamun", minOrder: "₹799", desc: "Get complimentary Gulab Jamuns dessert on your order above ₹799.", category: "FREE DESSERT", color: "#F3C846" },
  { code: "THALI299", title: "Royal Thali at ₹299", minOrder: "₹299", desc: "Feast on a complete Family Thali with Dal Makhani, Shahi Paneer, Naan, Rice & Sweet.", category: "ALL ORDERS", color: "#E8C97A" },
  { code: "PK100", title: "Flat ₹100 Cashback", minOrder: "₹699", desc: "Save big on your weekend order. Get flat ₹100 instant cashback on orders above ₹699.", category: "CASHBACK", color: "#F0C850" },
  { code: "MIDNIGHT", title: "Late Night 15% OFF", minOrder: "₹349", desc: "Midnight cravings? Order between 10 PM and 1 AM to get flat 15% discount on all items.", category: "MIDNIGHT SPECIAL", color: "#E8A838" },
  { code: "WEEKEND", title: "Weekend Special Deal", minOrder: "₹599", desc: "Make your weekend delicious! Enjoy 15% discount on all family platters and tandoor starters.", category: "WEEKEND ONLY", color: colors.gold },
];

export default function OffersScreen() {
  const { animatedTranslateY, hiddenOffset } = useTabBarAnimation();
  const { onScroll } = useTabBarScrollHandler(animatedTranslateY, hiddenOffset);

  return (
    <ScreenHeader 
      title="Offers & Promo Codes" 
      backHref="/(tabs)/profile"
      onScroll={onScroll}
    >
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
