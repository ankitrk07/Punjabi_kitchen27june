import { useApp } from "@/src/context/AppContext";
import { colors } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React from "react";
import { Animated as RNAnimated, StyleSheet, Text, TextInput, TouchableOpacity, View, Image } from "react-native";
import Animated, { interpolate, runOnJS, SharedValue, useAnimatedReaction, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

type TopBarProps = {
  variant?: "full" | "minimal";
  scrollY?: number;
  menuScrollY?: SharedValue<number>;
  search?: string;
  setSearch?: (text: string) => void;
  cartRef?: React.RefObject<any>;
  isOrdersTab?: boolean;
  showProfile?: boolean;
  onExplorePress?: () => void;
};

export default function TopBar({ variant = "full", scrollY, menuScrollY, search, setSearch, cartRef, isOrdersTab, showProfile = false, onExplorePress }: TopBarProps) {
  const { cartBumpAnim, selectedAddress, cart, user } = useApp();
  const router = useRouter();

  const userName = user?.name || "Guest";
  const initial = userName.charAt(0).toUpperCase();
  const avatarUrl = user?.avatar;

  const cartCount = cart?.reduce((sum, item) => sum + item.qty, 0) || 0;

  const [playCartAnim, setPlayCartAnim] = React.useState(false);
  const prevCartCountRef = React.useRef(cartCount);
  const minimalNewCartRef = React.useRef<LottieView>(null);
  const fullNewCartRef = React.useRef<LottieView>(null);
  const cartFadeAnim = React.useRef(new RNAnimated.Value(0)).current;
  const iconOpacity = React.useRef(new RNAnimated.Value(1)).current;

  const startTimerRef = React.useRef<any>(null);
  const crossFadeTimerRef = React.useRef<any>(null);
  const fallbackTimerRef = React.useRef<any>(null);  const isAnimatingRef = React.useRef(false);

  const triggerCartAnimation = React.useCallback(() => {
    isAnimatingRef.current = true;

    // 1. Immediately hide the static icon, show Lottie instantly
    iconOpacity.setValue(0);
    cartFadeAnim.setValue(1);
    setPlayCartAnim(true);

    // 2. Clear any active animation timers
    if (startTimerRef.current) clearTimeout(startTimerRef.current);
    if (crossFadeTimerRef.current) clearTimeout(crossFadeTimerRef.current);
    if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);

    // 3. Start play head explicitly from frame 0 concurrently with no delay
    minimalNewCartRef.current?.reset();
    fullNewCartRef.current?.reset();
    minimalNewCartRef.current?.play();
    fullNewCartRef.current?.play();

    // 4. Cross-fade at the end: starts at 0ms + 7200ms - 600ms = 6600ms
    crossFadeTimerRef.current = setTimeout(() => {
      RNAnimated.parallel([
        RNAnimated.timing(cartFadeAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        RNAnimated.timing(iconOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setPlayCartAnim(false);
        isAnimatingRef.current = false;
      });
    }, 6600);

    // 5. Fallback cleanup
    fallbackTimerRef.current = setTimeout(() => {
      setPlayCartAnim(false);
      isAnimatingRef.current = false;
    }, 7300);
  }, [cartFadeAnim, iconOpacity]);

  // Synchronous cart check in render phase as a fallback
  if (cartCount > prevCartCountRef.current) {
    prevCartCountRef.current = cartCount;
    if (!isAnimatingRef.current) {
      triggerCartAnimation();
    }
  }

  // Listen to cartBumpAnim synchronous triggers for absolute instant starts
  React.useEffect(() => {
    const listenerId = cartBumpAnim.addListener(({ value }) => {
      // Trigger when bump starts (value becomes greater than 0.05)
      if (value > 0.05 && !isAnimatingRef.current) {
        triggerCartAnimation();
      }
    });
    return () => {
      cartBumpAnim.removeListener(listenerId);
    };
  }, [cartBumpAnim, triggerCartAnimation]);

  React.useEffect(() => {
    return () => {
      if (startTimerRef.current) clearTimeout(startTimerRef.current);
      if (crossFadeTimerRef.current) clearTimeout(crossFadeTimerRef.current);
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    };
  }, []);
  const progress = Math.min((scrollY ?? 0) / 84, 1);
  const hideLocations = progress > 0.28;
  const showCartPocket = progress > 0.08;
  const barStyle = {
    transform: [{ translateY: -progress * 6 }],
  };
  const leftStyle = {
    transform: [{ translateY: -progress * 3 }, { scale: 1 - progress * 0.08 }],
    opacity: hideLocations ? 0 : 1 - progress * 2.4,
  };
  const iconStyle = {
    transform: [{ translateY: -progress * 2 }, { scale: 1 - progress * 0.14 }],
  };
  const copyStyle = {
    transform: [{ translateY: -progress * 2 }],
    opacity: hideLocations ? 0 : 1 - progress * 2.6,
  };
  const cartStyle = {
    transform: [{ translateY: -progress * 4 }, { scale: 1 - progress * 0.08 }],
  };

  const openLocations = () => {
    router.push("/profile/addresses");
  };

  const onCartPress = () => {
    RNAnimated.sequence([
      RNAnimated.timing(cartBumpAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      RNAnimated.timing(cartBumpAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      router.push("/cart");
    });
  };

  const [showInlineSearch, setShowInlineSearch] = React.useState(false);
  const inlineInputRef = React.useRef<TextInput>(null);

  React.useEffect(() => {
    if (showInlineSearch) {
      setTimeout(() => {
        inlineInputRef.current?.focus();
      }, 50);
    }
  }, [showInlineSearch]);

  useAnimatedReaction(
    () => menuScrollY?.value ?? 0,
    (y) => {
      if (y < 40 && showInlineSearch) {
        runOnJS(setShowInlineSearch)(false);
      }
    }
  );

  const cartAnimStyle = useAnimatedStyle(() => {
    // Cart stays in place — no movement on scroll
    return { transform: [{ translateX: 0 }] };
  });

  const searchIconStyle = useAnimatedStyle(() => {
    if (!menuScrollY) return { opacity: 0, transform: [{ scale: 0 }, { translateX: 0 }] };
    const opacity = interpolate(menuScrollY.value, [110, 150], [0, 1], "clamp");
    const scale = interpolate(menuScrollY.value, [110, 150], [0, 1], "clamp");
    const translateX = interpolate(menuScrollY.value, [110, 150], [-15, 0], "clamp");
    return {
      opacity,
      transform: [{ scale }, { translateX }],
    };
  });

  const exploreIconStyle = useAnimatedStyle(() => {
    if (!menuScrollY) return { opacity: 0, transform: [{ scale: 0 }, { translateX: 0 }] };
    const opacity = interpolate(menuScrollY.value, [110, 150], [0, 1], "clamp");
    const scale = interpolate(menuScrollY.value, [110, 150], [0, 1], "clamp");
    const translateX = interpolate(menuScrollY.value, [110, 150], [-15, 0], "clamp");
    return {
      opacity,
      transform: [{ scale }, { translateX }],
    };
  });

  if (variant === "minimal") {
    return (
      <View style={[styles.minimalBar, { zIndex: 100 }, isOrdersTab ? { paddingRight: 10 } : null]}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          {showInlineSearch ? (
            <View style={styles.inlineSearchWrapper}>
              <Ionicons name="search-outline" size={18} color="#D4AF37" />
              <TextInput
                ref={inlineInputRef}
                value={search}
                onChangeText={setSearch}
                placeholder="Search menu..."
                placeholderTextColor="rgba(255,255,255,0.4)"
                style={styles.inlineSearchInput}
              />
              <TouchableOpacity onPress={() => { setShowInlineSearch(false); setSearch?.(""); }}>
                <Ionicons name="close" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={{ color: "#FFF", fontSize: 18, fontWeight: "900", letterSpacing: 0.5 }}>Punjabi Kitchen</Text>
          )}

          <View style={{ flexDirection: "row", alignItems: "center", position: "relative" }}>
            {/* Search & Explore fade in to the LEFT of cart */}
            {!showInlineSearch && !isOrdersTab && (
              <Animated.View style={[searchIconStyle, { marginRight: 8 }]}>
                <TouchableOpacity onPress={() => setShowInlineSearch(true)} activeOpacity={0.85} style={styles.headerSearchBtn}>
                  <Ionicons name="search-outline" size={20} color="#D4AF37" />
                </TouchableOpacity>
              </Animated.View>
            )}

            {!showInlineSearch && !isOrdersTab && onExplorePress && (
              <Animated.View style={[exploreIconStyle, { marginRight: 8 }]}>
                <TouchableOpacity onPress={onExplorePress} activeOpacity={0.85} style={styles.headerSearchBtn}>
                  <Ionicons name="book-outline" size={20} color="#D4AF37" />
                </TouchableOpacity>
              </Animated.View>
            )}

            {/* Cart icon — always stays in its rightmost position */}
            <View>
              <View style={{ position: "relative", alignItems: "center", justifyContent: "center" }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  {showProfile && (
                    <TouchableOpacity
                      onPress={() => router.replace("/(tabs)/profile")}
                      activeOpacity={0.75}
                      style={styles.avatarTouch}
                    >
                      <LinearGradient
                        colors={["#F0D488", "#C9A84C"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.avatarBorder}
                      >
                        <View style={styles.avatarBg}>
                          {avatarUrl ? (
                            <Image
                              source={{ uri: avatarUrl }}
                              style={styles.avatarImage}
                              resizeMode="cover"
                            />
                          ) : (
                            <Text style={styles.avatarText}>{initial}</Text>
                          )}
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}

                  <RNAnimated.View ref={cartRef} style={[styles.heartBtn, { zIndex: 2 }]}>
                    <TouchableOpacity onPress={onCartPress} activeOpacity={0.85} style={styles.heartBtnInner}>
                      {/* Static icon always visible underneath, but animated opacity */}
                      <RNAnimated.View style={{ opacity: iconOpacity }}>
                        <Ionicons name="cart-outline" size={22} color="#D4AF37" />
                      </RNAnimated.View>
                      {/* Lottie overlaid on top, fades out to reveal icon */}
                      <RNAnimated.View style={{ position: "absolute", opacity: cartFadeAnim, pointerEvents: "none" }}>
                        <LottieView
                          ref={minimalNewCartRef}
                          source={require("../../assets/new-cart.json")}
                          autoPlay={false}
                          loop={false}
                          speed={0.85}
                          style={{ width: 28, height: 28 }}
                          colorFilters={[
                            { keypath: "**.Fond 1", color: "#000000" },
                            { keypath: "**.Contour 1", color: "#D4AF37" },
                            { keypath: "ROUE Silhouettes.**", color: "#D4AF37" },
                            { keypath: "BAC Silhouettes.**", color: "#D4AF37" },
                            { keypath: "CADRE Silhouettes.**", color: "#D4AF37" }
                          ]}
                        />
                      </RNAnimated.View>
                      {cartCount > 0 && (
                        <View style={styles.cartBadge}>
                          <Text style={styles.cartBadgeText}>{cartCount}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </RNAnimated.View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.barShell, barStyle]}>
      <View pointerEvents="none" style={[styles.cartShadow, { opacity: showCartPocket ? 1 : 0 }]}>
        <LinearGradient
          colors={[
            "rgba(0,0,0,0)",
            "rgba(0,0,0,0.24)",
            "rgba(0,0,0,0.80)",
            "rgba(0,0,0,0.98)",
          ]}
          locations={[0, 0.34, 0.7, 1]}
          style={StyleSheet.absoluteFill}
        />
      </View>
      <LinearGradient
        colors={[
          'rgba(0, 0, 0, 0.90)',
          'rgba(0, 0, 0, 0.65)',
          'rgba(0, 0, 0, 0.20)',
          'rgba(0, 0, 0, 0.00)'
        ]}
        locations={[0, 0.4, 0.75, 1]}
        style={styles.bar}
      >
        <TouchableOpacity
          style={[styles.locationWrap, leftStyle, hideLocations ? styles.locationHidden : null]}
          onPress={openLocations}
          activeOpacity={0.8}
        >
          <View style={iconStyle}>
            <Ionicons name="location-outline" size={25} color="#ffffff" />
          </View>

          <View style={[styles.locationCopy, copyStyle]}>
            <View style={styles.titleRow}>
              <Text style={styles.locationTitle} numberOfLines={1}>
                {selectedAddress?.label || "Select location"}
              </Text>
              <Ionicons name="chevron-down" size={12} color="rgba(255, 255, 255, 0.7)" style={styles.chevron} />
            </View>

            <Text style={styles.locationSub} numberOfLines={1}>
              {selectedAddress?.line || "Tap to add address"}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {showProfile && (
            <TouchableOpacity
              onPress={() => router.replace("/(tabs)/profile")}
              activeOpacity={0.75}
              style={styles.avatarTouch}
            >
              <LinearGradient
                colors={["#F0D488", "#C9A84C"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatarBorder}
              >
                <View style={styles.avatarBg}>
                  {avatarUrl ? (
                    <Image
                      source={{ uri: avatarUrl }}
                      style={styles.avatarImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={styles.avatarText}>{initial}</Text>
                  )}
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}

          <RNAnimated.View ref={cartRef} style={[cartStyle, { zIndex: 2 }]}>
            <View style={[styles.heartBtn, { zIndex: 2 }]}>
              <TouchableOpacity onPress={onCartPress} activeOpacity={0.85} style={styles.heartBtnInner}>
                {/* Static icon always visible underneath, but animated opacity */}
                <RNAnimated.View style={{ opacity: iconOpacity }}>
                  <Ionicons name="cart-outline" size={22} color="#D4AF37" />
                </RNAnimated.View>
                {/* Lottie overlaid on top, fades out to reveal icon */}
                <RNAnimated.View style={{ position: "absolute", opacity: cartFadeAnim, pointerEvents: "none" }}>
                  <LottieView
                    ref={fullNewCartRef}
                    source={require("../../assets/new-cart.json")}
                    autoPlay={false}
                    loop={false}
                    speed={0.85}
                    style={{ width: 24, height: 24 }}
                    colorFilters={[
                      { keypath: "ROUE Silhouettes", color: "#D4AF37" },
                      { keypath: "BAC Silhouettes", color: "#D4AF37" },
                      { keypath: "CADRE Silhouettes", color: "#D4AF37" },
                      { keypath: "Forme 1", color: "#D4AF37" },
                      { keypath: "Rectangle 1", color: "#D4AF37" },
                      { keypath: "Ellipse 1", color: "#D4AF37" },
                      { keypath: "**", color: "#D4AF37" }
                    ]}
                  />
                </RNAnimated.View>
                {cartCount > 0 && (
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>{cartCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </RNAnimated.View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  barShell: {
    zIndex: 20,
    elevation: 20,
    position: "relative",
  },

  cartShadow: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 128,
    borderBottomLeftRadius: 20,
    overflow: "hidden",
  },

  bar: {
    height: 74,
    paddingTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 16,
    paddingRight: 18,
  },

  locationWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  locationHidden: {
    width: 0,
    flexGrow: 0,
    flexBasis: 0,
    marginRight: 0,
  },

  locationCopy: {
    flex: 1,
    minWidth: 0,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  chevron: {
    marginTop: 1,
  },

  locationTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.2,
    // Intense text shadow ensures clean legibility over changing background imagery assets
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  locationSub: {
    color: "rgba(235, 230, 220, 0.8)", // Clean luxury ivory tint for optimal visual contrast
    fontSize: 11,
    marginTop: 1,
    letterSpacing: 0.1,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  heartBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.3)", // Glassmorphic translucent dark backplate
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)", // Subtle golden frame accent
    alignItems: "center",
    justifyContent: "center",
  },

  heartBtnInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  minimalBar: {
    height: 56,
    backgroundColor: colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    justifyContent: "center",
    paddingLeft: 16,
    paddingRight: 18,
  },

  cartBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#D4AF37",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#000",
  },

  cartBadgeText: {
    color: "#000",
    fontSize: 10,
    fontWeight: "bold",
    paddingHorizontal: 4,
  },
  inlineSearchWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 20,
    paddingHorizontal: 12,
    marginRight: 12,
    height: 38,
  },
  inlineSearchInput: {
    flex: 1,
    color: "#FFF",
    fontSize: 14,
    marginLeft: 8,
    padding: 0,
  },
  headerSearchBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)",
  },
  avatarTouch: {
    marginRight: 4,
    shadowColor: "#C9A84C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarBorder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    padding: 1.2,
  },
  avatarBg: {
    flex: 1,
    backgroundColor: "#111",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 15,
  },
  avatarText: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: "800",
  },
});