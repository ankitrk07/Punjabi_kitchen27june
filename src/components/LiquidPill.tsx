import React from "react";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";
import Animated, {
  useAnimatedProps,
  SharedValue,
} from "react-native-reanimated";

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface Props {
  width: number;
  height: number;
  path: SharedValue<string>;
}

export default function LiquidPill({
  width,
  height,
  path,
}: Props) {
  const animatedProps = useAnimatedProps(() => {
    return {
      d: path.value,
    };
  });

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="pill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#FFFFFF" />
          <Stop offset="50%" stopColor="#F5F5F7" />
          <Stop offset="100%" stopColor="#ECECF0" />
        </LinearGradient>
      </Defs>

      <AnimatedPath
        animatedProps={animatedProps}
        fill="url(#pill)"
      />
    </Svg>
  );
}