import CategoryFilterBar from "@/src/components/menu/CategoryFilterBar";
import DietaryFilter, { DishTypeFilter, PriceRangeFilter } from "@/src/components/menu/DietaryFilter";
import MenuEmptyState from "@/src/components/menu/MenuEmptyState";
import MenuSearchBar from "@/src/components/menu/MenuSearchBar";
import MenuSection, { MenuSectionData } from "@/src/components/menu/MenuSection";
import TopBar from "@/src/components/TopBar";
import { useApp } from "@/src/context/AppContext";
import { useTabBarAnimation } from "@/src/context/TabBarAnimationContext";
import { CATEGORIES, DISHES } from "@/src/data/menu";
import { useTabBarScrollHandler } from "@/src/hooks/useTabBarScrollHandler";
import { colors } from "@/src/theme";
import { storage } from "@/src/utils/storage";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { apiClient } from "@/src/utils/apiClient";
import type { Category, Dish } from "@/src/data/menu";
import Animated from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const ALL_FILTER = { id: "all", name: "All", icon: "grid", image: "" };

export type SortOption = "popular" | "price-asc" | "price-desc" | "rating";

export default function MenuScreen() {
  const { addToCart, dishes: apiDishes, categories: apiCategories } = useApp();
  const { animatedTranslateY, hiddenOffset } = useTabBarAnimation();
  const { onScroll } = useTabBarScrollHandler(animatedTranslateY, hiddenOffset);
  const router = useRouter();

  const filters = useMemo(() => [ALL_FILTER, ...(apiCategories && apiCategories.length > 0 ? apiCategories : CATEGORIES)], [apiCategories]);
  
  // Filter states
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [dishType, setDishType] = useState<DishTypeFilter>("all");
  const [priceRange, setPriceRange] = useState<PriceRangeFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [viewMode, setViewMode] = useState<"grid" | "cinematic">("grid");
  const [showExtendedFilters, setShowExtendedFilters] = useState(false);
  const [showFeaturedBanner, setShowFeaturedBanner] = useState(true);
  const [favoritesIds, setFavoritesIds] = useState<string[]>([]);
  
  const cardRefs = useRef<Record<string, any>>({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      const saved = await storage.getItem<string[]>("pk_favorites", []);
      if (mounted && saved) setFavoritesIds(saved);
    })();
    return () => { mounted = false; };
  }, []);

  const toggleFavorite = async (id: string) => {
    setFavoritesIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [id, ...prev];
      void storage.setItem("pk_favorites", next);
      return next;
    });
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

  const filteredDishes = useMemo(() => {
    const term = search.trim().toLowerCase();
    const dishesSource = apiDishes.length > 0 ? apiDishes : DISHES;

    let result = dishesSource.filter((dish) => {
      const itemCat = dish.category || (dish as any).categoryId || "";
      const matchesCategory = selectedCategory === "all" || itemCat === selectedCategory;
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
  }, [search, selectedCategory, dishType, priceRange, sortBy, apiDishes]);

  const categorySections = useMemo(() => {
    const categoriesSource = apiCategories.length > 0 ? apiCategories : CATEGORIES;
    const categoriesToShow =
      selectedCategory === "all"
        ? categoriesSource
        : categoriesSource.filter((category) => category.id === selectedCategory);

    return categoriesToShow
      .map((category) => ({
        ...category,
        dishes: filteredDishes.filter((dish) => (dish.category || (dish as any).categoryId) === category.id),
      }))
      .filter((section) => section.dishes.length > 0);
  }, [filteredDishes, selectedCategory, apiCategories]) as MenuSectionData[];

  const featuredDish = useMemo(() => {
    const dishesSource = apiDishes.length > 0 ? apiDishes : DISHES;
    return dishesSource.find(d => d.id === "d-cs-1") ?? dishesSource[0];
  }, [apiDishes]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <TopBar variant="minimal" />

      <Animated.ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[showFeaturedBanner ? 3 : 2]}
        keyboardShouldPersistTaps="handled"
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {/* Executive Header */}
        <View style={styles.menuHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.kicker}>ROYAL CULINARY SELECTION</Text>
            <Text style={styles.headerTitle}>Master Menu</Text>
          </View>

          <TouchableOpacity 
            onPress={() => setShowFeaturedBanner(!showFeaturedBanner)}
            style={styles.toggleBannerBtn}
          >
            <Ionicons name={showFeaturedBanner ? "eye-off-outline" : "sparkles-outline"} size={14} color={colors.gold} />
            <Text style={styles.toggleBannerText}>{showFeaturedBanner ? "Compact View" : "Show Spotlight"}</Text>
          </TouchableOpacity>
        </View>

        {/* Featured Today Spotlight Reel (Collapsible) */}
        {showFeaturedBanner && (
          <View style={styles.bannerWrap}>
            <TouchableOpacity activeOpacity={0.92} onPress={() => openDish(featuredDish)} style={styles.bannerCard}>
              <Image source={{ uri: featuredDish.image }} style={styles.bannerImg} />
              <LinearGradient
                colors={["rgba(10,10,10,0.15)", "rgba(10,10,10,0.7)", "rgba(10,10,10,0.98)"]}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.bannerBadge}>
                <Ionicons name="sparkles" size={11} color="#000" />
                <Text style={styles.bannerBadgeText}>CHEF'S SIGNATURE</Text>
              </View>
              <View style={styles.bannerContent}>
                <Text style={styles.bannerTitle}>{featuredDish.name}</Text>
                <Text style={styles.bannerDesc} numberOfLines={1}>{featuredDish.description}</Text>
                <View style={styles.bannerFooter}>
                  <Text style={styles.bannerPrice}>₹{featuredDish.price}</Text>
                  <View style={styles.orderPill}>
                    <Text style={styles.orderPillText}>View Signature</Text>
                    <Ionicons name="chevron-forward" size={11} color="#000" />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Menu Search Bar */}
        <MenuSearchBar
          value={search}
          onChangeText={setSearch}
          onClear={() => setSearch("")}
          itemCount={filteredDishes.length}
        />

        {/* Sticky Control HUD — Genius Airy Structure */}
        <View style={styles.stickyFilters}>
          <CategoryFilterBar
            filters={filters}
            selectedId={selectedCategory}
            onSelect={setSelectedCategory}
          />

          {/* Unified Compact Control Row */}
          <View style={styles.hudRow}>
            <DietaryFilter value={dishType} onChange={setDishType} />

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

        {categorySections.length === 0 ? (
          <MenuEmptyState
            title="No dishes matched your filters"
            message="Try clearing your price range or category search."
          />
        ) : (
          <View style={styles.sectionsWrap}>
            {categorySections.map((section) => (
              <MenuSection
                key={section.id}
                section={section}
                favorites={favoritesIds}
                onToggleFavorite={toggleFavorite}
                onAddToCart={addToCart}
                onOpen={openDish}
                onCardRef={(dishId, node) => { cardRefs.current[dishId] = node; }}
                viewMode={viewMode}
              />
            ))}
          </View>
        )}
      </Animated.ScrollView>
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
    paddingTop: 6,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 8,
  },
  hudRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    gap: 10,
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
    paddingVertical: 10,
    gap: 10,
  },
  filterGroup: {
    gap: 6,
  },
  filterGroupTitle: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.5,
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
  sectionsWrap: { paddingTop: 16, gap: 16 },
});
