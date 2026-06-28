import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "@/src/components/ScreenHeader";
import { colors } from "@/src/theme";

type Language = {
  code: string;
  name: string;
  nativeName: string;
};

export default function LanguageScreen() {
  const [selected, setSelected] = useState("en");

  const languages: Language[] = [
    { code: "en", name: "English", nativeName: "English" },
    { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
    { code: "pb", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
    { code: "bn", name: "Bengali", nativeName: "বাংলা" },
    { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
    { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  ];

  const handleSelect = (code: string, name: string) => {
    setSelected(code);
    alert(`Language changed to ${name}!`);
  };

  return (
    <ScreenHeader title="App Language" backHref="/(tabs)/profile">
      <Text style={styles.sectionLabel}>Select Language</Text>
      <View style={styles.card}>
        {languages.map((item) => (
          <TouchableOpacity
            key={item.code}
            style={[styles.row, selected === item.code && styles.activeRow]}
            onPress={() => handleSelect(item.code, item.name)}
            activeOpacity={0.7}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.langName, selected === item.code && styles.activeText]}>
                {item.name}
              </Text>
              <Text style={styles.nativeName}>{item.nativeName}</Text>
            </View>
            {selected === item.code && (
              <Ionicons name="checkmark-circle" size={20} color={colors.gold} />
            )}
          </TouchableOpacity>
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
  },
  activeRow: {
    backgroundColor: "rgba(212, 175, 55, 0.04)",
  },
  langName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  activeText: {
    color: colors.gold,
  },
  nativeName: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
