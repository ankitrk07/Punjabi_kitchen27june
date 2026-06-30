import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "@/src/context/AppContext";
import { colors } from "@/src/theme";

export default function Login() {
  const router = useRouter();
  const { signIn } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password");
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (trimmedEmail === "admin@punjabikitchen.com") {
      if (password !== "admin123") {
        setError("Invalid admin password");
        return;
      }
      await signIn({
        name: "Restaurant Manager",
        email: "admin@punjabikitchen.com",
        gender: "male",
      });
      router.replace("/admin/dashboard");
      return;
    }

    const name = email.split("@")[0].replace(/[._-]/g, " ");
    await signIn({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email: email.trim(),
      gender: "male",
    });
    router.replace("/(tabs)/home");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={["#000", "#0A0A0A", "#1A0F00"]} style={StyleSheet.absoluteFill} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.logoWrap}>
            <View style={styles.crown}>
              <Ionicons name="restaurant" size={40} color={colors.gold} />
            </View>
            <Text style={styles.brand}>Punjabi Kitchen</Text>
            <Text style={styles.tag}>Royal Flavours of Punjab</Text>
          </View>

          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue your feast</Text>

          <View style={styles.field}>
            <Ionicons name="mail-outline" size={18} color={colors.gold} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              testID="email-input"
            />
          </View>

          <View style={styles.field}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.gold} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              testID="password-input"
            />
          </View>

          {!!error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity style={styles.loginBtn} onPress={onLogin} testID="login-btn">
            <Text style={styles.loginText}>LOGIN</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/auth/signup")} testID="goto-signup">
            <Text style={styles.linkText}>
              New to Punjabi Kitchen? <Text style={{ color: colors.gold }}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 24, justifyContent: "center", flexGrow: 1 },
  logoWrap: { alignItems: "center", marginBottom: 32 },
  crown: { width: 92, height: 92, borderRadius: 46, borderWidth: 2, borderColor: colors.gold, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface },
  brand: { color: colors.gold, fontSize: 22, fontWeight: "700", marginTop: 12, letterSpacing: 2 },
  tag: { color: colors.textSecondary, fontSize: 11, letterSpacing: 2, marginTop: 4 },
  title: { color: "#FFF", fontSize: 26, fontWeight: "700", marginBottom: 4 },
  subtitle: { color: colors.textSecondary, fontSize: 13, marginBottom: 24 },
  field: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 14, marginBottom: 12, gap: 10 },
  input: { flex: 1, color: "#FFF", paddingVertical: 14, fontSize: 14 },
  loginBtn: { backgroundColor: colors.gold, paddingVertical: 14, borderRadius: 24, alignItems: "center", marginTop: 12 },
  loginText: { color: "#000", fontWeight: "800", letterSpacing: 2 },
  linkText: { color: colors.textSecondary, textAlign: "center", marginTop: 20, fontSize: 13 },
  error: { color: colors.error, fontSize: 12, marginBottom: 8 },
});