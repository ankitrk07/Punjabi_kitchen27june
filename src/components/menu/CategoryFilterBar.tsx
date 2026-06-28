import { colors } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";

type FilterItem = { id: string; name: string; icon: string };

type Props = {
  filters: FilterItem[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export default function CategoryFilterBar({ filters, selectedId, onSelect }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {filters.map((filter) => {
        const selected = selectedId === filter.id;
        return (
          <TouchableOpacity
            key={filter.id}
            onPress={() => onSelect(filter.id)}
            style={[styles.chip, selected && styles.chipSelected]}
            activeOpacity={0.85}
            testID={`filter-${filter.id}`}
          >
            <Ionicons name={filter.icon as any} size={14} color={selected ? "#0A0A0A" : colors.gold} />
            <Text style={[styles.text, selected && styles.textSelected]}>{filter.name}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: 16, gap: 10 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  chipSelected: { backgroundColor: colors.gold, borderColor: colors.gold },
  text: { color: colors.gold, fontSize: 13, fontWeight: "700" },
  textSelected: { color: "#0A0A0A" },
});
