import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

type DustLayer = "front" | "mid" | "back";

type DustConfig = {
  xFraction: number;
  delay: number;
  amplitude: number;
  speed: number;
  size: number;
  layer: DustLayer;
};

type DustMoteProps = {
  x: number;
  delay: number;
  amplitude?: number;
  speed?: number;
  size?: number;
  layer?: DustLayer;
};

const DUST_CONFIGS: DustConfig[] = [
  { xFraction: 0.18, delay: 1200, amplitude: 30, speed: 0.6, size: 1.2, layer: "back" },
  { xFraction: 0.68, delay: 1400, amplitude: 25, speed: 0.6, size: 1.3, layer: "back" },

  { xFraction: 0.28, delay: 900, amplitude: 40, speed: 0.9, size: 2.2, layer: "mid" },
  { xFraction: 0.82, delay: 500, amplitude: 35, speed: 1.1, size: 2.0, layer: "mid" },

  { xFraction: 0.15, delay: 450, amplitude: 46, speed: 1.3, size: 3.0, layer: "front" },
  { xFraction: 0.61, delay: 980, amplitude: 48, speed: 1.4, size: 3.2, layer: "front" },
];

function DustMote({ x, delay, amplitude = 44, speed = 1, size = 2.5, layer = "mid" }: DustMoteProps) {
  const ty = useSharedValue(0);
  const op = useSharedValue(0);
  const driftX = useSharedValue(0);

  const baseDuration = (4600 + Math.random() * 1200) / speed;

  const opacityCeiling =
    layer === "front" ? 0.72 :
    layer === "mid" ? 0.50 :
    0.24;

  useEffect(() => {
    ty.value = withDelay(
      delay,
      withRepeat(
        withTiming(-amplitude, {
          duration: baseDuration,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      )
    );

    op.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(opacityCeiling, { duration: baseDuration * 0.28 }),
          withTiming(opacityCeiling * 0.55, { duration: baseDuration * 0.44 }),
          withTiming(0.0, { duration: baseDuration * 0.28 })
        ),
        -1,
        false
      )
    );

    driftX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(4, {
            duration: baseDuration * 0.6,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(-4, {
            duration: baseDuration * 0.4,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        -1,
        true
      )
    );

    return () => {
      cancelAnimation(ty);
      cancelAnimation(op);
      cancelAnimation(driftX);
    };
  }, [amplitude, baseDuration, delay, opacityCeiling, op, ty, driftX]);

  const style = useAnimatedStyle(() => ({
    opacity: op.value,
    transform: [
      { translateY: ty.value },
      { translateX: driftX.value },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.dustMote,
        {
          left: x,
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style,
      ]}
    />
  );
}

type GoldDustLayerProps = {
  width: number;
  height?: number;
  zIndex?: number;
};

export default function GoldDustLayer({ width, height = 120, zIndex = 10 }: GoldDustLayerProps) {
  return (
    <View pointerEvents="none" style={[styles.root, { width, height, zIndex }]}> 
      {DUST_CONFIGS.map(({ xFraction, delay, amplitude, speed, size, layer }, i) => (
        <DustMote
          key={i}
          x={width * xFraction}
          delay={delay}
          amplitude={amplitude}
          speed={speed}
          size={size}
          layer={layer}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
    zIndex: 10,
    elevation: 10,
  },
  dustMote: {
    position: "absolute",
    bottom: 2,
    backgroundColor: "#F0C840",
    opacity: 0.8,
  },
});
