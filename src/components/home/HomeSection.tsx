import Marquee from "@/src/components/Marquee";
import { DEAL_OF_DAY, DISHES, REVIEWS } from "@/src/data/menu";
import { colors } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { apiClient, resolveImageUrl } from "@/src/utils/apiClient";
import { getDishImageSource } from "@/src/utils/dishImages";
import Animated, { useAnimatedStyle, useSharedValue, withTiming, runOnJS } from "react-native-reanimated";

const AnimatedImage = Animated.createAnimatedComponent(Image);

type Props = { chefSpecials: typeof DISHES };

export function DealOfDaySection() {
  const router = useRouter();
  const [deals, setDeals] = useState<any[]>([DEAL_OF_DAY]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const transitionProgress = useSharedValue(1);

  useEffect(() => {
    apiClient
      .getDealOfDay()
      .then((res: any) => {
        if (res && res.deals && res.deals.length > 0) {
          setDeals(res.deals);
        } else if (res && res.dishName) {
          setDeals([res]);
        }
      })
      .catch((e) => console.log("Failed to fetch deal of day:", e));
  }, []);

  useEffect(() => {
    if (deals.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % deals.length);
    }, 4500); // cycle every 4.5 seconds
    return () => clearInterval(interval);
  }, [deals.length]);

  // Coordinated slide-fade transition when activeIndex changes
  useEffect(() => {
    if (activeIndex === visibleIndex) return;

    transitionProgress.value = withTiming(0, { duration: 250 }, (finished) => {
      if (finished) {
        runOnJS(setVisibleIndex)(activeIndex);
      }
    });
  }, [activeIndex]);

  useEffect(() => {
    transitionProgress.value = withTiming(1, { duration: 300 });
  }, [visibleIndex]);

  const activeDeal = deals[visibleIndex] || DEAL_OF_DAY;
  const discountPercent = activeDeal.originalPrice && activeDeal.price
    ? Math.round(((activeDeal.originalPrice - activeDeal.price) / activeDeal.originalPrice) * 100)
    : 25;

  const imageAnimStyle = useAnimatedStyle(() => {
    return {
      opacity: transitionProgress.value,
      transform: [
        { scale: 0.88 + 0.12 * transitionProgress.value },
        { rotate: "12deg" } // Counter-rotate the image to keep it upright inside the -12deg rotated oval frame
      ]
    };
  });

  const textAnimStyle = useAnimatedStyle(() => {
    return {
      opacity: transitionProgress.value,
      transform: [
        { translateY: 10 * (1 - transitionProgress.value) }
      ]
    };
  });

  return (
    <View style={styles.dealSection}>
      <LinearGradient
        colors={["#131313", "#090909", "#060606"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.dealContainer}
      >
        {/* Deal Header Row */}
        <View style={styles.dealTopRow}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.dealHeading}>
              Deal of the Day
            </Text>
            <Text style={styles.sparkle}>✨</Text>
          </View>

          <TouchableOpacity
            style={styles.moreDealsBtn}
            onPress={() => router.push("/profile/offers")}
          >
            <Text style={styles.moreDealsText}>More Deals</Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color="rgba(255,255,255,0.55)"
            />
          </TouchableOpacity>
        </View>

        {/* Content Row split layout */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.dealContentRow}
          onPress={() => router.push("/(tabs)/menu")}
        >
          {/* Left details side */}
          <Animated.View style={[styles.dealLeftCol, textAnimStyle]}>
            <View style={styles.chefPick}>
              <Text style={styles.chefPickText}>★ CHEF'S PICK</Text>
            </View>

            <Text style={styles.newDealTitle} numberOfLines={2}>
              {activeDeal.dishName}
            </Text>

            <Text style={styles.newDealDesc} numberOfLines={3}>
              {activeDeal.desc}
            </Text>

            <View style={styles.newBottomRow}>
              <View style={styles.newPriceRow}>
                <Text style={styles.newPrice}>₹{activeDeal.price}</Text>
                <Text style={styles.oldPriceNew}>₹{activeDeal.originalPrice}</Text>
              </View>

              <View style={styles.discountPill}>
                <Text style={styles.discountPillText}>{discountPercent}% OFF</Text>
              </View>
            </View>
          </Animated.View>

          {/* Right Diagonal Oval image side */}
          <View style={styles.dealRightCol}>
            <View style={styles.diagonalOvalFrame}>
              <AnimatedImage
                source={getDishImageSource(activeDeal.id, activeDeal.image)}
                style={[styles.newDealImg, imageAnimStyle]}
                contentFit="cover"
              />
            </View>
          </View>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

export function ChefSpecialsSection({ chefSpecials }: Props) {
  const router = useRouter();
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>Chef's Special</Text>
        <View style={styles.crown}><Ionicons name="star" size={12} color={colors.gold} /></View>
      </View>
      <Text style={styles.chefNote}>Handpicked by our head chef</Text>
      <Marquee speed={45} itemWidth={180} itemCount={chefSpecials.length}>
        {chefSpecials.map((d) => (
          <TouchableOpacity key={d.id} style={styles.chefCard} onPress={() => router.push(`/category/${d.category}` as any)}>
            <Image source={{ uri: resolveImageUrl(d.image) }} style={styles.chefImg} />
            <LinearGradient colors={["transparent", "rgba(0,0,0,0.95)"]} style={styles.chefOverlay} />
            <View style={styles.chefInfo}>
              <Text style={styles.chefName} numberOfLines={1}>{d.name}</Text>
              <Text style={styles.chefPriceSmall}>₹{d.price}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </Marquee>
    </View>
  );
}

export function ReviewsSection() {
  const [reviews, setReviews] = useState<any[]>(REVIEWS);

  useEffect(() => {
    apiClient.getReviews().then(setReviews).catch((e) => console.log("Failed to fetch reviews:", e));
  }, []);

  return (
    <View style={[styles.section, styles.reviewsSection]}>
      <Marquee speed={35} itemWidth={280} itemCount={reviews.length}>
        {reviews.map((r, index) => (
          <View key={r.id || String(index)} style={styles.reviewCard}>
            <View style={styles.reviewHead}>
              <Image source={{ uri: r.avatar }} style={styles.reviewAvatar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.reviewName}>{r.name}</Text>
                <View style={{ flexDirection: "row" }}>
                  {[...Array(r.rating)].map((_, i) => <Ionicons key={i} name="star" size={11} color={colors.gold} />)}
                </View>
              </View>
            </View>
            <Text style={styles.reviewText} numberOfLines={3}>{r.text}</Text>
          </View>
        ))}
      </Marquee>
    </View>
  );
}

export function LocationSection() {
  return (
    <View style={styles.section}>
      <View style={styles.locCard}>
        <Ionicons name="location" size={22} color={colors.gold} />
        <View style={{ flex: 1 }}>
          <Text style={styles.locTitle}>Visit Us</Text>
          <Text style={styles.locText}>Purulia Rd, opposite Kashyap Eye Hospital,{"\n"}Ajit Enclave, New Barhi Toli, Ranchi 834001</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 26 },
  reviewsSection: { marginTop: 3 },
  sectionHead: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, marginBottom: 14, gap: 8 },
  sectionTitle: { color: "#FFF", fontSize: 20, fontWeight: "700" },
  crown: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: colors.gold, alignItems: "center", justifyContent: "center" },
  chefNote: {
    paddingHorizontal: 20,
    marginBottom: 10,
    color: "rgba(255,255,255,0.42)",
    fontSize: 12,
    fontFamily: "serif",
    fontStyle: "italic",
    fontWeight: "600",
    letterSpacing: 0.2,
  },
 
  dealSection: {
  marginTop: 26,
  paddingHorizontal: 14,
},

dealContainer: {
  borderRadius: 26,
  padding: 12,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.06)",
  backgroundColor: "#080808",
},

dealTopRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 14,
},

dealHeading: {
  color: "#F4F1EA",
  fontSize: 18,
  fontWeight: "500",
  letterSpacing: 0.3,
},

sparkle: {
  color: "#8E6D2F",
  fontSize: 13,
  marginLeft: 6,
},

moreDealsBtn: {
  flexDirection: "row",
  alignItems: "center",
},

moreDealsText: {
  color: "rgba(255,255,255,0.55)",
  fontSize: 13,
},

newDealImg: {
  width: "140%",
  height: "140%",
  marginLeft: "-20%",
  marginTop: "-20%",
},

dealContentRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: 6,
  paddingBottom: 4,
},

dealLeftCol: {
  flex: 1.25,
  paddingRight: 10,
  justifyContent: "center",
},

dealRightCol: {
  flex: 0.85,
  alignItems: "center",
  justifyContent: "center",
},

diagonalOvalFrame: {
  width: 125,
  height: 165,
  borderRadius: 65,
  borderWidth: 1.5,
  borderColor: "#C9A45C",
  overflow: "hidden",
  transform: [{ rotate: "-12deg" }],
  backgroundColor: "#181818",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.35,
  shadowRadius: 10,
  elevation: 6,
},

chefPick: {
  alignSelf: "flex-start",
  backgroundColor: "rgba(201,164,92,0.14)",
  paddingHorizontal: 10,
  paddingVertical: 5,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: "rgba(201,164,92,0.22)",
  marginBottom: 8,
},

chefPickText: {
  color: "#C9A45C",
  fontSize: 9,
  fontWeight: "600",
  letterSpacing: 0.5,
},

newDealTitle: {
  color: "#F5F3EE",
  fontSize: 22,
  fontWeight: "600",
  letterSpacing: 0.2,
  lineHeight: 28,
},

newDealDesc: {
  color: "rgba(255, 255, 255, 0.72)",
  fontSize: 12,
  lineHeight: 18,
  marginTop: 6,
  marginBottom: 12,
},

newBottomRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},

newPriceRow: {
  flexDirection: "row",
  alignItems: "baseline",
},

newPrice: {
  color: "#C9A45C",
  fontSize: 26,
  fontWeight: "700",
},

oldPriceNew: {
  color: "rgba(255,255,255,0.28)",
  fontSize: 14,
  marginLeft: 6,
  textDecorationLine: "line-through",
},

discountPill: {
  backgroundColor: "rgba(201,164,92,0.12)",
  paddingHorizontal: 14,
  paddingVertical: 8,
  borderRadius: 14,
  borderWidth: 1,
  borderColor: "rgba(201,164,92,0.25)",
},

discountPillText: {
  color: "#C9A45C",
  fontSize: 12,
  fontWeight: "600",
},
  chefCard: { width: 170, height: 220, marginLeft: 12, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: colors.borderGold },
  chefImg: { width: "100%", height: "100%" },
  chefOverlay: { position: "absolute", left: 0, right: 0, bottom: 0, height: "60%" },
  chefInfo: { position: "absolute", bottom: 10, left: 12, right: 12 },
  chefName: { color: "#FFF", fontWeight: "700", fontSize: 14 },
  chefPriceSmall: { color: colors.gold, fontSize: 13, fontWeight: "700", marginTop: 2 },
  reviewCard: { width: 270, marginLeft: 12, padding: 16, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  reviewHead: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  reviewAvatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: colors.gold },
  reviewName: { color: "#FFF", fontWeight: "600", fontSize: 13 },
  reviewText: { color: colors.textSecondary, fontSize: 12, fontStyle: "italic", lineHeight: 18 },
  locCard: { marginHorizontal: 16, padding: 16, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderGold, flexDirection: "row", gap: 12, alignItems: "center" },
  locTitle: { color: colors.gold, fontWeight: "700", fontSize: 14, marginBottom: 4 },
  locText: { color: colors.textSecondary, fontSize: 12, lineHeight: 18 },
});
