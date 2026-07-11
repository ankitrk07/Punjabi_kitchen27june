import { useApp } from "@/src/context/AppContext";
import { colors } from "@/src/theme";
import { storage } from "@/src/utils/storage";
import { resolveImageUrl } from "@/src/utils/apiClient";
import { getDishImageSource } from "@/src/utils/dishImages";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AnimatedHeartButton from "@/src/components/AnimatedHeartButton";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";

const { width } = Dimensions.get("window");

const SPECIAL_TAGS: Record<string, { label: string; bg: string; color: string; time: string; cal: string; spicy: number; rich: number }> = {
  "d-naan-1": { label: "BESTSELLER", bg: "rgba(212,175,55,0.9)", color: "#000", time: "12 mins", cal: "210 kcal", spicy: 0, rich: 2 },
  "d-naan-2": { label: "POPULAR", bg: "rgba(255,255,255,0.15)", color: "#FFF", time: "14 mins", cal: "240 kcal", spicy: 0, rich: 2 },
  "d-bir-1": { label: "CHEF PICK", bg: "rgba(229,87,34,0.9)", color: "#FFF", time: "25 mins", cal: "580 kcal", spicy: 2, rich: 3 },
  "d-bir-2": { label: "BESTSELLER", bg: "rgba(212,175,55,0.9)", color: "#000", time: "22 mins", cal: "520 kcal", spicy: 1, rich: 3 },
  "d-chk-1": { label: "MUST TRY", bg: "rgba(34,197,94,0.9)", color: "#000", time: "20 mins", cal: "490 kcal", spicy: 2, rich: 3 },
  "d-chk-2": { label: "SMOKY HOT", bg: "rgba(239,68,68,0.9)", color: "#FFF", time: "25 mins", cal: "410 kcal", spicy: 3, rich: 2 },
  "d-pan-2": { label: "ROYAL SPEC", bg: "rgba(168,85,247,0.9)", color: "#FFF", time: "18 mins", cal: "460 kcal", spicy: 1, rich: 3 },
  "d-dal-1": { label: "SLOW COOK", bg: "rgba(212,175,55,0.9)", color: "#000", time: "30 mins", cal: "380 kcal", spicy: 1, rich: 3 },
  "d-cs-1": { label: "SIGNATURE", bg: "rgba(212,175,55,0.95)", color: "#000", time: "25 mins", cal: "720 kcal", spicy: 2, rich: 3 },
  "d-cs-2": { label: "SEASONAL", bg: "rgba(34,197,94,0.9)", color: "#000", time: "20 mins", cal: "340 kcal", spicy: 1, rich: 2 },
};

function VegNonVegIndicator({ isVeg, size = 16 }: { isVeg: boolean; size?: number }) {
  const color = isVeg ? "#22c55e" : "#dc2626";
  const borderWidth = 1.2;
  const dotSize = Math.round(size * 0.44);
  const squareRadius = Math.max(1, Math.round(size * 0.15));

  return (
    <View style={{
      width: size,
      height: size,
      alignItems: "center",
      justifyContent: "center",
    }}>
      <View style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderWidth: borderWidth,
        borderColor: color,
        borderRadius: squareRadius,
        backgroundColor: "transparent",
      }} />
      <View style={{
        width: dotSize,
        height: dotSize,
        borderRadius: dotSize / 2,
        backgroundColor: color,
      }} />
    </View>
  );
}

export default function DishDetail() {
  const { id, fromX, fromY, fromW, fromH } = useLocalSearchParams<{ id: string; fromX?: string; fromY?: string; fromW?: string; fromH?: string }>();
  const router = useRouter();
  const { addToCart, dishes, favorites: favoritesIds, toggleFavorite, cart } = useApp();
  const dish = dishes.find((item) => item.id === id);
  const isInCart = dish ? cart.some((item) => item.id === dish.id) : false;
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(18)).current;
  const heroAnim = useRef(new Animated.Value(0)).current;
  const imageOpacity = useRef(new Animated.Value(0)).current;

  const [showImageModal, setShowImageModal] = useState(false);

  const hasSourceFrame = !!(fromX && fromY && fromW && fromH);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 350, useNativeDriver: true }),
    ]).start();

    Animated.sequence([
      Animated.timing(heroAnim, { toValue: 1, duration: 520, useNativeDriver: false }),
      Animated.timing(imageOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
  }, []);

  if (!dish) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={44} color={colors.textSecondary} />
          <Text style={styles.missingTitle}>Dish not found</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const specialTag = SPECIAL_TAGS[dish.id] ?? { label: "ROYAL SELECTION", bg: "rgba(212,175,55,0.2)", color: colors.gold, time: "15-20 min", cal: "380 kcal", spicy: 1, rich: 2 };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Top Hero Image Header Section */}
        <View style={styles.heroWrap}>
          <TouchableOpacity 
            activeOpacity={0.9} 
            style={StyleSheet.absoluteFill}
            onPress={() => setShowImageModal(true)}
          >
            {hasSourceFrame ? (
              <Animated.View
                style={[
                  styles.heroFloat,
                  {
                    transform: [
                      { translateX: heroAnim.interpolate({ inputRange: [0, 1], outputRange: [Number(fromX), 0] }) },
                      { translateY: heroAnim.interpolate({ inputRange: [0, 1], outputRange: [Number(fromY), 0] }) },
                      { scaleX: heroAnim.interpolate({ inputRange: [0, 1], outputRange: [Number(fromW) / width, 1] }) },
                      { scaleY: heroAnim.interpolate({ inputRange: [0, 1], outputRange: [Number(fromH) / 440, 1] }) },
                    ],
                  },
                ]}
              >
                <Image source={getDishImageSource(dish.id, dish.image)} style={styles.heroImg} />
              </Animated.View>
            ) : (
              <Image source={getDishImageSource(dish.id, dish.image)} style={styles.heroImg} />
            )}
          </TouchableOpacity>
          <LinearGradient colors={["rgba(10,10,10,0.6)", "rgba(10,10,10,0.2)", "rgba(10,10,10,0.95)"]} style={StyleSheet.absoluteFill} pointerEvents="none" />

          {/* Floating Actions on Image */}
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={20} color={colors.gold} />
            </TouchableOpacity>
            <View style={styles.iconBtn}>
              <AnimatedHeartButton
                isFavorite={favoritesIds.includes(dish.id)}
                onPress={() => toggleFavorite(dish.id)}
                size={20}
              />
            </View>
          </View>

          {/* Overlaid Title and Kicker */}
          <Animated.View style={[styles.heroText, { opacity: imageOpacity, transform: [{ translateY: heroAnim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] }]} pointerEvents="none">
            <View style={styles.kickerRow}>
              <View style={[styles.badge, { backgroundColor: specialTag.bg }]}>
                <Text style={[styles.badgeText, { color: specialTag.color }]}>
                  {specialTag.label}
                </Text>
              </View>
              <View style={styles.badgeVegNonveg}>
                <VegNonVegIndicator isVeg={dish.veg} size={11} />
                <Text style={styles.badgeVegText}>{dish.veg ? "VEG" : "NON-VEG"}</Text>
              </View>
            </View>
            <Text style={styles.title}>{dish.name}</Text>
          </Animated.View>
        </View>

        {/* Detailed Sheet Content */}
        <Animated.View style={[styles.sheet, { opacity: fade, transform: [{ translateY: slide }] }]}>
          
          {/* Header Row: Pricing & Rating */}
          <View style={styles.priceRow}>
            <View>
              <Text style={styles.priceLabel}>ESTIMATED VALUE</Text>
              <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}>
                <Text style={styles.price}>₹{dish.price}</Text>
                <Text style={styles.taxesLabel}>inclusive of taxes</Text>
              </View>
            </View>
            
            <View style={styles.ratingPill}>
              <Ionicons name="star" size={13} color="#0A0A0A" />
              <Text style={styles.ratingText}>{dish.rating?.toFixed(1) ?? "4.5"}</Text>
            </View>
          </View>

          <View style={styles.goldDivider} />

          {/* Metadata Grid (Beautified Cards) */}
          <View style={styles.metaGrid}>
            <View style={styles.metaCard}>
              <Ionicons name="time-outline" size={20} color={colors.gold} />
              <Text style={styles.metaTitle}>Prep Time</Text>
              <Text style={styles.metaValue}>{specialTag.time}</Text>
            </View>
            <View style={styles.metaCard}>
              <Ionicons name="flame-outline" size={20} color="#dc2626" />
              <Text style={styles.metaTitle}>Calories</Text>
              <Text style={styles.metaValue}>{specialTag.cal}</Text>
            </View>
            <View style={styles.metaCard}>
              <Ionicons name="restaurant-outline" size={20} color={colors.gold} />
              <Text style={styles.metaTitle}>Course Type</Text>
              <Text style={styles.metaValue} numberOfLines={1}>{dish.category ? dish.category.replace(/-/g, " ").toUpperCase() : "MAIN"}</Text>
            </View>
          </View>

          {/* Flavor Profile Section */}
          <Text style={styles.sectionTitle}>Flavor Experience</Text>
          <View style={styles.flavorCard}>
            <View style={styles.flavorRow}>
              <Text style={styles.flavorName}>Spiciness</Text>
              <View style={styles.meterContainer}>
                {[1, 2, 3].map((step) => (
                  <View 
                    key={step} 
                    style={[
                      styles.meterSegment, 
                      step <= specialTag.spicy && { backgroundColor: "#dc2626" }
                    ]} 
                  />
                ))}
              </View>
              <Text style={styles.flavorDesc}>
                {specialTag.spicy === 0 ? "Mild" : specialTag.spicy === 1 ? "Medium" : specialTag.spicy === 2 ? "Spicy" : "Very Spicy"}
              </Text>
            </View>

            <View style={styles.flavorRow}>
              <Text style={styles.flavorName}>Richness</Text>
              <View style={styles.meterContainer}>
                {[1, 2, 3].map((step) => (
                  <View 
                    key={step} 
                    style={[
                      styles.meterSegment, 
                      step <= specialTag.rich && { backgroundColor: colors.gold }
                    ]} 
                  />
                ))}
              </View>
              <Text style={styles.flavorDesc}>
                {specialTag.rich === 1 ? "Light" : specialTag.rich === 2 ? "Balanced" : "Rich & Creamy"}
              </Text>
            </View>
          </View>

          {/* About Section */}
          <Text style={styles.sectionTitle}>About this dish</Text>
          <Text style={styles.bodyText}>{dish.description}</Text>

          {/* Signature Highlights */}
          <Text style={styles.sectionTitle}>Royal Standards</Text>
          <View style={styles.highlightsContainer}>
            <View style={styles.highlightItem}>
              <Ionicons name="checkmark-circle-outline" size={16} color={colors.gold} />
              <Text style={styles.highlightText}>Slow-cooked by master culinary artisans</Text>
            </View>
            <View style={styles.highlightItem}>
              <Ionicons name="checkmark-circle-outline" size={16} color={colors.gold} />
              <Text style={styles.highlightText}>100% freshly sourced ingredients & herbs</Text>
            </View>
            <View style={styles.highlightItem}>
              <Ionicons name="checkmark-circle-outline" size={16} color={colors.gold} />
              <Text style={styles.highlightText}>Packaged in high-grade heat retention boxes</Text>
            </View>
          </View>

          {/* Add to Cart Actions */}
          <TouchableOpacity 
            style={[styles.addBtn, isInCart && styles.addedBtn]} 
            onPress={() => addToCart(dish)}
          >
            <Ionicons 
              name={isInCart ? "checkmark-circle" : "cart-outline"} 
              size={18} 
              color={isInCart ? colors.gold : "#0A0A0A"} 
            />
            <Text style={[styles.addBtnText, isInCart && styles.addedBtnText]}>
              {isInCart ? "ADDED TO CART" : "ADD TO ORDER"}
            </Text>
          </TouchableOpacity>

        </Animated.View>
      </ScrollView>

      {/* Aesthetic Image Viewer Modal */}
      {showImageModal && (
        <View style={styles.modalOverlay}>
          <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFillObject}>
            <TouchableOpacity 
              style={StyleSheet.absoluteFill} 
              activeOpacity={1} 
              onPress={() => setShowImageModal(false)} 
            />
            
            <View style={styles.modalContainer}>
              <View style={styles.modalCardStyle}>
                <Image source={getDishImageSource(dish.id, dish.image)} style={styles.modalImage} />
                <LinearGradient
                  colors={["rgba(0,0,0,0.85)", "transparent", "rgba(0,0,0,0.92)"]}
                  style={StyleSheet.absoluteFill}
                  pointerEvents="none"
                />
                
                {/* Top Badge Overlay */}
                <View style={styles.modalTopRow}>
                  <VegNonVegIndicator isVeg={dish.veg} size={16} />
                  
                  <View style={styles.modalRatingPill}>
                    <Ionicons name="star" size={12} color="#0A0A0A" />
                    <Text style={styles.modalRatingText}>{dish.rating?.toFixed(1) ?? "4.5"}</Text>
                  </View>
                </View>

                {/* Bottom Text Overlay */}
                <View style={styles.modalBottomInfo}>
                  <Text style={styles.modalDishName}>{dish.name}</Text>
                  
                  <View style={styles.modalMetaRow}>
                    <View style={styles.modalMetaChip}>
                      <Ionicons name="time-outline" size={12} color={colors.gold} />
                      <Text style={styles.modalMetaChipText}>{specialTag.time}</Text>
                    </View>
                    <View style={styles.modalMetaChip}>
                      <Ionicons name="flame-outline" size={12} color="#dc2626" />
                      <Text style={styles.modalMetaChipText}>{specialTag.cal}</Text>
                    </View>
                    <View style={[
                      styles.modalMetaChip, 
                      { borderColor: dish.veg ? "rgba(34,197,94,0.3)" : "rgba(220,38,38,0.3)" }
                    ]}>
                      <Text style={[
                        styles.modalMetaChipText,
                        { color: dish.veg ? "#22c55e" : "#dc2626" }
                      ]}>
                        {dish.veg ? "PURE VEG" : "NON-VEG"}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Close Button */}
              <TouchableOpacity 
                style={styles.modalCloseBtn}
                onPress={() => setShowImageModal(false)}
                activeOpacity={0.8}
              >
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  heroWrap: { height: 440, position: "relative" },
  heroFloat: { position: "absolute", left: 0, top: 0, width: "100%", height: 440, borderRadius: 22, overflow: "hidden" },
  heroImg: { width: "100%", height: "100%", resizeMode: "cover" },
  topBar: { position: "absolute", top: 14, left: 16, right: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center", zIndex: 12 },
  iconBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(10,10,10,0.65)", borderWidth: 1, borderColor: "rgba(212,175,55,0.25)", alignItems: "center", justifyContent: "center" },
  heroText: { position: "absolute", left: 18, right: 18, bottom: 24, zIndex: 10 },
  kickerRow: { flexDirection: "row", gap: 8, alignItems: "center", marginBottom: 8 },
  badge: { alignSelf: "flex-start", paddingHorizontal: 9, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 9, fontWeight: "900", letterSpacing: 0.8 },
  badgeVegNonveg: { flexDirection: "row", gap: 4, alignItems: "center", backgroundColor: "rgba(0,0,0,0.6)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 0.5, borderColor: "rgba(255,255,255,0.15)" },
  badgeVegText: { color: "rgba(255,255,255,0.8)", fontSize: 9, fontWeight: "800", letterSpacing: 0.5 },
  title: { color: "#FFF", fontSize: 28, fontWeight: "900", letterSpacing: 0.3 },
  sheet: { marginTop: -20, backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, borderWidth: 1.5, borderColor: "rgba(212,175,55,0.18)", borderBottomWidth: 0 },
  priceRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  priceLabel: { color: colors.textSecondary, fontSize: 9, fontWeight: "800", letterSpacing: 1.5 },
  price: { color: colors.gold, fontSize: 28, fontWeight: "900", marginTop: 2 },
  taxesLabel: { color: colors.textSecondary, fontSize: 9, fontWeight: "500", marginLeft: 4, alignSelf: "flex-end", marginBottom: 4 },
  ratingPill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, height: 28, borderRadius: 14, backgroundColor: colors.gold },
  ratingText: { color: "#0A0A0A", fontSize: 13, fontWeight: "900" },
  goldDivider: { height: 1, backgroundColor: "rgba(212,175,55,0.15)", marginVertical: 14 },
  metaGrid: { flexDirection: "row", gap: 8, marginBottom: 20 },
  metaCard: { flex: 1, backgroundColor: "rgba(255,255,255,0.02)", borderRadius: 16, borderWidth: 1.2, borderColor: "rgba(255,255,255,0.06)", paddingVertical: 12, paddingHorizontal: 8, alignItems: "center", gap: 4 },
  metaTitle: { color: colors.textSecondary, fontSize: 10, fontWeight: "600" },
  metaValue: { color: "#FFF", fontSize: 11, fontWeight: "800" },
  sectionTitle: { color: "#FFF", fontSize: 14, fontWeight: "900", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 10, marginTop: 16 },
  flavorCard: { backgroundColor: "rgba(255,255,255,0.02)", borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", padding: 14, gap: 12, marginBottom: 20 },
  flavorRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  flavorName: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: "700", width: 80 },
  meterContainer: { flexDirection: "row", gap: 4, flex: 1, justifyContent: "center" },
  meterSegment: { height: 6, flex: 1, maxWidth: 36, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 3 },
  flavorDesc: { color: colors.textSecondary, fontSize: 11, fontWeight: "600", width: 90, textAlign: "right" },
  bodyText: { color: "rgba(255,255,255,0.72)", fontSize: 12.5, lineHeight: 18, marginBottom: 20 },
  highlightsContainer: { gap: 8, marginBottom: 26, backgroundColor: "rgba(212,175,55,0.03)", padding: 14, borderRadius: 14, borderWidth: 0.8, borderColor: "rgba(212,175,55,0.12)" },
  highlightItem: { flexDirection: "row", gap: 8, alignItems: "center" },
  highlightText: { color: "rgba(255,255,255,0.8)", fontSize: 11.5, fontWeight: "600" },
  addBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: colors.gold, paddingVertical: 14, borderRadius: 18, shadowColor: colors.gold, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 6 },
  addBtnText: { color: "#0A0A0A", fontSize: 12, fontWeight: "900", letterSpacing: 1.5 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: colors.bg },
  missingTitle: { color: "#FFF", fontSize: 16, fontWeight: "800" },
  backBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, backgroundColor: colors.gold },
  backBtnText: { color: "#0A0A0A", fontWeight: "900" },

  // Image Modal Overlay Styles
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99999,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCardStyle: {
    width: width - 40,
    height: (width - 40) * 1.25,
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: "#121212",
    borderWidth: 1.5,
    borderColor: "rgba(212,175,55,0.4)",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  modalImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  modalTopRow: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
  },
  modalRatingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.gold,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  modalRatingText: {
    color: "#0A0A0A",
    fontSize: 12,
    fontWeight: "900",
  },
  modalBottomInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    zIndex: 10,
  },
  modalDishName: {
    color: "#FFF",
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  modalMetaRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  modalMetaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  modalMetaChipText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "700",
  },
  modalCloseBtn: {
    marginTop: 25,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(18,18,18,0.85)",
    borderWidth: 1.5,
    borderColor: "rgba(212,175,55,0.5)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  addedBtn: {
    backgroundColor: "rgba(212,175,55,0.12)",
    borderWidth: 1.5,
    borderColor: colors.gold,
    shadowColor: colors.gold,
    shadowOpacity: 0.1,
  },
  addedBtnText: {
    color: colors.gold,
  },
});
