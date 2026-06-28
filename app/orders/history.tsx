import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import ScreenHeader from "@/src/components/ScreenHeader";
import { useApp } from "@/src/context/AppContext";
import { colors } from "@/src/theme";

export default function OrderHistory() {
  const { orders } = useApp();
  const router = useRouter();

  return (
    <ScreenHeader title="Order History">
      {orders.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="time-outline" size={56} color={colors.textSecondary} />
          <Text style={styles.emptyText}>No previous orders</Text>
          <TouchableOpacity style={styles.cta} onPress={() => router.push("/(tabs)/menu")} testID="browse-btn">
            <Text style={styles.ctaText}>Browse Menu</Text>
          </TouchableOpacity>
        </View>
      ) : (
        orders.map((o) => (
          <View key={o.id} style={styles.card} testID={`history-${o.id}`}>
            <View style={styles.head}>
              <Text style={styles.id}>{o.id}</Text>
              <View style={[styles.pill, o.status === "Delivered" && { backgroundColor: colors.success }]}>
                <Text style={styles.pillText}>{o.status}</Text>
              </View>
            </View>
            <Text style={styles.meta}>{new Date(o.createdAt).toLocaleString()} · {o.mode}</Text>
            <View style={{ marginTop: 8 }}>
              {o.items.map((it) => (
                <Text key={it.id} style={styles.itemLine}>• {it.name} × {it.qty}</Text>
              ))}
            </View>
            <Text style={styles.total}>Total: ₹{o.total}</Text>
          </View>
        ))
      )}
    </ScreenHeader>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyText: { color: colors.textSecondary },
  cta: { backgroundColor: colors.gold, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 22, marginTop: 8 },
  ctaText: { color: "#000", fontWeight: "700" },
  card: { padding: 14, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginBottom: 10 },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  id: { color: "#FFF", fontWeight: "700" },
  pill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: colors.accent },
  pillText: { color: "#000", fontWeight: "700", fontSize: 10 },
  meta: { color: colors.textSecondary, fontSize: 11, marginTop: 4 },
  itemLine: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  total: { color: colors.gold, fontWeight: "800", marginTop: 8 },
});
