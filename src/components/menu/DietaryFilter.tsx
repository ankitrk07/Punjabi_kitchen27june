import { colors } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type DishTypeFilter = "all" | "veg" | "nonveg";
export type PriceRangeFilter = "all" | "under-200" | "200-350" | "above-350";

type Props = {
  value: DishTypeFilter;
  onChange: (value: DishTypeFilter) => void;
};

export default function DietaryFilter({ value, onChange }: Props) {
  return (
    <View style={styles.segment}>
      <TouchableOpacity 
        style={[styles.segmentBtn, value === "all" && styles.segmentBtnSelected]} 
        activeOpacity={0.85} 
        onPress={() => onChange("all")}
      >
        <Ionicons name="grid-outline" size={12} color={value === "all" ? colors.gold : colors.textSecondary} />
        <Text numberOfLines={1} style={[styles.segmentText, value === "all" && styles.segmentTextSelected]}>All</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.segmentBtn, value === "veg" && styles.segmentBtnSelected]} 
        activeOpacity={0.85} 
        onPress={() => onChange(value === "veg" ? "all" : "veg")}
      >
        <Ionicons name="leaf" size={12} color={value === "veg" ? "#22c55e" : colors.textSecondary} />
        <Text numberOfLines={1} style={[styles.segmentText, value === "veg" && styles.segmentTextSelected]}>Pure Veg</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.segmentBtn, value === "nonveg" && styles.segmentBtnSelected]} 
        activeOpacity={0.85} 
        onPress={() => onChange(value === "nonveg" ? "all" : "nonveg")}
      >
        <Ionicons name="flame" size={12} color={value === "nonveg" ? "#ef4444" : colors.textSecondary} />
        <Text numberOfLines={1} style={[styles.segmentText, value === "nonveg" && styles.segmentTextSelected]}>Non-Veg</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  segment: { 
    flexDirection: "row", 
    gap: 4, 
    padding: 3, 
    borderRadius: 12, 
    backgroundColor: "rgba(255,255,255,0.03)", 
    borderWidth: 1, 
    borderColor: colors.border,
    minWidth: 220,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 8,
    height: 32,
    borderRadius: 9,
    backgroundColor: "transparent",
  },
  segmentBtnSelected: { 
    backgroundColor: "rgba(212,175,55,0.14)", 
    borderWidth: 1, 
    borderColor: "rgba(212,175,55,0.35)" 
  },
  segmentText: { color: colors.textSecondary, fontSize: 11, fontWeight: "600" },
  segmentTextSelected: { color: colors.gold, fontWeight: "800" },
});
