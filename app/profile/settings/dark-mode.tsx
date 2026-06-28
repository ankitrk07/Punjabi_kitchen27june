import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "@/src/components/ScreenHeader";
import { colors } from "@/src/theme";

export default function DarkModeScreen() {
  const [theme, setTheme] = useState("dark");

  const options = [
    { key: "dark", label: "On (Dark Mode)", desc: "Saves battery on OLED screens and reduces eye strain in dark environments.", icon: "moon-outline" },
    { key: "light", label: "Off (Light Mode)", desc: "Classic white display theme for bright daylight environments.", icon: "sunny-outline" },
    { key: "system", label: "System Default", desc: "Matches the display settings configured on your operating system.", icon: "settings-outline" },
  ];

  const handleSelect = (key: string) => {
    setTheme(key);
    alert(`Theme preference set to ${key}!`);
  };

  return (
    <ScreenHeader title="Dark Mode" backHref="/(tabs)/profile">
      <Text style={styles.sectionLabel}>Theme Preferences</Text>
      <View style={styles.card}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={[styles.row, theme === opt.key && styles.activeRow]}
            onPress={() => handleSelect(opt.key)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconCircle, theme === opt.key && styles.activeIconCircle]}>
              <Ionicons name={opt.icon as any} size={18} color={theme === opt.key ? "#000" : colors.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.optionLabel, theme === opt.key && styles.activeText]}>
                {opt.label}
              </Text>
              <Text style={styles.optionDesc}>{opt.desc}</Text>
            </View>
            {theme === opt.key && (
              <Ionicons name="radio-button-on" size={20} color={colors.gold} />
            )}
            {theme !== opt.key && (
              <Ionicons name="radio-button-off" size={20} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* AMOLED Note */}
      <View style={styles.noteCard}>
        <Ionicons name="flash-outline" size={18} color={colors.gold} />
        <Text style={styles.noteText}>
          Dark Mode uses deep black colors (`#000000`) on supported devices, which turns off display pixels to improve overall battery life.
        </Text>
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
  activeRow: {
    backgroundColor: "rgba(212, 175, 55, 0.04)",
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
  activeIconCircle: {
    backgroundColor: colors.gold,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  activeText: {
    color: colors.gold,
  },
  optionDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  noteCard: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "rgba(212, 175, 55, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.1)",
    borderRadius: 16,
    padding: 14,
    marginTop: 16,
  },
  noteText: {
    flex: 1,
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
  },
});
