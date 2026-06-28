import ScreenHeader from "@/src/components/ScreenHeader";
import { colors } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function SharedOrdersScreen() {
  return (
    <ScreenHeader title="Shared Orders" backHref="/(tabs)/profile">
      <View style={styles.hero}>
        <Ionicons name="share-social-outline" size={22} color={colors.gold} />
        <View style={{ flex: 1 }}>
          <Text style={styles.heroTitle}>Shared order activity</Text>
          <Text style={styles.heroText}>See orders that were shared with you or created as a group.</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>No shared orders yet</Text>
        <Text style={styles.note}>Start a shared order from your favourite group.</Text>
      </View>
    </ScreenHeader>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: "row", gap: 12, alignItems: "center", backgroundColor: colors.surface, borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: colors.borderGold },
  heroTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: "800" },
  heroText: { color: colors.textSecondary, marginTop: 4, lineHeight: 18 },
  card: { backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  title: { color: colors.textPrimary, fontWeight: "700", marginBottom: 4 },
  note: { color: colors.textSecondary },
});
