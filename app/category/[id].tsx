import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Animated, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useApp } from "@/src/context/AppContext";
import { CATEGORIES, DISHES, Dish } from "@/src/data/menu";
import { colors } from "@/src/theme";

const { width, height } = Dimensions.get("window");

type FlyingItem = { id: string; image: string; x: number; y: number };

export default function CategoryDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { addToCart, cart } = useApp();
  const cat = CATEGORIES.find((c) => c.id === id);
  const dishes = DISHES.filter((d) => d.category === id);
  const [flying, setFlying] = useState<FlyingItem[]>([]);
  const itemAnims = useRef(dishes.map(() => new Animated.Value(0))).current;
  const count = cart.reduce((s, i) => s + i.qty, 0);

  useEffect(() => {
    Animated.stagger(
      60,
      itemAnims.map((a) => Animated.spring(a, { toValue: 1, friction: 6, useNativeDriver: true }))
    ).start();
  }, []);

  const handleAdd = (d: Dish, layout: { x: number; y: number }) => {
    const flyId = `${d.id}-${Date.now()}`;
    setFlying((prev) => [...prev, { id: flyId, image: d.image, x: layout.x, y: layout.y }]);
    addToCart(d);
    setTimeout(() => {
      setFlying((prev) => prev.filter((f) => f.id !== flyId));
    }, 700);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} testID="back-btn">
          <Ionicons name="chevron-back" size={22} color={colors.gold} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{cat?.name || id}</Text>
        <TouchableOpacity onPress={() => router.push("/cart")} style={styles.iconBtn} testID="cart-btn">
          <Ionicons name="bag-handle" size={22} color={colors.gold} />
          {count > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{count}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {dishes.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="restaurant-outline" size={56} color={colors.textSecondary} />
            <Text style={styles.emptyText}>More dishes coming soon!</Text>
          </View>
        ) : (
          dishes.map((d, idx) => {
            const opacity = itemAnims[idx];
            const translateY = itemAnims[idx].interpolate({ inputRange: [0, 1], outputRange: [20, 0] });
            return (
              <Animated.View key={d.id} style={{ opacity, transform: [{ translateY }] }}>
                <View style={styles.dishCard}>
                  <Image source={{ uri: d.image }} style={styles.dishImg} />
                  <View style={styles.dishInfo}>
                    <View style={styles.dishHead}>
                      <View style={[styles.vegDot, { borderColor: d.veg ? colors.success : colors.error }]}>
                        <View style={[styles.vegDotInner, { backgroundColor: d.veg ? colors.success : colors.error }]} />
                      </View>
                      <Text style={styles.dishName} numberOfLines={1}>{d.name}</Text>
                    </View>
                    <Text style={styles.dishDesc} numberOfLines={2}>{d.description}</Text>
                    <View style={styles.priceRow}>
                      <Text style={styles.price}>₹{d.price}</Text>
                      {d.rating && (
                        <View style={styles.rating}>
                          <Ionicons name="star" size={11} color={colors.gold} />
                          <Text style={styles.ratingText}>{d.rating}</Text>
                        </View>
                      )}
                    </View>
                    <TouchableOpacity
                      style={styles.addBtn}
                      onPress={() => handleAdd(d, { x: width - 80, y: 200 + idx * 130 })}
                      testID={`add-${d.id}`}
                    >
                      <Ionicons name="add" size={16} color="#000" />
                      <Text style={styles.addBtnText}>ADD TO CART</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
            );
          })
        )}
      </ScrollView>

      {/* Flying images */}
      {flying.map((f) => (
        <FlyingDish key={f.id} image={f.image} fromX={f.x} fromY={f.y} />
      ))}
    </SafeAreaView>
  );
}

function FlyingDish({ image, fromX, fromY }: { image: string; fromX: number; fromY: number }) {
  const trans = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(trans, {
        toValue: { x: width - fromX - 40, y: -(fromY + 30) },
        duration: 650,
        useNativeDriver: true,
      }),
      Animated.timing(scale, { toValue: 0.15, duration: 650, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 650, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.flying,
        {
          left: fromX,
          top: fromY,
          opacity,
          transform: [{ translateX: trans.x }, { translateY: trans.y }, { scale }],
        },
      ]}
    >
      <Image source={{ uri: image }} style={styles.flyingImg} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { height: 60, flexDirection: "row", alignItems: "center", paddingHorizontal: 16, gap: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.borderGold },
  title: { flex: 1, color: "#FFF", fontSize: 18, fontWeight: "700", textAlign: "center" },
  badge: { position: "absolute", top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: colors.gold, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
  badgeText: { color: "#000", fontSize: 10, fontWeight: "700" },
  empty: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyText: { color: colors.textSecondary },
  dishCard: { flexDirection: "row", padding: 12, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginBottom: 12, gap: 12 },
  dishImg: { width: 110, height: 130, borderRadius: 12 },
  dishInfo: { flex: 1, justifyContent: "space-between" },
  dishHead: { flexDirection: "row", alignItems: "center", gap: 6 },
  vegDot: { width: 14, height: 14, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  vegDotInner: { width: 6, height: 6, borderRadius: 3 },
  dishName: { color: "#FFF", fontWeight: "700", fontSize: 15, flex: 1 },
  dishDesc: { color: colors.textSecondary, fontSize: 11, marginTop: 4, lineHeight: 16 },
  priceRow: { flexDirection: "row", alignItems: "center", marginTop: 4, gap: 10 },
  price: { color: colors.gold, fontWeight: "800", fontSize: 16 },
  rating: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: "rgba(212,175,55,0.12)" },
  ratingText: { color: colors.gold, fontSize: 10, fontWeight: "700" },
  addBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, backgroundColor: colors.gold, paddingVertical: 8, borderRadius: 20, marginTop: 6 },
  addBtnText: { color: "#000", fontWeight: "800", fontSize: 11, letterSpacing: 1 },
  flying: { position: "absolute", width: 80, height: 80, zIndex: 999 },
  flyingImg: { width: "100%", height: "100%", borderRadius: 40, borderWidth: 2, borderColor: colors.gold },
});