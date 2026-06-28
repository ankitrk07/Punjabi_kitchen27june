import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import ScreenHeader from "@/src/components/ScreenHeader";
import { colors } from "@/src/theme";

type Request = {
  id: string;
  type: string;
  guests: number;
  date: string;
  status: string;
  statusColor: string;
  details: string;
};

export default function EventRequestsScreen() {
  const [requests, setRequests] = useState<Request[]>([
    {
      id: "REQ-901",
      type: "Corporate Seminar Buffet",
      guests: 80,
      date: "12 Oct 2025",
      status: "Approved",
      statusColor: colors.success,
      details: "Full North-Indian buffet with live counters for Paneer Tikka & Jalebi.",
    },
    {
      id: "REQ-847",
      type: "Family Anniversary Lunch",
      guests: 45,
      date: "24 Nov 2025",
      status: "Under Review",
      statusColor: colors.gold,
      details: "Standard lunch buffet with custom decoration and birthday cake.",
    },
  ]);

  // Form states
  const [eventType, setEventType] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [date, setDate] = useState("");
  const [details, setDetails] = useState("");

  const handleSubmit = () => {
    if (!eventType || !guestCount || !date) {
      alert("Please fill in all mandatory fields.");
      return;
    }

    const newReq: Request = {
      id: `REQ-${Math.floor(100 + Math.random() * 900)}`,
      type: eventType,
      guests: parseInt(guestCount) || 0,
      date: date,
      status: "Submitted",
      statusColor: colors.gold,
      details: details || "No special instructions provided.",
    };

    setRequests([newReq, ...requests]);
    setEventType("");
    setGuestCount("");
    setDate("");
    setDetails("");
    alert("Catering request submitted successfully!");
  };

  return (
    <ScreenHeader title="Event Catering Requests" backHref="/(tabs)/profile">
      {/* Existing Requests */}
      <Text style={styles.sectionLabel}>Your Requests</Text>
      {requests.map((r) => (
        <View key={r.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.reqTitle}>{r.type}</Text>
              <Text style={styles.reqId}>Request #{r.id} • {r.date}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: `${r.statusColor}18` }]}>
              <Text style={[styles.statusText, { color: r.statusColor }]}>{r.status}</Text>
            </View>
          </View>
          <Text style={styles.reqDetails}>
            👥 {r.guests} guests • {r.details}
          </Text>
        </View>
      ))}

      {/* New Request Form */}
      <Text style={[styles.sectionLabel, { marginTop: 16 }]}>New Catering Request</Text>
      <View style={styles.formCard}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Event Type *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Wedding Reception, Birthday, Corporate"
            placeholderTextColor={colors.textSecondary}
            value={eventType}
            onChangeText={setEventType}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Expected Guests *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 50"
            placeholderTextColor={colors.textSecondary}
            keyboardType="number-pad"
            value={guestCount}
            onChangeText={setGuestCount}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Preferred Date *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 15 November 2025"
            placeholderTextColor={colors.textSecondary}
            value={date}
            onChangeText={setDate}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Catering Details & Menu Requirements</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="e.g. Live counters required, specific menu choices, Jain options..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={3}
            value={details}
            onChangeText={setDetails}
          />
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>Submit Request</Text>
        </TouchableOpacity>
      </View>
    </ScreenHeader>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.gold,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  reqTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  reqId: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
  },
  reqDetails: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "600",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.02)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  submitBtn: {
    backgroundColor: colors.gold,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 8,
  },
  submitBtnText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 14,
  },
});
