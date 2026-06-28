import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "@/src/components/ScreenHeader";
import { colors } from "@/src/theme";

const WISHLIST = [
  { id: "1", name: "Peshwari Chicken", rest: "Punjabi Kitchen – CP", price: "₹480", emoji: "🍖", note: "Want to try on next birthday dinner!" },
  { id: "2", name: "Rajasthani Laal Maas", rest: "Spice Garden – Saket", price: "₹560", emoji: "🥘", note: "Heard it's fiery and authentic." },
  { id: "3", name: "Dahi Bhalla Platter", rest: "Dhaba 29 – Lajpat Nagar", price: "₹180", emoji: "🍥", note: "Summer special, must try!" },
];

export default function WishlistScreen() {
  return (
    <ScreenHeader title="Wishlist" backHref="/(tabs)/profile">
      <Text style={s.label}>Items you've bookmarked to try 🎯</Text>
      {WISHLIST.map((item) => (
        <View key={item.id} style={s.card}>
          <View style={s.topRow}>
            <Text style={s.emoji}>{item.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.name}>{item.name}</Text>
              <Text style={s.rest}>{item.rest}</Text>
              <Text style={s.price}>{item.price}</Text>
            </View>
            <TouchableOpacity>
              <Ionicons name="bookmark" size={20} color={colors.gold} />
            </TouchableOpacity>
          </View>
          <View style={s.noteRow}>
            <Ionicons name="chatbubble-ellipses-outline" size={13} color={colors.textSecondary} />
            <Text style={s.note}>"{item.note}"</Text>
          </View>
          <TouchableOpacity style={s.btn}>
            <Ionicons name="cart-outline" size={14} color="#000" />
            <Text style={s.btnText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScreenHeader>
  );
}

const s = StyleSheet.create({
  label: { color: colors.textSecondary, fontSize: 13, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 10 },
  card: { backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 12 },
  topRow: { flexDirection: "row", gap: 12, alignItems: "flex-start", marginBottom: 10 },
  emoji: { fontSize: 36 },
  name: { fontSize: 15, fontWeight: "700", color: colors.textPrimary },
  rest: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  price: { fontSize: 14, fontWeight: "800", color: colors.gold, marginTop: 4 },
  noteRow: { flexDirection: "row", gap: 6, alignItems: "flex-start", backgroundColor: "rgba(255,255,255,0.03)", padding: 10, borderRadius: 10, marginBottom: 12 },
  note: { fontSize: 11, color: colors.textSecondary, fontStyle: "italic", flex: 1, lineHeight: 16 },
  btn: { flexDirection: "row", alignItems: "center", gap: 6, justifyContent: "center", backgroundColor: colors.gold, paddingVertical: 10, borderRadius: 12 },
  btnText: { fontSize: 12, fontWeight: "700", color: "#000" },
});
