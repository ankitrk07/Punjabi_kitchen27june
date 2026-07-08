import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

const { width } = Dimensions.get("window");
const GOLD = "#C9A84C";
const GOLD_LIGHT = "#E8C97A";
const WHITE = "#FFFFFF";

interface StickyConfirmationSheetProps {
  visible: boolean;
  guests: string;
  dateStr: string;
  timeSlot: string | null;
  occasion: string;
  onConfirm: () => void;
  onPressSummary: () => void;
}

export function StickyConfirmationSheet({
  visible,
  guests,
  dateStr,
  timeSlot,
  occasion,
  onConfirm,
  onPressSummary,
}: StickyConfirmationSheetProps) {
  const slideAnim = useSharedValue(150); // hidden at bottom by default

  useEffect(() => {
    slideAnim.value = withSpring(visible ? 0 : 150, {
      damping: 15,
      stiffness: 90,
    });
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideAnim.value }],
  }));

  // Build the summary string
  const parts = [];
  parts.push(`${guests} Guest${Number(guests) > 1 ? "s" : ""}`);
  if (dateStr) parts.push(dateStr);
  if (timeSlot) parts.push(timeSlot);
  if (occasion && occasion !== "None") parts.push(occasion);
  const summaryText = parts.join("  ·  ");

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {/* Summary Row */}
      <TouchableOpacity
        onPress={onPressSummary}
        activeOpacity={0.8}
        style={styles.summaryRow}
      >
        <View style={styles.summaryLeft}>
          <Ionicons name="restaurant-outline" size={13} color={GOLD} />
          <Text style={styles.summaryText} numberOfLines={1}>
            {summaryText}
          </Text>
        </View>
        <Ionicons name="create-outline" size={13} color={`${GOLD}80`} />
      </TouchableOpacity>

      {/* Action Button */}
      <TouchableOpacity
        style={styles.confirmBtn}
        onPress={onConfirm}
        activeOpacity={0.95}
      >
        <LinearGradient
          colors={[GOLD_LIGHT, GOLD]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          <Text style={styles.confirmBtnText}>CONFIRM RESERVATION  →</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#0F0B09",
    borderTopWidth: 1.5,
    borderColor: "rgba(201, 168, 76, 0.25)",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingBottom: 22,
    paddingHorizontal: 16,
    zIndex: 9999,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(201, 168, 76, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(201, 168, 76, 0.1)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  summaryLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  summaryText: {
    color: GOLD,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  confirmBtn: {
    width: "100%",
    borderRadius: 12,
    height: 48,
    overflow: "hidden",
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  gradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmBtnText: {
    color: "#000000",
    fontSize: 13.5,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
});
