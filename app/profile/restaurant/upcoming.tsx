import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "@/src/components/ScreenHeader";
import { colors } from "@/src/theme";

const RESERVATIONS = [
  { id: "RES-221", date: "28 Jun 2025", time: "7:30 PM", guests: 4, table: "Table 12 – Garden View", status: "Confirmed", statusColor: colors.success, occasion: "Anniversary Dinner" },
  { id: "RES-218", date: "05 Jul 2025", time: "1:00 PM", guests: 2, table: "Table 6 – Indoor", status: "Pending", statusColor: colors.gold, occasion: "Business Lunch" },
];

export default function UpcomingReservationsScreen() {
  return (
    <ScreenHeader title="Upcoming Reservations" backHref="/(tabs)/profile">
      <Text style={s.label}>{RESERVATIONS.length} upcoming reservations</Text>
      {RESERVATIONS.map((r) => (
        <View key={r.id} style={s.card}>
          <View style={s.cardTop}>
            <View style={s.dateBox}>
              <Text style={s.dateDay}>{r.date.split(" ")[0]}</Text>
              <Text style={s.dateMonth}>{r.date.split(" ").slice(1).join(" ")}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={s.badgeRow}>
                <View style={[s.statusBadge, { backgroundColor: `${r.statusColor}18` }]}>
                  <Text style={[s.statusText, { color: r.statusColor }]}>{r.status}</Text>
                </View>
                <Text style={s.resId}>#{r.id}</Text>
              </View>
              <Text style={s.occasion}>{r.occasion}</Text>
              <View style={s.detailRow}>
                <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
                <Text style={s.detail}>{r.time}</Text>
              </View>
              <View style={s.detailRow}>
                <Ionicons name="people-outline" size={12} color={colors.textSecondary} />
                <Text style={s.detail}>{r.guests} guests</Text>
              </View>
              <View style={s.detailRow}>
                <Ionicons name="grid-outline" size={12} color={colors.textSecondary} />
                <Text style={s.detail}>{r.table}</Text>
              </View>
            </View>
          </View>
          <View style={s.actions}>
            <TouchableOpacity style={s.modifyBtn}><Text style={s.modifyText}>Modify</Text></TouchableOpacity>
            <TouchableOpacity style={s.cancelBtn}><Text style={s.cancelText}>Cancel</Text></TouchableOpacity>
          </View>
        </View>
      ))}
      <TouchableOpacity style={s.addBtn}>
        <Ionicons name="calendar-outline" size={18} color="#000" />
        <Text style={s.addBtnText}>Book a Table</Text>
      </TouchableOpacity>
    </ScreenHeader>
  );
}

const s = StyleSheet.create({
  label: { color: colors.textSecondary, fontSize: 13, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 10 },
  card: { backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 14 },
  cardTop: { flexDirection: "row", gap: 14, marginBottom: 14 },
  dateBox: { backgroundColor: "rgba(212,175,55,0.1)", borderRadius: 12, padding: 12, alignItems: "center", minWidth: 58, borderWidth: 1, borderColor: "rgba(212,175,55,0.2)" },
  dateDay: { fontSize: 22, fontWeight: "900", color: colors.gold },
  dateMonth: { fontSize: 9, color: colors.textSecondary, fontWeight: "600", textAlign: "center" },
  badgeRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: "700" },
  resId: { fontSize: 10, color: colors.textSecondary },
  occasion: { fontSize: 15, fontWeight: "700", color: colors.textPrimary, marginBottom: 6 },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 3 },
  detail: { fontSize: 11, color: colors.textSecondary },
  actions: { flexDirection: "row", gap: 10, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
  modifyBtn: { flex: 1, borderWidth: 1, borderColor: colors.gold, paddingVertical: 8, borderRadius: 12, alignItems: "center" },
  modifyText: { fontSize: 12, color: colors.gold, fontWeight: "600" },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: colors.error, paddingVertical: 8, borderRadius: 12, alignItems: "center" },
  cancelText: { fontSize: 12, color: colors.error, fontWeight: "600" },
  addBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: colors.gold, paddingVertical: 14, borderRadius: 25, marginTop: 10 },
  addBtnText: { color: "#000", fontWeight: "700", fontSize: 14 },
});
