import { useApp } from "@/src/context/AppContext";
import { colors } from "@/src/theme";
import { apiClient } from "@/src/utils/apiClient";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Login() {
  const router = useRouter();
  const { signIn } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<"email" | "password" | null>(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0.4)).current;
  const logoScale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // Logo breathing loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoScale, { toValue: 1.05, duration: 1500, useNativeDriver: true }),
        Animated.timing(logoScale, { toValue: 0.95, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

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

    const trimmedEmail = email.trim().toLowerCase();
    if (trimmedEmail !== "admin@punjabikitchen.com" && !trimmedEmail.endsWith("@gmail.com")) {
      setError("We do not support temporary emails.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const trimmedEmail = email.trim().toLowerCase();
      const userProfile = await apiClient.login({ email: trimmedEmail, password: password.trim() });
      await signIn(userProfile);

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const isAdmin = email.trim().toLowerCase() === "admin@punjabikitchen.com";

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={["#000", "#0D0B08", "#24180F"]} style={StyleSheet.absoluteFill} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* logo & brand header */}
          <View style={styles.logoWrap}>
            <Animated.View style={[styles.crown, { transform: [{ scale: logoScale }] }]}>
              <Ionicons name="restaurant" size={38} color={colors.gold} />
            </Animated.View>
            <Text style={styles.brand}>Punjabi Kitchen</Text>
            <Text style={styles.tag}>Royal Flavours of Punjab</Text>
          </View>

          {/* greeting title */}
          <Text style={styles.title}>{getGreeting()}, Guest</Text>
          <Text style={styles.subtitle}>Login to enter the royal culinary experience</Text>

          {/* Email input field */}
          <View style={[
            styles.field,
            focusedField === "email" && styles.fieldFocused
          ]}>
            <Ionicons name="mail-outline" size={18} color={focusedField === "email" ? colors.gold : "rgba(255,255,255,0.4)"} />
            <TextInput
              style={styles.input}
              placeholder="Enter Email Address"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              testID="email-input"
              editable={!loading}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          {/* Password input field */}
          <View style={[
            styles.field,
            focusedField === "password" && styles.fieldFocused
          ]}>
            <Ionicons name="lock-closed-outline" size={18} color={focusedField === "password" ? colors.gold : "rgba(255,255,255,0.4)"} />
            <TextInput
              style={styles.input}
              placeholder="Enter Password"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              testID="password-input"
              editable={!loading}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          {/* error display */}
          {!!error && <Text style={styles.errorText}>{error}</Text>}

          {/* login button */}
          <TouchableOpacity style={styles.loginBtn} onPress={onLogin} testID="login-btn" disabled={loading}>
            <Text style={styles.loginText}>ENTER FEAST</Text>
            <Ionicons name="chevron-forward" size={14} color="#000" />
          </TouchableOpacity>

          {/* navigation link */}
          <TouchableOpacity onPress={() => router.push("/auth/signup")} testID="goto-signup" disabled={loading} style={styles.signupLink}>
            <Text style={styles.linkText}>
              New to Punjabi Kitchen? <Text style={{ color: colors.gold, fontWeight: "900" }}>Get Started</Text>
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Loading Modal overlay */}
      {loading && (
        <Animated.View style={[styles.loadingOverlay, { opacity: fadeAnim }]}>
          <View style={styles.loadingContainer}>
            <View style={[
              styles.loadingLogoWrap,
              isAdmin && { borderColor: "rgba(229, 139, 34, 0.45)", shadowColor: colors.accent }
            ]}>
              <Ionicons
                name={isAdmin ? "shield-checkmark-outline" : "restaurant"}
                size={36}
                color={isAdmin ? colors.accent : colors.gold}
              />
            </View>
            <ActivityIndicator
              size="large"
              color={isAdmin ? colors.accent : colors.gold}
              style={styles.spinner}
            />
            <Animated.Text style={[
              styles.loadingText,
              { opacity: pulseAnim },
              isAdmin && { color: colors.accent }
            ]}>
              {isAdmin ? "Accessing Control Panel..." : "Preparing your feast..."}
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
  logoWrap: { alignItems: "center", marginBottom: 38 },
  crown: { width: 88, height: 88, borderRadius: 44, borderWidth: 1.5, borderColor: colors.gold, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.01)" },
  brand: { color: colors.gold, fontSize: 24, fontWeight: "900", marginTop: 12, letterSpacing: 2, textTransform: "uppercase" },
  tag: { color: colors.textSecondary, fontSize: 10, letterSpacing: 3, marginTop: 4, textTransform: "uppercase", fontWeight: "600" },
  title: { color: "#FFF", fontSize: 24, fontWeight: "900", letterSpacing: 0.3, marginBottom: 4 },
  subtitle: { color: colors.textSecondary, fontSize: 13, lineHeight: 18, marginBottom: 24 },
  field: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.02)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", borderRadius: 16, paddingHorizontal: 14, marginBottom: 12, gap: 10 },
  fieldFocused: { borderColor: colors.gold, backgroundColor: "rgba(212,175,55,0.02)" },
  input: { flex: 1, color: "#FFF", paddingVertical: 14, fontSize: 14 },
  loginBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: colors.gold, paddingVertical: 14, borderRadius: 24, marginTop: 12, shadowColor: colors.gold, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  loginText: { color: "#000", fontWeight: "900", letterSpacing: 1.5 },
  signupLink: { marginTop: 24 },
  linkText: { color: colors.textSecondary, textAlign: "center", fontSize: 13 },
  errorText: { color: colors.error, fontSize: 12, fontWeight: "600", marginBottom: 12, alignSelf: "center" },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5, 5, 5, 0.94)",
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