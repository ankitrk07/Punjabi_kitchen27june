import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import ScreenHeader from "@/src/components/ScreenHeader";
import { colors } from "@/src/theme";

export default function DataSettingsScreen() {
  const [cacheSize, setCacheSize] = useState("24.5 MB");
  const [historySize, setHistorySize] = useState("1.2 MB");
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [isClearingHistory, setIsClearingHistory] = useState(false);

  const handleClearCache = () => {
    setIsClearingCache(true);
    setTimeout(() => {
      setIsClearingCache(false);
      setCacheSize("0.0 KB");
      alert("App image and layout cache cleared successfully!");
    }, 1500);
  };

  const handleClearHistory = () => {
    setIsClearingHistory(true);
    setTimeout(() => {
      setIsClearingHistory(false);
      setHistorySize("0.0 KB");
      alert("Recent searches and dining histories cleared.");
    }, 1500);
  };

  return (
    <ScreenHeader title="Data Settings" backHref="/(tabs)/profile">
      <Text style={styles.sectionLabel}>Storage & Cache Management</Text>
      
      <View style={styles.card}>
        {/* Cache Row */}
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Images & Menu Cache</Text>
            <Text style={styles.desc}>Temporary menu images, logo files, and screen layout data.</Text>
            <Text style={styles.sizeText}>Current Size: {cacheSize}</Text>
          </View>
          <TouchableOpacity
            style={[styles.actionBtn, cacheSize === "0.0 KB" && styles.disabledBtn]}
            onPress={handleClearCache}
            disabled={isClearingCache || cacheSize === "0.0 KB"}
          >
            {isClearingCache ? (
              <ActivityIndicator color={colors.gold} size="small" />
            ) : (
              <Text style={styles.actionBtnText}>Clear</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* History Row */}
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Search & Navigation History</Text>
            <Text style={styles.desc}>Recent queries, suggestions, and previously viewed dishes.</Text>
            <Text style={styles.sizeText}>Current Size: {historySize}</Text>
          </View>
          <TouchableOpacity
            style={[styles.actionBtn, historySize === "0.0 KB" && styles.disabledBtn]}
            onPress={handleClearHistory}
            disabled={isClearingHistory || historySize === "0.0 KB"}
          >
            {isClearingHistory ? (
              <ActivityIndicator color={colors.gold} size="small" />
            ) : (
              <Text style={styles.actionBtnText}>Clear</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Account Deletion */}
      <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Account Security</Text>
      <View style={styles.dangerCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.dangerTitle}>Deactivate or Delete Account</Text>
          <Text style={styles.dangerDesc}>
            Permanently delete your profile, active gold subscriptions, address book, and loyalty points. This action is irreversible.
          </Text>
        </View>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => alert("Account deletion request submitted.")}
        >
          <Text style={styles.deleteBtnText}>Delete</Text>
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
    overflow: "hidden",
  },
  row: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
    paddingRight: 10,
  },
  sizeText: {
    fontSize: 11,
    color: colors.gold,
    fontWeight: "600",
    marginTop: 6,
  },
  actionBtn: {
    borderWidth: 1,
    borderColor: colors.gold,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledBtn: {
    borderColor: colors.border,
    opacity: 0.5,
  },
  actionBtnText: {
    fontSize: 12,
    color: colors.gold,
    fontWeight: "bold",
  },
  dangerCard: {
    backgroundColor: "rgba(239, 68, 68, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.15)",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  dangerTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.error,
  },
  dangerDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
    marginTop: 4,
  },
  deleteBtn: {
    backgroundColor: colors.error,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  deleteBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});
