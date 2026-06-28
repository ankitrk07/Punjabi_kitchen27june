import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";

const { width: SCREEN_W } = Dimensions.get("window");

type Props = {
  children: React.ReactNode;
  speed?: number; // pixels per second
  itemWidth: number;
  itemCount: number;
};

export default function Marquee({ children, speed = 30, itemWidth, itemCount }: Props) {
  const trans = useRef(new Animated.Value(0)).current;
  const totalWidth = itemWidth * itemCount;

  useEffect(() => {
    const duration = (totalWidth / speed) * 1000;
    const loop = Animated.loop(
      Animated.timing(trans, {
        toValue: -totalWidth,
        duration,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [totalWidth, speed]);

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.row, { transform: [{ translateX: trans }] }]}>
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