import { Dish } from "@/src/data/menu";
import { colors } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import MenuDishCard from "./MenuDishCard";

export type MenuSectionData = {
  id: string;
  name: string;
  icon: string;
  dishes: Dish[];
};

type Props = {
  section: MenuSectionData;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onAddToCart: (dish: Dish, clickCoords?: { x: number; y: number }) => void;
  onOpen: (dish: Dish) => void;
  onCardRef: (dishId: string, node: any) => void;
  viewMode?: "grid" | "cinematic";
};

export default function MenuSection({ section, favorites, onToggleFavorite, onAddToCart, onOpen, onCardRef, viewMode = "grid" }: Props) {
  return (
    <View style={styles.block}>
      <View style={styles.head}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={styles.titleBar} />
          <View>
            <Text style={styles.title}>{section.name}</Text>
            <Text style={styles.subtitle}>{section.dishes.length} items available</Text>
          </View>
        </View>
        <View style={styles.pill}>
          <Ionicons name={section.icon as any} size={12} color={colors.gold} />
          <Text style={styles.pillText}>{section.name}</Text>
        </View>
      </View>

      <View style={[styles.wrapBase, viewMode === "cinematic" ? styles.cinematicWrap : styles.gridWrap]}>
        {section.dishes.map((dish) => (
          <View key={dish.id} style={viewMode === "cinematic" ? styles.cinematicItem : styles.gridItem}>
            <MenuDishCard
              dish={dish}
              isFavorite={favorites.includes(dish.id)}
              onToggleFavorite={onToggleFavorite}
              onAddToCart={onAddToCart}
              onOpen={onOpen}
              cardRef={(node) => onCardRef(dish.id, node)}
              viewMode={viewMode}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { gap: 14, marginBottom: 8 },
  head: { paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  titleBar: { width: 4, height: 28, borderRadius: 2, backgroundColor: colors.gold },
  title: { color: "#FFF", fontSize: 19, fontWeight: "900", letterSpacing: 0.3 },
  subtitle: { color: colors.textSecondary, fontSize: 11, marginTop: 1, fontWeight: "500" },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(212,175,55,0.08)",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.25)",
  },
  pillText: { color: colors.gold, fontSize: 11, fontWeight: "800", textTransform: "capitalize" },
  wrapBase: { paddingHorizontal: 16 },
  gridWrap: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -6 },
  gridItem: { width: "50%", paddingHorizontal: 6, marginBottom: 12 },
  cinematicWrap: { flexDirection: "column", gap: 16 },
  cinematicItem: { width: "100%" },
});
