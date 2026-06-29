import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "@/src/components/ScreenHeader";
import { colors } from "@/src/theme";
import { useRouter } from "expo-router";

type SettingItem = {
  label: string;
  icon: string;
  route: string;
  value?: string;
};

type SettingSection = {
  title: string;
  items: SettingItem[];
};

export default function SettingsScreen() {
  const router = useRouter();

  const SECTIONS: SettingSection[] = [
    {
      title: "Personal Information",
      items: [
        { label: "Edit Profile", icon: "person-outline", route: "/profile/settings/profile" },
        { label: "Change Mobile Number", icon: "call-outline", route: "/profile/settings/change-mobile" },
        { label: "Change Email Address", icon: "mail-outline", route: "/profile/settings/change-email" },
      ],
    },
    {
      title: "App Preferences",
      items: [
        { label: "Language Settings", icon: "language-outline", route: "/profile/settings/language", value: "English" },
        { label: "Dark Mode", icon: "moon-outline", route: "/profile/settings/dark-mode", value: "On" },
      ],
    },
    {
      title: "Privacy & Permissions",
      items: [
        { label: "App Permissions", icon: "lock-closed-outline", route: "/profile/settings/permissions" },
        { label: "Data Settings", icon: "server-outline", route: "/profile/settings/data" },
      ],
    },
  ];

  return (
    <ScreenHeader title="Account Settings" backHref="/(tabs)/profile">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.container}>
        {SECTIONS.map((section, idx) => (
          <View key={idx} style={s.section}>
            <Text style={s.sectionTitle}>{section.title}</Text>
            <View style={s.card}>
              {section.items.map((item, itemIdx) => (
                <TouchableOpacity
                  key={itemIdx}
                  style={[s.itemRow, itemIdx === section.items.length - 1 && s.noBorder]}
                  activeOpacity={0.7}
                  onPress={() => router.push(item.route as any)}
                >
                  <View style={s.itemLeft}>
                    <View style={s.iconBg}>
                      <Ionicons name={item.icon as any} size={18} color={colors.gold} />
                    </View>
                    <Text style={s.itemLabel}>{item.label}</Text>
                  </View>
                  <View style={s.itemRight}>
                    {item.value && <Text style={s.itemValue}>{item.value}</Text>}
                    <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </ScreenHeader>
  );
}

const s = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 10,
    marginLeft: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(212, 175, 55, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  itemLabel: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  itemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  itemValue: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "500",
  },
});
