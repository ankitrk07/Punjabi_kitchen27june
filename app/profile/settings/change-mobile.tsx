import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "@/src/components/ScreenHeader";
import { colors } from "@/src/theme";

export default function ChangeMobileScreen() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1 = Enter Phone, 2 = Verify OTP
  const [timer, setTimer] = useState(30);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let interval: any;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleSendOtp = () => {
    if (phone.length < 10) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
      setTimer(30);
    }, 1500);
  };

  const handleVerifyOtp = () => {
    if (otp.length < 4) {
      alert("Please enter the 4-digit verification code.");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert("Mobile number updated successfully!");
      setStep(1);
      setPhone("");
      setOtp("");
    }, 1500);
  };

  return (
    <ScreenHeader title="Change Mobile Number" backHref="/(tabs)/profile">
      <View style={styles.banner}>
        <View style={styles.iconCircle}>
          <Ionicons name="phone-portrait" size={32} color={colors.gold} />
        </View>
        <Text style={styles.title}>Update Mobile Number</Text>
        <Text style={styles.subtitle}>
          We will send a 4-digit One Time Password (OTP) to verify your new mobile connection.
        </Text>
      </View>

      {step === 1 ? (
        <View style={styles.card}>
          <Text style={styles.inputLabel}>New Mobile Number</Text>
          <View style={styles.inputRow}>
            <Text style={styles.countryCode}>+91</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter 10-digit number"
              placeholderTextColor={colors.textSecondary}
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          <TouchableOpacity style={styles.btn} onPress={handleSendOtp} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.btnText}>Send Verification Code</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.inputLabel}>Enter 4-Digit OTP sent to +91 {phone}</Text>
          <View style={styles.inputRow}>
            <Ionicons name="key-outline" size={18} color={colors.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="e.g. 1234"
              placeholderTextColor={colors.textSecondary}
              keyboardType="number-pad"
              maxLength={4}
              value={otp}
              onChangeText={setOtp}
            />
          </View>

          <TouchableOpacity style={styles.btn} onPress={handleVerifyOtp} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.btnText}>Verify & Update</Text>
            )}
          </TouchableOpacity>

          <View style={styles.timerRow}>
            {timer > 0 ? (
              <Text style={styles.timerText}>Resend code in {timer}s</Text>
            ) : (
              <TouchableOpacity onPress={handleSendOtp}>
                <Text style={styles.resendText}>Resend Verification Code</Text>
              </TouchableOpacity>
            )}
          </View>
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
  countryCode: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: "bold",
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
  timerRow: {
    alignItems: "center",
    marginTop: 16,
  },
  timerText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  resendText: {
    fontSize: 12,
    color: colors.gold,
    fontWeight: "bold",
  },
});
