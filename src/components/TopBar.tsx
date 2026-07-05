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
};

export default function TopBar({ variant = "full", scrollY, menuScrollY, search, setSearch, cartRef, isOrdersTab, showProfile = false }: TopBarProps) {
  const { cartBumpAnim, selectedAddress, cart, user } = useApp();
  const router = useRouter();

  const userName = user?.name || "Guest";
  const initial = userName.charAt(0).toUpperCase();
  const avatarUrl = user?.avatar;

  const cartCount = cart?.reduce((sum, item) => sum + item.qty, 0) || 0;

  const [playCartAnim, setPlayCartAnim] = React.useState(false);
  const prevCartCountRef = React.useRef(cartCount);

  React.useEffect(() => {
    if (cartCount > prevCartCountRef.current) {
      setPlayCartAnim(true);
    }
    prevCartCountRef.current = cartCount;
  }, [cartCount]);

  const animProgress = useSharedValue(0);
  const minimalLottieRef = React.useRef<LottieView>(null);
  const fullLottieRef = React.useRef<LottieView>(null);

  React.useEffect(() => {
    if (playCartAnim) {
      animProgress.value = 0;
      animProgress.value = withTiming(1, { duration: 400 });

      const lottieTimer = setTimeout(() => {
        minimalLottieRef.current?.play(0, 100);
        fullLottieRef.current?.play(0, 100);
      }, 50);

      const hideTimer = setTimeout(() => {
        animProgress.value = withTiming(0, { duration: 400 }, (finished) => {
          if (finished) {
            runOnJS(setPlayCartAnim)(false);
          }
        });
      }, 1600);

      return () => {
        clearTimeout(lottieTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [playCartAnim]);

  const wrapperStyle = useAnimatedStyle(() => {
    const opacity = animProgress.value;
    const translateX = interpolate(animProgress.value, [0, 1], [40, 0]);
    return {
      opacity,
      transform: [{ translateX }],
    };
  });

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
    if (!menuScrollY || showInlineSearch) return { transform: [{ translateX: 0 }] };
    const translateX = interpolate(menuScrollY.value, [80, 150], [54, 0], "clamp");
    return {
      transform: [{ translateX }],
    };
  });

  const searchIconStyle = useAnimatedStyle(() => {
    if (!menuScrollY) return { opacity: 0, transform: [{ scale: 0 }, { translateX: 0 }] };
    const opacity = interpolate(menuScrollY.value, [80, 150], [0, 1], "clamp");
    const scale = interpolate(menuScrollY.value, [80, 150], [0, 1], "clamp");
    const translateX = interpolate(menuScrollY.value, [80, 150], [-54, 0], "clamp");
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
            <Animated.View style={cartAnimStyle}>
              <View style={{ position: "relative", alignItems: "center", justifyContent: "center" }}>
                {playCartAnim && (
                  <Animated.View
                    style={[
                      {
                        position: "absolute",
                        left: -70,
                        width: 75,
                        height: 75,
                        zIndex: -1,
                      },
                      wrapperStyle,
                    ]}
                  >
                    <LottieView
                      ref={minimalLottieRef}
                      source={require("../../assets/cart.json")}
                      loop={false}
                      speed={1.6}
                      style={{ width: "100%", height: "100%" }}
                    />
                  </Animated.View>
                )}
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
                      <Ionicons name="cart-outline" size={22} color="#D4AF37" />
                      {cartCount > 0 && (
                        <View style={styles.cartBadge}>
                          <Text style={styles.cartBadgeText}>{cartCount}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </RNAnimated.View>
                </View>
              </View>
            </Animated.View>

            {!showInlineSearch && !isOrdersTab && (
              <Animated.View style={[searchIconStyle, { marginLeft: 12 }]}>
                <TouchableOpacity onPress={() => setShowInlineSearch(true)} activeOpacity={0.85} style={styles.headerSearchBtn}>
                  <Ionicons name="search-outline" size={20} color="#D4AF37" />
                </TouchableOpacity>
              </Animated.View>
            )}
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
            <View style={{ position: "relative", alignItems: "center", justifyContent: "center" }}>
              {playCartAnim && (
                <Animated.View
                  style={[
                    {
                      position: "absolute",
                      left: -70,
                      width: 75,
                      height: 75,
                      zIndex: -1,
                    },
                    wrapperStyle,
                  ]}
                >
                  <LottieView
                    ref={fullLottieRef}
                    source={require("../../assets/cart.json")}
                    loop={false}
                    speed={1.6}
                    style={{ width: "100%", height: "100%" }}
                  />
                </Animated.View>
              )}
              <View style={[styles.heartBtn, { zIndex: 2 }]}>
                <TouchableOpacity onPress={onCartPress} activeOpacity={0.85} style={styles.heartBtnInner}>
                  <Ionicons name="cart-outline" size={22} color="#D4AF37" />
                  {cartCount > 0 && (
                    <View style={styles.cartBadge}>
                      <Text style={styles.cartBadgeText}>{cartCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
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