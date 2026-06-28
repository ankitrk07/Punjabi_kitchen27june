import ScreenHeader from "@/src/components/ScreenHeader";
import { colors } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

const TIMELINE = [
  { key: "confirmed", label: "Order Confirmed", icon: "checkmark-circle" },
  { key: "packed", label: "Packed for Travel", icon: "bag-handle" },
  { key: "out", label: "On the way to Ranchi station", icon: "train-outline" },
  { key: "delivered", label: "Delivered to Seat", icon: "restaurant" },
];

export default function TrackTrainOrderScreen() {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, [pulse]);

  const activeIndex = 2;
  const pulseScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.35] });

  return (
    <ScreenHeader title="Track Train Order" backHref="/orders/train">
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Ionicons name="locate-outline" size={16} color={colors.gold} />
          <Text style={styles.badgeText}>Live Ranchi delivery tracking</Text>
        </View>
        <Text style={styles.title}>Your Ranchi train order is on the way</Text>
        <Text style={styles.copy}>Track the progress from kitchen preparation to seat delivery across Ranchi stations.
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderId}>RCH-240819</Text>
            <Text style={styles.orderMeta}>PNR 1234567890 · Ranchi Jn</Text>
          </View>
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>In transit</Text>
          </View>
        </View>

        <View style={styles.timeline}>
          {TIMELINE.map((step, index) => {
            const done = index <= activeIndex;
            const active = index === activeIndex;

            return (
              <View key={step.key} style={styles.stepRow}>
                <View style={styles.dotCol}>
                  {active && <Animated.View style={[styles.pulse, { transform: [{ scale: pulseScale }] }]} />}
                  <View style={[styles.dot, done && styles.dotActive]}>
                    <Ionicons name={step.icon as any} size={14} color={done ? "#000" : colors.textSecondary} />
                  </View>
                  {index < TIMELINE.length - 1 && <View style={[styles.line, done && styles.lineActive]} />}
                </View>
                <View style={styles.stepContent}>
                  <Text style={[styles.stepLabel, done && styles.stepLabelActive]}>{step.label}</Text>
                  {active && <Text style={styles.stepNote}>Driver is approaching the station.</Text>}
                  {done && !active && <Text style={styles.stepNote}>Completed</Text>}
                </View>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Order summary</Text>
        <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Items</Text><Text style={styles.summaryValue}>Paneer Thali × 1, Tea × 2</Text></View>
        <View style={styles.summaryRow}><Text style={styles.summaryLabel}>ETA</Text><Text style={styles.summaryValue}>18 min</Text></View>
        <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Delivery stop</Text><Text style={styles.summaryValue}>Ranchi Jn</Text></View>
      </View>
    </ScreenHeader>
  );
}

const styles = StyleSheet.create({
  hero: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderGold,
    backgroundColor: colors.surface,
    marginBottom: 12,
  },
  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(212,175,55,0.08)",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.24)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 14,
  },
  badgeText: { color: colors.gold, fontSize: 12, fontWeight: "700" },
  title: { color: colors.textPrimary, fontSize: 22, fontWeight: "800", lineHeight: 28 },
  copy: { color: colors.textSecondary, marginTop: 10, lineHeight: 20 },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  orderHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  orderId: { color: colors.textPrimary, fontSize: 16, fontWeight: "800" },
  orderMeta: { color: colors.textSecondary, marginTop: 4, fontSize: 12 },
  statusPill: { backgroundColor: "rgba(212,175,55,0.14)", borderColor: colors.borderGold, borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  statusText: { color: colors.gold, fontSize: 12, fontWeight: "700" },
  timeline: { paddingTop: 2 },
  stepRow: { flexDirection: "row", gap: 14, minHeight: 72 },
  dotCol: { width: 30, alignItems: "center" },
  dot: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.surface2, borderWidth: 2, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  dotActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  pulse: { position: "absolute", width: 42, height: 42, borderRadius: 21, backgroundColor: "rgba(212,175,55,0.25)" },
  line: { width: 2, flex: 1, backgroundColor: colors.border, marginTop: 2 },
  lineActive: { backgroundColor: colors.gold },
  stepContent: { flex: 1, paddingTop: 4 },
  stepLabel: { color: colors.textSecondary, fontWeight: "600" },
  stepLabelActive: { color: colors.textPrimary },
  stepNote: { color: colors.gold, fontSize: 11, marginTop: 2 },
  sectionTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: "700", marginBottom: 12 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", gap: 12, paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.border },
  summaryLabel: { color: colors.textSecondary, flex: 1 },
  summaryValue: { color: colors.textPrimary, fontWeight: "700", textAlign: "right", flex: 1 },
});