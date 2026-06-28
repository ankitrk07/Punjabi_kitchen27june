import { colors } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

type Props = {
  value: string;
  onChangeText: (value: string) => void;
  onClear: () => void;
  itemCount: number;
};

export default function MenuSearchBar({ value, onChangeText, onClear, itemCount }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.textSecondary} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder="Search dishes, drinks, desserts..."
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          testID="menu-search-input"
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={onClear} testID="clear-search-btn">
            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.helperText}>{itemCount} items found</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, backgroundColor: colors.bg },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    height: 52,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  input: { flex: 1, color: "#FFF", fontSize: 14, paddingVertical: 0 },
  helperText: { color: colors.textSecondary, fontSize: 12, marginTop: 8, marginLeft: 4 },
});
