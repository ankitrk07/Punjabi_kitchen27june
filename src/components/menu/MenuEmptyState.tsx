import { colors } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  title: string;
  message: string;
};

export default function MenuEmptyState({ title, message }: Props) {
  return (
    <View style={styles.emptyState}>
      <Ionicons name="nutrition-outline" size={42} color={colors.textSecondary} />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyState: { paddingVertical: 40, alignItems: "center", justifyContent: "center", gap: 8 },
  emptyTitle: { color: "#FFF", fontSize: 16, fontWeight: "700", marginTop: 6 },
  emptyText: { color: colors.textSecondary, fontSize: 13, textAlign: "center", maxWidth: 260 },
});
