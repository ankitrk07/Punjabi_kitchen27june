import React from "react";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import { colors } from "@/src/theme";

type HeartButtonProps = {
  isFavorite: boolean;
  onPress: () => void;
  size?: number;
  testID?: string;
};

export default function AnimatedHeartButton({ isFavorite, onPress, size = 20, testID }: HeartButtonProps) {
  const [hasClicked, setHasClicked] = React.useState(false);

  const handlePress = () => {
    setHasClicked(true);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      testID={testID}
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {isFavorite ? (
        hasClicked ? (
          <LottieView
            source={require("../../assets/heart.json")}
            autoPlay={true}
            loop={false}
            style={{
              width: size * 2.4,
              height: size * 2.4,
            }}
          />
        ) : (
          <Ionicons
            name="heart"
            size={size * 0.9}
            color="#FF2D55"
          />
        )
      ) : (
        <Ionicons
          name="heart-outline"
          size={size * 0.9}
          color="rgba(255,255,255,0.4)"
        />
      )}
    </Pressable>
  );
}
