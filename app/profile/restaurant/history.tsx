import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "@/src/components/ScreenHeader";
import { colors } from "@/src/theme";

const PAST = [
  { id: "RES-198", date: "15 Feb 2025", time: "7:00 PM", guests: 6, occasion: "Birthday Party", rating: 5, feedback: "Fantastic food and warm hospitality. Will visit again!", bill: "₹3,200" },
  { id: "RES-155", date: "20 Dec 2024", time: "1:30 PM", guests: 3, occasion: "Business Lunch", rating: 4, feedback: "Quick service, Dal Makhani was spectacular.", bill: "₹1,800" },
];

export default function RestaurantHistoryScreen() {
  return (
    <ScreenHeader title="Past Reservations" backHref="/(tabs)/profile">
      <Text style={s.label}>{PAST.length} past dining experiences</Text>
      {PAST.map((r) => (
        <View key={r.id} style={s.card}>
          <View style={s.topRow}>
            <View style={s.datePill}>
              <Text style={s.dateText}>{r.date}</Text>
              <Text style={s.timeText}>{r.time}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.occasion}>{r.occasion}</Text>
              <View style={s.detailRow}><Ionicons name="people-outline" size={12} color={colors.textSecondary} /><Text style={s.detail}>{r.guests} guests</Text></View>
              <View style={s.detailRow}><Ionicons name="receipt-outline" size={12} color={colors.textSecondary} /><Text style={s.detail}>Bill: {r.bill}</Text></View>
            </View>
          </View>
          {/* Rating Stars */}
          <View style={s.ratingRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons key={star} name={star <= r.rating ? "star" : "star-outline"} size={16} color={colors.gold} />
            ))}
            <Text style={s.ratingText}>{r.rating}.0</Text>
          </View>
          <View style={s.feedbackBox}>
            <Ionicons name="chatbubble-ellipses-outline" size={13} color={colors.textSecondary} />
            <Text style={s.feedback}>"{r.feedback}"</Text>
          </View>
          <TouchableOpacity style={s.rebookBtn} onPress={() => alert("Booking again!")}><Ionicons name="calendar-outline" size={14} color="#000" /><Text style={s.rebookText}>Rebook Same Experience</Text></TouchableOpacity>
        </View>
      ))}
    </ScreenHeader>
  );
}

const s = StyleSheet.create({
  label: { color: colors.textSecondary, fontSize: 13, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 10 },
  card: { backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 14 },
  topRow: { flexDirection: "row", gap: 14, marginBottom: 12 },
  datePill: { backgroundColor: "rgba(212,175,55,0.1)", borderRadius: 12, padding: 12, alignItems: "center", borderWidth: 1, borderColor: "rgba(212,175,55,0.2)" },
  dateText: { fontSize: 10, fontWeight: "700", color: colors.gold },
  timeText: { fontSize: 10, color: colors.textSecondary, marginTop: 2 },
  occasion: { fontSize: 15, fontWeight: "700", color: colors.textPrimary, marginBottom: 6 },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 3 },
  detail: { fontSize: 11, color: colors.textSecondary },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 3, marginBottom: 10 },
  ratingText: { fontSize: 12, color: colors.textSecondary, marginLeft: 6 },
  feedbackBox: { flexDirection: "row", gap: 6, backgroundColor: "rgba(255,255,255,0.03)", padding: 10, borderRadius: 10, marginBottom: 12 },
  feedback: { flex: 1, fontSize: 11, color: colors.textSecondary, fontStyle: "italic", lineHeight: 16 },
  rebookBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: colors.gold, paddingVertical: 10, borderRadius: 12 },
  rebookText: { fontSize: 12, fontWeight: "700", color: "#000" },
});
