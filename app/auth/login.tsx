import React, { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "@/src/context/AppContext";
import { colors } from "@/src/theme";
import { apiClient } from "@/src/utils/apiClient";

export default function Login() {
  const router = useRouter();
  const { signIn } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const onLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const trimmedEmail = email.trim().toLowerCase();
      // Verify credentials on backend
      const userProfile = await apiClient.login({ email: trimmedEmail, password: password.trim() });
      
      // Complete sign in and load context
      await signIn(userProfile);

      // Route based on role
      if (trimmedEmail === "admin@punjabikitchen.com") {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/(tabs)/home");
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
      setLoading(false);
    }
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
              editable={!loading}
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
              editable={!loading}
            />
          </View>

          {!!error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity style={styles.loginBtn} onPress={onLogin} testID="login-btn" disabled={loading}>
            <Text style={styles.loginText}>LOGIN</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/auth/signup")} testID="goto-signup" disabled={loading}>
            <Text style={styles.linkText}>
              New to Punjabi Kitchen? <Text style={{ color: colors.gold }}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {loading && (
        <Animated.View style={[styles.loadingOverlay, { opacity: fadeAnim }]}>
          <View style={styles.loadingContainer}>
            <View style={[
              styles.loadingLogoWrap,
              email.trim().toLowerCase() === "admin@punjabikitchen.com" && { borderColor: "rgba(229, 139, 34, 0.45)", shadowColor: colors.accent }
            ]}>
              <Ionicons 
                name={email.trim().toLowerCase() === "admin@punjabikitchen.com" ? "shield-checkmark-outline" : "restaurant"} 
                size={36} 
                color={email.trim().toLowerCase() === "admin@punjabikitchen.com" ? colors.accent : colors.gold} 
              />
            </View>
            <ActivityIndicator 
              size="large" 
              color={email.trim().toLowerCase() === "admin@punjabikitchen.com" ? colors.accent : colors.gold} 
              style={styles.spinner} 
            />
            <Animated.Text style={[
              styles.loadingText, 
              { opacity: pulseAnim },
              email.trim().toLowerCase() === "admin@punjabikitchen.com" && { color: colors.accent }
            ]}>
              {email.trim().toLowerCase() === "admin@punjabikitchen.com" 
                ? "Accessing Control Panel..." 
                : "Preparing your feast..."}
            </Animated.Text>
          </View>
        </Animated.View>
      )}
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