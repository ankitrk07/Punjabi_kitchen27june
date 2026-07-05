import CategoryFilterBar from "@/src/components/menu/CategoryFilterBar";
import DietaryFilter, { DishTypeFilter, PriceRangeFilter } from "@/src/components/menu/DietaryFilter";
import MenuEmptyState from "@/src/components/menu/MenuEmptyState";
import MenuSearchBar from "@/src/components/menu/MenuSearchBar";
import MenuSection from "@/src/components/menu/MenuSection";
import TopBar from "@/src/components/TopBar";
import { useApp } from "@/src/context/AppContext";
import { useTabBarAnimation } from "@/src/context/TabBarAnimationContext";
import { CATEGORIES, DISHES } from "@/src/data/menu";
import { useTabBarScrollHandler } from "@/src/hooks/useTabBarScrollHandler";
import { colors } from "@/src/theme";
import { storage } from "@/src/utils/storage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, Platform, RefreshControl, Animated as RNAnimated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { useSharedValue } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const ALL_FILTER = { id: "all", name: "All", icon: "grid", image: "" };

export type SortOption = "popular" | "price-asc" | "price-desc" | "rating";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface FlyingDishProps {
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  image: string;
  targetX: number;
  targetY: number;
  viewMode: "grid" | "cinematic";
  onAnimationComplete: () => void;
}

const FlyingDish: React.FC<FlyingDishProps> = ({
  startX,
  startY,
  startWidth,
  startHeight,
  image,
  targetX,
  targetY,
  viewMode,
  onAnimationComplete,
}) => {
  const animatedX = useRef(new RNAnimated.Value(startX)).current;
  const animatedY = useRef(new RNAnimated.Value(startY)).current;
  const animatedScale = useRef(new RNAnimated.Value(1)).current;
  const animatedOpacity = useRef(new RNAnimated.Value(1)).current;
  const animatedRotation = useRef(new RNAnimated.Value(0)).current;

  const imageWidth = startWidth;
  const imageHeight = viewMode === "cinematic" ? 140 : 160;

  useEffect(() => {
    // 1. Pop out of the page (lift slightly and scale up)
    RNAnimated.parallel([
      RNAnimated.timing(animatedScale, {
        toValue: 1.15,
        duration: 200,
        useNativeDriver: true,
      }),
      RNAnimated.timing(animatedY, {
        toValue: startY - 20,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // 2. Flight path to the cart (curved fall, rotation, fade and scale down)
      RNAnimated.parallel([
        RNAnimated.timing(animatedX, {
          toValue: targetX - imageWidth / 2,
          duration: 650,
          useNativeDriver: true,
        }),
        RNAnimated.timing(animatedY, {
          toValue: targetY - imageHeight / 2,
          duration: 650,
          useNativeDriver: true,
        }),
        RNAnimated.timing(animatedScale, {
          toValue: 0.08,
          duration: 650,
          useNativeDriver: true,
        }),
        RNAnimated.timing(animatedRotation, {
          toValue: 1, // spin 1.5 times (540 deg)
          duration: 650,
          useNativeDriver: true,
        }),
        RNAnimated.sequence([
          RNAnimated.delay(450),
          RNAnimated.timing(animatedOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        onAnimationComplete();
      });
    });
  }, []);

  const rotate = animatedRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "540deg"],
  });

  return (
    <RNAnimated.Image
      source={{ uri: image }}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: imageWidth,
        height: imageHeight,
        borderRadius: viewMode === "cinematic" ? 20 : 16,
        borderWidth: 2,
        borderColor: colors.gold,
        transform: [
          { translateX: animatedX },
          { translateY: animatedY },
          { scale: animatedScale },
          { rotate: rotate },
        ],
        opacity: animatedOpacity,
        zIndex: 99999,
      }}
    />
  );
};

export default function MenuScreen() {
  const { addToCart, dishes: apiDishes, categories: apiCategories, cartBumpAnim, refreshAllData, favorites: favoritesIds, toggleFavorite } = useApp();
  const scrollY = useSharedValue(0);
  const { animatedTranslateY, hiddenOffset } = useTabBarAnimation();
  const { onScroll } = useTabBarScrollHandler(animatedTranslateY, hiddenOffset, scrollY);
  const router = useRouter();

  const filters = useMemo(() => {
    const list = apiCategories && apiCategories.length > 0 ? apiCategories : CATEGORIES;
    return [ALL_FILTER, ...list.filter(cat => cat.parentId === null)];
  }, [apiCategories]);

  // Filter states
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSubTab, setSelectedSubTab] = useState<string>("all");

  useEffect(() => {
    setSelectedSubTab("all");
  }, [selectedCategory]);

  const [dishType, setDishType] = useState<DishTypeFilter>("all");
  const [priceRange, setPriceRange] = useState<PriceRangeFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [viewMode, setViewMode] = useState<"grid" | "cinematic">("grid");
  const [showExtendedFilters, setShowExtendedFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshAllData();
      setSelectedCategory("all");
      setSelectedSubTab("all");
      setDishType("all");
      setPriceRange("all");
      setSortBy("popular");
      setSearch("");
    } catch (e) {
      console.log("Failed to refresh menu:", e);
    } finally {
      setRefreshing(false);
    }
  };

  interface FlyingItem {
    id: string;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    image: string;
  }

  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);
  const cartButtonRef = useRef<any>(null);
  const [cartCoords, setCartCoords] = useState({ x: SCREEN_WIDTH - 37, y: 55 });

  const cardRefs = useRef<Record<string, any>>({});

  useEffect(() => {
    // Measure cart button coordinates relative to the window
    const timer = setTimeout(() => {
      cartButtonRef.current?.measureInWindow((x: number, y: number, w: number, h: number) => {
        if (w > 0 && h > 0) {
          setCartCoords({ x: x + w / 2, y: y + h / 2 });
        }
      });
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleAddToCart = (dish: any) => {
    addToCart(dish);
    const card = cardRefs.current[dish.id];
    if (card && card.measureInWindow) {
      card.measureInWindow((x: number, y: number, w: number, h: number) => {
        if (w > 0 && h > 0) {
          setFlyingItems((prev) => [
            ...prev,
            {
              id: `${dish.id}-${Date.now()}-${Math.random()}`,
              startX: x,
              startY: y,
              startWidth: w,
              startHeight: h,
              image: dish.image,
            },
          ]);
        }
      });
    }
  };

  const handleAnimationComplete = (id: string) => {
    setFlyingItems((prev) => prev.filter((item) => item.id !== id));

    // Trigger cart bump animation
    cartBumpAnim.setValue(0);
    RNAnimated.sequence([
      RNAnimated.timing(cartBumpAnim, { toValue: 1.2, duration: 150, useNativeDriver: true }),
      RNAnimated.timing(cartBumpAnim, { toValue: 1.0, duration: 150, useNativeDriver: true }),
    ]).start();
  };



  const openDish = (dish: (typeof DISHES)[number]) => {
    const card = cardRefs.current[dish.id];
    if (card?.measureInWindow) {
      card.measureInWindow((x: number, y: number, w: number, h: number) => {
        router.push({
          pathname: "/dish/[id]",
          params: {
            id: dish.id,
            fromX: String(x),
            fromY: String(y),
            fromW: String(w),
            fromH: String(h),
          },
        } as any);
      });
      return;
    }

    router.push({ pathname: "/dish/[id]", params: { id: dish.id } } as any);
  };

  const isCategoryDescendant = (childCatId: string, parentCatId: string): boolean => {
    if (childCatId === parentCatId) return true;
    const catsSource = apiCategories.length > 0 ? apiCategories : CATEGORIES;
    const parentCat = catsSource.find((c) => c.id === childCatId);
    if (!parentCat || !parentCat.parentId) return false;
    return isCategoryDescendant(parentCat.parentId, parentCatId);
  };

  const filteredDishes = useMemo(() => {
    const term = search.trim().toLowerCase();
    const dishesSource = apiDishes.length > 0 ? apiDishes : DISHES;

    let result = dishesSource.filter((dish) => {
      const itemCat = dish.category || (dish as any).categoryId || "";
      let matchesCategory = false;
      if (selectedCategory === "all") {
        matchesCategory = true;
      } else {
        if (selectedSubTab === "all") {
          matchesCategory = isCategoryDescendant(itemCat, selectedCategory);
        } else {
          matchesCategory = isCategoryDescendant(itemCat, selectedSubTab);
        }
      }
      const matchesType =
        dishType === "all" ||
        (dishType === "veg" && dish.veg) ||
        (dishType === "nonveg" && !dish.veg);
      const matchesSearch =
        term.length === 0 ||
        dish.name.toLowerCase().includes(term) ||
        dish.description.toLowerCase().includes(term) ||
        itemCat.toLowerCase().includes(term) ||
        (dish.veg ? "veg" : "non veg").includes(term);

      // Custom Price Filter
      let matchesPrice = true;
      if (priceRange === "under-200") {
        matchesPrice = dish.price <= 200;
      } else if (priceRange === "200-350") {
        matchesPrice = dish.price > 200 && dish.price <= 350;
      } else if (priceRange === "above-350") {
        matchesPrice = dish.price > 350;
      }

      return matchesCategory && matchesType && matchesSearch && matchesPrice;
    });

    // Apply sorting
    if (sortBy === "price-asc") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      result = [...result].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    }

    return result;
  }, [search, selectedCategory, selectedSubTab, dishType, priceRange, sortBy, apiDishes, apiCategories]);

  const categorySections = useMemo(() => {
    const catsSource = apiCategories.length > 0 ? apiCategories : CATEGORIES;
    let categoriesToShow = catsSource.filter((c) => c.parentId !== null);

    if (selectedCategory !== "all") {
      if (selectedSubTab === "all") {
        categoriesToShow = categoriesToShow.filter((c) => isCategoryDescendant(c.id, selectedCategory));
      } else {
        categoriesToShow = categoriesToShow.filter((c) => isCategoryDescendant(c.id, selectedSubTab));
      }
    }

    return categoriesToShow
      .map((category) => ({
        ...category,
        dishes: filteredDishes.filter((dish) => {
          const dishCat = dish.category || (dish as any).categoryId || "";
          return isCategoryDescendant(dishCat, category.id);
        }),
      }))
      .filter((section) => section.dishes.length > 0);
  }, [filteredDishes, selectedCategory, selectedSubTab, apiCategories]);



  const currentSubCats = useMemo(() => {
    if (selectedCategory === "all") return [];
    const catsSource = apiCategories.length > 0 ? apiCategories : CATEGORIES;
    return catsSource.filter((c) => c.parentId === selectedCategory);
  }, [selectedCategory, apiCategories]);



  const flatListData = useMemo(() => {
    const list: any[] = [];
    list.push({ id: "header", type: "header" });
    list.push({ id: "search", type: "search" });
    list.push({ id: "filters", type: "filters" });

    if (categorySections.length === 0) {
      list.push({ id: "empty", type: "empty" });
    } else {
      categorySections.forEach((section) => {
        list.push({ id: `section-${section.id}`, type: "section", data: section });
      });
    }
    return list;
  }, [categorySections]);

  const renderItem = useCallback(({ item }: { item: any }) => {
    switch (item.type) {
      case "header":
        return (
          <View style={styles.menuHeader}>
            <View style={{ flex: 1, paddingRight: 60 }}>
              <Text style={styles.kicker}>ROYAL CULINARY SELECTION</Text>
              <Text style={styles.headerTitle}>Master Menu</Text>
            </View>
          </View>
        );
      case "search":
        return (
          <MenuSearchBar
            value={search}
            onChangeText={setSearch}
            onClear={() => setSearch("")}
            itemCount={filteredDishes.length}
          />
        );
      case "filters":
        return (
          <View style={styles.stickyFilters}>
            <CategoryFilterBar
              filters={filters}
              selectedId={selectedCategory}
              onSelect={setSelectedCategory}
            />

            {currentSubCats.length > 0 && (
              <View style={styles.subTabsContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subTabsScroll} style={{ maxHeight: 50 }}>
                  <TouchableOpacity
                    style={[styles.subTabBtn, selectedSubTab === "all" && styles.subTabBtnActive]}
                    onPress={() => setSelectedSubTab("all")}
                  >
                    <Text style={[styles.subTabText, selectedSubTab === "all" && styles.subTabTextActive]}>All</Text>
                  </TouchableOpacity>
                  {currentSubCats.map((sc) => (
                    <TouchableOpacity
                      key={sc.id}
                      style={[styles.subTabBtn, selectedSubTab === sc.id && styles.subTabBtnActive]}
                      onPress={() => setSelectedSubTab(sc.id)}
                    >
                      <Text style={[styles.subTabText, selectedSubTab === sc.id && styles.subTabTextActive]}>{sc.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Dietary Segment Row (Spacious & Clean) */}
            <View style={styles.dietaryRow}>
              <DietaryFilter value={dishType} onChange={setDishType} />
            </View>

            {/* HUD actions Row (Spacious controls and result indicator) */}
            <View style={styles.hudRow}>
              <Text style={styles.resultCountText}>
                Showing {filteredDishes.length} {filteredDishes.length === 1 ? 'dish' : 'dishes'}
              </Text>

              <View style={styles.hudActions}>
                {/* Filter Drawer Toggle */}
                <TouchableOpacity
                  onPress={() => setShowExtendedFilters(!showExtendedFilters)}
                  style={[styles.hudBtn, (priceRange !== "all" || sortBy !== "popular") && styles.hudBtnActive]}
                >
                  <Ionicons name="options-outline" size={14} color={(priceRange !== "all" || sortBy !== "popular") ? colors.gold : colors.textPrimary} />
                  <Text style={[(priceRange !== "all" || sortBy !== "popular") ? styles.hudBtnTextActive : styles.hudBtnText]}>Filters</Text>
                </TouchableOpacity>

                {/* View Mode Toggle Switcher */}
                <View style={styles.viewToggleBox}>
                  <TouchableOpacity
                    onPress={() => setViewMode("grid")}
                    style={[styles.viewBtn, viewMode === "grid" && styles.viewBtnActive]}
                  >
                    <Ionicons name="grid-outline" size={13} color={viewMode === "grid" ? colors.gold : colors.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setViewMode("cinematic")}
                    style={[styles.viewBtn, viewMode === "cinematic" && styles.viewBtnActive]}
                  >
                    <Ionicons name="tv-outline" size={13} color={viewMode === "cinematic" ? colors.gold : colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Extended Custom Filter & Sort Drawer */}
            {showExtendedFilters && (
              <View style={styles.extendedDrawer}>
                {/* Custom Price Filters */}
                <View style={styles.filterGroup}>
                  <Text style={styles.filterGroupTitle}>PRICE RANGE</Text>
                  <View style={styles.chipGrid}>
                    {[
                      { id: "all", label: "All Prices" },
                      { id: "under-200", label: "Under ₹200" },
                      { id: "200-350", label: "₹200 - ₹350" },
                      { id: "above-350", label: "Above ₹350" },
                    ].map((p) => (
                      <TouchableOpacity
                        key={p.id}
                        onPress={() => setPriceRange(p.id as PriceRangeFilter)}
                        style={[styles.filterChip, priceRange === p.id && styles.filterChipActive]}
                      >
                        <Text style={[styles.filterChipText, priceRange === p.id && styles.filterChipTextActive]}>{p.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Sorting Options */}
                <View style={styles.filterGroup}>
                  <Text style={styles.filterGroupTitle}>SORT BY</Text>
                  <View style={styles.chipGrid}>
                    {[
                      { id: "popular", label: "Popularity" },
                      { id: "rating", label: "Top Rated ★" },
                      { id: "price-asc", label: "Price: Low to High" },
                      { id: "price-desc", label: "Price: High to Low" },
                    ].map((s) => (
                      <TouchableOpacity
                        key={s.id}
                        onPress={() => setSortBy(s.id as SortOption)}
                        style={[styles.filterChip, sortBy === s.id && styles.filterChipActive]}
                      >
                        <Text style={[styles.filterChipText, sortBy === s.id && styles.filterChipTextActive]}>{s.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            )}
          </View>
        );
      case "empty":
        return (
          <MenuEmptyState
            title="No dishes matched your filters"
            message="Try clearing your price range or category search."
          />
        );
      case "section":
        return (
          <View style={styles.sectionsWrap}>
            <MenuSection
              section={item.data}
              favorites={favoritesIds}
              onToggleFavorite={toggleFavorite}
              onAddToCart={handleAddToCart}
              onOpen={openDish}
              onCardRef={(dishId, node) => { cardRefs.current[dishId] = node; }}
              viewMode={viewMode}
            />
          </View>
        );
      default:
        return null;
    }
  }, [
    search,
    filteredDishes,
    filters,
    selectedCategory,
    currentSubCats,
    selectedSubTab,
    dishType,
    showExtendedFilters,
    priceRange,
    sortBy,
    viewMode,
    favoritesIds,
    toggleFavorite,
    handleAddToCart,
    openDish,
  ]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <TopBar
        variant="minimal"
        cartRef={cartButtonRef}
        menuScrollY={scrollY}
        search={search}
        setSearch={setSearch}
      />

      <Animated.FlatList
        data={flatListData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[2]}
        keyboardShouldPersistTaps="handled"
        onScroll={onScroll}
        scrollEventThrottle={16}
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={5}
        removeClippedSubviews={Platform.OS === "android"}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.gold}
            colors={[colors.gold]}
            progressBackgroundColor={colors.surface}
          />
        }
      />

      {flyingItems.map((item) => (
        <FlyingDish
          key={item.id}
          startX={item.startX}
          startY={item.startY}
          startWidth={item.startWidth}
          startHeight={item.startHeight}
          image={item.image}
          targetX={cartCoords.x}
          targetY={cartCoords.y}
          viewMode={viewMode}
          onAnimationComplete={() => handleAnimationComplete(item.id)}
        />
      ))}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: 38 },
  menuHeader: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  kicker: {
    color: colors.gold,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 2.2,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#FFF",
    marginTop: 2,
    letterSpacing: -0.5,
  },
  toggleBannerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(212,175,55,0.08)",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.25)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  toggleBannerText: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: "700",
  },
  bannerWrap: {
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  bannerCard: {
    height: 140,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
    justifyContent: "flex-end",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.35)",
  },
  bannerImg: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  bannerBadge: {
    position: "absolute",
    top: 10,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.gold,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  bannerBadgeText: {
    color: "#000",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  bannerContent: {
    padding: 12,
  },
  bannerTitle: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "900",
  },
  bannerDesc: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
    marginTop: 1,
  },
  bannerFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  bannerPrice: {
    color: colors.gold,
    fontSize: 18,
    fontWeight: "900",
  },
  orderPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.gold,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  orderPillText: {
    color: "#000",
    fontSize: 10,
    fontWeight: "800",
  },
  stickyFilters: {
    backgroundColor: colors.bg,
    paddingTop: 20,
    paddingBottom: 22,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 22,
  },
  hudRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    gap: 10,
    marginTop: 14,
  },
  dietaryRow: {
    paddingHorizontal: 16,
    flexDirection: "row",
  },
  resultCountText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  hudActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  hudBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    height: 34,
  },
  hudBtnActive: {
    backgroundColor: "rgba(212,175,55,0.12)",
    borderColor: colors.gold,
  },
  hudBtnText: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: "700",
  },
  hudBtnTextActive: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: "800",
  },
  viewToggleBox: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 2,
    height: 34,
    alignItems: "center",
  },
  viewBtn: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 7,
  },
  viewBtnActive: {
    backgroundColor: "rgba(212,175,55,0.15)",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.3)",
  },
  extendedDrawer: {
    backgroundColor: "rgba(255,255,255,0.02)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 16,
  },
  filterGroup: {
    gap: 8,
  },
  filterGroupTitle: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.8,
    marginBottom: 4,
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: "rgba(212,175,55,0.15)",
    borderColor: colors.gold,
  },
  filterChipText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "600",
  },
  filterChipTextActive: {
    color: colors.gold,
    fontWeight: "800",
  },
  subTabsContainer: {
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255,255,255,0.06)",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  subTabsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  subTabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.08)",
  },
  subTabBtnActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  subTabText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "600",
  },
  subTabTextActive: {
    color: "#000",
    fontWeight: "700",
  },
  sectionsWrap: { paddingTop: 16, gap: 16 },
});

