import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "@/src/components/ScreenHeader";
import { colors } from "@/src/theme";

type ContactOption = {
  title: string;
  number: string;
  displayNumber: string;
  icon: keyof typeof Ionicons.glyphMap;
  status: string;
  statusColor: string;
  desc: string;
};

export default function CallScreen() {
  const contactOptions: ContactOption[] = [
    {
      title: "24/7 Customer Care Helpline",
      number: "18002020989",
      displayNumber: "1800-202-0989 (Toll Free)",
      icon: "headset-outline",
      status: "Available Now",
      statusColor: colors.success,
      desc: "For general queries, order delays, cancellations & payment support.",
    },
    {
      title: "Connaught Place Outlet (CP)",
      number: "+911143210987",
      displayNumber: "+91 11 4321 0987",
      icon: "restaurant-outline",
      status: "Open • Wait < 2 mins",
      statusColor: colors.gold,
      desc: "For issues regarding quality of food, special cooking instructions for current orders at CP.",
    },
    {
      title: "Lajpat Nagar Outlet",
      number: "+911143210988",
      displayNumber: "+91 11 4321 0988",
      icon: "restaurant-outline",
      status: "Open • Wait < 1 min",
      statusColor: colors.gold,
      desc: "For issues regarding quality of food, special cooking instructions for current orders at Lajpat Nagar.",
    },
  ];

  const handleCall = (phoneNumber: string) => {
    const url = `tel:${phoneNumber}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          alert("Phone calls are not supported on this device.");
        }
      })
      .catch((err) => console.log(err));
  };

  return (
    <ScreenHeader title="Call Support" backHref="/(tabs)/profile">
      {/* Top Banner */}
      <View style={styles.topBanner}>
        <View style={styles.phoneIconCircle}>
          <Ionicons name="call" size={32} color={colors.gold} />
        </View>
        <Text style={styles.bannerTitle}>Speak with Our Team</Text>
        <Text style={styles.bannerSubtitle}>
          Select a contact number below to directly dial our customer care or individual outlets.
        </Text>
      </View>

      {/* Options List */}
      <Text style={styles.sectionLabel}>Available Contact Options</Text>
      {contactOptions.map((opt, idx) => (
        <View key={idx} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Ionicons name={opt.icon} size={20} color={colors.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionTitle}>{opt.title}</Text>
              <View style={styles.statusRow}>
                <View style={[styles.dot, { backgroundColor: opt.statusColor }]} />
                <Text style={[styles.statusText, { color: opt.statusColor }]}>{opt.status}</Text>
              </View>
            </View>
          </View>
          <Text style={styles.descText}>{opt.desc}</Text>
          <TouchableOpacity
            style={styles.dialBtn}
            onPress={() => handleCall(opt.number)}
            activeOpacity={0.8}
          >
            <Ionicons name="call" size={16} color="#000" />
            <Text style={styles.dialText}>Dial {opt.displayNumber}</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Safety Notice */}
      <View style={styles.safetyCard}>
        <Ionicons name="shield-checkmark" size={20} color={colors.success} style={{ marginTop: 2 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.safetyTitle}>Official Support Channels Only</Text>
          <Text style={styles.safetyText}>
            Our staff will never ask for your UPI PIN, banking passwords, or card OTPs. Please do not share sensitive details.
          </Text>
        </View>
      </View>
    </ScreenHeader>
  );
}

const styles = StyleSheet.create({
  topBanner: {
    alignItems: "center",
    marginVertical: 20,
    paddingHorizontal: 16,
  },
  phoneIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(212, 175, 55, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)",
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 18,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.gold,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12,
    marginTop: 10,
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
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.03)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  descText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 14,
  },
  dialBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gold,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  dialText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#000",
  },
  safetyCard: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "rgba(16, 185, 129, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.1)",
    borderRadius: 16,
    padding: 14,
    marginTop: 12,
  },
  safetyTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: colors.success,
    marginBottom: 4,
  },
  safetyText: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
  },
});
