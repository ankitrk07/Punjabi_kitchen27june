import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, ActivityIndicator, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/src/theme";

interface BeautifulRefreshControlProps {
  scrollY: Animated.Value;
  refreshing: boolean;
  title?: string;
  color?: string;
}

export const BeautifulRefreshControl: React.FC<BeautifulRefreshControlProps> = ({
  scrollY,
  refreshing,
  title = "Preparing your feast...",
  color = colors.gold,
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(0.4)).current;

  // Rotation animation loop when refreshing
  useEffect(() => {
    let spinAnim: Animated.CompositeAnimation | null = null;
    let pulseAnim: Animated.CompositeAnimation | null = null;

    if (refreshing) {
      spinValue.setValue(0);
      spinAnim = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      spinAnim.start();

      pulseAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseValue, {
            toValue: 0.4,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnim.start();
    } else {
      spinValue.setValue(0);
      pulseValue.setValue(0.4);
    }

    return () => {
      if (spinAnim) spinAnim.stop();
      if (pulseAnim) pulseAnim.stop();
    };
  }, [refreshing]);

  // Pull-to-spin interpolation (when pulling down, before refreshing starts)
  const pullRotate = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: ["-360deg", "0deg"],
    extrapolate: "clamp",
  });

  // Scale pulling effect
  const pullScale = scrollY.interpolate({
    inputRange: [-100, -30, 0],
    outputRange: [1.15, 1, 0.7],
    extrapolate: "clamp",
  });

  // Opacity fade in as we pull down
  const pullOpacity = scrollY.interpolate({
    inputRange: [-80, -20, 0],
    outputRange: [1, 0.4, 0],
    extrapolate: "clamp",
  });

  // Continuous rotation mapping when active
  const activeRotate = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // Final rotation is activeRotate if refreshing, else pullRotate
  const rotateValue = refreshing ? activeRotate : pullRotate;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: pullOpacity,
          transform: [{ scale: pullScale }],
        },
      ]}
      pointerEvents="none"
    >
      <View style={styles.content}>
        {/* Glowing pulsing plate wrapper */}
        <Animated.View
          style={[
            styles.logoWrap,
            {
              borderColor: color === colors.gold ? colors.borderGold : "rgba(229, 139, 34, 0.35)",
              transform: [{ rotate: rotateValue }],
            },
          ]}
        >
          <Ionicons
            name={color === colors.gold ? "restaurant-outline" : "shield-checkmark-outline"}
            size={22}
            color={color}
          />
        </Animated.View>

        {/* Small indicator spinner */}
        <ActivityIndicator size="small" color={color} style={styles.spinner} />

        {/* Status text */}
        <Animated.Text
          style={[
            styles.text,
            {
              color: color,
              opacity: refreshing ? pulseValue : 0.8,
            },
          ]}
        >
          {refreshing ? title : "Pull to request..."}
        </Animated.Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: -85,
    left: 0,
    right: 0,
    height: 85,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  content: {
    alignItems: "center",
    flexDirection: "row",
    backgroundColor: colors.surface,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  logoWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg,
  },
  spinner: {
    marginLeft: 2,
  },
  text: {
    fontSize: 10.5,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
});
