import ScreenHeader from "@/src/components/ScreenHeader";
import { colors } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const favorites = [
  { name: "Paneer Butter Masala", note: "Most reordered this month" },
  { name: "Garlic Naan", note: "Often paired with curries" },
  { name: "Mango Lassi", note: "Quick add-on" },
];

export default function ReorderFavoritesScreen() {
  return (
    <ScreenHeader title="Reorder Favorites" backHref="/(tabs)/profile">
      <View style={styles.hero}>
        <Ionicons name="heart-outline" size={22} color={colors.gold} />
        <View style={{ flex: 1 }}>
          <Text style={styles.heroTitle}>Quick reorder</Text>
          <Text style={styles.heroText}>Pick from your favorite dishes and place a fast repeat order.</Text>
        </View>
      </View>

      {favorites.map((item) => (
        <View key={item.name} style={styles.card}>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.note}>{item.note}</Text>
        </View>
      ))}
    </ScreenHeader>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: "row", gap: 12, alignItems: "center", backgroundColor: colors.surface, borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: colors.borderGold },
  heroTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: "800" },
  heroText: { color: colors.textSecondary, marginTop: 4, lineHeight: 18 },
  card: { backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  title: { color: colors.textPrimary, fontWeight: "700", marginBottom: 4 },
  note: { color: colors.textSecondary },
});
