import { colors } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type DishTypeFilter = "all" | "veg" | "nonveg";

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
        <Ionicons name="grid-outline" size={13} color="#FFFFFF" />
        <Text numberOfLines={1} style={[styles.segmentText, value === "all" && styles.segmentTextSelected]}>All</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.segmentBtn, value === "veg" && styles.segmentBtnSelected]}
        activeOpacity={0.85}
        onPress={() => onChange(value === "veg" ? "all" : "veg")}
      >
        <Ionicons name="leaf-outline" size={13} color="#FFFFFF" />
        <Text numberOfLines={1} style={[styles.segmentText, value === "veg" && styles.segmentTextSelected]}>Veg</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.segmentBtn, value === "nonveg" && styles.segmentBtnSelected]}
        activeOpacity={0.85}
        onPress={() => onChange(value === "nonveg" ? "all" : "nonveg")}
      >
        <Ionicons name="water-outline" size={13} color="#FFFFFF" />
        <Text numberOfLines={1} style={[styles.segmentText, value === "nonveg" && styles.segmentTextSelected]}>Non-Veg</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  segment: {
    flexDirection: "row",
    gap: 4,
    padding: 4,
    borderRadius: 24,
    backgroundColor: "#0D0B08",
    borderWidth: 1.2,
    borderColor: "rgba(255, 255, 255, 0.08)",
    flex: 1,
    height: 48,
    alignItems: "center",
  },
  segmentBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 8,
    height: 40,
    borderRadius: 20,
    backgroundColor: "transparent",
  },
  segmentBtnSelected: {
    backgroundColor: "#A08135",
    borderWidth: 1,
    borderColor: "rgba(201, 168, 76, 0.35)",
  },
  segmentText: {
    color: "rgba(255, 255, 255, 0.72)",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  segmentTextSelected: { 
    color: "#FFFFFF", 
    fontWeight: "800",
  },
});
