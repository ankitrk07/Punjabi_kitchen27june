import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { LayoutAnimation, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const GOLD = "#C9A84C";
const WHITE = "#FFFFFF";

interface SpecialRequestsInputProps {
  value: string;
  onChange: (v: string) => void;
}

export function SpecialRequestsInput({ value, onChange }: SpecialRequestsInputProps) {
  const [expanded, setExpanded] = useState(value.length > 0);

  const toggleExpand = () => {
    // Smooth layout transition on expand
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={styles.container}>
      {!expanded ? (
        <TouchableOpacity
          onPress={toggleExpand}
          activeOpacity={0.7}
          style={styles.triggerBtn}
        >
          <Text style={styles.triggerText}>Add a special request +</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.expandedContainer}>
          <View style={styles.headerRow}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Ionicons name="chatbox-ellipses-outline" size={14} color={GOLD} />
              <Text style={styles.label}>SPECIAL REQUESTS</Text>
            </View>
            <TouchableOpacity onPress={toggleExpand} activeOpacity={0.7} style={styles.closeBtn}>
              <Ionicons name="close-circle-outline" size={16} color="#777" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Dietary restrictions, seating notes, allergies..."
              placeholderTextColor="#555555"
              multiline
              maxLength={200}
              value={value}
              onChangeText={onChange}
              underlineColorAndroid="transparent"
              selectionColor={GOLD}
              cursorColor={GOLD}
            />
            <Text style={styles.counter}>{value.length}/200</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    paddingHorizontal: 4,
  },
  triggerBtn: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: GOLD,
  },
  triggerText: {
    color: GOLD,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  expandedContainer: {
    backgroundColor: "rgba(14, 14, 14, 0.5)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(201, 168, 76, 0.12)",
    padding: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    color: GOLD,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  closeBtn: {
    padding: 2,
  },
  inputWrapper: {
    position: "relative",
  },
  textInput: {
    color: WHITE,
    fontSize: 13,
    minHeight: 68,
    maxHeight: 120,
    textAlignVertical: "top",
    paddingTop: 4,
    paddingBottom: 20, // Leave room for character counter
    paddingHorizontal: 4,
  },
  counter: {
    position: "absolute",
    bottom: 0,
    right: 4,
    color: "#555",
    fontSize: 10,
    fontWeight: "600",
  },
});
