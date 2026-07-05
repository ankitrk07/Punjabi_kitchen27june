import { colors } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React, { useEffect, useRef } from "react";
import {
    Animated,
    Dimensions,
    FlatList,
    Image,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");
const CARD_W = Math.round(width * 0.68);
const SIDE_SPACING = Math.round((width - CARD_W) / 2);
const SNAP_INTERVAL = CARD_W + 16;
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList as any);

export type Offer = {
  id: string;
  title: string;
  subtitle?: string;
  price?: string | number;
  originalPrice?: string | number;
  image?: string;
  badge?: string;
};

type Props = {
  offers: Offer[];
  testID?: string;
  showPlaceholder?: boolean; // when true, show placeholder instead of hiding
  onAddPress?: (id: string) => void;
};

export default function DailyOffersCarousel({ offers, testID = "daily-offers", showPlaceholder = false, onAddPress }: Props) {
  const scrollX = useRef(new Animated.Value(0)).current;
  const listRef = useRef<FlatList<Offer> | null>(null);
  const autoIndex = useRef(0);

  const loopData = offers && offers.length > 1 ? [...offers, ...offers, ...offers] : offers;

  useEffect(() => {
    if (!loopData || loopData.length <= 1) return;

    const base = offers.length;
    const startIndex = base;
    requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({ index: startIndex, animated: false });
      autoIndex.current = startIndex;
    });

    const timer = setInterval(() => {
      const next = autoIndex.current + 1;
      const maxIndex = loopData.length - 1;
      autoIndex.current = next > maxIndex ? base : next;
      listRef.current?.scrollToIndex({ index: autoIndex.current, animated: true });
    }, 2800);

    return () => clearInterval(timer);
  }, [loopData, offers.length]);

  if (!offers || offers.length === 0) {
    if (!showPlaceholder) return null;

    return (
      <View style={styles.wrapper} testID={`${testID}-placeholder`}>
        <BlurView intensity={70} tint="dark" style={styles.placeholderCard}>
          <View style={styles.placeholderContent}>
            <Ionicons name="sparkles" size={28} color={colors.gold} />
            <Text style={styles.placeholderTitle}>Daily Dish Offers</Text>
            <Text style={styles.placeholderSub}>Check back later for curated delights.</Text>
          </View>
        </BlurView>
      </View>
    );
  }

  const renderItem = ({ item, index }: { item: Offer; index: number }) => {
    const inputRange = [(index - 1) * SNAP_INTERVAL, index * SNAP_INTERVAL, (index + 1) * SNAP_INTERVAL];
    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.92, 1, 0.92],
      extrapolate: "clamp",
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.7, 1, 0.7],
      extrapolate: "clamp",
    });

    const animatedStyle = { transform: [{ scale }], opacity } as any;

    return (
      <View style={{ width: CARD_W, paddingHorizontal: 8 }}>
        <Animated.View style={[styles.cardContainer, animatedStyle]}>
          <BlurView intensity={80} tint="dark" style={styles.blurCard}>
            <Pressable
              android_ripple={{ color: "rgba(255,255,255,0.04)" }}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() => {
                // micro interaction: could open offer details
              }}
              testID={`offer-${item.id}`}
            >
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
              ) : (
                <View style={styles.fallbackImage} />
              )}

              <View style={styles.cardBody}>
                <View style={styles.rowTop}>
                  <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                  {item.badge ? (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                  ) : null}
                </View>

                {item.subtitle ? <Text style={styles.subtitle} numberOfLines={2}>{item.subtitle}</Text> : null}

                <View style={styles.rowBottom}>
                  <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}>
                    <Text style={styles.priceText}>₹{item.price}</Text>
                    {item.originalPrice ? (
                      <Text style={styles.originalPriceText}>₹{item.originalPrice}</Text>
                    ) : null}
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.addButton}
                    onPress={() => onAddPress?.(item.id)}
                  >
                    <Ionicons name="add" size={13} color="#0A0A0A" />
                    <Text style={styles.addButtonText}>ADD</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Pressable>
          </BlurView>
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={[styles.wrapper, { height: 200 }]} testID={testID}>
      <AnimatedFlatList
        ref={(node: any) => { listRef.current = node; }}
        data={loopData as Offer[]}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SNAP_INTERVAL}
        snapToAlignment="center"
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: SIDE_SPACING, alignItems: "center" }}
        keyExtractor={(i: Offer, index: number) => `${i.id}-${index}`}
        renderItem={renderItem}
        nestedScrollEnabled
        scrollEventThrottle={16}
        getItemLayout={(_: any, index: number) => ({ length: SNAP_INTERVAL, offset: SNAP_INTERVAL * index, index })}
        onMomentumScrollEnd={(event: any) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / SNAP_INTERVAL);
          autoIndex.current = index;
          if (offers.length > 1) {
            const base = offers.length;
            const total = loopData.length;
            if (index < base) {
              const nextIndex = index + base;
              autoIndex.current = nextIndex;
              listRef.current?.scrollToIndex({ index: nextIndex, animated: false });
            } else if (index >= total - base) {
              const nextIndex = index - base;
              autoIndex.current = nextIndex;
              listRef.current?.scrollToIndex({ index: nextIndex, animated: false });
            }
          }
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingVertical: 8, overflow: "hidden" },
  cardContainer: {
    borderRadius: 18,
  },
  blurCard: {
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "rgba(18, 12, 10, 0.75)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.25)",
  },
  card: {
    width: "100%",
    height: 170,
    backgroundColor: Platform.OS === "android" ? "rgba(255,255,255,0.02)" : "transparent",
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
  },
  cardPressed: { transform: [{ scale: 0.993 }], shadowOpacity: 0.6 },
  image: { width: "100%", height: 88 },
  fallbackImage: { width: "100%", height: 88, backgroundColor: "rgba(255,255,255,0.03)" },
  cardBody: { padding: 10, gap: 6 },
  rowTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { color: "#FFF", fontSize: 16, fontWeight: "800", flex: 1, marginRight: 8 },
  subtitle: { color: colors.textSecondary, fontSize: 12 },
  badge: { backgroundColor: colors.gold, paddingHorizontal: 8, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  badgeText: { color: "#0A0A0A", fontSize: 10, fontWeight: "800" },
  rowBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
  priceWrap: { backgroundColor: "rgba(212,175,55,0.08)", paddingHorizontal: 10, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  priceText: { color: colors.gold, fontSize: 14, fontWeight: "900" },
  originalPriceText: {
    color: "rgba(255, 255, 255, 0.36)",
    fontSize: 11,
    textDecorationLine: "line-through",
    fontWeight: "600",
  },
  addButton: {
    backgroundColor: colors.gold,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    height: 28,
    borderRadius: 14,
    gap: 2,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  addButtonText: {
    color: "#0A0A0A",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  placeholderCard: { borderRadius: 14, padding: 16, marginHorizontal: 16 },
  placeholderContent: { alignItems: "center", gap: 6 },
  placeholderTitle: { color: "#FFF", fontSize: 16, fontWeight: "800" },
  placeholderSub: { color: colors.textSecondary, fontSize: 13, textAlign: "center", maxWidth: 260 },
});
