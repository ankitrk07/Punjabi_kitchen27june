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
import GoldDustLayer from "@/src/components/ui/GoldDustLayer";
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
import React, { useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
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
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  ZoomIn,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

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
    colors: ["rgba(0, 150, 136, 0.04)", "rgba(5, 5, 5, 0.96)"],
    activeColors: ["rgba(0, 150, 136, 0.10)", "rgba(5, 5, 5, 0.96)"],
    iconGradient: ["#00897bac", "#004d408c"],
    borderColor: "rgba(0, 150, 135, 0.15)",
    activeBorderColor: "rgba(0, 150, 135, 0.22)",
  },
  {
    id: "takeaway",
    label: "Takeaway",
    icon: "bag",
    desc: "Pick up your order",
    colors: ["rgba(212, 175, 55, 0.04)", "rgba(5, 5, 5, 0.96)"],
    activeColors: ["rgba(212, 175, 55, 0.10)", "rgba(5, 5, 5, 0.96)"],
    iconGradient: ["#b58f26ff", "#544525ff"],
    borderColor: "rgba(201, 168, 76, 0.11)",
    activeBorderColor: "rgba(201, 168, 76, 0.28)",
  },
  {
    id: "delivery",
    label: "Delivery",
    icon: "bicycle",
    desc: "Hot & fresh delivery",
    colors: ["rgba(0, 150, 136, 0.04)", "rgba(5, 5, 5, 0.96)"],
    activeColors: ["rgba(0, 150, 136, 0.10)", "rgba(5, 5, 5, 0.96)"],
    iconGradient: ["#00897bac", "#004d408c"],
    borderColor: "rgba(0, 150, 135, 0.15)",
    activeBorderColor: "rgba(0, 150, 135, 0.22)",
  },
];

const PROMO_ITEMS = [
  "🔥  Free delivery on orders above ₹499",
  "⭐  4.9-rated Chef Specials available now",
  "🎁  New member? Get 20% off on your first order",
  "🕐  Live orders delivered in just 30 min",
  "🌿  Fresh ingredients sourced daily",
];

const MOODS = [
  { label: "🍛 Curries", cat: "curry" },
  { label: "🍞 Breads", cat: "breads" },
  { label: "🥩 Tandoor", cat: "tandoor" },
  { label: "🥤 Beverages", cat: "beverages" },
  { label: "🧁 Desserts", cat: "desserts" },
  { label: "🍜 Chinese", cat: "chinese" },
];

// ─────────────────────────────────────────────────────────────────────────────
// 1. AnimatedPromoTicker
//    Infinite scrolling promo strip below TopBar
// ─────────────────────────────────────────────────────────────────────────────
function AnimatedPromoTicker() {
  const translateX = useSharedValue(0);
  const fullText = PROMO_ITEMS.join("          ");
  const TICKER_W = fullText.length * 7.2;

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(-TICKER_W / 2, { duration: 22000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={ticker.wrap} pointerEvents="none">
      <LinearGradient
        colors={[colors.bg, "transparent"]}
        start={{ x: 0, y: 0.5 }} end={{ x: 0.12, y: 0.5 }}
        style={ticker.fadeLeft} pointerEvents="none"
      />
      <Animated.Text style={[ticker.text, animStyle]}>
        {fullText}{"          "}{fullText}
      </Animated.Text>
      <LinearGradient
        colors={["transparent", colors.bg]}
        start={{ x: 0.88, y: 0.5 }} end={{ x: 1, y: 0.5 }}
        style={ticker.fadeRight} pointerEvents="none"
      />
    </View>
  );
}

const ticker = StyleSheet.create({
  wrap: {
    height: 34,
    backgroundColor: GOLD_SOFT,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(201,168,76,0.3)",
    overflow: "hidden",
    justifyContent: "center",
  },
  text: { color: GOLD_LIGHT, fontSize: 12, fontWeight: "500", letterSpacing: 0.3, width: 9999 },
  fadeLeft: { position: "absolute", left: 0, top: 0, bottom: 0, width: 40, zIndex: 2 },
  fadeRight: { position: "absolute", right: 0, top: 0, bottom: 0, width: 40, zIndex: 2 },
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
  const router = useRouter();
  const userName = user?.name || "Guest";
  const initial = userName.charAt(0).toUpperCase();

  return (
    <Animated.View
      entering={FadeInDown.delay(100).springify().damping(20)}
      style={greeting.row}
    >
      <View>
        <Text style={greeting.welcomeLabel}>Hello there 👋</Text>
        <Text style={greeting.nameText}>{userName}</Text>
      </View>

      <TouchableOpacity
        style={greeting.avatarContainer}
        onPress={() => router.replace("/(tabs)/profile")}
        activeOpacity={0.8}
        testID="profile-avatar-btn"
      >
        <LinearGradient
          colors={["#F0D488", "#C9A84C"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={greeting.avatarBorder}
        >
          <View style={greeting.avatarBg}>
            <Text style={greeting.avatarText}>{initial}</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const greeting = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  welcomeLabel: {
    color: "rgba(255, 255, 255, 0.55)",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  nameText: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  avatarContainer: {
    shadowColor: "#C9A84C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarBorder: {
    width: 42,
    height: 42,
    borderRadius: 21,
    padding: 1.5,
  },
  avatarBg: {
    flex: 1,
    backgroundColor: "#111",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.gold,
    fontSize: 16,
    fontWeight: "800",
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. AnimatedHeroBanner  [CHANGE 2]
//    • Food/restaurant HD image as background (ImageBackground-style)
//    • New Punjabi Kitchen specific headline copy
//    • Keeps all original animations (parallax, stats, orders badge, glow)
// ─────────────────────────────────────────────────────────────────────────────

const HERO_BG_URI =
  "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=90&fit=crop";

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
        source={{ uri: HERO_BG_URI }}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />
      <LinearGradient
        colors={["rgba(8,8,8,0.55)", "rgba(8,8,8,0.72)", "rgba(8,8,8,0.88)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
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

      {ordersLength > 0 && (
        <Animated.View
          entering={ZoomIn.delay(800).springify()}
          style={heroBanner.ordersBadge}
        >
          <Animated.View style={[heroBanner.ordersGlow, glowStyle]} />
          <Ionicons name="receipt-outline" size={14} color={GOLD} />
          <Text style={heroBanner.ordersText}>
            {ordersLength} active order{ordersLength > 1 ? "s" : ""}
          </Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const heroBanner = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 24,
    overflow: "hidden",
    padding: 28,
    borderWidth: 0.5,
    borderColor: "rgba(201,168,76,0.3)",
    minHeight: 230,
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
    marginBottom: 12,
  },
  headline: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "300",
    lineHeight: 40,
    marginBottom: 10,
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
    marginBottom: 22,
    letterSpacing: 0.2,
  },
  statsRow: { flexDirection: "row" },
  statItem: {
    flex: 1,
    alignItems: "center",
    borderRightWidth: 0.5,
    borderRightColor: "rgba(255,255,255,0.12)",
    paddingVertical: 6,
  },
  statVal: { color: GOLD_LIGHT, fontWeight: "700", fontSize: 15, marginBottom: 2 },
  statSub: { color: "rgba(255,255,255,0.4)", fontSize: 10, letterSpacing: 0.3 },
  ordersBadge: {
    position: "absolute", top: 20, right: 20,
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: GOLD_SOFT,
    borderRadius: 100,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 0.5, borderColor: "rgba(201,168,76,0.45)",
  },
  ordersGlow: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 100,
    backgroundColor: "rgba(201,168,76,0.15)",
  },
  ordersText: { color: GOLD_LIGHT, fontSize: 12, fontWeight: "600" },
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
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[
            modeCard.card,
            {
              borderColor: active ? item.activeBorderColor : item.borderColor,
            }
          ]}
        >
          <LinearGradient
            colors={item.iconGradient as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={modeCard.iconCircle}
          >
            <Ionicons name={item.icon as any} size={20} color="#FFF" />
          </LinearGradient>

          <Text style={modeCard.label}>
            {item.label}
          </Text>
          <Text style={modeCard.desc}>{item.desc}</Text>

          <View style={modeCard.arrowCircle}>
            <Ionicons name="arrow-forward" size={11} color="rgba(255,255,255,0.7)" />
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
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    gap: 6,
    overflow: "hidden",
    position: "relative",
  },
  glowLayer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
  },
  iconCircle: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: "center", justifyContent: "center",
  },
  label: {
    color: "#fff",
    fontFamily: Platform.select({ ios: "Georgia", android: "serif" }),
    fontStyle: "italic",
    fontWeight: "600",
    fontSize: 14.5,
    letterSpacing: 0.1,
    marginTop: 2,
  },
  desc: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 10,
    textAlign: "center",
    letterSpacing: 0.2,
    lineHeight: 13,
  },
  arrowCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 0.8,
    borderColor: "rgba(255, 255, 255, 0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. AnimatedMoodStrip
//    Placed below HomeModes, gold left-bar REMOVED
// ─────────────────────────────────────────────────────────────────────────────
function MoodChip({ item, index }: { item: typeof MOODS[0]; index: number }) {
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
    <Animated.View style={pressStyle}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPressIn={() => { pressScale.value = withSpring(0.91, { damping: 15, stiffness: 400 }); }}
        onPressOut={() => { pressScale.value = withSpring(1, SPRING_CONFIG); }}
        style={moodStyle.chip}
      >
        <Text style={moodStyle.chipText}>{item.label}</Text>
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

      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={moodStyle.row}
        entering={FadeIn.delay(340)}
      >
        {MOODS.map((m, i) => (
          <MoodChip key={m.cat} item={m} index={i} />
        ))}
      </Animated.ScrollView>
    </Animated.View>
  );
}

const moodStyle = StyleSheet.create({
  section: { marginTop: 22, marginBottom: 4 },
  title: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.1,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  row: { paddingHorizontal: 20, gap: 10, flexDirection: "row" },
  chip: {
    backgroundColor: GOLD_SOFT,
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderWidth: 0.5,
    borderColor: "rgba(201,168,76,0.3)",
  },
  chipText: {
    color: GOLD_LIGHT,
    fontSize: 13,
    fontWeight: "500",
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
// 8. LocationSection — Professional replacement [CHANGE 3]
// ─────────────────────────────────────────────────────────────────────────────
function LocationSection() {
  return (
    <Animated.View
      entering={FadeInUp.delay(100).springify().damping(22)}
      style={locStyle.container}
    >
      {/* Google Maps-style preview */}
      <View style={locStyle.mapPreview}>
        <LinearGradient
          colors={[
            "#0e1726",
            "#132238",
            "#1d2f49",
            "#17243a",
            "#0f1a2b",
          ]}
          locations={[0, 0.2, 0.5, 0.8, 1]}
          style={StyleSheet.absoluteFillObject}
        />

        <View style={locStyle.terrainBlobA} />
        <View style={locStyle.terrainBlobB} />
        <View style={locStyle.terrainBlobC} />

        <View style={locStyle.roadMain} />
        <View style={locStyle.roadMainAlt} />
        <View style={locStyle.roadCross} />
        <View style={locStyle.roadCurveA} />
        <View style={locStyle.roadCurveB} />

        <View style={locStyle.routeLine} />
        <View style={locStyle.routeGlow} />

        <View style={locStyle.poiA} />
        <View style={locStyle.poiB} />
        <View style={locStyle.poiC} />
        <View style={locStyle.poiD} />

        <View style={locStyle.streetNameTop}>
          <Text style={locStyle.streetText}>Purulia Rd</Text>
        </View>
        <View style={locStyle.streetNameLeft}>
          <Text style={locStyle.streetText}>Kashyap Eye Hospital</Text>
        </View>
        <View style={locStyle.streetNameBottom}>
          <Text style={locStyle.streetText}>Ajit Enclave</Text>
        </View>

        <View style={locStyle.searchBar}>
          <Ionicons name="search" size={14} color="rgba(255,255,255,0.7)" />
          <Text style={locStyle.searchText} numberOfLines={1}>
            Punjabi Kitchen, Ranchi
          </Text>
          <View style={locStyle.searchBubble} />
        </View>

        <View style={locStyle.zoomControls}>
          <TouchableOpacity style={locStyle.zoomBtn} activeOpacity={0.85}>
            <Text style={locStyle.zoomSign}>+</Text>
          </TouchableOpacity>
          <View style={locStyle.zoomDivider} />
          <TouchableOpacity style={locStyle.zoomBtn} activeOpacity={0.85}>
            <Text style={locStyle.zoomSign}>−</Text>
          </TouchableOpacity>
        </View>

        <View style={locStyle.compass}>
          <View style={locStyle.compassInner}>
            <Text style={locStyle.compassText}>N</Text>
          </View>
        </View>

        <LinearGradient
          colors={["rgba(0,0,0,0.08)", "rgba(0,0,0,0.24)", "rgba(0,0,0,0.44)"]}
          style={StyleSheet.absoluteFillObject}
        />

        <View style={locStyle.trafficChip}>
          <Ionicons name="car-sport-outline" size={12} color={GOLD_LIGHT} />
          <Text style={locStyle.trafficText}>Live area map</Text>
        </View>

        {/* Center pin */}
        <View style={locStyle.pinWrap}>
          <View style={locStyle.pinRing} />
          <View style={locStyle.pinDot} />
          <View style={locStyle.pinShadow} />
        </View>
        {/* Map label */}
        <View style={locStyle.mapLabel}>
          <Ionicons name="map-outline" size={12} color={GOLD} />
          <Text style={locStyle.mapLabelText}>Ranchi, Jharkhand</Text>
        </View>
      </View>

      {/* Info card */}
      <View style={locStyle.card}>
        {/* Restaurant name row */}
        <View style={locStyle.nameRow}>
          <View style={locStyle.iconPill}>
            <Ionicons name="restaurant-outline" size={16} color={GOLD} />
          </View>
          <View>
            <Text style={locStyle.restName}>Punjabi Kitchen</Text>
            <Text style={locStyle.restType}>Multi Cuisine Family Restaurant</Text>
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
          </View>
          {/* Open badge */}
          <View style={locStyle.openBadge}>
            <View style={locStyle.openDot} />
            <Text style={locStyle.openText}>Open</Text>
          </View>
        </View>

        {/* Phone */}
        <View style={locStyle.infoRow}>
          <View style={locStyle.infoIcon}>
            <Ionicons name="call-outline" size={15} color={GOLD} />
          </View>
          <View>
            <Text style={locStyle.infoLabel}>Phone</Text>
            <Text style={locStyle.infoValue}>+91 96932 10321</Text>
          </View>
        </View>

        <View style={locStyle.dividerLine} />

        {/* CTA buttons */}
        <View style={locStyle.ctaRow}>
          <TouchableOpacity style={locStyle.ctaPrimary} activeOpacity={0.85} onPress={() => Linking.openURL("https://maps.google.com/?q=Punjabi+Kitchen+Purulia+Road+Ranchi")}>
            <Ionicons name="navigate-outline" size={15} color="#1a0d0a" />
            <Text style={locStyle.ctaPrimaryText}>Get Directions</Text>
          </TouchableOpacity>
          <TouchableOpacity style={locStyle.ctaSecondary} activeOpacity={0.85} onPress={() => Linking.openURL("tel:+919693210321")}>
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
  mapPreview: {
    height: 170,
    borderRadius: 16,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
    borderColor: "rgba(201,168,76,0.3)",
    marginBottom: -4,
  },
  terrainBlobA: {
    position: "absolute",
    left: -10,
    top: 18,
    width: 150,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(70,122,74,0.18)",
  },
  terrainBlobB: {
    position: "absolute",
    right: -12,
    top: 10,
    width: 165,
    height: 138,
    borderRadius: 70,
    backgroundColor: "rgba(60,110,120,0.16)",
  },
  terrainBlobC: {
    position: "absolute",
    left: 48,
    bottom: 10,
    width: 200,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(94,83,54,0.16)",
  },
  roadMain: {
    position: "absolute",
    left: -20,
    top: 76,
    width: "115%",
    height: 14,
    borderRadius: 12,
    backgroundColor: "rgba(240,245,255,0.76)",
    transform: [{ rotate: "-10deg" }],
  },
  roadMainAlt: {
    position: "absolute",
    right: -10,
    bottom: 54,
    width: "88%",
    height: 10,
    borderRadius: 10,
    backgroundColor: "rgba(240,245,255,0.6)",
    transform: [{ rotate: "12deg" }],
  },
  roadCross: {
    position: "absolute",
    left: 118,
    top: 0,
    bottom: 0,
    width: 10,
    backgroundColor: "rgba(240,245,255,0.48)",
    transform: [{ rotate: "18deg" }],
  },
  roadCurveA: {
    position: "absolute",
    left: 36,
    top: 52,
    width: 86,
    height: 68,
    borderTopWidth: 10,
    borderLeftWidth: 10,
    borderColor: "rgba(240,245,255,0.55)",
    borderTopLeftRadius: 48,
    transform: [{ rotate: "-6deg" }],
  },
  roadCurveB: {
    position: "absolute",
    right: 30,
    bottom: 28,
    width: 110,
    height: 74,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderColor: "rgba(240,245,255,0.52)",
    borderBottomRightRadius: 48,
    transform: [{ rotate: "9deg" }],
  },
  routeLine: {
    position: "absolute",
    left: 78,
    top: 44,
    width: 124,
    height: 6,
    borderRadius: 4,
    backgroundColor: "rgba(66,133,244,0.95)",
    transform: [{ rotate: "-14deg" }],
  },
  routeGlow: {
    position: "absolute",
    left: 72,
    top: 40,
    width: 136,
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(66,133,244,0.22)",
    transform: [{ rotate: "-14deg" }],
  },
  poiA: {
    position: "absolute",
    left: 26,
    top: 28,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.82)",
  },
  poiB: {
    position: "absolute",
    right: 22,
    top: 42,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.72)",
  },
  poiC: {
    position: "absolute",
    left: 178,
    bottom: 20,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  poiD: {
    position: "absolute",
    right: 92,
    bottom: 72,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "rgba(255,255,255,0.65)",
  },
  streetNameTop: {
    position: "absolute",
    top: 18,
    left: 22,
    backgroundColor: "rgba(15,23,42,0.62)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
  },
  streetNameLeft: {
    position: "absolute",
    left: 12,
    bottom: 42,
    backgroundColor: "rgba(15,23,42,0.62)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
  },
  streetNameBottom: {
    position: "absolute",
    right: 28,
    bottom: 16,
    backgroundColor: "rgba(15,23,42,0.62)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
  },
  streetText: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  searchBar: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 66,
    height: 32,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.96)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    gap: 6,
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  searchText: {
    flex: 1,
    color: "#233143",
    fontSize: 11,
    fontWeight: "600",
  },
  searchBubble: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#4285F4",
  },
  zoomControls: {
    position: "absolute",
    right: 10,
    bottom: 12,
    width: 34,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.94)",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  zoomBtn: {
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  zoomDivider: {
    height: 0.5,
    backgroundColor: "rgba(0,0,0,0.12)",
  },
  zoomSign: {
    color: "#1f2d3d",
    fontSize: 18,
    fontWeight: "700",
    marginTop: -1,
  },
  compass: {
    position: "absolute",
    left: 12,
    bottom: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  compassInner: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#1f2d3d",
    alignItems: "center",
    justifyContent: "center",
  },
  compassText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "700",
  },
  trafficChip: {
    position: "absolute",
    top: 10,
    right: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.62)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 0.5,
    borderColor: "rgba(201,168,76,0.28)",
  },
  trafficText: {
    color: GOLD_LIGHT,
    fontSize: 10,
    fontWeight: "500",
  },
  pinWrap: { alignItems: "center", justifyContent: "center" },
  pinRing: {
    width: 38, height: 38, borderRadius: 19,
    borderWidth: 1.5, borderColor: "rgba(66,133,244,0.8)",
    position: "absolute",
  },
  pinDot: {
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: "#EA4335",
  },
  pinShadow: {
    width: 20, height: 4, borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.18)",
    marginTop: 6,
  },
  mapLabel: {
    position: "absolute", bottom: 10, left: 12,
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 0.5, borderColor: "rgba(201,168,76,0.3)",
  },
  mapLabelText: { color: GOLD_LIGHT, fontSize: 10, fontWeight: "500" },

  card: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: "rgba(201,168,76,0.25)",
    marginTop: 8,
    padding: 18,
    paddingTop: 24,
  },
  nameRow: {
    flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14,
  },
  iconPill: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: GOLD_SOFT,
    borderWidth: 0.5, borderColor: "rgba(201,168,76,0.35)",
    alignItems: "center", justifyContent: "center",
  },
  restName: {
    color: "#fff", fontSize: 16, fontWeight: "700", letterSpacing: 0.1,
  },
  restType: {
    color: "rgba(255,255,255,0.4)", fontSize: 11, marginTop: 2,
  },
  dividerLine: {
    height: 0.5, backgroundColor: "rgba(201,168,76,0.15)", marginVertical: 12,
  },
  infoRow: {
    flexDirection: "row", alignItems: "flex-start",
    gap: 12, marginBottom: 12,
  },
  infoIcon: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: "rgba(201,168,76,0.08)",
    alignItems: "center", justifyContent: "center",
    marginTop: 2,
  },
  infoLabel: {
    color: "rgba(255,255,255,0.35)", fontSize: 10,
    fontWeight: "600", letterSpacing: 0.8,
    textTransform: "uppercase", marginBottom: 3,
  },
  infoValue: {
    color: "rgba(255,255,255,0.75)", fontSize: 13, lineHeight: 19,
  },
  openBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(34,197,94,0.12)",
    borderRadius: 100, paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 0.5, borderColor: "rgba(34,197,94,0.3)",
  },
  openDot: {
    width: 5, height: 5, borderRadius: 3,
    backgroundColor: "#22c55e",
  },
  openText: { color: "#22c55e", fontSize: 11, fontWeight: "600" },

  ctaRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  ctaPrimary: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 6,
    backgroundColor: GOLD, borderRadius: 12,
    paddingVertical: 12,
  },
  ctaPrimaryText: {
    color: "#1a0d0a", fontWeight: "700", fontSize: 13,
  },
  ctaSecondary: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 6,
    backgroundColor: GOLD_SOFT,
    borderRadius: 12, paddingVertical: 12,
    borderWidth: 0.5, borderColor: "rgba(201,168,76,0.4)",
  },
  ctaSecondaryText: {
    color: GOLD_LIGHT, fontWeight: "600", fontSize: 13,
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
  const { orders } = useApp();
  const { animatedTranslateY, hiddenOffset } = useTabBarAnimation();

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
          <TopBar />
        </Animated.View>

        <Animated.ScrollView
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          style={styles.scroll}
        >
          {/* Add top padding to prevent content under absolute TopBar */}
          <View style={{ height: Platform.OS === 'ios' ? 100 : 80 }} />

          {/* 1. Promo ticker */}
          <AnimatedPromoTicker />

          {/* 2. Greeting — "Hello" + user name, no PK logo */}
          <AnimatedGreeting />

          {/* 3. Hero banner — food image bg + Punjabi Kitchen copy */}
          <AnimatedHeroBanner ordersLength={orders.length} scrollY={scrollY} />

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, position: "relative" },
  scroll: { zIndex: 1 },
});