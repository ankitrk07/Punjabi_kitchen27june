import { useApp } from "@/src/context/AppContext";
import { colors } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function OrderStatusSummary() {
  const { orders } = useApp();
  const active = orders.find((o) => o.status !== "Delivered");
  if (!active) return null;
  return (
    <TouchableOpacity style={styles.orderSummary} activeOpacity={0.9}>
      <Ionicons name="bicycle" size={14} color={colors.gold} style={{ marginRight: 8 }} />
      <View>
        <Text style={styles.orderSummaryText}>Order {String(active.id).slice(-6).toUpperCase()}</Text>
        <Text style={styles.orderSummarySub}>{active.status} · ₹{active.total}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  orderSummary: { marginTop: 12, flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.03)", padding: 10, borderRadius: 12, borderWidth: 1, borderColor: "rgba(201,168,76,0.06)" },
  orderSummaryText: { color: "#FFF", fontSize: 13, fontWeight: "800" },
  orderSummarySub: { color: colors.textSecondary, fontSize: 11 },
});
