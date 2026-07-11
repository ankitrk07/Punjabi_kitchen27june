import { useApp } from "@/src/context/AppContext";
import { colors } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Dimensions, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

const { width, height } = Dimensions.get("window");

const AI_EXAMPLES = [
  "Suggest a spicy paneer combination for dinner.",
  "Which Punjabi dish has the lowest preparation time?",
  "Recommend a complete family feast for 4 guests.",
];

// Dark styled Leaflet map with Nominatim User-Agent headers
const MAP_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="initial-scale=1.0, user-scalable=no, width=device-width" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body { margin: 0; padding: 0; background: #0c0907; }
    #map { width: 100vw; height: 100vh; }
    .pin {
      width: 44px;
      height: 44px;
      position: absolute;
      top: 50%;
      left: 50%;
      margin-top: -44px;
      margin-left: -22px;
      z-index: 1000;
      pointer-events: none;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <svg class="pin" viewBox="0 0 24 24">
    <path fill="#C9A84C" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>
  <script>
    var map = L.map('map', { zoomControl: false }).setView([23.3441, 85.3096], 15);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: ''
    }).addTo(map);

    function reportLocation() {
      var center = map.getCenter();
      // Nominatim requires custom User-Agent to prevent 403 blocks
      fetch('https://nominatim.openstreetmap.org/reverse?format=json&lat=' + center.lat + '&lon=' + center.lng, {
        headers: {
          'User-Agent': 'PunjabiKitchenApp/1.0 (sudip@dineout.com)'
        }
      })
        .then(response => response.json())
        .then(data => {
          var address = data.display_name || (center.lat.toFixed(4) + ', ' + center.lng.toFixed(4));
          var shortAddress = address.split(',').slice(0, 3).join(',').trim();
          window.ReactNativeWebView.postMessage(JSON.stringify({
            address: shortAddress || address,
            lat: center.lat,
            lng: center.lng
          }));
        })
        .catch(err => {
          var fallbackAddr = "Ranchi, Jharkhand (" + center.lat.toFixed(4) + ", " + center.lng.toFixed(4) + ")";
          window.ReactNativeWebView.postMessage(JSON.stringify({
            address: fallbackAddr,
            lat: center.lat,
            lng: center.lng
          }));
        });
    }

    var timer;
    map.on('moveend', function() {
      clearTimeout(timer);
      timer = setTimeout(reportLocation, 650);
    });

    reportLocation();
  </script>
</body>
</html>
`;

// Zero Gravity Golden Particle Component
function ZeroGravityParticle({ delay }: { delay: number }) {
  const posY = useRef(new Animated.Value(height)).current;
  const posX = useRef(new Animated.Value(Math.random() * width)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const size = Math.random() * 4 + 2.5;

  useEffect(() => {
    const startAnimation = () => {
      posY.setValue(height + 10);
      posX.setValue(Math.random() * width);
      opacity.setValue(0);

      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(posY, {
            toValue: -50,
            duration: 12000 + Math.random() * 14000,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: Math.random() * 0.4 + 0.2,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.delay(7000),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 3000,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start(() => {
        startAnimation();
      });
    };

    startAnimation();
  }, []);

  return (
    <Animated.View style={[
      styles.particle,
      {
        width: size,
        height: size,
        borderRadius: size / 2,
        opacity: opacity,
        transform: [
          { translateX: posX },
          { translateY: posY }
        ]
      }
    ]} />
  );
}

function ZeroGravityBackground() {
  return (
    <View style={StyleSheet.absoluteFill}>
      {Array.from({ length: 18 }).map((_, i) => (
        <ZeroGravityParticle key={i} delay={i * 650} />
      ))}
    </View>
  );
}

export default function SignUp() {
  const router = useRouter();
  const { signIn, addAddress } = useApp();
  
  // SignUp step state (1 to 4)
  const [step, setStep] = useState(1);

  // Input states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  
  const [location, setLocation] = useState("Ajit Enclave, Ranchi");
  const [dineMode, setDineMode] = useState<"Delivery" | "Dine In">("Delivery");
  
  const [showMapModal, setShowMapModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // WebView Ref
  const webViewRef = useRef<WebView>(null);

  // Animations
  const fadeOverlay = useRef(new Animated.Value(0)).current;
  const pulseOverlay = useRef(new Animated.Value(0.4)).current;
  
  // Slide offset progressive translation
  const slideProgress = useRef(new Animated.Value(0)).current;

  // Water Ripple Overlay Animations
  const rippleScale1 = useRef(new Animated.Value(0)).current;
  const rippleOpacity1 = useRef(new Animated.Value(0)).current;
  const rippleScale2 = useRef(new Animated.Value(0)).current;
  const rippleOpacity2 = useRef(new Animated.Value(0)).current;

  // Liquid background blobs
  const blob1X = useRef(new Animated.Value(-100)).current;
  const blob1Y = useRef(new Animated.Value(-100)).current;
  const blob2X = useRef(new Animated.Value(width)).current;
  const blob2Y = useRef(new Animated.Value(height / 2)).current;

  // Smooth floating dot indicator
  const dotProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(dotProgress, {
      toValue: step - 1,
      friction: 12,
      tension: 30,
      useNativeDriver: true,
    }).start();

    Animated.spring(slideProgress, {
      toValue: step - 1,
      friction: 13,
      tension: 35,
      useNativeDriver: true,
    }).start();

    let targets = { b1X: -100, b1Y: -100, b2X: width, b2Y: height / 2 };
    if (step === 2) {
      targets = { b1X: width / 2, b1Y: -50, b2X: -50, b2Y: height * 0.6 };
    } else if (step === 3) {
      targets = { b1X: -50, b1Y: height * 0.4, b2X: width / 2, b2Y: height };
    } else if (step === 4) {
      targets = { b1X: width / 3, b1Y: height / 3, b2X: -80, b2Y: -80 };
    }

    Animated.parallel([
      Animated.spring(blob1X, { toValue: targets.b1X, friction: 9, useNativeDriver: true }),
      Animated.spring(blob1Y, { toValue: targets.b1Y, friction: 9, useNativeDriver: true }),
      Animated.spring(blob2X, { toValue: targets.b2X, friction: 9, useNativeDriver: true }),
      Animated.spring(blob2Y, { toValue: targets.b2Y, friction: 9, useNativeDriver: true }),
    ]).start();

  }, [step]);

  useEffect(() => {
    if (loading) {
      Animated.timing(fadeOverlay, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseOverlay, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseOverlay, {
            toValue: 0.4,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      fadeOverlay.setValue(0);
      pulseOverlay.setValue(0.4);
    }
  }, [loading]);

  const triggerWaterFlowTransition = (nextStep: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    
    rippleScale1.setValue(0);
    rippleOpacity1.setValue(1);
    rippleScale2.setValue(0);
    rippleOpacity2.setValue(0.85);

    Animated.parallel([
      Animated.timing(rippleScale1, {
        toValue: 2.2,
        duration: 550,
        useNativeDriver: true,
      }),
      Animated.timing(rippleOpacity1, {
        toValue: 0,
        duration: 550,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.sequence([
      Animated.delay(100),
      Animated.parallel([
        Animated.timing(rippleScale2, {
          toValue: 2.2,
          duration: 480,
          useNativeDriver: true,
        }),
        Animated.timing(rippleOpacity2, {
          toValue: 0,
          duration: 480,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    setStep(nextStep);
  };

  const onNextStep = () => {
    setError("");
    if (step === 4) {
      onSignup();
    } else {
      triggerWaterFlowTransition(step + 1);
    }
  };

  const onPrevStep = () => {
    setError("");
    if (step > 1) {
      triggerWaterFlowTransition(step - 1);
    } else {
      router.back();
    }
  };

  const onSkip = () => {
    triggerWaterFlowTransition(4);
  };

  const onSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill all fields to create your account");
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail.endsWith("@gmail.com")) {
      setError("We do not support temporary emails.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      if (location.trim()) {
        addAddress({ label: dineMode === "Dine In" ? "Restaurant Dine-In" : "Primary Address", line: location.trim() });
      }

      await signIn({ name: name.trim(), email: email.trim().toLowerCase(), gender, password: password.trim() });
      router.replace("/(tabs)/home");
    } catch (err: any) {
      setError(err.message || "Signup failed. Please try again.");
      setLoading(false);
    }
  };

  // Search Address Geocoding Handler with custom User-Agent headers
  const handleMapSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            "User-Agent": "PunjabiKitchenApp/1.0 (sudip@dineout.com)"
          }
        }
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const item = data[0];
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);
        const displayName = item.display_name.split(',').slice(0, 3).join(',').trim();
        setLocation(displayName);
        
        // Command Leaflet map in WebView to center on target coordinates
        webViewRef.current?.injectJavaScript(`
          map.setView([${lat}, ${lon}], 16);
        `);
      } else {
        alert("Address not found. Please try a different location query.");
      }
    } catch (err) {
      console.log("Geocoding map search failed:", err);
    } finally {
      setSearching(false);
    }
  };

  // Interpolate floating active dot position
  const dotTranslateX = dotProgress.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [0, 18, 36, 54],
  });

  // Calculate sliding container translation offset
  const containerTranslateX = slideProgress.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [0, -width, -width * 2, -width * 3],
  });

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={["#030202", "#0C0907", "#170C05"]} style={StyleSheet.absoluteFill} />
      
      {/* Zero Gravity Particle Flow in background */}
      <ZeroGravityBackground />

      {/* Dynamic drifting water glow blobs in the background */}
      <Animated.View style={[styles.glowBlob, { backgroundColor: "rgba(212,175,55,0.04)", width: 280, height: 280, borderRadius: 140, transform: [{ translateX: blob1X }, { translateY: blob1Y }] }]} />
      <Animated.View style={[styles.glowBlob, { backgroundColor: "rgba(229,139,34,0.03)", width: 320, height: 320, borderRadius: 160, transform: [{ translateX: blob2X }, { translateY: blob2Y }] }]} />

      {/* Water Ripple Overlay 1 */}
      <Animated.View 
        pointerEvents="none"
        style={[
          styles.rippleOverlay,
          {
            transform: [{ scale: rippleScale1 }],
            opacity: rippleOpacity1,
            borderColor: "rgba(212,175,55,0.35)",
          }
        ]} 
      />

      {/* Water Ripple Overlay 2 */}
      <Animated.View 
        pointerEvents="none"
        style={[
          styles.rippleOverlay,
          {
            transform: [{ scale: rippleScale2 }],
            opacity: rippleOpacity2,
            borderColor: "rgba(229,139,34,0.25)",
          }
        ]} 
      />

      {/* Top Navigation Row */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onPrevStep} style={styles.backBtn} disabled={loading}>
          <Ionicons name="chevron-back" size={20} color={colors.gold} />
        </TouchableOpacity>

        {/* Skip button for step 1, 2, 3 */}
        {step < 4 ? (
          <TouchableOpacity onPress={onSkip} style={styles.skipBtn} disabled={loading}>
            <Text style={styles.skipBtnText}>SKIP</Text>
            <Ionicons name="arrow-forward" size={14} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <Animated.View style={[styles.slidingContainer, { transform: [{ translateX: containerTranslateX }] }]}>
          
          {/* STEP 1: AI Assistant Intro */}
          <View style={styles.slidePage}>
            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <View style={styles.stepContent}>
                <LottieView
                  source={require("../../assets/AI.json")}
                  autoPlay
                  loop
                  style={styles.lottieAnim}
                />
                <Text style={styles.title}>Your AI Culinary Butler</Text>
                <Text style={styles.subtitle}>Our built-in smart assistant helps you curate dishes, request customized spice levels, and book tables.</Text>
                
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>WHAT YOU CAN ASK:</Text>
                  {AI_EXAMPLES.map((example, i) => (
                    <View key={i} style={styles.exampleRow}>
                      <Ionicons name="chatbubble-ellipses-outline" size={16} color={colors.gold} />
                      <Text style={styles.exampleText}>"{example}"</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity style={styles.primaryBtn} onPress={onNextStep}>
                  <Text style={styles.primaryBtnText}>NEXT</Text>
                  <Ionicons name="arrow-forward" size={16} color="#000" />
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>

          {/* STEP 2: Location Setup */}
          <View style={styles.slidePage}>
            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <View style={styles.stepContent}>
                <View style={styles.iconCircle}>
                  <Ionicons name="location-outline" size={32} color={colors.gold} />
                </View>
                <Text style={styles.title}>Select Your Location</Text>
                <Text style={styles.subtitle}>Order directly to your door or view the restaurant's location for Dine-In.</Text>

                {/* Mode Selectors */}
                <View style={styles.modeRow}>
                  <TouchableOpacity 
                    style={[styles.modeBtn, dineMode === "Delivery" && styles.modeBtnActive]} 
                    onPress={() => { setDineMode("Delivery"); setLocation("Ajit Enclave, Ranchi"); }}
                  >
                    <Ionicons name="bicycle" size={16} color={dineMode === "Delivery" ? "#000" : "#FFF"} />
                    <Text style={[styles.modeText, dineMode === "Delivery" && { color: "#000" }]}>Delivery</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.modeBtn, dineMode === "Dine In" && styles.modeBtnActive]} 
                    onPress={() => { setDineMode("Dine In"); setLocation("Connaught Place, New Delhi"); }}
                  >
                    <Ionicons name="restaurant" size={16} color={dineMode === "Dine In" ? "#000" : "#FFF"} />
                    <Text style={[styles.modeText, dineMode === "Dine In" && { color: "#000" }]}>Dine In</Text>
                  </TouchableOpacity>
                </View>

                {dineMode === "Dine In" ? (
                  <View style={styles.restaurantLocationCard}>
                    <Ionicons name="restaurant-outline" size={18} color={colors.gold} style={{ marginRight: 10 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.restaurantLocationLabel}>RESTAURANT LOCATION</Text>
                      <Text style={styles.restaurantLocationText}>Connaught Place, New Delhi</Text>
                    </View>
                  </View>
                ) : (
                  <View style={{ width: "100%", gap: 10 }}>
                    <View style={styles.field}>
                      <Ionicons name="navigate-outline" size={18} color={colors.gold} />
                      <TextInput 
                        style={styles.input} 
                        placeholder="Delivery Address" 
                        placeholderTextColor={colors.textSecondary} 
                        value={location} 
                        onChangeText={setLocation} 
                        editable={!loading} 
                      />
                    </View>
                    
                    {/* Select on Map Trigger Button */}
                    <TouchableOpacity style={styles.mapSelectBtn} onPress={() => setShowMapModal(true)}>
                      <Ionicons name="map-outline" size={16} color={colors.gold} />
                      <Text style={styles.mapSelectBtnText}>SELECT FROM MAP</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <TouchableOpacity style={styles.primaryBtn} onPress={onNextStep}>
                  <Text style={styles.primaryBtnText}>NEXT</Text>
                  <Ionicons name="arrow-forward" size={16} color="#000" />
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>

          {/* STEP 3: Personal Preferences */}
          <View style={styles.slidePage}>
            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <View style={styles.stepContent}>
                <View style={styles.iconCircle}>
                  <Ionicons name="person-outline" size={32} color={colors.gold} />
                </View>
                <Text style={styles.title}>Personal Profile</Text>
                <Text style={styles.subtitle}>Help us customize your experience and select avatars.</Text>

                <Text style={styles.label}>GENDER</Text>
                <View style={styles.genderRow}>
                  {(["male", "female"] as const).map((g) => (
                    <TouchableOpacity key={g} style={[styles.genderBtn, gender === g && styles.genderBtnActive]} onPress={() => setGender(g)} disabled={loading}>
                      <Text style={[styles.genderText, gender === g && { color: "#000" }]}>{g === "male" ? "♂ Male" : "♀ Female"}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity style={styles.primaryBtn} onPress={onNextStep}>
                  <Text style={styles.primaryBtnText}>CONTINUE</Text>
                  <Ionicons name="arrow-forward" size={16} color="#000" />
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>

          {/* STEP 4: Account Details */}
          <View style={styles.slidePage}>
            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <View style={styles.stepContent}>
                <View style={styles.iconCircle}>
                  <Ionicons name="lock-closed-outline" size={32} color={colors.gold} />
                </View>
                <Text style={styles.title}>Secure Your Account</Text>
                <Text style={styles.subtitle}>Enter credentials to finalize your royal membership.</Text>

                <View style={styles.field}>
                  <Ionicons name="person-outline" size={18} color={colors.gold} />
                  <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor={colors.textSecondary} value={name} onChangeText={setName} testID="name-input" editable={!loading} />
                </View>
                <View style={styles.field}>
                  <Ionicons name="mail-outline" size={18} color={colors.gold} />
                  <TextInput style={styles.input} placeholder="Email Address" placeholderTextColor={colors.textSecondary} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" testID="email-input" editable={!loading} />
                </View>
                <View style={styles.field}>
                  <Ionicons name="lock-closed-outline" size={18} color={colors.gold} />
                  <TextInput style={styles.input} placeholder="Create Password" placeholderTextColor={colors.textSecondary} value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" testID="password-input" editable={!loading} />
                </View>

                {!!error && <Text style={styles.errorText}>{error}</Text>}

                <TouchableOpacity style={styles.primaryBtn} onPress={onSignup} disabled={loading}>
                  {loading ? <ActivityIndicator size="small" color="#000" /> : (
                    <>
                      <Text style={styles.primaryBtnText}>REGISTER</Text>
                      <Ionicons name="checkmark-circle-outline" size={16} color="#000" />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>

      {/* Bottom Right Indicator Track */}
      <View style={styles.bottomIndicator}>
        {/* Liquid Indicator Track */}
        <View style={styles.indicatorTrack}>
          {[1, 2, 3, 4].map((s) => (
            <View key={s} style={styles.staticDot} />
          ))}
          {/* Mercury/Fluid sliding dot */}
          <Animated.View style={[styles.activeDot, { transform: [{ translateX: dotTranslateX }] }]} />
        </View>
      </View>

      {/* Map Selector Modal */}
      <Modal visible={showMapModal} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.mapSafe}>
          {/* Header */}
          <View style={styles.mapHeader}>
            <TouchableOpacity onPress={() => setShowMapModal(false)} style={styles.mapBackBtn}>
              <Ionicons name="close-outline" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.mapHeaderTitle}>Select on Map</Text>
            <TouchableOpacity onPress={() => setShowMapModal(false)} style={styles.mapDoneBtn}>
              <Text style={styles.mapDoneBtnText}>CONFIRM</Text>
            </TouchableOpacity>
          </View>

          {/* Real-time Address search bar inside the Map Selector */}
          <View style={styles.mapSearchContainer}>
            <Ionicons name="search" size={18} color="rgba(255,255,255,0.4)" style={{ marginLeft: 12 }} />
            <TextInput
              style={styles.mapSearchInput}
              placeholder="Search address or landmark..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleMapSearch}
              autoCorrect={false}
            />
            {searching ? (
              <ActivityIndicator size="small" color={colors.gold} style={{ marginRight: 12 }} />
            ) : searchQuery.length > 0 ? (
              <TouchableOpacity onPress={handleMapSearch} style={{ marginRight: 12 }}>
                <Ionicons name="arrow-forward-circle" size={22} color={colors.gold} />
              </TouchableOpacity>
            ) : null}
          </View>
          
          <WebView
            ref={webViewRef}
            originWhitelist={['*']}
            source={{ html: MAP_HTML }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            onMessage={(event) => {
              try {
                const data = JSON.parse(event.nativeEvent.data);
                if (data && data.address) {
                  setLocation(data.address);
                }
              } catch (err) {
                console.log("Map WebView error:", err);
              }
            }}
            style={{ flex: 1, backgroundColor: "#0C0907" }}
          />

          <View style={styles.mapFooter}>
            <View style={styles.mapFooterPin}>
              <Ionicons name="location-sharp" size={20} color={colors.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.mapFooterLabel}>SELECTED ADDRESS</Text>
              <Text style={styles.mapFooterText} numberOfLines={2}>{location || "Locating..."}</Text>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#020100", position: "relative" },
  glowBlob: { position: "absolute", zIndex: 0, opacity: 0.8 },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, height: 60, zIndex: 10 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.02)", borderWidth: 1, borderColor: "rgba(212,175,55,0.25)", alignItems: "center", justifyContent: "center" },
  indicatorTrack: { flexDirection: "row", width: 78, height: 12, alignItems: "center", position: "relative" },
  staticDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: "rgba(255,255,255,0.15)", marginRight: 16 },
  activeDot: { position: "absolute", left: -4.5, width: 12, height: 6, borderRadius: 3, backgroundColor: colors.gold, shadowColor: colors.gold, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 3, elevation: 4 },
  skipBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, height: 32 },
  skipBtnText: { color: "rgba(255,255,255,0.6)", fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  slidingContainer: {
    flexDirection: "row",
    width: width * 4,
    flex: 1,
  },
  slidePage: {
    width: width,
    height: "100%",
  },
  scroll: { padding: 24, flexGrow: 1, justifyContent: "flex-start", paddingTop: 40, zIndex: 5 },
  stepContent: { width: "100%", alignItems: "center", gap: 14 },
  iconCircle: { width: 68, height: 68, borderRadius: 34, backgroundColor: "rgba(255,255,255,0.02)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center", marginBottom: 6 },
  title: { color: "#FFF", fontSize: 24, fontWeight: "900", textAlign: "center", letterSpacing: 0.2 },
  subtitle: { color: colors.textSecondary, fontSize: 12.5, lineHeight: 18, textAlign: "center", paddingHorizontal: 16, marginBottom: 8 },
  card: { width: "100%", backgroundColor: "rgba(255,255,255,0.02)", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", borderRadius: 20, padding: 18, gap: 10, marginBottom: 10 },
  cardTitle: { color: colors.gold, fontSize: 9.5, fontWeight: "900", letterSpacing: 1.5, marginBottom: 2 },
  exampleRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  exampleText: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: "600", fontStyle: "italic" },
  modeRow: { flexDirection: "row", gap: 10, width: "100%", marginBottom: 6 },
  modeBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, borderRadius: 14, borderWidth: 1.2, borderColor: "rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.02)" },
  modeBtnActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  modeText: { color: "#FFF", fontSize: 12, fontWeight: "800" },
  field: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.02)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", borderRadius: 16, paddingHorizontal: 14, gap: 10, width: "100%" },
  input: { flex: 1, color: "#FFF", paddingVertical: 14, fontSize: 14 },
  label: { color: colors.textSecondary, fontSize: 9, fontWeight: "900", letterSpacing: 1.5, alignSelf: "flex-start", marginTop: 8 },
  genderRow: { flexDirection: "row", gap: 10, width: "100%", marginBottom: 10 },
  genderBtn: { flex: 1, paddingVertical: 12, borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", alignItems: "center", backgroundColor: "rgba(255,255,255,0.02)" },
  genderBtnActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  genderText: { color: "#FFF", fontWeight: "800" },
  primaryBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: colors.gold, width: "100%", paddingVertical: 14, borderRadius: 24, marginTop: 12, shadowColor: colors.gold, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  primaryBtnText: { color: "#000", fontWeight: "900", letterSpacing: 1.5 },
  errorText: { color: colors.error, fontSize: 12, fontWeight: "600", alignSelf: "center", marginTop: 4 },
  rippleOverlay: {
    position: "absolute",
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: (width * 1.5) / 2,
    borderWidth: 1.5,
    backgroundColor: "transparent",
    top: height / 2 - (width * 1.5) / 2,
    left: width / 2 - (width * 1.5) / 2,
    zIndex: 99,
  },
  particle: {
    position: "absolute",
    backgroundColor: colors.gold,
    zIndex: 1,
  },
  restaurantLocationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(212,175,55,0.08)",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.25)",
    borderRadius: 16,
    padding: 16,
    width: "100%",
  },
  restaurantLocationLabel: {
    color: colors.gold,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  restaurantLocationText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
  },
  lottieAnim: {
    width: 220,
    height: 220,
    alignSelf: "center",
    marginBottom: 2,
  },
  mapSelectBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.2,
    borderColor: colors.gold,
    borderRadius: 16,
    paddingVertical: 12,
    width: "100%",
    backgroundColor: "rgba(212,175,55,0.04)",
  },
  mapSelectBtnText: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  mapSafe: {
    flex: 1,
    backgroundColor: "#0C0907",
  },
  mapHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
    backgroundColor: "#0C0907",
  },
  mapBackBtn: {
    padding: 6,
  },
  mapHeaderTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "800",
  },
  mapDoneBtn: {
    backgroundColor: colors.gold,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  mapDoneBtnText: {
    color: "#000",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
  },
  mapSearchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
    paddingVertical: 8,
  },
  mapSearchInput: {
    flex: 1,
    color: "#FFF",
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  mapFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
    backgroundColor: "#0C0907",
  },
  mapFooterPin: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(212,175,55,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  mapFooterLabel: {
    color: colors.gold,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  mapFooterText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "600",
  },
  bottomIndicator: {
    position: "absolute",
    bottom: 80,
    right: 24,
    zIndex: 10,
  },
});