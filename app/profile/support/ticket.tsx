import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "@/src/components/ScreenHeader";
import { colors } from "@/src/theme";
import { useApp } from "@/src/context/AppContext";

export default function TicketScreen() {
  const { supportTickets, createSupportTicket, user } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [subject, setSubject] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Medium");

  const handleRaiseTicket = async () => {
    if (!subject.trim() || !desc.trim()) {
      alert("Please fill in the subject and description.");
      return;
    }
    if (!user) {
      alert("Please login first to submit queries.");
      return;
    }

    try {
      await createSupportTicket({
        subject: subject.trim(),
        description: desc.trim(),
        priority,
        userEmail: user.email,
      });
      setSubject("");
      setDesc("");
      setPriority("Medium");
      setModalVisible(false);
      alert("Ticket raised successfully! Check back for updates.");
    } catch (e) {
      alert("Failed to submit support ticket.");
    }
  };

  const openTickets = supportTickets.filter(t => t.status !== "Resolved").length;

  return (
    <ScreenHeader title="Support Tickets" backHref="/(tabs)/profile">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.container}>
        <Text style={s.label}>{openTickets} open ticket{openTickets !== 1 ? "s" : ""}</Text>
        
        {supportTickets.map((t) => {
          const statusColor = t.status === "Resolved" ? colors.success : colors.gold;
          const formattedDate = new Date(t.createdAt).toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });
          
          return (
            <View key={t.id} style={s.card}>
              <View style={s.topRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.subject}>{t.subject}</Text>
                  <Text style={s.ticketId}>Ticket #{t.id.slice(-6).toUpperCase()} • {formattedDate}</Text>
                </View>
                <View style={[s.priorityBadge, { backgroundColor: t.priority === "High" ? "rgba(239,68,68,0.12)" : t.priority === "Medium" ? "rgba(212,175,55,0.12)" : "rgba(16,185,129,0.12)" }]}>
                  <Text style={[s.priorityText, { color: t.priority === "High" ? colors.error : t.priority === "Medium" ? colors.gold : colors.success }]}>{t.priority}</Text>
                </View>
              </View>
              
              <View style={s.updateRow}>
                <Ionicons name="chatbubble-ellipses-outline" size={13} color={colors.textSecondary} />
                <Text style={s.lastUpdate}>{t.lastUpdate || "Review in progress."}</Text>
              </View>
              
              <View style={s.footer}>
                <View style={[s.statusBadge, { backgroundColor: `${statusColor}15` }]}>
                  <Text style={[s.statusText, { color: statusColor }]}>{t.status}</Text>
                </View>
              </View>
            </View>
          );
        })}

        <TouchableOpacity style={s.newTicketBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="add-circle-outline" size={18} color="#000" />
          <Text style={s.newTicketText}>Raise New Ticket</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Raise Ticket Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={s.modalBackdrop}>
          <View style={s.modalCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Raise Support Query</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={s.input}
              placeholder="Query Subject (e.g. Refund request)"
              placeholderTextColor={colors.textSecondary}
              value={subject}
              onChangeText={setSubject}
            />

            <TextInput
              style={[s.input, s.textArea]}
              placeholder="Detailed description of your issue..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              value={desc}
              onChangeText={setDesc}
            />

            <Text style={s.radioLabel}>Priority Urgency</Text>
            <View style={s.radioRow}>
              {(["Low", "Medium", "High"] as const).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[s.radioBtn, priority === p && s.radioBtnActive]}
                  onPress={() => setPriority(p)}
                >
                  <Text style={[s.radioText, priority === p && { color: "#000" }]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={s.submitBtn} onPress={handleRaiseTicket}>
              <Text style={s.submitBtnText}>Submit Support Ticket</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenHeader>
  );
}

const s = StyleSheet.create({
  container: { paddingBottom: 30 },
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
  newTicketBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: colors.gold, paddingVertical: 14, borderRadius: 25, marginTop: 10 },
  newTicketText: { color: "#000", fontWeight: "700", fontSize: 14 },
  
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center", padding: 20 },
  modalCard: { backgroundColor: colors.surface, borderRadius: 20, borderWidth: 1, borderColor: colors.border, padding: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 16, fontWeight: "800", color: colors.gold },
  input: { backgroundColor: "rgba(255,255,255,0.02)", borderWidth: 1, borderColor: colors.border, color: colors.textPrimary, padding: 12, borderRadius: 12, fontSize: 13, marginBottom: 12 },
  textArea: { height: 90, textAlignVertical: "top" },
  radioLabel: { fontSize: 10, color: colors.textSecondary, fontWeight: "800", textTransform: "uppercase", marginBottom: 8 },
  radioRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  radioBtn: { flex: 1, backgroundColor: "rgba(255,255,255,0.02)", borderWidth: 1, borderColor: colors.border, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  radioBtnActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  radioText: { fontSize: 12, color: colors.textSecondary, fontWeight: "700" },
  submitBtn: { backgroundColor: colors.gold, paddingVertical: 12, borderRadius: 14, alignItems: "center" },
  submitBtnText: { color: "#000", fontWeight: "800", fontSize: 13 },
});
