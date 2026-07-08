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
import Animated, { useAnimatedStyle, useSharedValue, withTiming, runOnJS, interpolate, withSpring, Easing } from "react-native-reanimated";

const AnimatedImage = Animated.createAnimatedComponent(Image);

type Props = { chefSpecials: typeof DISHES };

export function DealOfDaySection() {
  const router = useRouter();
  const [deals, setDeals] = useState<any[]>([DEAL_OF_DAY]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const transitionProgress = useSharedValue(1);

  // States to keep track of organic random rotations for the stack
  const [activeRotation, setActiveRotation] = useState(-10);
  const [prevRotation, setPrevRotation] = useState(8);

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

  // When activeIndex changes, transition previous card and generate a truly random landing angle
  useEffect(() => {
    if (activeIndex === visibleIndex) return;

    // The previous top card becomes the background card, staying exactly at its landed rotation
    setPrevRotation(activeRotation);
    
    // Generate a steep, stylish random landing angle between 16 and 32 degrees (positive or negative)
    const direction = Math.random() > 0.5 ? 1 : -1;
    const randomAngle = direction * (16 + Math.random() * 16);
    setActiveRotation(randomAngle);

    transitionProgress.value = 0;
    setVisibleIndex(activeIndex);
    transitionProgress.value = withTiming(1, {
      duration: 350,
      easing: Easing.out(Easing.quad),
    });
  }, [activeIndex]);

  const activeDeal = deals[visibleIndex] || DEAL_OF_DAY;
  
  // Resolve previous deal for the underlying card stack
  const prevIndex = (visibleIndex - 1 + deals.length) % deals.length;
  const prevDeal = deals[prevIndex] || DEAL_OF_DAY;

  const discountPercent = activeDeal.originalPrice && activeDeal.price
    ? Math.round(((activeDeal.originalPrice - activeDeal.price) / activeDeal.originalPrice) * 100)
    : 25;

  // The active card is "thrown" from top-right and lands at its random activeRotation
  const imageAnimStyle = useAnimatedStyle(() => {
    const t = transitionProgress.value;
    const translateX = interpolate(t, [0, 1], [140, 0]);
    const translateY = interpolate(t, [0, 1], [-180, 0]);
    const rotateVal = interpolate(t, [0, 1], [40, activeRotation]);
    const scaleVal = interpolate(t, [0, 1], [1.32, 1.0]);
    const opacityVal = interpolate(t, [0, 0.25, 1], [0, 0.45, 1]);

    return {
      opacity: opacityVal,
      transform: [
        { translateX },
        { translateY },
        { rotate: `${rotateVal}deg` },
        { scale: scaleVal }
      ]
    };
  });

  // Counter-rotate the inner image to keep it upright inside the tilted frame
  const innerImgAnimStyle = useAnimatedStyle(() => {
    const t = transitionProgress.value;
    const rotateVal = interpolate(t, [0, 1], [40, activeRotation]);
    return {
      transform: [
        { rotate: `${-rotateVal}deg` },
        { scale: 1.18 }
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
          {/* Left details side (structured layout) */}
          <View style={styles.dealLeftCol}>
            <View style={styles.chefPickRow}>
              <View style={styles.chefPick}>
                <Text style={styles.chefPickText}>★ CHEF'S PICK</Text>
              </View>
              <View style={styles.dealTagPill}>
                <Text style={styles.dealTagText}>🔥 TODAY ONLY</Text>
              </View>
            </View>

            <Text style={styles.newDealTitle} numberOfLines={2}>
              {activeDeal.dishName}
            </Text>

            <Text style={styles.newDealDesc} numberOfLines={2}>
              {activeDeal.desc}
            </Text>

            {/* Menu partition line */}
            <View style={styles.dashedLine} />

            <View style={styles.newBottomRow}>
              <View style={styles.newPriceRow}>
                <Text style={styles.priceLabel}>Price: </Text>
                <Text style={styles.newPrice}>₹{activeDeal.price}</Text>
                <Text style={styles.oldPriceNew}>₹{activeDeal.originalPrice}</Text>
              </View>
            </View>

            {/* Place the % OFF discount pill at the very bottom as its own block */}
            <View style={{ alignSelf: "flex-start", marginTop: 8 }}>
              <View style={styles.discountPill}>
                <Text style={styles.discountPillText}>{discountPercent}% OFF</Text>
              </View>
            </View>
          </View>

          {/* Right image side with tilted throwing stack */}
          <View style={styles.dealRightCol}>
            {/* Bottom Stacked Card (Previous Item, tilted and shifted to peeking position) */}
            <View style={[styles.bottomStackedFrame, { transform: [{ rotate: `${prevRotation}deg` }, { translateX: 14 }, { translateY: 8 }] }]}>
              <Image
                source={getDishImageSource(prevDeal.id, prevDeal.image)}
                style={[styles.prevDealImg, { transform: [{ rotate: `${-prevRotation}deg` }, { scale: 1.18 }] }]}
                contentFit="cover"
              />
              <View style={styles.greyOverlay} />
            </View>

            {/* Top Active Card (Current Item, thrown and lands at its random angle) */}
            <Animated.View style={[styles.diagonalOvalFrame, imageAnimStyle]}>
              <AnimatedImage
                source={getDishImageSource(activeDeal.id, activeDeal.image)}
                style={[styles.newDealImg, innerImgAnimStyle]}
                contentFit="cover"
              />
            </Animated.View>
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
  height: 300,
},

dealContainer: {
  height: 282,
  borderRadius: 26,
  padding: 14,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.06)",
  backgroundColor: "#080808",
  overflow: "hidden",
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
  height: 212,
},

dealLeftCol: {
  flex: 1.25,
  paddingRight: 10,
  height: 212,
  justifyContent: "space-between",
},

dealRightCol: {
  flex: 0.85,
  alignItems: "center",
  justifyContent: "center",
},

diagonalOvalFrame: {
  width: 140,
  height: 180,
  borderRadius: 70,
  borderWidth: 1.5,
  borderColor: "#C9A45C",
  overflow: "hidden",
  backgroundColor: "#181818",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.35,
  shadowRadius: 10,
  elevation: 6,
},

chefPickRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  marginBottom: 8,
},

chefPick: {
  alignSelf: "flex-start",
  backgroundColor: "rgba(201,164,92,0.14)",
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 6,
  borderWidth: 1,
  borderColor: "rgba(201,164,92,0.22)",
},

chefPickText: {
  color: "#C9A45C",
  fontSize: 9,
  fontWeight: "600",
  letterSpacing: 0.5,
},

dealTagPill: {
  backgroundColor: "rgba(255,75,75,0.09)",
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 6,
  borderWidth: 1,
  borderColor: "rgba(255,75,75,0.18)",
},

dealTagText: {
  color: "#FF5E5E",
  fontSize: 9,
  fontWeight: "600",
  letterSpacing: 0.3,
},

newDealTitle: {
  color: "#F5F3EE",
  fontSize: 21,
  fontWeight: "600",
  letterSpacing: 0.2,
  lineHeight: 26,
},

newDealDesc: {
  color: "rgba(255, 255, 255, 0.55)",
  fontSize: 12,
  lineHeight: 18,
  marginTop: 6,
},

dashedLine: {
  borderStyle: "dashed",
  borderWidth: 0.6,
  borderColor: "rgba(201,168,76,0.18)",
  marginVertical: 10,
  width: "100%",
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

priceLabel: {
  color: "rgba(255,255,255,0.4)",
  fontSize: 12,
  marginRight: 4,
},

newPrice: {
  color: "#C9A45C",
  fontSize: 24,
  fontWeight: "700",
},

oldPriceNew: {
  color: "rgba(255,255,255,0.28)",
  fontSize: 13,
  marginLeft: 6,
  textDecorationLine: "line-through",
},

bottomStackedFrame: {
  position: "absolute",
  width: 135,
  height: 175,
  borderRadius: 67,
  borderWidth: 1,
  borderColor: "rgba(201,164,92,0.18)",
  overflow: "hidden",
  opacity: 0.72,
  backgroundColor: "#101010",
},

greyOverlay: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: "rgba(18, 18, 18, 0.78)",
},

prevDealImg: {
  width: "140%",
  height: "140%",
  marginLeft: "-20%",
  marginTop: "-20%",
},

discountPill: {
  backgroundColor: "rgba(201,164,92,0.12)",
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 6,
  borderWidth: 1,
  borderColor: "rgba(201,164,92,0.25)",
},

discountPillText: {
  color: "#C9A45C",
  fontSize: 9,
  fontWeight: "600",
  letterSpacing: 0.3,
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
