import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "@/src/components/ScreenHeader";
import { colors } from "@/src/theme";

export default function ChangeEmailScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState(1); // 1 = Confirm Password, 2 = Enter New Email
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirmPassword = () => {
    if (!password) {
      alert("Please enter your current account password to proceed.");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
    }, 1500);
  };

  const handleUpdateEmail = () => {
    if (!email.includes("@")) {
      alert("Please enter a valid email address.");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert("Email address updated successfully!");
      setStep(1);
      setPassword("");
      setEmail("");
    }, 1500);
  };

  return (
    <ScreenHeader title="Change Email Address" backHref="/(tabs)/profile">
      <View style={styles.banner}>
        <View style={styles.iconCircle}>
          <Ionicons name="mail" size={32} color={colors.gold} />
        </View>
        <Text style={styles.title}>Update Email Address</Text>
        <Text style={styles.subtitle}>
          Securely verify your identity and enter a new email address to receive order updates.
        </Text>
      </View>

      {step === 1 ? (
        <View style={styles.card}>
          <Text style={styles.inputLabel}>Confirm Current Password</Text>
          <View style={styles.inputRow}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="Enter account password"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity style={styles.btn} onPress={handleConfirmPassword} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.btnText}>Verify Identity</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.inputLabel}>New Email Address</Text>
          <View style={styles.inputRow}>
            <Ionicons name="mail-outline" size={18} color={colors.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="e.g. newemail@domain.com"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <TouchableOpacity style={styles.btn} onPress={handleUpdateEmail} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.btnText}>Verify & Save Email</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={() => setStep(1)}>
            <Text style={styles.cancelText}>Back</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScreenHeader>
  );
}

const styles = StyleSheet.create({
  banner: {
    alignItems: "center",
    marginVertical: 20,
    paddingHorizontal: 16,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(212, 175, 55, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 18,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.02)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
  },
  btn: {
    backgroundColor: colors.gold,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
  },
  btnText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 14,
  },
  cancelBtn: {
    alignItems: "center",
    marginTop: 14,
  },
  cancelText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "bold",
  },
});
