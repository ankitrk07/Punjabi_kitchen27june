import React, { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "@/src/context/AppContext";
import { colors } from "@/src/theme";

export default function SignUp() {
  const router = useRouter();
  const { signIn } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (loading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.4,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      fadeAnim.setValue(0);
      pulseAnim.setValue(0.4);
    }
  }, [loading]);

  const onSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill all fields");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Pass password so it is registered on the backend
      await signIn({ name: name.trim(), email: email.trim(), gender, password: password.trim() });
      router.replace("/(tabs)/home");
    } catch (err: any) {
      setError(err.message || "Signup failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={["#000", "#0A0A0A", "#1A0F00"]} style={StyleSheet.absoluteFill} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => router.back()} style={styles.back} disabled={loading}>
            <Ionicons name="chevron-back" size={22} color={colors.gold} />
          </TouchableOpacity>

          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the Punjabi Kitchen family</Text>

          <View style={styles.field}>
            <Ionicons name="person-outline" size={18} color={colors.gold} />
            <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor={colors.textSecondary} value={name} onChangeText={setName} testID="name-input" editable={!loading} />
          </View>
          <View style={styles.field}>
            <Ionicons name="mail-outline" size={18} color={colors.gold} />
            <TextInput style={styles.input} placeholder="Email" placeholderTextColor={colors.textSecondary} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" testID="email-input" editable={!loading} />
          </View>
          <View style={styles.field}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.gold} />
            <TextInput style={styles.input} placeholder="Password" placeholderTextColor={colors.textSecondary} value={password} onChangeText={setPassword} secureTextEntry testID="password-input" editable={!loading} />
          </View>

          <Text style={styles.genderLabel}>Gender (for avatar)</Text>
          <View style={styles.genderRow}>
            {(["male", "female"] as const).map((g) => (
              <TouchableOpacity key={g} style={[styles.genderBtn, gender === g && styles.genderBtnActive]} onPress={() => setGender(g)} testID={`gender-${g}`} disabled={loading}>
                <Text style={[styles.genderText, gender === g && { color: "#000" }]}>{g === "male" ? "♂ Male" : "♀ Female"}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {!!error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity style={styles.btn} onPress={onSignup} testID="signup-btn" disabled={loading}>
            <Text style={styles.btnText}>CREATE ACCOUNT</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {loading && (
        <Animated.View style={[styles.loadingOverlay, { opacity: fadeAnim }]}>
          <View style={styles.loadingContainer}>
            <View style={styles.loadingLogoWrap}>
              <Ionicons name="restaurant" size={36} color={colors.gold} />
            </View>
            <ActivityIndicator size="large" color={colors.gold} style={styles.spinner} />
            <Animated.Text style={[styles.loadingText, { opacity: pulseAnim }]}>
              Creating your royal table...
            </Animated.Text>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 24, paddingTop: 60 },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.borderGold, marginBottom: 18 },
  title: { color: "#FFF", fontSize: 26, fontWeight: "700" },
  subtitle: { color: colors.textSecondary, fontSize: 13, marginBottom: 24 },
  field: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 14, marginBottom: 12, gap: 10 },
  input: { flex: 1, color: "#FFF", paddingVertical: 14, fontSize: 14 },
  genderLabel: { color: colors.textSecondary, fontSize: 12, marginTop: 8, marginBottom: 8, letterSpacing: 1 },
  genderRow: { flexDirection: "row", gap: 10 },
  genderBtn: { flex: 1, paddingVertical: 12, borderRadius: 14, borderWidth: 1, borderColor: colors.border, alignItems: "center", backgroundColor: colors.surface },
  genderBtnActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  genderText: { color: "#FFF", fontWeight: "600" },
  btn: { backgroundColor: colors.gold, paddingVertical: 14, borderRadius: 24, alignItems: "center", marginTop: 18 },
  btnText: { color: "#000", fontWeight: "800", letterSpacing: 2 },
  error: { color: colors.error, fontSize: 12, marginTop: 8 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5, 5, 5, 0.92)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  loadingLogoWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1.5,
    borderColor: colors.borderGold,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  spinner: {
    transform: [{ scale: 1.25 }],
    marginBottom: 16,
  },
  loadingText: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginTop: 8,
  },
});