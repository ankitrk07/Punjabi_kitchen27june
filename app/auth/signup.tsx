import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
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

  const onSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill all fields");
      return;
    }
    await signIn({ name: name.trim(), email: email.trim(), gender });
    router.replace("/(tabs)/home");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={["#000", "#0A0A0A", "#1A0F00"]} style={StyleSheet.absoluteFill} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => router.back()} style={styles.back}>
            <Ionicons name="chevron-back" size={22} color={colors.gold} />
          </TouchableOpacity>

          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the Punjabi Kitchen family</Text>

          <View style={styles.field}>
            <Ionicons name="person-outline" size={18} color={colors.gold} />
            <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor={colors.textSecondary} value={name} onChangeText={setName} testID="name-input" />
          </View>
          <View style={styles.field}>
            <Ionicons name="mail-outline" size={18} color={colors.gold} />
            <TextInput style={styles.input} placeholder="Email" placeholderTextColor={colors.textSecondary} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" testID="email-input" />
          </View>
          <View style={styles.field}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.gold} />
            <TextInput style={styles.input} placeholder="Password" placeholderTextColor={colors.textSecondary} value={password} onChangeText={setPassword} secureTextEntry testID="password-input" />
          </View>

          <Text style={styles.genderLabel}>Gender (for avatar)</Text>
          <View style={styles.genderRow}>
            {(["male", "female"] as const).map((g) => (
              <TouchableOpacity key={g} style={[styles.genderBtn, gender === g && styles.genderBtnActive]} onPress={() => setGender(g)} testID={`gender-${g}`}>
                <Text style={[styles.genderText, gender === g && { color: "#000" }]}>{g === "male" ? "♂ Male" : "♀ Female"}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {!!error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity style={styles.btn} onPress={onSignup} testID="signup-btn">
            <Text style={styles.btnText}>CREATE ACCOUNT</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
});