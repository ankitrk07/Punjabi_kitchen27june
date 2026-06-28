import { Dish } from "@/src/data/menu";
import { colors } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";

type Props = {
  dish: Dish;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onAddToCart: (dish: Dish) => void;
  onOpen: (dish: Dish) => void;
  cardRef?: (node: any) => void;
  viewMode?: "grid" | "cinematic";
};

// Map dish IDs to custom contextual tags & prep times for production feel
const SPECIAL_TAGS: Record<string, { label: string; bg: string; color: string; time: string; cal: string }> = {
  "d-naan-1": { label: "BESTSELLER", bg: "rgba(212,175,55,0.9)", color: "#000", time: "12 mins", cal: "210 kcal" },
  "d-naan-2": { label: "POPULAR", bg: "rgba(255,255,255,0.15)", color: "#FFF", time: "14 mins", cal: "240 kcal" },
  "d-bir-1":  { label: "CHEF PICK", bg: "rgba(229,87,34,0.9)", color: "#FFF", time: "25 mins", cal: "580 kcal" },
  "d-bir-2":  { label: "BESTSELLER", bg: "rgba(212,175,55,0.9)", color: "#000", time: "22 mins", cal: "520 kcal" },
  "d-chk-1":  { label: "MUST TRY", bg: "rgba(34,197,94,0.9)", color: "#000", time: "20 mins", cal: "490 kcal" },
  "d-chk-2":  { label: "SMOKY HOT", bg: "rgba(239,68,68,0.9)", color: "#FFF", time: "25 mins", cal: "410 kcal" },
  "d-pan-2":  { label: "ROYAL SPEC", bg: "rgba(168,85,247,0.9)", color: "#FFF", time: "18 mins", cal: "460 kcal" },
  "d-dal-1":  { label: "SLOW COOK", bg: "rgba(212,175,55,0.9)", color: "#000", time: "30 mins", cal: "380 kcal" },
  "d-cs-1":   { label: "SIGNATURE", bg: "rgba(212,175,55,0.95)", color: "#000", time: "25 mins", cal: "720 kcal" },
  "d-cs-2":   { label: "SEASONAL", bg: "rgba(34,197,94,0.9)", color: "#000", time: "20 mins", cal: "340 kcal" },
};

export default function MenuDishCard({ dish, isFavorite, onToggleFavorite, onAddToCart, onOpen, cardRef, viewMode = "grid" }: Props) {
  const specialTag = SPECIAL_TAGS[dish.id] ?? { label: "", bg: "", color: "", time: "15 mins", cal: "350 kcal" };

  if (viewMode === "cinematic") {
    return (
      <TouchableOpacity
        ref={cardRef}
        style={styles.cinematicCard}
        testID={`dish-${dish.id}`}
        activeOpacity={0.92}
        onPress={() => onOpen(dish)}
      >
        <Image source={{ uri: dish.image }} style={styles.cinematicImg} />
        <LinearGradient
          colors={["rgba(10,10,10,0.2)", "rgba(10,10,10,0.65)", "rgba(10,10,10,0.98)"]}
          style={StyleSheet.absoluteFill}
        />
        
        {/* Top Floating Controls */}
        <View style={styles.cinematicTopRow}>
          <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
            <View style={styles.vegBadge}>
              <Ionicons
                name={dish.veg ? "leaf" : "flame"}
                size={12}
                color={dish.veg ? "#22c55e" : "#ef4444"}
              />
            </View>
            {specialTag.label !== "" && (
              <View style={[styles.specialBadge, { backgroundColor: specialTag.bg }]}>
                <Text style={[styles.specialBadgeText, { color: specialTag.color }]}>{specialTag.label}</Text>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.favoriteBtnCinematic} activeOpacity={0.85} onPress={() => onToggleFavorite(dish.id)}>
            <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={16} color={isFavorite ? colors.gold : "#FFF"} />
          </TouchableOpacity>
        </View>

        {/* Bottom Hero Overlay */}
        <View style={styles.cinematicBottomBody}>
          <View style={styles.cinematicMetaRow}>
            <View style={styles.metaChip}>
              <Ionicons name="star" size={11} color={colors.gold} />
              <Text style={styles.metaChipText}>{dish.rating?.toFixed(1) ?? "4.8"}</Text>
            </View>
            <View style={styles.metaChip}>
              <Ionicons name="time-outline" size={11} color="rgba(255,255,255,0.7)" />
              <Text style={styles.metaChipText}>{specialTag.time}</Text>
            </View>
            <View style={styles.metaChip}>
              <Ionicons name="flame-outline" size={11} color="rgba(255,255,255,0.7)" />
              <Text style={styles.metaChipText}>{specialTag.cal}</Text>
            </View>
          </View>

          <Text style={styles.cinematicTitle}>{dish.name}</Text>
          <Text style={styles.cinematicDesc} numberOfLines={2}>{dish.description}</Text>

          <View style={styles.cinematicFooterRow}>
            <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}>
              <Text style={styles.cinematicPrice}>₹{dish.price}</Text>
              <Text style={styles.priceTaxes}>net price</Text>
            </View>

            <TouchableOpacity
              style={styles.cinematicAddBtn}
              onPress={() => onAddToCart(dish)}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={16} color="#0A0A0A" />
              <Text style={styles.cinematicAddText}>ADD TO CART</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      ref={cardRef}
      style={styles.card}
      testID={`dish-${dish.id}`}
      activeOpacity={0.9}
      onPress={() => onOpen(dish)}
    >
      <View style={styles.imageWrap}>
        <Image source={{ uri: dish.image }} style={styles.cardImg} />
        <LinearGradient
          colors={["rgba(10,10,10,0.3)", "rgba(10,10,10,0.1)", "rgba(10,10,10,0.95)"]}
          style={StyleSheet.absoluteFill}
        />
        
        {/* Top Badges */}
        <View style={styles.topBadge}>
          <View style={{ flexDirection: "row", gap: 5, alignItems: "center" }}>
            <View style={styles.vegBadge}>
              <Ionicons
                name={dish.veg ? "leaf" : "flame"}
                size={11}
                color={dish.veg ? colors.gold : "#FFB34D"}
              />
            </View>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={10} color="#111" />
              <Text style={styles.ratingText}>{dish.rating?.toFixed(1) ?? "4.8"}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.favoriteBtnFloating}
            activeOpacity={0.85}
            onPress={() => onToggleFavorite(dish.id)}
            testID={`fav-${dish.id}`}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={13}
              color={isFavorite ? colors.gold : "#FFF"}
            />
          </TouchableOpacity>
        </View>

        {/* Prep Time Indicator */}
        <View style={styles.prepTimeTag}>
          <Ionicons name="time-outline" size={10} color="rgba(255,255,255,0.7)" />
          <Text style={styles.prepTimeText}>{specialTag.time}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={{ gap: 2 }}>
          <Text style={styles.cardTitle} numberOfLines={1}>{dish.name}</Text>
          <Text style={styles.cardDesc} numberOfLines={1}>{dish.description}</Text>
        </View>

        <View style={styles.cardFooter}>
          <View style={{ flex: 1 }}>
            <Text style={styles.price}>₹{dish.price}</Text>
            <Text style={styles.priceTaxes}>+ taxes</Text>
          </View>
          
          <TouchableOpacity
            style={styles.addPillBtn}
            onPress={() => onAddToCart(dish)}
            testID={`add-${dish.id}`}
            activeOpacity={0.8}
          >
            <Text style={styles.addPillText}>ADD</Text>
            <Ionicons name="add" size={12} color="#0A0A0A" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Grid styles
  card: {
    width: "100%",
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  imageWrap: { height: 160, backgroundColor: "#1B1B1B", position: "relative" },
  cardImg: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  topBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 2,
  },
  vegBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(10,10,10,0.85)",
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  specialBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  specialBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.gold,
  },
  ratingText: { color: "#111", fontSize: 11, fontWeight: "900" },
  prepTimeTag: {
    position: "absolute",
    bottom: 10,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.15)",
  },
  prepTimeText: { color: "rgba(255,255,255,0.8)", fontSize: 10, fontWeight: "600" },
  addPillBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    backgroundColor: colors.gold,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  addPillText: {
    color: "#0A0A0A",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  cardBody: { padding: 12, gap: 8 },
  cardHeadRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  cardTitle: { color: "#FFF", fontSize: 15, fontWeight: "800" },
  cardDesc: { color: colors.textSecondary, fontSize: 11, marginTop: 1, lineHeight: 15 },
  cardFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 6, marginTop: 2 },
  price: { color: colors.gold, fontSize: 16, fontWeight: "900" },
  priceTaxes: { color: colors.textSecondary, fontSize: 9, fontWeight: "500" },
  favoriteBtnFloating: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(10,10,10,0.75)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.15)",
  },

  // Cinematic Widescreen Mode Styles
  cinematicCard: {
    width: "100%",
    height: 220,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#0A0A0A",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.35)",
    position: "relative",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  cinematicImg: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  cinematicTopRow: {
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 2,
  },
  favoriteBtnCinematic: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  cinematicBottomBody: {
    padding: 16,
    zIndex: 2,
  },
  cinematicMetaRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 6,
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.15)",
  },
  metaChipText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "700",
  },
  cinematicTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
  cinematicDesc: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  cinematicFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  cinematicPrice: {
    color: colors.gold,
    fontSize: 22,
    fontWeight: "900",
  },
  cinematicAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.gold,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  cinematicAddText: {
    color: "#0A0A0A",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
});
