import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "@/src/components/ScreenHeader";
import { colors } from "@/src/theme";

const TICKETS = [
  { id: "TKT-049", subject: "Refund not received for order #ORD-7510", date: "22 Jun 2025", status: "In Progress", statusColor: colors.gold, priority: "High", lastUpdate: "Our team is reviewing your bank details." },
  { id: "TKT-038", subject: "Wrong item delivered – Paneer Tikka vs Dal Makhani", date: "18 Jun 2025", status: "Resolved", statusColor: colors.success, priority: "Medium", lastUpdate: "Refund of ₹248 processed successfully." },
  { id: "TKT-025", subject: "App crashing on order checkout page", date: "10 Jun 2025", status: "Resolved", statusColor: colors.success, priority: "Low", lastUpdate: "Fixed in app version 2.4.5. Please update." },
];

export default function TicketScreen() {
  return (
    <ScreenHeader title="Support Tickets" backHref="/(tabs)/profile">
      <Text style={s.label}>{TICKETS.filter(t => t.status !== "Resolved").length} open tickets</Text>
      {TICKETS.map((t) => (
        <View key={t.id} style={s.card}>
          <View style={s.topRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.subject}>{t.subject}</Text>
              <Text style={s.ticketId}>Ticket #{t.id} • {t.date}</Text>
            </View>
            <View style={[s.priorityBadge, { backgroundColor: t.priority === "High" ? "rgba(239,68,68,0.12)" : t.priority === "Medium" ? "rgba(212,175,55,0.12)" : "rgba(16,185,129,0.12)" }]}>
              <Text style={[s.priorityText, { color: t.priority === "High" ? colors.error : t.priority === "Medium" ? colors.gold : colors.success }]}>{t.priority}</Text>
            </View>
          </View>
          <View style={s.updateRow}>
            <Ionicons name="chatbubble-ellipses-outline" size={13} color={colors.textSecondary} />
            <Text style={s.lastUpdate}>{t.lastUpdate}</Text>
          </View>
          <View style={s.footer}>
            <View style={[s.statusBadge, { backgroundColor: `${t.statusColor}15` }]}>
              <Text style={[s.statusText, { color: t.statusColor }]}>{t.status}</Text>
            </View>
            <TouchableOpacity style={s.viewBtn}><Text style={s.viewBtnText}>View Details</Text></TouchableOpacity>
          </View>
        </View>
      ))}
      <TouchableOpacity style={s.newTicketBtn}>
        <Ionicons name="add-circle-outline" size={18} color="#000" />
        <Text style={s.newTicketText}>Raise New Ticket</Text>
      </TouchableOpacity>
    </ScreenHeader>
  );
}

const s = StyleSheet.create({
  label: { color: colors.textSecondary, fontSize: 13, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 10 },
  card: { backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 12 },
  topRow: { flexDirection: "row", gap: 10, alignItems: "flex-start", marginBottom: 10 },
  subject: { fontSize: 13, fontWeight: "600", color: colors.textPrimary, lineHeight: 18, flex: 1 },
  ticketId: { fontSize: 10, color: colors.textSecondary, marginTop: 3 },
  priorityBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  priorityText: { fontSize: 9, fontWeight: "700" },
  updateRow: { flexDirection: "row", gap: 6, backgroundColor: "rgba(255,255,255,0.03)", padding: 10, borderRadius: 10, marginBottom: 12, alignItems: "flex-start" },
  lastUpdate: { fontSize: 11, color: colors.textSecondary, flex: 1, lineHeight: 16 },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: "700" },
  viewBtn: { borderWidth: 1, borderColor: colors.gold, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  viewBtnText: { fontSize: 11, color: colors.gold, fontWeight: "600" },
  newTicketBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: colors.gold, paddingVertical: 14, borderRadius: 25, marginTop: 10 },
  newTicketText: { color: "#000", fontWeight: "700", fontSize: 14 },
});
