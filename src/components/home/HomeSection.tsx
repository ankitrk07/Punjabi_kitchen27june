import Marquee from "@/src/components/Marquee";
import { DEAL_OF_DAY, DISHES, REVIEWS } from "@/src/data/menu";
import { colors } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, TextInput } from "react-native";
import { Image } from "expo-image";
import { apiClient, resolveImageUrl } from "@/src/utils/apiClient";
import { getDishImageSource } from "@/src/utils/dishImages";
import Animated, { useAnimatedStyle, useSharedValue, withTiming, runOnJS, interpolate, withSpring, Easing, FadeInUp, ZoomIn } from "react-native-reanimated";

const AnimatedImage = Animated.createAnimatedComponent(Image);

type Props = { chefSpecials: typeof DISHES };

export function DealOfDaySection() {
  const router = useRouter();
  const [deals, setDeals] = useState<any[]>([DEAL_OF_DAY]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const transitionProgress = useSharedValue(1);

  // Shared values to keep track of organic random rotations for the stack
  const prevRotationVal = useSharedValue(8);
  const activeRotationVal = useSharedValue(-10);

  useEffect(() => {
    apiClient
      .getDealOfDay()
      .then((res: any) => {
        if (res && res.deals && res.deals.length > 0) {
          setDeals(res.deals);
        } else if (res && res.dishName) {
          setDeals([res]);
        } else {
          throw new Error("No deals returned from server");
        }
      })
      .catch((e) => {
        console.log("Failed to fetch deal of day from server, using local fallback:", e);
        if (DISHES && DISHES.length > 0) {
          // Select up to 5 random dishes to show in the slideshow
          const shuffled = [...DISHES].sort(() => 0.5 - Math.random());
          const selectedDishes = shuffled.slice(0, Math.min(5, shuffled.length));
          const localDeals = selectedDishes.map((dish) => {
            const originalPrice = dish.price;
            const price = Math.round(originalPrice * 0.75); // 25% discount
            return {
              id: dish.id,
              title: "Deal of the Day",
              dishName: dish.name,
              price,
              originalPrice,
              image: dish.image,
              desc: dish.description || "Limited time deal of the day! Get 25% OFF."
            };
          });
          setDeals(localDeals);
        } else {
          // Hard fallback in case DISHES is empty
          setDeals([
            DEAL_OF_DAY,
            {
              id: "Dal_Makhani",
              title: "Deal of the Day",
              dishName: "Dal Makhani",
              price: 180,
              originalPrice: 240,
              image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80",
              desc: "Creamy slow-cooked whole black lentils and kidney beans, a Punjabi classic."
            },
            {
              id: "Paneer_Tikka_Butter_Masala",
              title: "Deal of the Day",
              dishName: "Paneer Tikka Butter Masala",
              price: 232,
              originalPrice: 310,
              image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80",
              desc: "Tandoori paneer tikka cubes cooked in a rich, creamy tomato gravy."
            }
          ]);
        }
      });
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
    prevRotationVal.value = activeRotationVal.value;
    
    // Generate a steep, stylish random landing angle between 16 and 32 degrees (positive or negative)
    const direction = Math.random() > 0.5 ? 1 : -1;
    const randomAngle = direction * (16 + Math.random() * 16);
    activeRotationVal.value = randomAngle;

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

  const bottomStackedAnimStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${prevRotationVal.value}deg` },
        { translateX: 14 },
        { translateY: 8 }
      ]
    };
  });

  const prevInnerImgAnimStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${-prevRotationVal.value}deg` },
        { scale: 1.18 }
      ]
    };
  });

  // The active card is "thrown" from top-right and lands at its random activeRotation
  const imageAnimStyle = useAnimatedStyle(() => {
    const t = transitionProgress.value;
    const translateX = interpolate(t, [0, 1], [140, 0]);
    const translateY = interpolate(t, [0, 1], [-180, 0]);
    const rotateVal = interpolate(t, [0, 1], [40, activeRotationVal.value]);
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
    const rotateVal = interpolate(t, [0, 1], [40, activeRotationVal.value]);
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
            <Animated.View style={[styles.bottomStackedFrame, bottomStackedAnimStyle]}>
              <AnimatedImage
                source={getDishImageSource(prevDeal.id, prevDeal.image)}
                style={[styles.prevDealImg, prevInnerImgAnimStyle]}
                contentFit="cover"
              />
              <View style={styles.greyOverlay} />
            </Animated.View>

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

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    apiClient.getReviews().then(setReviews).catch((e) => console.log("Failed to fetch reviews:", e));
  }, []);

  const handleSubmitFeedback = async () => {
    if (!name.trim() || !text.trim()) {
      setErrorMsg("Please fill in both your name and review message.");
      return;
    }
    setErrorMsg("");
    setIsSubmitting(true);
    try {
      const newReview = await apiClient.addReview({
        name,
        rating,
        text,
      });
      // Prepend the new review so it appears in the marquee instantly
      setReviews((prev) => [newReview, ...prev]);
      setIsSubmitted(true);
      setShowForm(false);
    } catch (e) {
      console.log("Failed to submit review:", e);
      setErrorMsg("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
                  {[...Array(Math.max(0, Math.min(5, r.rating)))].map((_, i) => (
                    <Ionicons key={i} name="star" size={11} color={colors.gold} />
                  ))}
                </View>
              </View>
            </View>
            <Text style={styles.reviewText} numberOfLines={3}>{r.text}</Text>
          </View>
        ))}
      </Marquee>

      {/* Write a Review Option */}
      {!showForm && !isSubmitted && (
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.feedbackToggleBtn}
          onPress={() => setShowForm(true)}
        >
          <Ionicons name="create-outline" size={15} color={colors.gold} />
          <Text style={styles.feedbackToggleText}>Share Your Feedback</Text>
        </TouchableOpacity>
      )}

      {/* Collapsible Feedback Form */}
      {showForm && !isSubmitted && (
        <Animated.View
          entering={FadeInUp.springify().damping(18)}
          style={styles.feedbackCard}
        >
          <View style={styles.feedbackHeader}>
            <Text style={styles.feedbackTitle}>Share Your Experience</Text>
            <TouchableOpacity onPress={() => setShowForm(false)}>
              <Ionicons name="close" size={20} color="rgba(255,255,255,0.4)" />
            </TouchableOpacity>
          </View>

          {/* Star Selection */}
          <View style={styles.starsContainer}>
            <Text style={styles.starsLabel}>Your Rating:</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  activeOpacity={0.7}
                  onPress={() => setRating(star)}
                >
                  <Ionicons
                    name={star <= rating ? "star" : "star-outline"}
                    size={24}
                    color={colors.gold}
                    style={{ marginRight: 8 }}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Name Input */}
          <TextInput
            placeholder="Your Name"
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={name}
            onChangeText={setName}
            style={styles.feedbackInput}
          />

          {/* Review Text */}
          <TextInput
            placeholder="Tell us about your dining or delivery experience..."
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={text}
            onChangeText={setText}
            multiline
            numberOfLines={3}
            style={[styles.feedbackInput, styles.feedbackMultilineInput]}
          />

          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

          {/* Submit */}
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={isSubmitting}
            style={styles.submitBtn}
            onPress={handleSubmitFeedback}
          >
            <Text style={styles.submitBtnText}>
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Success Notification */}
      {isSubmitted && (
        <Animated.View
          entering={ZoomIn.springify()}
          style={styles.successCard}
        >
          <View style={styles.successHeader}>
            <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
            <Text style={styles.successTitle}>Review Submitted!</Text>
          </View>
          <Text style={styles.successText}>
            Thank you! Your feedback has been posted successfully and appears on the home feed.
          </Text>
          <TouchableOpacity
            onPress={() => {
              setIsSubmitted(false);
              setName("");
              setText("");
              setRating(5);
            }}
            style={styles.resetBtn}
          >
            <Text style={styles.resetBtnText}>Write Another Review</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
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
  feedbackToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.3)",
    backgroundColor: "rgba(201,168,76,0.04)",
  },
  feedbackToggleText: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  feedbackCard: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.3)",
    shadowColor: "#C9A84C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  feedbackHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  feedbackTitle: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 0.1,
  },
  starsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  starsLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    fontWeight: "500",
  },
  starsRow: {
    flexDirection: "row",
  },
  feedbackInput: {
    backgroundColor: "rgba(255,255,255,0.02)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#FFF",
    fontSize: 13,
    marginBottom: 10,
  },
  feedbackMultilineInput: {
    height: 72,
    textAlignVertical: "top",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 11,
    marginBottom: 10,
    fontWeight: "500",
  },
  submitBtn: {
    backgroundColor: colors.gold,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  submitBtnText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: 0.2,
  },
  successCard: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "rgba(34, 197, 94, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.25)",
    alignItems: "center",
  },
  successHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  successTitle: {
    color: "#22c55e",
    fontWeight: "700",
    fontSize: 14,
  },
  successText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 12,
  },
  resetBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  resetBtnText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    fontWeight: "600",
  },
});
