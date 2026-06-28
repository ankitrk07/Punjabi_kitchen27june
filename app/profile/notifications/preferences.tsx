import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "@/src/components/ScreenHeader";
import { colors } from "@/src/theme";

export default function NotificationPreferencesScreen() {
  const [prefs, setPrefs] = useState({
    orderUpdates: true,
    offers: true,
    announcements: false,
    reminders: true,
    rewards: true,
    sms: false,
    email: true,
  });
  const toggle = (key: keyof typeof prefs) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  const SECTIONS = [
    {
      title: "Order Notifications",
      items: [
        { key: "orderUpdates", label: "Order Updates", desc: "Confirmed, prepared, out for delivery, delivered" },
        { key: "reminders", label: "Scheduled Order Reminders", desc: "Get notified before your scheduled orders" },
      ]
    },
    {
      title: "Promotions & Rewards",
      items: [
        { key: "offers", label: "Offers & Discounts", desc: "Exclusive deals, limited-time coupons" },
        { key: "rewards", label: "Reward Points", desc: "Points earned, redeemed, expiry alerts" },
      ]
    },
    {
      title: "General",
      items: [
        { key: "announcements", label: "Announcements", desc: "New features, app updates, service notices" },
      ]
    },
    {
      title: "Channels",
      items: [
        { key: "sms", label: "SMS Notifications", desc: "Receive important alerts via SMS" },
        { key: "email", label: "Email Notifications", desc: "Order receipts and weekly summaries" },
      ]
    },
  ];

  return (
    <ScreenHeader title="Notification Preferences" backHref="/(tabs)/profile">
      {SECTIONS.map((sec, si) => (
        <View key={si} style={s.section}>
          <Text style={s.sectionTitle}>{sec.title}</Text>
          {sec.items.map((item, ii) => (
            <View key={ii} style={s.row}>
              <View style={{ flex: 1 }}>
                <Text style={s.label}>{item.label}</Text>
                <Text style={s.desc}>{item.desc}</Text>
              </View>
              <Switch value={prefs[item.key as keyof typeof prefs]} onValueChange={() => toggle(item.key as keyof typeof prefs)} thumbColor={colors.gold} trackColor={{ false: colors.border, true: "rgba(212,175,55,0.4)" }} />
            </View>
          ))}
        </View>
      ))}
      <TouchableOpacity style={s.saveBtn} onPress={() => alert("Preferences Saved!")}>
        <Text style={s.saveBtnText}>Save Preferences</Text>
      </TouchableOpacity>
    </ScreenHeader>
  );
}

const s = StyleSheet.create({
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: colors.gold, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 12 },
  label: { fontSize: 14, color: colors.textPrimary, fontWeight: "500" },
  desc: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  saveBtn: { backgroundColor: colors.gold, paddingVertical: 14, borderRadius: 25, alignItems: "center", marginTop: 10 },
  saveBtnText: { color: "#000", fontWeight: "700", fontSize: 14 },
});
