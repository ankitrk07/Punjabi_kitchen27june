/**
 * Home.tsx — Animated Restaurant Home Screen
 *
 * Changes applied:
 *  1. AnimatedGreeting  — "Hello" + user's name from profile (no "Good evening", no PK logo)
 *  2. AnimatedHeroBanner — Punjabi Kitchen copy + real food Image background (uri)
 *  3. HomeHero (old "Royal Flavours" box) — REMOVED
 *  4. HomeModes moved to where HomeHero was; mode label font changed to serif italic
 *  5. AnimatedMoodStrip placed directly below HomeModes
 *  6. Gold left-bar removed from all AnimatedSectionHeader calls + from AnimatedMoodStrip
 *  7. CHANGE 1 — TopBar hides/shows on scroll (non-sticky, animated out)
 *  8. CHANGE 2 — Animated cart button with flying food emoji (needs TopBar.tsx update)
 *  9. CHANGE 3 — Professional LocationSection with map preview, address, timings, CTAs
 */

import {
  ChefSpecialsSection,
  DealOfDaySection,
  ReviewsSection,
} from "@/src/components/home/HomeSection";
import TopBar from "@/src/components/TopBar";
import { CountdownCard } from "@/src/components/home/CountdownCard";
import { AnniversaryBanner } from "@/src/components/home/AnniversaryBanner";
import GoldDustLayer from "@/src/components/ui/GoldDustLayer";
import Marquee from "@/src/components/Marquee";
import { useApp } from "@/src/context/AppContext";
import { useTabBarAnimation } from "@/src/context/TabBarAnimationContext";
import { Dish, DISHES } from "@/src/data/menu";
import { useTabBarScrollHandler } from "@/src/hooks/useTabBarScrollHandler";
import { colors } from "@/src/theme";
import { apiClient } from "@/src/utils/apiClient";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  ImageSourcePropType,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInRight,
  FadeInUp,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useFrameCallback,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  ZoomIn,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

const { width: SCREEN_W } = Dimensions.get("window");

// ─── Design tokens ────────────────────────────────────────────────────────────
const GOLD = "#C9A84C";
const GOLD_LIGHT = "#E8C97A";
const GOLD_DIM = "#8A6D2F";
const GOLD_SOFT = "rgba(201,168,76,0.15)";

const SPRING_CONFIG = { damping: 18, stiffness: 180, mass: 0.8 };

const MODES = [
  {
    id: "dine-in",
    label: "Dine In",
    icon: "restaurant",
    desc: "Reserve a table",
    colors: ["rgba(0, 150, 136, 0.24)", "rgba(5, 5, 5, 0.88)"],
    activeColors: ["rgba(0, 150, 136, 0.38)", "rgba(5, 5, 5, 0.85)"],
    iconGradient: ["#00897bac", "#004d408c"],
    borderColor: "rgba(0, 150, 135, 0.15)",
    activeBorderColor: "rgba(0, 150, 135, 0.22)",
    bgImage: require("../../assets/images/dine_in.jpg"),
    imageOpacity: 0.85,
    activeImageOpacity: 1.0,
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  {
    id: "takeaway",
    label: "Takeaway",
    icon: "bag",
    desc: "Pick up your order",
    colors: ["rgba(212, 175, 55, 0.18)", "rgba(5, 5, 5, 0.96)"],
    activeColors: ["rgba(212, 175, 55, 0.32)", "rgba(5, 5, 5, 0.96)"],
    iconGradient: ["#b58f26ff", "#544525ff"],
    borderColor: "rgba(201, 168, 76, 0.11)",
    activeBorderColor: "rgba(201, 168, 76, 0.28)",
    bgImage: require("../../assets/images/takeaway.jpg"),
    imageOpacity: 0.55,
    activeImageOpacity: 0.7,
    start: { x: 1, y: 0 },
    end: { x: 0, y: 1 },
  },
  {
    id: "delivery",
    label: "Delivery",
    icon: "bicycle",
    desc: "Hot & fresh",
    colors: ["rgba(0, 150, 136, 0.24)", "rgba(5, 5, 5, 0.88)"],
    activeColors: ["rgba(0, 150, 136, 0.38)", "rgba(5, 5, 5, 0.85)"],
    iconGradient: ["#00897bac", "#004d408c"],
    borderColor: "rgba(0, 150, 135, 0.15)",
    activeBorderColor: "rgba(0, 150, 135, 0.22)",
    bgImage: require("../../assets/images/delivery.png"),
    imageOpacity: 0.85,
    activeImageOpacity: 1.0,
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
];

const OFFER_1 = require("../../assets/images/offer1.png");
const OFFER_2 = require("../../assets/images/offer2.png");
const OFFER_3 = require("../../assets/images/offer3.png");
const OFFER_4 = require("../../assets/images/offer4.png");
const OFFER_5 = require("../../assets/images/offer5.png");
const OFFER_6 = require("../../assets/images/offer6.png");
const OFFER_7 = require("../../assets/images/offer7.png");
const OFFER_8 = require("../../assets/images/offer8.png");
const OFFER_9 = require("../../assets/images/offer9.png");
const OFFER_10 = require("../../assets/images/offer10.png");
const OFFER_11 = require("../../assets/images/offer11.png");

type PromoOffer = {
  id: string;
  icon: ImageSourcePropType;
  headline: string;
  sub: string;
  code: string;
  accent: string;
  description: string;
};

const PROMO_OFFERS: PromoOffer[] = [
  {
    id: "p1",
    icon: OFFER_11,
    headline: "20% OFF First Order",
    sub: "Use code PUNJABI20 · Min order ₹499",
    code: "PUNJABI20",
    accent: "#F0C850",
    description: "Welcome to Punjabi Kitchen! Enjoy 20% discount on your very first order. Use coupon code PUNJABI20. Minimum order value ₹499.",
  },
  {
    id: "p2",
    icon: OFFER_10,
    headline: "Free Delivery Today",
    sub: "On all orders above ₹399",
    code: "FREEDEL",
    accent: "#E8A838",
    description: "Hungry? Get free delivery on all orders above ₹399. Fast delivery straight to your doorstep.",
  },
  {
    id: "p3",
    icon: OFFER_3,
    headline: "Buy 1 Get 1 Naan",
    sub: "Fresh butter & garlic naans · Code BOGO",
    code: "BOGO",
    accent: "#D4AF37",
    description: "Buy any Naan and get the second one completely free. Double the joy with code BOGO. Add both naans to cart to apply.",
  },
  {
    id: "p4",
    icon: OFFER_4,
    headline: "Free Gulab Jamun",
    sub: "On orders above ₹799 · Code SWEETPK",
    code: "SWEETPK",
    accent: "#F3C846",
    description: "Get complimentary Gulab Jamuns dessert on your order above ₹799. Valid for a limited time with coupon code SWEETPK.",
  },
  {
    id: "p5",
    icon: OFFER_8,
    headline: "Royal Thali at ₹299",
    sub: "Full meal with sweet & drinks · Code THALI299",
    code: "THALI299",
    accent: "#E8C97A",
    description: "Feast on a complete Family Thali with Dal Makhani, Shahi Paneer, Naan, Rice & Sweet for just ₹299. Code THALI299.",
  },
  {
    id: "p6",
    icon: OFFER_6,
    headline: "Flat ₹100 Cashback",
    sub: "Flat savings on orders above ₹699",
    code: "PK100",
    accent: "#F0C850",
    description: "Save big on your weekend order. Get flat ₹100 instant cashback on orders above ₹699 with code PK100.",
  },
  {
    id: "p7",
    icon: OFFER_7,
    headline: "Late Night 15% OFF",
    sub: "Order 10 PM - 1 AM · Code MIDNIGHT",
    code: "MIDNIGHT",
    accent: "#E8A838",
    description: "Midnight cravings? Order between 10 PM and 1 AM to get flat 15% discount on all items with code MIDNIGHT.",
  },
  {
    id: "p8",
    icon: OFFER_9,
    headline: "Weekend Special Deal",
    sub: "Flat 15% off family platters · Code WEEKEND",
    code: "WEEKEND",
    accent: "#D4AF37",
    description: "Make your weekend delicious! Enjoy 15% discount on all family platters and tandoor starters. Use coupon code WEEKEND.",
  },
];

const MOODS = [
  { label: "Curries", cat: "curry", icon: require("../../assets/images/curries.png") },
  { label: "Breads", cat: "breads", icon: require("../../assets/images/breads.png") },
  { label: "Tandoor", cat: "tandoor", icon: require("../../assets/images/tandoor.png") },
  { label: "Beverages", cat: "beverages", icon: require("../../assets/images/beverages.png") },
  { label: "Desserts", cat: "desserts", icon: require("../../assets/images/desserts.png") },
  { label: "Chinese", cat: "chinese", icon: require("../../assets/images/chinese.png") },
];

// ─────────────────────────────────────────────────────────────────────────────
// 1. AnimatedPromoTicker & OfferDetailModal
//    Continuous scrolling offer text marquee. Tap anywhere to expand all active deals.
// ─────────────────────────────────────────────────────────────────────────────
const ITEM_WIDTH = 550;
const TOTAL_W = PROMO_OFFERS.length * ITEM_WIDTH;

let _setModalVisible: ((visible: boolean) => void) | null = null;

function AnimatedPromoTicker() {
  const translateX = useSharedValue(0);

  useFrameCallback((frameInfo) => {
    const timeDelta = frameInfo.timeSincePreviousFrame || 16.67;
    // 0.025 pixels per millisecond (around 25px per second) - extremely slow and readable
    const speed = 0.025;

    translateX.value = translateX.value - speed * timeDelta;

    // Smooth loop reset
    if (translateX.value <= -TOTAL_W) {
      translateX.value += TOTAL_W;
    }
  });

  const scrollStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const repeatedOffers = [...PROMO_OFFERS, ...PROMO_OFFERS, ...PROMO_OFFERS];

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => _setModalVisible?.(true)}
      style={ticker.wrap}
    >
      <LinearGradient
        colors={["rgba(201,168,76,0.3)", "rgba(201,168,76,0.05)", "transparent"]}
        style={ticker.topGlow}
      />

      <Animated.View style={[ticker.scrollRow, scrollStyle]}>
        {repeatedOffers.map((item, index) => {
          // Combine headline and details into a single flat string to avoid nested text layout reflows
          const combinedText = `${item.headline} · ${item.sub}`;
          return (
            <View key={`${item.id}-${index}`} style={ticker.marqueeItem}>
              <View style={ticker.marqueeItemLeft}>
                <Image
                  source={item.icon}
                  style={ticker.marqueeIcon}
                  contentFit="contain"
                />
                <Text style={ticker.marqueeText} numberOfLines={1}>
                  {combinedText}
                </Text>
                <View style={ticker.marqueeCodePill}>
                  <Text style={ticker.marqueeCodeText}>{item.code}</Text>
                </View>
              </View>
              <View style={ticker.marqueeDivider} />
            </View>
          );
        })}
      </Animated.View>

      <LinearGradient
        colors={["rgba(14, 10, 8, 1)", "transparent"]}
        start={{ x: 0, y: 0.5 }} end={{ x: 0.08, y: 0.5 }}
        style={ticker.fadeLeft} pointerEvents="none"
      />
      <LinearGradient
        colors={["transparent", "rgba(14, 10, 8, 1)"]}
        start={{ x: 0.92, y: 0.5 }} end={{ x: 1, y: 0.5 }}
        style={ticker.fadeRight} pointerEvents="none"
      />
    </TouchableOpacity>
  );
}

/** Rendered at the screen root level to display all active deals in detail */
function OfferDetailModal() {
  const [visible, setVisible] = useState(false);
  const { animatedTranslateY, hiddenOffset } = useTabBarAnimation();
  const { onScroll } = useTabBarScrollHandler(animatedTranslateY, hiddenOffset);

  useEffect(() => {
    _setModalVisible = setVisible;
    return () => { _setModalVisible = null; };
  }, []);

  if (!visible) return null;

  return (
    <View style={ticker.modalOverlay}>
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={1}
        onPress={() => setVisible(false)}
      />
      <Animated.View
        entering={FadeInDown.duration(260)}
        style={ticker.modalCard}
      >
        <LinearGradient
          colors={["rgba(26,20,16,1)", "rgba(16,12,8,1)"]}
          style={StyleSheet.absoluteFill}
        />

        {/* Header */}
        <View style={ticker.modalHeader}>
          <View style={ticker.modalHeaderTitleWrap}>
            <Ionicons name="gift" size={20} color={GOLD} />
            <Text style={ticker.modalTitle}>Exclusive Offers</Text>
          </View>
          <TouchableOpacity
            onPress={() => setVisible(false)}
            style={ticker.modalClose}
          >
            <Ionicons name="close" size={18} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
        </View>

        {/* Scrollable list of all active deals */}
        <Animated.ScrollView
          onScroll={onScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={ticker.modalScrollContent}
        >
          {PROMO_OFFERS.map((offer, index) => (
            <View key={offer.id} style={ticker.offerItemContainer}>
              <View style={ticker.offerMainRow}>
                {/* Contextual image wrapper */}
                <View style={ticker.offerIconWrap}>
                  <Image
                    source={offer.icon}
                    style={ticker.offerIcon}
                    contentFit="contain"
                  />
                </View>

                {/* Text details */}
                <View style={ticker.offerInfoCol}>
                  <Text style={[ticker.offerHeadline, { color: offer.accent }]}>
                    {offer.headline}
                  </Text>
                  <Text style={ticker.offerDescription}>
                    {offer.description}
                  </Text>
                </View>
              </View>

              {/* Promo code & apply row */}
              <View style={ticker.offerActionRow}>
                <View style={[ticker.codeBox, { borderColor: offer.accent + "40" }]}>
                  <Text style={[ticker.codeLabel, { color: offer.accent }]}>{offer.code}</Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setVisible(false)}
                  style={[ticker.applyBtn, { backgroundColor: offer.accent }]}
                >
                  <Text style={ticker.applyBtnText}>Apply</Text>
                </TouchableOpacity>
              </View>

              {index < PROMO_OFFERS.length - 1 && <View style={ticker.offerSeparator} />}
            </View>
          ))}
        </Animated.ScrollView>
      </Animated.View>
    </View>
  );
}

const ticker = StyleSheet.create({
  // Marquee Wrap Style
  wrap: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 35,
    backgroundColor: "rgba(12, 8, 6, 0.98)",
    borderTopWidth: 0.5,
    borderTopColor: "rgba(201,168,76,0.45)",
    overflow: "hidden",
    justifyContent: "center",
  },
  topGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    zIndex: 3,
  },
  scrollRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  marqueeItem: {
    width: ITEM_WIDTH,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  marqueeItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  marqueeIcon: {
    width: 26,
    height: 26,
  },
  marqueeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
    maxWidth: 360, // Safe bounds preventing overlapping
  },
  marqueeCodePill: {
    backgroundColor: "rgba(201, 168, 76, 0.15)",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(201, 168, 76, 0.4)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  marqueeCodeText: {
    color: GOLD_LIGHT,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  marqueeDivider: {
    width: 1.5,
    height: 16,
    backgroundColor: "rgba(201, 168, 76, 0.4)",
  },
  fadeLeft: { position: "absolute", left: 0, top: 0, bottom: 0, width: 30, zIndex: 2 },
  fadeRight: { position: "absolute", right: 0, top: 0, bottom: 0, width: 30, zIndex: 2 },

  // Modal styles
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.72)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  modalCard: {
    width: SCREEN_W - 40,
    maxHeight: "80%",
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 22,
    borderWidth: 1.5,
    borderColor: "rgba(201,168,76,0.3)",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  modalHeaderTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  modalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalScrollContent: {
    paddingVertical: 16,
    paddingBottom: 24,
  },
  offerItemContainer: {
    marginBottom: 8,
  },
  offerMainRow: {
    flexDirection: "row",
    gap: 14,
  },
  offerIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "rgba(201,168,76,0.08)",
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  offerIcon: {
    width: 38,
    height: 38,
  },
  offerInfoCol: {
    flex: 1,
    gap: 4,
  },
  offerHeadline: {
    fontSize: 15,
    fontWeight: "800",
  },
  offerDescription: {
    color: "rgba(255, 255, 255, 0.55)",
    fontSize: 12,
    lineHeight: 18,
  },
  offerActionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingLeft: 66, // Align nicely under text
  },
  codeBox: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  codeLabel: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  applyBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 10,
    minWidth: 70,
    alignItems: "center",
  },
  applyBtnText: {
    color: "#0F0B08",
    fontSize: 12,
    fontWeight: "800",
  },
  offerSeparator: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginVertical: 18,
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. AnimatedGreeting  [CHANGE 1]
//    • "Hello" replaces "Good evening"
//    • User's real name shown (from useApp().user.name)
//    • Gold "PK" avatar circle REMOVED entirely
//    • Shimmer animates on the user name text
// ─────────────────────────────────────────────────────────────────────────────
function AnimatedGreeting() {
  const { user } = useApp();
  const userName = user?.name || "Guest";

  return (
    <Animated.View
      entering={FadeInDown.delay(100).springify().damping(20)}
      style={greeting.row}
    >
      <View style={{
        flexDirection: "row",
        alignItems: "baseline",
        gap: 6,
        backgroundColor: "#0A0A0A", // Match the screen background color to mask the border
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderTopWidth: 0,
        borderBottomWidth: 1.5,
        borderColor: "rgba(201, 168, 76, 0.4)", // Thin golden border
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.95,
        shadowRadius: 5,
        elevation: 8, // Android shadow support
      }}>
        <Text style={greeting.welcomeLabel}>Hello there 👋,</Text>
        <Text style={greeting.nameText}>{userName}</Text>
      </View>
    </Animated.View>
  );
}

const greeting = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 44,
    paddingTop: 20,
    paddingBottom: 0,
    marginBottom: -25,
    position: "relative",
    zIndex: 10,
    elevation: 10,
  },
  welcomeLabel: {
    color: "rgba(255, 255, 255, 0.75)",
    fontSize: 13,
    fontFamily: Platform.select({
      ios: "Georgia-Italic",
      android: "serif",
    }),
    fontStyle: "italic",
    textShadowColor: "rgba(255, 255, 255, 0.35)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  nameText: {
    color: GOLD,
    fontSize: 18,
    fontFamily: Platform.select({
      ios: "Snell Roundhand",
      android: "cursive",
    }),
    fontWeight: "bold",
    letterSpacing: 0.5,
    textShadowColor: "rgba(232, 201, 122, 0.2)", // Gold glow
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. AnimatedHeroBanner  [CHANGE 2]
//    • Food/restaurant HD image as background (ImageBackground-style)
//    • New Punjabi Kitchen specific headline copy
//    • Keeps all original animations (parallax, stats, orders badge, glow)
// ─────────────────────────────────────────────────────────────────────────────

const HERO_BG_URI = require("../../assets/images/BACK.png");

function AnimatedHeroBanner({
  ordersLength,
  scrollY,
}: {
  ordersLength: number;
  scrollY: SharedValue<number>;
}) {
  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(scrollY.value, [0, 200], [1, 0.96], "clamp") },
    ],
    opacity: interpolate(scrollY.value, [0, 160], [1, 0.85], "clamp"),
  }));

  const glow = useSharedValue(1);
  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 900, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glow.value }],
    opacity: interpolate(glow.value, [1, 1.15], [0.5, 1]),
  }));

  return (
    <Animated.View style={[heroBanner.container, containerStyle]}>
      <Image
        source={HERO_BG_URI}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />
      <LinearGradient
        colors={["rgba(10,10,10,0.50)", "rgba(10,10,10,0.18)", "rgba(10,10,10,0.80)"]}
        start={{ x: 0, y: 0 }} // Top-left
        end={{ x: 1, y: 1 }}   // Bottom-right
        style={StyleSheet.absoluteFillObject}
      />

      <View style={heroBanner.arcWrap} pointerEvents="none">
        <View style={heroBanner.arc} />
      </View>

      <Animated.Text
        entering={FadeInDown.delay(200).springify().damping(22)}
        style={heroBanner.overline}
      >
        ✦ Multi Cuisine Family Restaurant · Ranchi
      </Animated.Text>

      <Animated.Text
        entering={FadeInDown.delay(320).springify().damping(22)}
        style={heroBanner.headline}
      >
        Rooted in{"\n"}
        <Text style={heroBanner.headlineGold}>Punjab's Soul</Text>
      </Animated.Text>

      {ordersLength > 0 && (
        <Animated.View
          entering={FadeInDown.delay(380).springify()}
          style={heroBanner.inlineOrdersBadge}
        >
          <Animated.View style={[heroBanner.ordersGlow, glowStyle]} />
          <Ionicons name="receipt-outline" size={13} color={GOLD} />
          <Text style={heroBanner.inlineOrdersText}>
            {ordersLength} active order{ordersLength > 1 ? "s" : ""}
          </Text>
        </Animated.View>
      )}

      <Animated.Text
        entering={FadeInUp.delay(460).duration(600)}
        style={heroBanner.sub}
      >
        Authentic flavours · Cooked with love · Delivered fresh
      </Animated.Text>

      <Animated.View
        entering={FadeInUp.delay(580).springify().damping(20)}
        style={heroBanner.statsRow}
      >
        {[
          { label: "4.9★", sub: "Rating" },
          { label: "30m", sub: "Delivery" },
          { label: "51K+", sub: "Orders" },
          { label: "98%", sub: "Satisfaction" },
        ].map((s, i) => (
          <Animated.View
            key={s.label}
            entering={FadeInUp.delay(630 + i * 70).springify()}
            style={[
              heroBanner.statItem,
              i === 3 && { borderRightWidth: 0 },
            ]}
          >
            <Text style={heroBanner.statVal}>{s.label}</Text>
            <Text style={heroBanner.statSub}>{s.sub}</Text>
          </Animated.View>
        ))}
      </Animated.View>

      <AnimatedPromoTicker />
    </Animated.View>
  );
}

const heroBanner = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 0,
    borderRadius: 28,
    overflow: "hidden",
    paddingHorizontal: 22,
    paddingTop: 40,
    paddingBottom: 50,
    borderWidth: 0.5,
    borderColor: "rgba(201,168,76,0.3)",
    minHeight: 220,
    justifyContent: "center",
  },
  arcWrap: {
    position: "absolute", right: -60, top: -60,
    width: 200, height: 200, borderRadius: 100, overflow: "hidden",
  },
  arc: {
    width: 200, height: 200, borderRadius: 100,
    borderWidth: 40, borderColor: "rgba(201,168,76,0.1)",
  },
  overline: {
    color: GOLD,
    fontSize: 10,
    letterSpacing: 2.5,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  headline: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "300",
    lineHeight: 38,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  headlineGold: {
    color: GOLD_LIGHT,
    fontWeight: "800",
    fontStyle: "italic",
  },
  sub: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12.5,
    fontWeight: "400",
    marginBottom: 18,
    letterSpacing: 0.2,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(0, 0, 0, 0.45)", // Semi-transparent black capsule
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    borderRightWidth: 0.5,
    borderRightColor: "rgba(255,255,255,0.12)",
    paddingVertical: 6,
    bottom: 0,
  },
  statVal: { color: GOLD_LIGHT, fontWeight: "700", fontSize: 15, marginBottom: 2 },
  statSub: { color: "rgba(255,255,255,0.65)", fontSize: 10, letterSpacing: 0.3 },
  inlineOrdersBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: GOLD_SOFT,
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 0.5,
    borderColor: "rgba(201,168,76,0.45)",
    alignSelf: "flex-start",
    marginTop: 2,
    marginBottom: 12,
    position: "relative",
  },
  ordersGlow: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 100,
    backgroundColor: "rgba(201,168,76,0.15)",
  },
  inlineOrdersText: { color: "#FFF", fontSize: 11, fontWeight: "700" },
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. AnimatedModeRow  [CHANGE 4]
//    Mode cards with SERIF ITALIC font for labels (Dine In / Takeaway / Delivery)
//    Spring press + glow pulse on active
// ─────────────────────────────────────────────────────────────────────────────
function AnimatedModeCard({
  item,
  index,
  onPress,
  active,
}: {
  item: typeof MODES[0];
  index: number;
  onPress: () => void;
  active?: boolean;
}) {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(180 + index * 80, withSpring(1, SPRING_CONFIG));
    opacity.value = withDelay(180 + index * 80, withTiming(1, { duration: 350 }));
  }, []);

  const pressScale = useSharedValue(1);
  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value * scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[modeCard.wrap, cardStyle]}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPressIn={() => { pressScale.value = withSpring(0.93, { damping: 14, stiffness: 400 }); }}
        onPressOut={() => { pressScale.value = withSpring(1, SPRING_CONFIG); }}
        onPress={onPress}
        style={modeCard.cardTouch}
      >
        <LinearGradient
          colors={active ? (item.activeColors as [string, string]) : (item.colors as [string, string])}
          start={item.start as any}
          end={item.end as any}
          style={[
            modeCard.card,
            { borderColor: active ? item.activeBorderColor : item.borderColor }
          ]}
        >
          {item.bgImage && (
            <Image
              source={item.bgImage}
              style={[
                modeCard.bgImage,
                { opacity: active ? item.activeImageOpacity : item.imageOpacity }
              ]}
              contentFit="cover"
              contentPosition="right bottom"
            />
          )}
          <LinearGradient
            colors={["rgba(0, 0, 0, 0.98)", "rgba(0, 0, 0, 0.0)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.75, y: 0.75 }}
            style={modeCard.overlay}
          />

          <LinearGradient
            colors={item.iconGradient as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={modeCard.iconCircle}
          >
            <Ionicons name={item.icon as any} size={17} color="#FFF" />
          </LinearGradient>

          <View style={modeCard.textGroup}>
            <Text style={modeCard.label} numberOfLines={1}>
              {item.label}
            </Text>
            <Text style={modeCard.desc} numberOfLines={1}>
              {item.desc}
            </Text>
          </View>

          <View
            style={[
              modeCard.arrowCircle,
              { borderColor: active ? item.activeBorderColor : item.borderColor }
            ]}
          >
            <Ionicons name="chevron-forward" size={14} color="#FFF" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

function AnimatedModesRow() {
  const [active, setActive] = React.useState("dine-in");
  const router = useRouter();

  const handleModePress = (id: string) => {
    setActive(id);
    if (id === "dine-in") {
      router.replace("/(tabs)/reserves" as any);
    } else {
      router.replace("/(tabs)/menu" as any);
    }
  };

  return (
    <View style={modeCard.row}>
      {MODES.map((m, i) => (
        <AnimatedModeCard
          key={m.id}
          item={m}
          index={i}
          active={active === m.id}
          onPress={() => handleModePress(m.id)}
        />
      ))}
    </View>
  );
}

const modeCard = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  wrap: { flex: 1 },
  cardTouch: {
    flex: 1,
    borderRadius: 18,
  },
  card: {
    borderRadius: 18,
    borderWidth: 0.8,
    paddingTop: 16,
    paddingBottom: 14,
    paddingHorizontal: 12,
    alignItems: "flex-start",
    overflow: "hidden",
    position: "relative",
    height: 155,
    justifyContent: "space-between",
  },
  glowLayer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
  },
  textGroup: {
    width: "100%",
    gap: 2,
    alignItems: "center",
  },
  iconCircle: {
    width: 34, height: 34, borderRadius: 17,
    alignItems: "center", justifyContent: "center",
    alignSelf: "center",
  },
  label: {
    color: "#fff",
    fontFamily: Platform.select({ ios: "System", android: "sans-serif" }),
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.1,
    textAlign: "center",
  },
  desc: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 10,
    textAlign: "center",
    letterSpacing: 0.1,
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  bgImage: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: "90%",
    height: "65%",
    borderRadius: 18,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. AnimatedMoodStrip
//    Placed below HomeModes, gold left-bar REMOVED
// ─────────────────────────────────────────────────────────────────────────────
function MoodChip({ item, index }: { item: typeof MOODS[0]; index: number }) {
  const router = useRouter();
  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(100 + index * 60, withSpring(1, SPRING_CONFIG));
    opacity.value = withDelay(100 + index * 60, withTiming(1, { duration: 300 }));
  }, []);

  const pressScale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value * scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[moodStyle.cardContainer, pressStyle]}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPressIn={() => { pressScale.value = withSpring(0.91, { damping: 15, stiffness: 400 }); }}
        onPressOut={() => { pressScale.value = withSpring(1, SPRING_CONFIG); }}
        onPress={() => {
          router.push({
            pathname: "/(tabs)/menu",
            params: { initialCategory: item.cat },
          });
        }}
        style={moodStyle.chipTouch}
      >
        <LinearGradient
          colors={["rgba(201,168,76,0.3)", "rgba(201,168,76,0.05)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={moodStyle.imageCircle}
        >
          <Image
            source={item.icon}
            style={moodStyle.largeIcon}
            contentFit="contain"
          />
        </LinearGradient>
        <Text style={moodStyle.cardText}>{item.label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

function AnimatedMoodStrip() {
  return (
    <Animated.View
      entering={FadeInDown.delay(300).springify().damping(20)}
      style={moodStyle.section}
    >
      <Animated.Text
        entering={FadeInDown.delay(260).springify()}
        style={moodStyle.title}
      >
        What are you craving?
      </Animated.Text>

      <Marquee speed={32} itemWidth={104} itemCount={MOODS.length}>
        {MOODS.map((m, i) => (
          <MoodChip key={m.cat} item={m} index={i} />
        ))}
      </Marquee>
    </Animated.View>
  );
}

const moodStyle = StyleSheet.create({
  section: { marginTop: 22, marginBottom: 8 },
  title: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.1,
    marginHorizontal: 20,
    marginBottom: 14,
  },
  cardContainer: {
    width: 104,
    alignItems: "center",
    justifyContent: "center",
  },
  chipTouch: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingVertical: 4,
  },
  imageCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1.2,
    borderColor: "rgba(201,168,76,0.32)",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  largeIcon: {
    width: 54,
    height: 54,
  },
  cardText: {
    color: "#E8C97A",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.2,
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. SectionHeader — NO gold left bar
// ─────────────────────────────────────────────────────────────────────────────
function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <Animated.View
      entering={FadeInDown.delay(100).springify().damping(22)}
      style={secHdr.wrap}
    >
      <Text style={secHdr.title}>{title}</Text>
      {subtitle ? (
        <Text
          style={[
            secHdr.sub,
            (
              subtitle === "4.9 ★ from 51,000+ orders" ||
              subtitle === "Opp. Kashyap Eye Hospital, Ranchi"
            ) && secHdr.subHandpicked,
          ]}
        >
          {subtitle}
        </Text>
      ) : null}
    </Animated.View>
  );
}

const secHdr = StyleSheet.create({
  wrap: {
    marginHorizontal: 20,
    marginTop: 26,
    marginBottom: 14,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  sub: {
    color: "rgba(255,255,255,0.42)",
    fontSize: 12,
    marginTop: 3,
    fontWeight: "400",
  },
  subHandpicked: {
    fontFamily: "serif",
    fontStyle: "italic",
    fontWeight: "600",
    letterSpacing: 0.2,
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. AnimatedDishCard — Chef Specials entry animation
// ─────────────────────────────────────────────────────────────────────────────
export function AnimatedDishCard({ item, index }: { item: any; index: number }) {
  const lift = useSharedValue(0);
  const shadow = useSharedValue(0);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: lift.value }],
    shadowOpacity: interpolate(shadow.value, [0, 1], [0.15, 0.45]),
    shadowRadius: interpolate(shadow.value, [0, 1], [8, 20]),
  }));

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 80).springify().damping(20)}
      style={[dishCard.wrap, cardStyle]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={() => { lift.value = withSpring(-5, { damping: 12, stiffness: 300 }); shadow.value = withTiming(1, { duration: 200 }); }}
        onPressOut={() => { lift.value = withSpring(0, SPRING_CONFIG); shadow.value = withTiming(0, { duration: 300 }); }}
        style={dishCard.card}
      >
        <LinearGradient colors={["#2a1a14", "#1a1008"]} style={dishCard.imgWrap}>
          <Text style={dishCard.emoji}>🍛</Text>
        </LinearGradient>

        <Animated.View
          entering={ZoomIn.delay(index * 80 + 200).springify()}
          style={dishCard.ratingBadge}
        >
          <Text style={dishCard.ratingText}>★ {item?.rating ?? "4.9"}</Text>
        </Animated.View>

        <View style={dishCard.info}>
          <Text style={dishCard.name} numberOfLines={1}>{item?.name ?? "Chef Special"}</Text>
          <Text style={dishCard.price}>₹ {item?.price ?? "299"}</Text>
        </View>

        <TouchableOpacity style={dishCard.addBtn}>
          <Ionicons name="add" size={18} color="#1a0d0a" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

const dishCard = StyleSheet.create({
  wrap: {
    width: 160, marginRight: 12,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 18, borderWidth: 0.5,
    borderColor: "rgba(201,168,76,0.2)", overflow: "hidden",
  },
  imgWrap: { width: "100%", height: 130, alignItems: "center", justifyContent: "center" },
  emoji: { fontSize: 44 },
  ratingBadge: {
    position: "absolute", top: 10, right: 10,
    backgroundColor: "rgba(0,0,0,0.72)",
    borderRadius: 100, paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 0.5, borderColor: "rgba(201,168,76,0.4)",
  },
  ratingText: { color: GOLD_LIGHT, fontSize: 11, fontWeight: "600" },
  info: { padding: 10, gap: 3 },
  name: { color: "#fff", fontSize: 13, fontWeight: "600", letterSpacing: 0.1 },
  price: { color: GOLD_LIGHT, fontSize: 13, fontWeight: "700" },
  addBtn: {
    position: "absolute", bottom: 10, right: 10,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: GOLD, alignItems: "center", justifyContent: "center",
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. LocationSection — Interactive Map + Delivery Tracker [CHANGE 3]
// ─────────────────────────────────────────────────────────────────────────────
const RESTAURANT_LAT = 23.3569;
const RESTAURANT_LNG = 85.3340;

function useRestaurantStatus() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentMinutes = hours * 60 + minutes;
  const openMinutes = 11 * 60; // 11:00 AM
  const closeMinutes = 23 * 60; // 11:00 PM
  const isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;

  let statusDetail = "";
  if (isOpen) {
    const remaining = closeMinutes - currentMinutes;
    const h = Math.floor(remaining / 60);
    const m = remaining % 60;
    statusDetail = h > 0 ? `Closes in ${h}h ${m}m` : `Closes in ${m}m`;
  } else {
    statusDetail = "Opens at 11:00 AM";
  }

  return { isOpen, statusDetail };
}

function buildMapHTML(hasActiveDelivery: boolean) {
  return `
<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body, #map { width: 100%; height: 100%; }
  .leaflet-control-attribution { display: none !important; }
  .leaflet-control-zoom { display: none !important; }
  
  .restaurant-pin {
    width: 44px; height: 44px;
    display: flex; align-items: center; justify-content: center;
    position: relative;
  }
  .restaurant-pin .pin-ring {
    position: absolute; width: 44px; height: 44px; border-radius: 50%;
    border: 2.5px solid rgba(201,168,76,0.7);
    animation: pinPulse 2s ease-in-out infinite;
  }
  .restaurant-pin .pin-core {
    width: 22px; height: 22px; border-radius: 50%;
    background: radial-gradient(circle at 40% 35%, #E8C97A, #C9A84C, #8A6D2F);
    border: 2px solid rgba(255,255,255,0.9);
    box-shadow: 0 2px 12px rgba(201,168,76,0.5), 0 0 20px rgba(201,168,76,0.25);
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; z-index: 2;
  }
  @keyframes pinPulse {
    0%, 100% { transform: scale(1); opacity: 0.7; }
    50% { transform: scale(1.35); opacity: 0; }
  }
  
  .restaurant-label {
    background: rgba(12,8,6,0.88);
    border: 1px solid rgba(201,168,76,0.45);
    border-radius: 8px; padding: 4px 10px;
    color: #E8C97A; font-size: 11px; font-weight: 700;
    font-family: -apple-system, sans-serif;
    white-space: nowrap; letter-spacing: 0.3px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.4);
    text-align: center;
  }
  
  .rider-pin {
    width: 40px; height: 40px;
    display: flex; align-items: center; justify-content: center;
    position: relative;
  }
  .rider-pin .rider-glow {
    position: absolute; width: 40px; height: 40px; border-radius: 50%;
    background: rgba(66,133,244,0.25);
    animation: riderPulse 1.5s ease-in-out infinite;
  }
  .rider-pin .rider-core {
    width: 28px; height: 28px; border-radius: 50%;
    background: linear-gradient(135deg, #4285F4, #1a73e8);
    border: 2.5px solid #fff;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; z-index: 2;
    box-shadow: 0 2px 10px rgba(66,133,244,0.5);
  }
  @keyframes riderPulse {
    0%, 100% { transform: scale(1); opacity: 0.6; }
    50% { transform: scale(1.5); opacity: 0; }
  }
  
  .rider-label {
    background: rgba(26,115,232,0.92);
    border: 1px solid rgba(255,255,255,0.3);
    border-radius: 6px; padding: 3px 8px;
    color: #fff; font-size: 10px; font-weight: 700;
    font-family: -apple-system, sans-serif;
    white-space: nowrap;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  }
</style>
</head><body>
<div id="map"></div>
<script>
  var map = L.map('map', {
    center: [${RESTAURANT_LAT}, ${RESTAURANT_LNG}],
    zoom: 16,
    zoomControl: false,
    attributionControl: false,
    dragging: true,
    scrollWheelZoom: false,
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19
  }).addTo(map);

  // Restaurant marker
  var pinIcon = L.divIcon({
    className: '',
    html: '<div class="restaurant-pin"><div class="pin-ring"></div><div class="pin-core">🍛</div></div>',
    iconSize: [44, 44],
    iconAnchor: [22, 22]
  });
  var restaurantMarker = L.marker([${RESTAURANT_LAT}, ${RESTAURANT_LNG}], { icon: pinIcon }).addTo(map);
  
  // Restaurant label tooltip
  restaurantMarker.bindTooltip('<div class="restaurant-label">Punjabi Kitchen</div>', {
    permanent: true, direction: 'top', offset: [0, -26], className: ''
  });

  ${hasActiveDelivery ? `
  // Delivery rider
  var riderIcon = L.divIcon({
    className: '',
    html: '<div class="rider-pin"><div class="rider-glow"></div><div class="rider-core">🏍️</div></div>',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
  
  var riderStartLat = ${RESTAURANT_LAT} + 0.012;
  var riderStartLng = ${RESTAURANT_LNG} - 0.008;
  var riderMarker = L.marker([riderStartLat, riderStartLng], { icon: riderIcon }).addTo(map);
  riderMarker.bindTooltip('<div class="rider-label">Ramesh · On the way</div>', {
    permanent: true, direction: 'top', offset: [0, -24], className: ''
  });
  
  // Route polyline
  var routePoints = [
    [riderStartLat, riderStartLng],
    [riderStartLat - 0.003, riderStartLng + 0.002],
    [riderStartLat - 0.006, riderStartLng + 0.004],
    [riderStartLat - 0.009, riderStartLng + 0.006],
    [${RESTAURANT_LAT}, ${RESTAURANT_LNG}]
  ];
  L.polyline(routePoints, {
    color: '#4285F4', weight: 4, opacity: 0.8,
    dashArray: '8, 8', lineCap: 'round'
  }).addTo(map);
  L.polyline(routePoints, {
    color: '#4285F4', weight: 12, opacity: 0.15
  }).addTo(map);
  
  // Animate rider along route
  var step = 0;
  var totalSteps = 200;
  function animateRider() {
    step = (step + 1) % totalSteps;
    var progress = step / totalSteps;
    var segIndex = Math.min(Math.floor(progress * (routePoints.length - 1)), routePoints.length - 2);
    var segProgress = (progress * (routePoints.length - 1)) - segIndex;
    var lat = routePoints[segIndex][0] + (routePoints[segIndex + 1][0] - routePoints[segIndex][0]) * segProgress;
    var lng = routePoints[segIndex][1] + (routePoints[segIndex + 1][1] - routePoints[segIndex][1]) * segProgress;
    riderMarker.setLatLng([lat, lng]);
    setTimeout(animateRider, 120);
  }
  animateRider();
  
  // Fit bounds to show both markers
  map.fitBounds([[${RESTAURANT_LAT}, ${RESTAURANT_LNG}], [riderStartLat, riderStartLng]], { padding: [40, 40] });
  ` : ''}

  // Tap to open directions
  map.on('click', function() {
    window.ReactNativeWebView.postMessage('openDirections');
  });
</script>
</body></html>`;
}

function LocationSection() {
  const { orders } = useApp();
  const { isOpen, statusDetail } = useRestaurantStatus();

  const activeDeliveryOrder = useMemo(
    () => orders.find((o) => o.status === "On the Way"),
    [orders]
  );
  const hasActiveDelivery = !!activeDeliveryOrder;

  const mapHTML = useMemo(() => buildMapHTML(hasActiveDelivery), [hasActiveDelivery]);

  const handleMapMessage = useCallback((event: any) => {
    if (event.nativeEvent.data === "openDirections") {
      const url = Platform.select({
        ios: `maps://app?daddr=${RESTAURANT_LAT},${RESTAURANT_LNG}`,
        default: `https://www.google.com/maps/dir/?api=1&destination=${RESTAURANT_LAT},${RESTAURANT_LNG}&destination_place_id=Punjabi+Kitchen+Ranchi`,
      });
      Linking.openURL(url);
    }
  }, []);

  return (
    <Animated.View
      entering={FadeInUp.delay(100).springify().damping(22)}
      style={locStyle.container}
    >
      {/* Interactive Map */}
      <View style={locStyle.mapWrap}>
        <WebView
          source={{ html: mapHTML }}
          style={locStyle.webview}
          scrollEnabled={false}
          onMessage={handleMapMessage}
          javaScriptEnabled
          domStorageEnabled
          originWhitelist={["*"]}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          overScrollMode="never"
          nestedScrollEnabled={false}
          cacheEnabled
        />

        {/* Overlay gradient at bottom for smooth blend */}
        <LinearGradient
          colors={["transparent", "rgba(14,10,8,0.6)"]}
          style={locStyle.mapBottomFade}
          pointerEvents="none"
        />

        {/* Live badge */}
        {hasActiveDelivery && (
          <View style={locStyle.liveBadge}>
            <View style={locStyle.liveDot} />
            <Text style={locStyle.liveText}>LIVE TRACKING</Text>
          </View>
        )}

        {/* Map corner label */}
        <View style={locStyle.mapCornerLabel}>
          <Ionicons name="map-outline" size={11} color={GOLD} />
          <Text style={locStyle.mapCornerText}>Tap map for directions</Text>
        </View>
      </View>

      {/* Premium Info Card */}
      <View style={locStyle.card}>
        {/* Restaurant name row */}
        <View style={locStyle.nameRow}>
          <LinearGradient
            colors={["rgba(201,168,76,0.18)", "rgba(201,168,76,0.06)"]}
            style={locStyle.iconPill}
          >
            <Ionicons name="restaurant-outline" size={17} color={GOLD} />
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={locStyle.restName}>Punjabi Kitchen</Text>
            <Text style={locStyle.restType}>Multi Cuisine Family Restaurant</Text>
          </View>
          {/* Status badge */}
          <View style={[locStyle.statusBadge, !isOpen && locStyle.statusBadgeClosed]}>
            <View style={[locStyle.statusDot, !isOpen && locStyle.statusDotClosed]} />
            <Text style={[locStyle.statusText, !isOpen && locStyle.statusTextClosed]}>
              {isOpen ? "Open" : "Closed"}
            </Text>
          </View>
        </View>

        <View style={locStyle.dividerLine} />

        {/* Address */}
        <View style={locStyle.infoRow}>
          <View style={locStyle.infoIcon}>
            <Ionicons name="location-outline" size={15} color={GOLD} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={locStyle.infoLabel}>Address</Text>
            <Text style={locStyle.infoValue}>
              Purulia Road, Opposite Kashyap Eye Hospital{"\n"}
              Ajit Enclave, New Barhi Toli, Ranchi — 834001
            </Text>
          </View>
        </View>

        {/* Timings */}
        <View style={locStyle.infoRow}>
          <View style={locStyle.infoIcon}>
            <Ionicons name="time-outline" size={15} color={GOLD} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={locStyle.infoLabel}>Hours</Text>
            <Text style={locStyle.infoValue}>Daily · 11:00 AM – 11:00 PM</Text>
            <Text style={locStyle.infoSub}>{statusDetail}</Text>
          </View>
        </View>

        {/* Phone */}
        <View style={locStyle.infoRow}>
          <View style={locStyle.infoIcon}>
            <Ionicons name="call-outline" size={15} color={GOLD} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={locStyle.infoLabel}>Phone</Text>
            <Text style={locStyle.infoValue}>+91 96932 10321</Text>
          </View>
        </View>

        <View style={locStyle.dividerLine} />

        {/* CTA buttons */}
        <View style={locStyle.ctaRow}>
          <TouchableOpacity
            style={locStyle.ctaPrimary}
            activeOpacity={0.85}
            onPress={() => {
              const url = Platform.select({
                ios: `maps://app?daddr=${RESTAURANT_LAT},${RESTAURANT_LNG}`,
                default: `https://www.google.com/maps/dir/?api=1&destination=${RESTAURANT_LAT},${RESTAURANT_LNG}`,
              });
              Linking.openURL(url);
            }}
          >
            <Ionicons name="navigate-outline" size={15} color="#1a0d0a" />
            <Text style={locStyle.ctaPrimaryText}>Get Directions</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={locStyle.ctaSecondary}
            activeOpacity={0.85}
            onPress={() => Linking.openURL("tel:+919693210321")}
          >
            <Ionicons name="call-outline" size={15} color={GOLD} />
            <Text style={locStyle.ctaSecondaryText}>Call Us</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const locStyle = StyleSheet.create({
  container: { marginHorizontal: 16, marginBottom: 8 },

  // Map wrapper
  mapWrap: {
    height: 220,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.3)",
    position: "relative",
  },
  webview: {
    flex: 1,
    backgroundColor: "#0d1117",
  },
  mapBottomFade: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  liveBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(66,133,244,0.88)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
    shadowColor: "#4285F4",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#fff",
  },
  liveText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },
  mapCornerLabel: {
    position: "absolute",
    bottom: 10,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
    borderWidth: 0.5,
    borderColor: "rgba(201,168,76,0.3)",
  },
  mapCornerText: {
    color: GOLD_LIGHT,
    fontSize: 10,
    fontWeight: "500",
  },

  // Info card
  card: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: "rgba(201,168,76,0.25)",
    marginTop: 10,
    padding: 18,
    paddingTop: 20,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  iconPill: {
    width: 42,
    height: 42,
    borderRadius: 13,
    borderWidth: 0.5,
    borderColor: "rgba(201,168,76,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  restName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.1,
  },
  restType: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 11,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(34,197,94,0.12)",
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 0.5,
    borderColor: "rgba(34,197,94,0.3)",
  },
  statusBadgeClosed: {
    backgroundColor: "rgba(239,68,68,0.12)",
    borderColor: "rgba(239,68,68,0.3)",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#22c55e",
  },
  statusDotClosed: {
    backgroundColor: "#ef4444",
  },
  statusText: {
    color: "#22c55e",
    fontSize: 11,
    fontWeight: "700",
  },
  statusTextClosed: {
    color: "#ef4444",
  },
  dividerLine: {
    height: 0.5,
    backgroundColor: "rgba(201,168,76,0.15)",
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  infoIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: "rgba(201,168,76,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  infoLabel: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 3,
  },
  infoValue: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 13,
    lineHeight: 19,
  },
  infoSub: {
    color: GOLD_DIM,
    fontSize: 11,
    fontWeight: "500",
    marginTop: 3,
    fontStyle: "italic",
  },
  ctaRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  ctaPrimary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: GOLD,
    borderRadius: 12,
    paddingVertical: 12,
  },
  ctaPrimaryText: {
    color: "#1a0d0a",
    fontWeight: "700",
    fontSize: 13,
  },
  ctaSecondary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: GOLD_SOFT,
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 0.5,
    borderColor: "rgba(201,168,76,0.4)",
  },
  ctaSecondaryText: {
    color: GOLD_LIGHT,
    fontWeight: "600",
    fontSize: 13,
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// 10. AnimatedDivider — subtle gold gradient rule between sections
// ─────────────────────────────────────────────────────────────────────────────
function AnimatedDivider({ delay = 0 }: { delay?: number }) {
  return (
    <Animated.View
      entering={FadeIn.delay(delay).duration(600)}
      style={divStyle.row}
    >
      <LinearGradient
        colors={["transparent", GOLD_SOFT, "transparent"]}
        start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
        style={divStyle.line}
      />
    </Animated.View>
  );
}

const divStyle = StyleSheet.create({
  row: { alignItems: "center", marginVertical: 6, position: "relative" },
  line: { height: 0.5, width: "100%" },
});

// ─────────────────────────────────────────────────────────────────────────────
// HOME SCREEN — final composition with ALL changes integrated
// ─────────────────────────────────────────────────────────────────────────────
export default function Home() {
  const { orders, reservations } = useApp();
  const { animatedTranslateY, hiddenOffset } = useTabBarAnimation();
  const router = useRouter();

  // Shared scroll Y drives FAB visibility + hero parallax + top bar hide
  const scrollY = useSharedValue(0);

  // CHANGE 1: TopBar animation — hides on scroll down
  const topBarTranslateY = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [0, 60],
          [0, -80],
          "clamp"
        ),
      },
    ],
    opacity: interpolate(scrollY.value, [0, 50], [1, 0], "clamp"),
  }));

  const [apiDishes, setApiDishes] = useState<Dish[]>([]);
  useEffect(() => {
    apiClient.getDishes().then(setApiDishes).catch((e) => console.log("Failed to fetch dishes on home:", e));
  }, []);

  const chefSpecials = useMemo(() => {
    const list = apiDishes.length > 0 ? apiDishes : DISHES;
    return list.filter(
      (d) => d.category === "chefs-special" || (d.rating && d.rating >= 4.8)
    ).slice(0, 8);
  }, [apiDishes]);

  const { onScroll } = useTabBarScrollHandler(animatedTranslateY, hiddenOffset, scrollY);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Animated.View style={styles.container}>

        {/* Decorative ambient layer */}
        <GoldDustLayer
          width={Math.max(360, Dimensions.get("window").width)}
          height={220}
          zIndex={0}
        />

        {/* CHANGE 1: Animated TopBar that hides on scroll */}
        <Animated.View style={[{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 }, topBarTranslateY]}>
          <TopBar showProfile={true} />
        </Animated.View>

        <Animated.ScrollView
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          style={styles.scroll}
        >
          {/* Add top padding to prevent content under absolute TopBar */}
          <View style={{ height: Platform.OS === 'ios' ? 70 : 56 }} />



          {/* 2. Greeting — "Hello" + user name, no PK logo */}
          <AnimatedGreeting />

           {/* 3. Hero banner — food image bg + Punjabi Kitchen copy */}
          <AnimatedHeroBanner ordersLength={orders.length} scrollY={scrollY} />

          {/* Anniversary Banner alert */}
          <AnniversaryBanner
            reservations={reservations}
            onPrefill={(pastRes) => {
              router.push({
                pathname: "/(tabs)/reserves",
                params: {
                  prefillGuests: pastRes.guests,
                  prefillTable: String(pastRes.tableNumber),
                  prefillSeating: pastRes.seatingType || "Indoor",
                  prefillOccasion: pastRes.occasion || "Anniversary",
                },
              });
            }}
          />

          {/* Active Reservation Countdown with dynamic color gradients & weather forecast */}
          <CountdownCard
            reservations={reservations}
            onPressCard={() => router.push("/(tabs)/reserves")}
          />

          {/* Mode selector - placed where HomeHero used to be */}
          <SectionHeader
            title="How would you like to order?"
            subtitle="Choose your dining experience"
          />
          <AnimatedModesRow />

          <AnimatedDivider delay={300} />

          {/* Mood strip directly below modes */}
          <AnimatedMoodStrip />

          <AnimatedDivider delay={400} />

          <DealOfDaySection />

          <AnimatedDivider />

          <ChefSpecialsSection chefSpecials={chefSpecials} />

          <AnimatedDivider />

          {/* Reviews — no gold bar */}
          <SectionHeader
            title="What Our Guests Say"
            subtitle="4.9 ★ from 51,000+ orders"
          />
          <ReviewsSection />

          <AnimatedDivider />

          {/* CHANGE 3: Professional Location Section — completely replaced */}
          <SectionHeader
            title="Find Us"
            subtitle="Opp. Kashyap Eye Hospital, Ranchi"
          />
          <LocationSection />
        </Animated.ScrollView>

      </Animated.View>

      {/* Offer detail modal — rendered at root level to avoid overflow clipping */}
      <OfferDetailModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, position: "relative" },
  scroll: { zIndex: 1 },
});