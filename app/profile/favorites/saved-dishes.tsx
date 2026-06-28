import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "@/src/components/ScreenHeader";
import { colors } from "@/src/theme";

const DISHES = [
  { id: "1", name: "Dal Makhani Special", price: "₹280", rating: "4.8", tag: "Bestseller", emoji: "🍛", desc: "Slow-cooked black lentils, white butter, fresh cream" },
  { id: "2", name: "Butter Chicken Thali", price: "₹520", rating: "4.9", tag: "Chef's Pick", emoji: "🍗", desc: "Tender chicken in rich buttery tomato gravy + 2 Naans + Rice" },
  { id: "3", name: "Amritsari Kulcha", price: "₹180", rating: "4.7", tag: "Must Try", emoji: "🫓", desc: "Crispy stuffed kulcha from clay tandoor with chole & butter" },
  { id: "4", name: "Paneer Tikka Wrap", price: "₹248", rating: "4.6", tag: "Trending", emoji: "🌯", desc: "Spiced paneer cubes with mint chutney wrapped in flatbread" },
];

export default function SavedDishesScreen() {
  return (
    <ScreenHeader title="Saved Dishes" backHref="/(tabs)/profile">
      <View style={s.topBar}>
        <Ionicons name="heart" size={18} color={colors.gold} />
        <Text style={s.topBarText}>{DISHES.length} Saved Dishes</Text>
      </View>

      {DISHES.map((dish) => (
        <View key={dish.id} style={s.card}>
          <View style={s.emojiBox}>
            <Text style={s.emoji}>{dish.emoji}</Text>
          </View>
          <View style={s.meta}>
            <View style={s.row}>
              <Text style={s.name}>{dish.name}</Text>
              <View style={s.tag}><Text style={s.tagText}>{dish.tag}</Text></View>
            </View>
            <Text style={s.desc}>{dish.desc}</Text>
            <View style={s.footer}>
              <Text style={s.price}>{dish.price}</Text>
              <View style={s.ratingRow}>
                <Ionicons name="star" size={12} color={colors.gold} />
                <Text style={s.rating}>{dish.rating}</Text>
              </View>
              <TouchableOpacity style={s.btn}><Text style={s.btnText}>Order Now</Text></TouchableOpacity>
              <TouchableOpacity>
                <Ionicons name="heart" size={18} color={colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}
    </ScreenHeader>
  );
}

const s = StyleSheet.create({
  topBar: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  topBarText: { color: colors.textSecondary, fontSize: 13 },
  card: { flexDirection: "row", backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 14, marginBottom: 12, gap: 12 },
  emojiBox: { width: 60, height: 60, borderRadius: 14, backgroundColor: "rgba(212,175,55,0.08)", alignItems: "center", justifyContent: "center" },
  emoji: { fontSize: 30 },
  meta: { flex: 1 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  name: { fontSize: 14, fontWeight: "700", color: colors.textPrimary, flex: 1 },
  tag: { backgroundColor: "rgba(212,175,55,0.15)", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  tagText: { fontSize: 9, color: colors.gold, fontWeight: "700" },
  desc: { fontSize: 11, color: colors.textSecondary, lineHeight: 15, marginBottom: 8 },
  footer: { flexDirection: "row", alignItems: "center", gap: 8 },
  price: { fontSize: 15, fontWeight: "800", color: colors.gold },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  rating: { fontSize: 11, color: colors.textPrimary, fontWeight: "600" },
  btn: { backgroundColor: colors.gold, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, marginLeft: "auto" },
  btnText: { fontSize: 10, fontWeight: "700", color: "#000" },
});
