import { useApp } from "@/src/context/AppContext";
import { DISHES } from "@/src/data/menu";
import { colors } from "@/src/theme";
import { storage } from "@/src/utils/storage";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function DishDetail() {
  const { id, fromX, fromY, fromW, fromH } = useLocalSearchParams<{ id: string; fromX?: string; fromY?: string; fromW?: string; fromH?: string }>();
  const router = useRouter();
  const { addToCart } = useApp();
  const dish = DISHES.find((item) => item.id === id);
  const [favoritesIds, setFavoritesIds] = useState<string[]>([]);
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(18)).current;
  const heroAnim = useRef(new Animated.Value(0)).current;
  const imageOpacity = useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    let mounted = true;
    (async () => {
      const saved = await storage.getItem<string[]>("pk_favorites", []);
      if (mounted && saved) setFavoritesIds(saved);
    })();
    return () => { mounted = false; };
  }, []);

  const toggleFavorite = async () => {
    if (!dish) return;
    setFavoritesIds((prev) => {
      const next = prev.includes(dish.id) ? prev.filter((item) => item !== dish.id) : [dish.id, ...prev];
      void storage.setItem("pk_favorites", next);
      return next;
    });
  };

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

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        <View style={styles.heroWrap}>
          {hasSourceFrame ? (
            <Animated.View
              style={[
                styles.heroFloat,
                {
                  transform: [
                    { translateX: heroAnim.interpolate({ inputRange: [0, 1], outputRange: [Number(fromX), 0] }) },
                    { translateY: heroAnim.interpolate({ inputRange: [0, 1], outputRange: [Number(fromY), 0] }) },
                    { scaleX: heroAnim.interpolate({ inputRange: [0, 1], outputRange: [Number(fromW) / width, 1] }) },
                    { scaleY: heroAnim.interpolate({ inputRange: [0, 1], outputRange: [Number(fromH) / 360, 1] }) },
                  ],
                },
              ]}
            >
              <Image source={{ uri: dish.image }} style={styles.heroImg} />
              <LinearGradient colors={["transparent", "rgba(10,10,10,0.25)", "rgba(10,10,10,0.94)"]} style={StyleSheet.absoluteFill} />
            </Animated.View>
          ) : (
            <Image source={{ uri: dish.image }} style={styles.heroImg} />
          )}
          <LinearGradient colors={["transparent", "rgba(10,10,10,0.25)", "rgba(10,10,10,0.94)"]} style={StyleSheet.absoluteFill} />

          <View style={styles.topBar}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={22} color={colors.gold} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={toggleFavorite}>
              <Ionicons name={favoritesIds.includes(dish.id) ? "heart" : "heart-outline"} size={20} color={colors.gold} />
            </TouchableOpacity>
          </View>

          <Animated.View style={[styles.heroText, { opacity: imageOpacity, transform: [{ translateY: heroAnim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] }]}>
            <Text style={styles.badge}>{dish.veg ? "VEG" : "NON-VEG"}</Text>
            <Text style={styles.title}>{dish.name}</Text>
            <Text style={styles.desc}>{dish.description}</Text>
          </Animated.View>
        </View>

        <Animated.View style={[styles.sheet, { opacity: fade, transform: [{ translateY: slide }] }]}>
          <View style={styles.priceRow}>
            <View>
              <Text style={styles.priceLabel}>Price</Text>
              <Text style={styles.price}>₹{dish.price}</Text>
            </View>
            <View style={styles.ratingPill}>
              <Ionicons name="star" size={14} color={colors.gold} />
              <Text style={styles.ratingText}>{dish.rating?.toFixed(1) ?? "4.5"}</Text>
            </View>
          </View>

          <View style={styles.metaGrid}>
            <View style={styles.metaCard}>
              <Ionicons name="time-outline" size={18} color={colors.gold} />
              <Text style={styles.metaTitle}>Prep Time</Text>
              <Text style={styles.metaValue}>20–25 min</Text>
            </View>
            <View style={styles.metaCard}>
              <Ionicons name={dish.veg ? "leaf" : "flame"} size={18} color={colors.gold} />
              <Text style={styles.metaTitle}>Type</Text>
              <Text style={styles.metaValue}>{dish.veg ? "Veg" : "Non-Veg"}</Text>
            </View>
            <View style={styles.metaCard}>
              <Ionicons name="restaurant-outline" size={18} color={colors.gold} />
              <Text style={styles.metaTitle}>Category</Text>
              <Text style={styles.metaValue} numberOfLines={1}>{dish.category.replace(/-/g, " ")}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>About this dish</Text>
          <Text style={styles.bodyText}>{dish.description}</Text>

          <TouchableOpacity style={styles.addBtn} onPress={() => addToCart(dish)}>
            <Ionicons name="bag-add-outline" size={18} color="#0A0A0A" />
            <Text style={styles.addBtnText}>ADD TO CART</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  heroWrap: { height: 360, position: "relative" },
  heroFloat: { position: "absolute", left: 0, top: 0, width: "100%", height: 360, borderRadius: 22, overflow: "hidden" },
  heroImg: { width: "100%", height: "100%" },
  topBar: { position: "absolute", top: 14, left: 16, right: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  iconBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: "rgba(10,10,10,0.55)", borderWidth: 1, borderColor: colors.borderGold, alignItems: "center", justifyContent: "center" },
  heroText: { position: "absolute", left: 18, right: 18, bottom: 18 },
  badge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: "rgba(212,175,55,0.16)", color: colors.gold, fontSize: 11, fontWeight: "800", overflow: "hidden", marginBottom: 10 },
  title: { color: "#FFF", fontSize: 30, fontWeight: "900", letterSpacing: 0.2 },
  desc: { color: colors.textSecondary, fontSize: 13, lineHeight: 20, marginTop: 8, maxWidth: width - 36 },
  sheet: { marginTop: -18, backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 18, borderTopWidth: 1, borderColor: colors.borderGold },
  priceRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  priceLabel: { color: colors.textSecondary, fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1.2 },
  price: { color: colors.gold, fontSize: 26, fontWeight: "900", marginTop: 4 },
  ratingPill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 14, backgroundColor: "rgba(212,175,55,0.12)", borderWidth: 1, borderColor: colors.borderGold },
  ratingText: { color: colors.gold, fontWeight: "800" },
  metaGrid: { flexDirection: "row", gap: 10, marginBottom: 18 },
  metaCard: { flex: 1, backgroundColor: colors.bg, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 12, alignItems: "center", gap: 5 },
  metaTitle: { color: colors.textSecondary, fontSize: 11 },
  metaValue: { color: "#FFF", fontSize: 12, fontWeight: "800", textAlign: "center" },
  sectionTitle: { color: "#FFF", fontSize: 16, fontWeight: "800", marginBottom: 8 },
  bodyText: { color: colors.textSecondary, fontSize: 13, lineHeight: 20, marginBottom: 20 },
  addBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: colors.gold, paddingVertical: 14, borderRadius: 18 },
  addBtnText: { color: "#0A0A0A", fontSize: 13, fontWeight: "900", letterSpacing: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: colors.bg },
  missingTitle: { color: "#FFF", fontSize: 16, fontWeight: "800" },
  backBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, backgroundColor: colors.gold },
  backBtnText: { color: "#0A0A0A", fontWeight: "900" },
});
