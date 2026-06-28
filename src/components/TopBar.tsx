import { useApp } from "@/src/context/AppContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import { colors } from "@/src/theme";
import React from "react";
import { Animated as RNAnimated, StyleSheet, Text, TouchableOpacity, View, TextInput } from "react-native";
import Animated, { useAnimatedStyle, interpolate, SharedValue, useAnimatedReaction, runOnJS } from "react-native-reanimated";

type TopBarProps = {
  variant?: "full" | "minimal";
  scrollY?: number;
  menuScrollY?: SharedValue<number>;
  search?: string;
  setSearch?: (text: string) => void;
  cartRef?: React.RefObject<any>;
};

export default function TopBar({ variant = "full", scrollY, menuScrollY, search, setSearch, cartRef }: TopBarProps) {
  const { cartBumpAnim, selectedAddress, cart } = useApp();
  const router = useRouter();
  
  const cartCount = cart?.reduce((sum, item) => sum + item.qty, 0) || 0;
  
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

  const searchIconStyle = useAnimatedStyle(() => {
    if (!menuScrollY) return { opacity: 0, transform: [{ scale: 0 }] };
    const opacity = interpolate(menuScrollY.value, [80, 150], [0, 1], "clamp");
    const scale = interpolate(menuScrollY.value, [80, 150], [0, 1], "clamp");
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  if (variant === "minimal") {
    return (
      <View style={[styles.minimalBar, { zIndex: 100 }]}>
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

          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            {!showInlineSearch && (
              <Animated.View style={searchIconStyle}>
                <TouchableOpacity onPress={() => setShowInlineSearch(true)} activeOpacity={0.85} style={styles.headerSearchBtn}>
                  <Ionicons name="search-outline" size={20} color="#D4AF37" />
                </TouchableOpacity>
              </Animated.View>
            )}

            <RNAnimated.View ref={cartRef} style={styles.heartBtn}>
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

        <RNAnimated.View ref={cartRef} style={[styles.heartBtn, cartStyle]}>
          <TouchableOpacity onPress={onCartPress} activeOpacity={0.85} style={styles.heartBtnInner}>
            <Ionicons name="cart-outline" size={22} color="#D4AF37" />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </RNAnimated.View>
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
    paddingHorizontal: 16,
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
    paddingHorizontal: 16,
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
});