import React, { useState } from "react";
import { View, Text, StyleSheet, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "@/src/components/ScreenHeader";
import { colors } from "@/src/theme";

export default function PermissionsScreen() {
  const [location, setLocation] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [camera, setCamera] = useState(false);
  const [contacts, setContacts] = useState(false);

  const permissions = [
    {
      key: "location",
      label: "Precise Location Permission",
      desc: "Used to pinpoint your address for accurate, on-time delivery dispatch.",
      icon: "location-outline",
      val: location,
      set: setLocation,
    },
    {
      key: "notifications",
      label: "Push Notifications",
      desc: "Delivers live status alerts when your food is being cooked and delivered.",
      icon: "notifications-outline",
      val: notifications,
      set: setNotifications,
    },
    {
      key: "camera",
      label: "Camera Permission",
      desc: "Needed if you want to scan promo QR codes at table reservations.",
      icon: "camera-outline",
      val: camera,
      set: setCamera,
    },
    {
      key: "contacts",
      label: "Access Contacts List",
      desc: "Allows selecting friends easily when inviting to group orders or splitting bills.",
      icon: "people-outline",
      val: contacts,
      set: setContacts,
    },
  ];

  return (
    <ScreenHeader title="App Permissions" backHref="/(tabs)/profile">
      <Text style={styles.sectionLabel}>System Permissions</Text>
      <View style={styles.card}>
        {permissions.map((p) => (
          <View key={p.key} style={styles.row}>
            <View style={styles.iconCircle}>
              <Ionicons name={p.icon as any} size={18} color={colors.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{p.label}</Text>
              <Text style={styles.desc}>{p.desc}</Text>
            </View>
            <Switch
              value={p.val}
              onValueChange={p.set}
              thumbColor={colors.gold}
              trackColor={{ false: colors.border, true: "rgba(212, 175, 55, 0.4)" }}
            />
          </View>
        ))}
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
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.03)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  desc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
});
