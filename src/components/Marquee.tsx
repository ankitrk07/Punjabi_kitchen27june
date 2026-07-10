import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing
} from "react-native-reanimated";

const { width: SCREEN_W } = Dimensions.get("window");

type Props = {
  children: React.ReactNode;
  speed?: number; // pixels per second
  itemWidth: number;
  itemCount: number;
};

export default function Marquee({ children, speed = 30, itemWidth, itemCount }: Props) {
  const totalWidth = itemWidth * itemCount;
  const translateX = useSharedValue(0);

  // Speed is in pixels per second. Duration (ms) = (distance / speed) * 1000
  const duration = (totalWidth / speed) * 1000;

  useEffect(() => {
    translateX.value = 0;
    translateX.value = withRepeat(
      withTiming(-totalWidth, {
        duration: duration,
        easing: Easing.linear
      }),
      -1, // Infinite loop
      false // Do not reverse, loop back to start
    );
  }, [totalWidth, speed, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }]
  }));

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.row, animatedStyle]}>
        {children}
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: "hidden", width: SCREEN_W },
  row: { flexDirection: "row" },
});