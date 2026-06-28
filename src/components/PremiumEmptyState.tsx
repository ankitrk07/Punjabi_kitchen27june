import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { colors } from "@/src/theme";
import ScreenHeader from "./ScreenHeader";

type Props = {
  title: string;
  emptyTitle?: string;
  emptySubtitle?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  buttonText?: string;
  backHref?: string;
};

export default function PremiumEmptyState({
  title,
  emptyTitle = "No data found",
  emptySubtitle = "There is nothing here yet. Check back later!",
  iconName = "folder-open-outline",
  buttonText = "Back to Home",
  backHref = "/(tabs)/profile",
}: Props) {
  const router = useRouter();

  const handlePress = () => {
    if (buttonText === "Explore Menu") {
      router.push("/(tabs)/menu");
    } else {
      router.push("/(tabs)/home");
    }
  };

  return (
    <ScreenHeader title={title} backHref={backHref}>
      <View style={styles.container}>
        <View style={styles.iconCircle}>
          <Ionicons name={iconName} size={48} color={colors.gold} />
        </View>
        <Text style={styles.title}>{emptyTitle}</Text>
        <Text style={styles.subtitle}>{emptySubtitle}</Text>
        <TouchableOpacity style={styles.button} onPress={handlePress} activeOpacity={0.8}>
          <Text style={styles.buttonText}>{buttonText}</Text>
        </TouchableOpacity>
      </View>
    </ScreenHeader>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    paddingHorizontal: 20,
    backgroundColor: colors.bg,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 30,
  },
  button: {
    backgroundColor: colors.gold,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "bold",
  },
});
