import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

const GOLD = "#C9A84C";

export type OccasionType = "None" | "Birthday" | "Anniversary" | "Business" | "Date Night" | "Casual";

const OCCASIONS: OccasionType[] = [
  "None",
  "Birthday",
  "Anniversary",
  "Business",
  "Date Night",
  "Casual",
];

interface OccasionSelectorProps {
  selected: OccasionType;
  onSelect: (occasion: OccasionType) => void;
}

function OccasionChip({
  label,
  isSelected,
  onPress,
}: {
  label: OccasionType;
  isSelected: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.92, { damping: 10, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 300 });
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={[
          styles.chip,
          isSelected && styles.chipActive,
        ]}
      >
        <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export function OccasionSelector({ selected, onSelect }: OccasionSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>OCCASION</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {OCCASIONS.map((occ) => (
          <OccasionChip
            key={occ}
            label={occ}
            isSelected={selected === occ}
            onPress={() => onSelect(occ)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    paddingHorizontal: 4,
  },
  label: {
    color: GOLD,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  scrollContent: {
    gap: 8,
    paddingRight: 16,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "rgba(14, 14, 14, 0.7)",
    borderWidth: 1,
    borderColor: "rgba(201, 168, 76, 0.15)",
  },
  chipActive: {
    backgroundColor: GOLD,
    borderColor: GOLD,
  },
  chipText: {
    color: "#777",
    fontSize: 12.5,
    fontWeight: "600",
  },
  chipTextActive: {
    color: "#000000",
    fontWeight: "800",
  },
});
