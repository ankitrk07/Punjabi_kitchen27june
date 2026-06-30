import { useApp } from "@/src/context/AppContext";
import { useTabBarAnimation } from "@/src/context/TabBarAnimationContext";
import { useTabBarScrollHandler } from "@/src/hooks/useTabBarScrollHandler";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Reanimated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";



// ─── Premium Design Tokens ──────────────────────────────────────────────────
const GOLD = "#C9A84C";
const GOLD_LIGHT = "#F0D488";
const DARK_BG = "#080808";
const SURFACE = "#111111";
const SURFACE_2 = "#181818";
const SURFACE_3 = "#1E1E1E";
const RED = "#E85555";
const GREEN = "#4CD97B";
const BLUE = "#4A9EFF";
const PURPLE = "#A855F7";
const ORANGE = "#F97316";
const TEAL = "#14B8A6";
const WHITE = "#FFFFFF";
const MUTED = "#6B6B6B";
const MUTED_2 = "#333333";

// ─── Mock Data ──────────────────────────────────────────────────────────────
const MOCK_DATA = {
  ongoingOrders: 2,
  pastOrders: 142,
  activeTracking: true,
  trainOrderActive: false,
  scheduledOrders: 1,
  groupOrders: 0,
  wishlistCount: 12,
  recentlyViewed: 8,
  favoriteOrders: 3,
  loyaltyPoints: 2450,
  cashback: 180,
  availableCoupons: 5,
  referralEarnings: 450,
  unreadNotifications: 3,
  openTickets: 1,
  upcomingReservations: 1,
};

// ─── Complete Sections Data ─────────────────────────────────────────────────
const SECTIONS = [
  {
    id: "orders",
    title: "Orders",
    icon: "receipt-outline",
    color: ORANGE,
    items: [
      {
        key: "my-orders",
        label: "My Orders",
        value: `${MOCK_DATA.pastOrders} orders`,
        icon: "list-outline",
        subItems: [
          { key: "ongoing", label: "Ongoing Orders", value: MOCK_DATA.ongoingOrders > 0 ? `${MOCK_DATA.ongoingOrders} active` : null },
          { key: "past", label: "Past Orders", value: `${MOCK_DATA.pastOrders} orders` },
          { key: "reorder-fav", label: "Reorder Favorites" },
        ]
      },
      {
        key: "track",
        label: "Track Order",
        value: MOCK_DATA.activeTracking ? "Active" : "No active orders",
        valueColor: MOCK_DATA.activeTracking ? GREEN : MUTED,
        icon: "location-outline",
      },
      {
        key: "train",
        label: "Order on Train",
        value: "Enter PNR",
        icon: "train-outline",
        subItems: [
          { key: "enter-pnr", label: "Enter PNR" },
          { key: "track-train", label: "Track Train Order", value: MOCK_DATA.trainOrderActive ? "Active" : null },
          { key: "prev-train", label: "Previous Train Orders" },
        ]
      },
      {
        key: "scheduled",
        label: "Scheduled Orders",
        value: MOCK_DATA.scheduledOrders > 0 ? `${MOCK_DATA.scheduledOrders} upcoming` : "None scheduled",
        icon: "calendar-outline",
      },
      {
        key: "group",
        label: "Group Orders",
        value: MOCK_DATA.groupOrders > 0 ? `${MOCK_DATA.groupOrders} active` : "No group orders",
        icon: "people-outline",
        subItems: [
          { key: "shared-orders", label: "Shared Orders" },
          { key: "split-payments", label: "Split Payments" },
        ]
      },
    ],
  },
  {
    id: "favorites",
    title: "Favorites",
    icon: "heart-outline",
    color: RED,
    items: [
      {
        key: "saved-dishes",
        label: "Saved Dishes",
        value: `${MOCK_DATA.wishlistCount} saved dishes`,
        icon: "heart-outline",
      },
      {
        key: "recent-items",
        label: "Recently Viewed Items",
        value: `${MOCK_DATA.recentlyViewed} items`,
        icon: "eye-outline",
      },
      {
        key: "fav-orders",
        label: "Favorite Orders",
        value: `${MOCK_DATA.favoriteOrders} saved`,
        icon: "star-outline",
      },
    ],
  },
  {
    id: "rewards",
    title: "Rewards & Offers",
    icon: "gift-outline",
    color: GOLD,
    items: [
      {
        key: "loyalty",
        label: "Rewards",
        value: `${MOCK_DATA.loyaltyPoints} pts • ₹${MOCK_DATA.cashback} cashback`,
        icon: "trophy-outline",
        subItems: [
          { key: "loyalty-points", label: "Loyalty Points", value: `${MOCK_DATA.loyaltyPoints} points` },
          { key: "cashback", label: "Cashback Balance", value: `₹${MOCK_DATA.cashback}` },
        ]
      },
      {
        key: "coupons",
        label: "Coupons & Promo Codes",
        value: `${MOCK_DATA.availableCoupons} available`,
        icon: "pricetag-outline",
        subItems: [
          { key: "available", label: "Available Coupons", value: `${MOCK_DATA.availableCoupons} coupons` },
          { key: "used", label: "Used Coupons" },
        ]
      },
      {
        key: "gift",
        label: "Gift Cards",
        icon: "gift-outline",
        subItems: [
          { key: "buy-gift", label: "Buy Gift Cards" },
          { key: "redeem-gift", label: "Redeem Gift Cards" },
        ]
      },
      {
        key: "referral",
        label: "Referral Program",
        value: `₹${MOCK_DATA.referralEarnings} earned`,
        icon: "share-social-outline",
        subItems: [
          { key: "invite-friends", label: "Invite Friends" },
          { key: "referral-earnings", label: "Referral Earnings", value: `₹${MOCK_DATA.referralEarnings}` },
        ]
      },
    ],
  },
  {
    id: "addresses",
    title: "Addresses",
    icon: "location-outline",
    color: GREEN,
    items: [
      {
        key: "manage-addresses",
        label: "Saved Addresses",
        value: "Home, Work & Others",
        icon: "location-outline",
      },
    ],
  },
  {
    id: "payments",
    title: "Payments",
    icon: "card-outline",
    color: BLUE,
    items: [
      {
        key: "methods",
        label: "Payment Methods",
        value: "2 cards • UPI • Wallet",
        icon: "wallet-outline",
        subItems: [
          { key: "cards", label: "Credit/Debit Cards" },
          { key: "upi", label: "UPI" },
          { key: "netbanking", label: "Net Banking" },
          { key: "wallets", label: "Wallets" },
        ]
      },
      {
        key: "history",
        label: "Transaction History",
        value: "₹12,450 spent",
        icon: "document-text-outline",
        subItems: [
          { key: "order-payments", label: "Order Payments" },
          { key: "refunds", label: "Refunds" },
        ]
      },
      {
        key: "saved-methods",
        label: "Saved Payment Methods",
        icon: "save-outline",
      },
    ],
  },
  {
    id: "membership",
    title: "Membership",
    icon: "diamond-outline",
    color: GOLD,
    items: [
      { key: "subscription", label: "Subscription Status", value: "Active", icon: "crown-outline" },
      { key: "benefits", label: "Membership Benefits", icon: "ribbon-outline" },
    ],
  },
  {
    id: "notifications",
    title: "Notifications",
    icon: "notifications-outline",
    color: PURPLE,
    items: [
      { key: "order-updates", label: "Order Updates", icon: "receipt-outline" },
      { key: "offers", label: "Offers & Promotions", icon: "pricetag-outline" },
      { key: "announcements", label: "Restaurant Announcements", icon: "megaphone-outline" },
    ],
  },
  {
    id: "support",
    title: "Customer Support",
    icon: "headset-outline",
    color: TEAL,
    items: [
      { key: "help", label: "Help Center", sub: "FAQs & guides", icon: "help-circle-outline" },
      {
        key: "ticket",
        label: "Raise a Ticket",
        value: MOCK_DATA.openTickets > 0 ? `${MOCK_DATA.openTickets} open` : "No open tickets",
        icon: "document-text-outline",
      },
      { key: "live-chat", label: "Live Chat", icon: "chatbubbles-outline" },
      { key: "call", label: "Call Restaurant", icon: "call-outline" },
    ],
  },
  {
    id: "restaurant",
    title: "Restaurant Features",
    icon: "restaurant-outline",
    color: ORANGE,
    items: [
      {
        key: "dining",
        label: "Dining Reservations",
        value: MOCK_DATA.upcomingReservations > 0 ? `${MOCK_DATA.upcomingReservations} upcoming` : "No reservations",
        icon: "calendar-outline",
        subItems: [
          { key: "upcoming", label: "Upcoming Reservations", value: MOCK_DATA.upcomingReservations > 0 ? `${MOCK_DATA.upcomingReservations} booking` : null },
          { key: "past-reservations", label: "Reservation History" },
        ]
      },
      {
        key: "catering",
        label: "Catering Orders",
        icon: "people-circle-outline",
      },
    ],
  },

  {
    id: "about",
    title: "About",
    icon: "information-circle-outline",
    color: MUTED,
    items: [
      { key: "about-us", label: "About Us", icon: "business-outline" },
      { key: "terms", label: "Terms & Conditions", icon: "document-outline" },
      { key: "privacy-policy", label: "Privacy Policy", icon: "shield-outline" },
      { key: "rate-app", label: "Rate App", icon: "star-outline" },
      { key: "share-app", label: "Share App", icon: "share-outline" },
      { key: "version", label: "App Version", value: "v2.5.0", icon: "code-slash-outline" },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SubItem Component (separate component to avoid hook issues)
// ─────────────────────────────────────────────────────────────────────────────
const SubItem = React.memo(function SubItem({
  item,
  level,
  sectionColor,
  onPress
}: {
  item: any;
  level: number;
  sectionColor: string;
  onPress: (key: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasSubItems = item.subItems && item.subItems.length > 0;

  const handlePress = useCallback(() => {
    if (hasSubItems) {
      setExpanded(prev => !prev);
    } else {
      onPress(item.key);
    }
  }, [hasSubItems, item.key, onPress]);

  return (
    <View style={{ marginLeft: level * 16 }}>
      <TouchableOpacity
        style={[styles.sectionItem, level > 0 && styles.subItem]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={styles.itemLeft}>
          <View style={[styles.itemIcon, { backgroundColor: `${sectionColor}10` }]}>
            <Ionicons name={item.icon as any} size={level === 0 ? 18 : 14} color={sectionColor} />
          </View>
          <View>
            <Text style={[styles.itemLabel, level > 0 && styles.subItemLabel]}>{item.label}</Text>
            {item.sub && <Text style={styles.itemSub}>{item.sub}</Text>}
          </View>
        </View>
        <View style={styles.itemRight}>
          {item.value && (
            <Text style={[styles.itemValue, item.valueColor && { color: item.valueColor }]}>
              {item.value}
            </Text>
          )}
          {hasSubItems && (
            <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={16} color={MUTED} />
          )}
          {!hasSubItems && !item.subItems && (
            <Ionicons name="chevron-forward" size={16} color={MUTED} />
          )}
        </View>
      </TouchableOpacity>

      {expanded && hasSubItems && (
        <View style={styles.subItemsContainer}>
          {item.subItems.map((subItem: any, idx: number) => (
            <SubItem
              key={idx}
              item={{ ...subItem, icon: "ellipse-outline" }}
              level={level + 1}
              sectionColor={sectionColor}
              onPress={onPress}
            />
          ))}
        </View>
      )}
    </View>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Settings Section Component
// ─────────────────────────────────────────────────────────────────────────────
const SettingsSection = React.memo(function SettingsSection({ section, onPress }: { section: typeof SECTIONS[0]; onPress: (key: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const toggleExpand = useCallback(() => setExpanded(prev => !prev), []);

  return (
    <View style={styles.section}>
      <TouchableOpacity style={styles.sectionHeader} onPress={toggleExpand} activeOpacity={0.7}>
        <View style={styles.sectionLeft}>
          <Ionicons name={section.icon as any} size={20} color={GOLD} />
          <Text style={styles.sectionTitle}>{section.title}</Text>
        </View>
        <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={18} color={MUTED} />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.sectionItems}>
          {section.items.map((item, idx) => (
            <SubItem
              key={idx}
              item={item}
              level={0}
              sectionColor={section.color}
              onPress={onPress}
            />
          ))}
        </View>
      )}
    </View>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Premium Header Component
// ─────────────────────────────────────────────────────────────────────────────
const PremiumHeader = React.memo(function PremiumHeader({ user, onEdit, onChangePhoto, isGold }: { user: any; onEdit: () => void; onChangePhoto: () => void; isGold: boolean }) {
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(20);

  useEffect(() => {
    fadeAnim.value = withTiming(1, { duration: 400 });
    slideAnim.value = withSpring(0, { damping: 18, stiffness: 120 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: slideAnim.value }],
  }));

  const defaultAvatar = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80";
  const avatarUri = user?.avatar || defaultAvatar;

  return (
    <Reanimated.View style={[styles.headerContainer, animatedStyle]}>
      <LinearGradient
        colors={["rgba(212, 175, 55, 0.1)", "rgba(20, 20, 20, 0)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.profileRow}>
        <TouchableOpacity style={styles.avatarSection} onPress={onChangePhoto} activeOpacity={0.9}>
          <LinearGradient colors={[GOLD, `${GOLD}30`]} style={styles.avatarRing}>
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          </LinearGradient>
          <View style={styles.editBadge}>
            <Ionicons name="camera-reverse" size={12} color="#000" />
          </View>
        </TouchableOpacity>

        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>{user?.name || "Sudip"}</Text>
            <Ionicons name="checkmark-circle" size={16} color={GREEN} style={styles.verifiedIcon} />
          </View>
          <Text style={styles.userEmail}>{user?.email || "sudip@dineout.com"}</Text>

          {isGold && (
            <LinearGradient
              colors={[GOLD_LIGHT, GOLD]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.goldBadge}
            >
              <Ionicons name="diamond" size={10} color="#000" />
              <Text style={styles.goldText}>Gold Member</Text>
            </LinearGradient>
          )}
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statBlock}>
          <Text style={styles.statNumber}>{MOCK_DATA.pastOrders}</Text>
          <Text style={styles.statLabel}>Orders Placed</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBlock}>
          <Text style={styles.statNumber}>₹12.4K</Text>
          <Text style={styles.statLabel}>Total Saved</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBlock}>
          <Text style={styles.statNumber}>{MOCK_DATA.loyaltyPoints}</Text>
          <Text style={styles.statLabel}>Points Balance</Text>
        </View>
      </View>
    </Reanimated.View>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Membership Progress Card
// ─────────────────────────────────────────────────────────────────────────────
const MembershipCard = React.memo(function MembershipCard() {
  const { user } = useApp();
  const scaleAnim = useSharedValue(0.95);

  const points = user?.loyaltyPoints ?? 350;
  const tier = user?.membershipTier ?? "Classic";

  useEffect(() => {
    scaleAnim.value = withSpring(1, { damping: 14, stiffness: 100 });
  }, []);

  const scaleStyle = useAnimatedStyle(() => ({ transform: [{ scale: scaleAnim.value }] }));

  const targetPoints = 1000;
  const progressPercent = Math.min(Math.round((points / targetPoints) * 100), 100);
  const pointsToGold = Math.max(targetPoints - points, 0);

  return (
    <Reanimated.View style={[styles.membershipWrapper, scaleStyle]}>
      <LinearGradient colors={[`${GOLD}20`, `${GOLD}05`]} style={styles.membershipCard}>
        <View style={styles.membershipLeft}>
          <Text style={styles.membershipTitle}>Membership Progress ({tier})</Text>
          <Text style={styles.membershipSubtitle}>{points} points earned</Text>
          <View style={styles.progressWrapper}>
            <View style={styles.progressBar}>
              <LinearGradient colors={[GOLD, GOLD_LIGHT]} style={[styles.progressFill, { width: `${progressPercent}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {pointsToGold > 0 ? `${pointsToGold} points to Gold Member` : "You are a Gold Member!"}
            </Text>
          </View>
        </View>
        <View style={styles.membershipIcon}>
          <Ionicons name="trophy" size={40} color={GOLD} />
        </View>
      </LinearGradient>
    </Reanimated.View>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Quick Action Buttons
// ─────────────────────────────────────────────────────────────────────────────
function QuickActions() {
  const router = useRouter();
  const actions = [
    { icon: "refresh-circle", label: "Reorder", color: ORANGE, route: "/profile/favorites/favorite-orders" },
    { icon: "navigate-circle", label: "Track", color: GREEN, route: "/orders/track" },
    { icon: "pricetag", label: "Offers", color: GOLD, route: "/profile/offers" },
    { icon: "headset", label: "Support", color: BLUE, route: "/profile/support/help" },
  ];

  return (
    <View style={styles.quickActions}>
      {actions.map((action, idx) => (
        <TouchableOpacity
          key={idx}
          style={styles.actionBtn}
          activeOpacity={0.7}
          onPress={() => router.push(action.route as any)}
        >
          <LinearGradient colors={[`${action.color}20`, `${action.color}05`]} style={styles.actionIcon}>
            <Ionicons name={action.icon as any} size={24} color={action.color} />
          </LinearGradient>
          <Text style={styles.actionLabel}>{action.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// Dynamic Navigation Registry
// ─────────────────────────────────────────────────────────────────────────────
const ROUTE_MAP: Record<string, string> = {
  // Orders
  "ongoing": "/orders/ongoing",
  "past": "/orders/past",
  "reorder-fav": "/orders/reorder-favorites",
  "track": "/orders/track",
  "scheduled": "/orders/scheduled",
  "shared-orders": "/orders/shared-orders",
  "enter-pnr": "/orders/train/enter-pnr",
  "track-train": "/orders/train/track",
  "prev-train": "/profile/orders/train/previous",
  "split-payments": "/profile/orders/group",

  // Favorites
  "saved-dishes": "/profile/favorites/saved-dishes",
  "recent-items": "/profile/favorites/recently-viewed",
  "fav-orders": "/profile/favorites/favorite-orders",

  // Rewards
  "loyalty-points": "/profile/rewards/loyalty-points",
  "cashback": "/profile/rewards/cashback",
  "available": "/profile/rewards/coupons",
  "used": "/profile/rewards/coupons",
  "buy-gift": "/profile/rewards/gift-cards",
  "redeem-gift": "/profile/rewards/gift-cards",
  "invite-friends": "/profile/rewards/referral",
  "referral-earnings": "/profile/rewards/referral",

  // Addresses
  "manage-addresses": "/profile/addresses",

  // Payments
  "cards": "/profile/payments/cards",
  "upi": "/profile/payments/upi",
  "netbanking": "/profile/payments/netbanking",
  "wallets": "/profile/payments/wallets",
  "order-payments": "/profile/payments/history",
  "refunds": "/profile/payments/refunds",
  "saved-methods": "/profile/payments/methods",

  // Membership
  "subscription": "/profile/membership/premium",
  "benefits": "/profile/membership/benefits",

  // Notifications
  "order-updates": "/profile/notifications/order-updates",
  "offers": "/profile/notifications/offers",
  "announcements": "/profile/notifications/announcements",

  // Support
  "help": "/profile/support/help",
  "ticket": "/profile/support/ticket",
  "live-chat": "/profile/support/live-chat",
  "call": "/profile/support/call",

  // Restaurant
  "upcoming": "/profile/restaurant/upcoming",
  "past-reservations": "/profile/restaurant/history",
  "catering": "/profile/restaurant/catering",

  // Settings
  "settings": "/profile/settings",
  "edit-profile": "/profile/settings/profile",
  "change-mobile": "/profile/settings/change-mobile",
  "change-email": "/profile/settings/change-email",
  "language": "/profile/settings/language",
  "dark-mode": "/profile/settings/dark-mode",
  "app-permissions": "/profile/settings/permissions",
  "data-settings": "/profile/settings/data",

  // About
  "about-us": "/profile/about/about",
  "terms": "/profile/about/terms",
  "privacy-policy": "/profile/about/privacy-policy",
  "rate-app": "/profile/about/rate",
  "share-app": "/profile/about/share",
  "version": "/profile/about/version"
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Profile Screen
// ─────────────────────────────────────────────────────────────────────────────
export default function Profile() {
  const router = useRouter();
  const { user, signOut, updateUser } = useApp();
  const insets = useSafeAreaInsets();
  const { animatedTranslateY, hiddenOffset } = useTabBarAnimation();
  const scrollY = useSharedValue(0);
  const { onScroll } = useTabBarScrollHandler(animatedTranslateY, hiddenOffset, scrollY);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 80], [0, 1], "clamp"),
  }));

  const isGold = (user?.email || "sudip@dineout.com") === "sudip@dineout.com" || user?.membershipTier === "Gold";

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access photos is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      await updateUser({ avatar: result.assets[0].uri });
    }
  };

  const handleItemPress = (key: string) => {
    const route = ROUTE_MAP[key];
    if (route) {
      router.push(route as any);
    } else {
      console.log("No route mapped for key:", key);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace("/auth/login");
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Ambient Glow Effects */}
      <View style={styles.glow1} />
      <View style={styles.glow2} />
      <View style={styles.glow3} />

      {/* Floating Animated Header */}
      <Reanimated.View style={[styles.floatingHeader, headerStyle]}>
        <LinearGradient colors={[`${DARK_BG}E6`, SURFACE_2]} style={[styles.floatingHeaderContent, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={GOLD} />
          </TouchableOpacity>
          <Text style={styles.floatingTitle}>Profile</Text>
          <View style={{ width: 22 }} />
        </LinearGradient>
      </Reanimated.View>

      {/* Sticky Settings Gear (Always Visible) */}
      <TouchableOpacity
        style={[styles.stickySettings, { top: insets.top + 12 }]}
        onPress={() => router.push("/profile/settings")}
        activeOpacity={0.7}
      >
        <Ionicons name="settings-outline" size={22} color={GOLD} />
      </TouchableOpacity>

      <Reanimated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.content}>
          <PremiumHeader
            user={user}
            onEdit={() => handleItemPress("edit-profile")}
            onChangePhoto={handlePickImage}
            isGold={isGold}
          />
          {!isGold && <MembershipCard />}
          <QuickActions />

          <View style={styles.sectionsContainer}>
            {SECTIONS.map((section) => (
              <SettingsSection key={section.id} section={section} onPress={handleItemPress} />
            ))}
          </View>

          <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.7}>
            <LinearGradient colors={[`${RED}15`, `${RED}05`]} style={styles.signOutGradient}>
              <Ionicons name="log-out-outline" size={20} color={RED} />
              <Text style={styles.signOutText}>Sign Out</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteBtn} activeOpacity={0.7}>
            <Text style={styles.deleteText}>Delete Account</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <View style={styles.footerLine} />
            <Text style={styles.footerText}>v2.5.0</Text>
            <View style={styles.footerLine} />
          </View>
        </View>
      </Reanimated.ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DARK_BG },

  glow1: { position: "absolute", top: -100, right: -80, width: 250, height: 250, borderRadius: 125, backgroundColor: `${GOLD}08` },
  glow2: { position: "absolute", bottom: -50, left: -100, width: 220, height: 220, borderRadius: 110, backgroundColor: `${GOLD}05` },
  glow3: { position: "absolute", top: "40%", right: -50, width: 150, height: 150, borderRadius: 75, backgroundColor: `${PURPLE}04` },

  floatingHeader: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 1000 },
  floatingHeaderContent: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: `${GOLD}15`,
  },
  floatingTitle: { color: WHITE, fontSize: 18, fontWeight: "600" },
  stickySettings: {
    position: "absolute",
    right: 20,
    zIndex: 1100,
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },

  content: { paddingTop: 20, paddingBottom: 40 },

  headerContainer: {
    marginHorizontal: 20, marginBottom: 24, padding: 20,
    backgroundColor: SURFACE_2, borderRadius: 24, borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.15)", position: "relative", overflow: "hidden",
  },
  profileRow: { flexDirection: "row", alignItems: "center", marginBottom: 20, gap: 16 },
  avatarSection: { position: "relative" },
  avatarRing: { width: 72, height: 72, borderRadius: 20, padding: 2 },
  avatar: { width: 68, height: 68, borderRadius: 18, backgroundColor: SURFACE },
  editBadge: {
    position: "absolute", bottom: -4, right: -4, width: 24, height: 24,
    borderRadius: 12, backgroundColor: GOLD, alignItems: "center",
    justifyContent: "center", borderWidth: 2, borderColor: SURFACE_2,
  },
  userInfo: { flex: 1, alignItems: "flex-start", justifyContent: "center" },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 },
  userName: { color: WHITE, fontSize: 18, fontWeight: "800", letterSpacing: 0.2 },
  verifiedIcon: { marginTop: 1 },
  userEmail: { color: MUTED, fontSize: 12, marginBottom: 6 },
  goldBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  goldText: { color: "#000000", fontSize: 9, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5 },
  verifiedBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: `${GREEN}15`, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12,
  },
  verifiedText: { color: GREEN, fontSize: 10, fontWeight: "600" },

  statsGrid: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-around",
    paddingTop: 16, borderTopWidth: 1, borderTopColor: "rgba(212, 175, 55, 0.15)",
  },
  statBlock: { alignItems: "center", flex: 1 },
  statNumber: { color: WHITE, fontSize: 16, fontWeight: "800" },
  statLabel: { color: MUTED, fontSize: 10, fontWeight: "600", marginTop: 2, textTransform: "uppercase", letterSpacing: 0.5 },
  statDivider: { width: 1, height: 24, backgroundColor: "rgba(212, 175, 55, 0.15)" },

  membershipWrapper: { marginHorizontal: 20, marginBottom: 24 },
  membershipCard: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    padding: 16, borderRadius: 16, borderWidth: 1, borderColor: `${GOLD}25`,
  },
  membershipLeft: { flex: 1 },
  membershipTitle: { color: WHITE, fontSize: 14, fontWeight: "600", marginBottom: 4 },
  membershipSubtitle: { color: MUTED, fontSize: 12, marginBottom: 12 },
  progressWrapper: { gap: 6 },
  progressBar: { height: 4, backgroundColor: `${GOLD}20`, borderRadius: 2, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 2 },
  progressText: { color: MUTED, fontSize: 10 },
  membershipIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: `${GOLD}10`, alignItems: "center", justifyContent: "center" },

  quickActions: { flexDirection: "row", justifyContent: "space-around", marginHorizontal: 20, marginBottom: 28 },
  actionBtn: { alignItems: "center", gap: 8 },
  actionIcon: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: `${GOLD}20` },
  actionLabel: { color: MUTED, fontSize: 12, fontWeight: "500" },

  sectionsContainer: { marginHorizontal: 20, gap: 12, marginBottom: 24 },
  section: { backgroundColor: SURFACE_2, borderRadius: 16, borderWidth: 1, borderColor: `${GOLD}15`, overflow: "hidden" },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14 },
  sectionLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  sectionTitle: { color: WHITE, fontSize: 14, fontWeight: "600" },
  sectionItems: { borderTopWidth: 1, borderTopColor: `${GOLD}10` },
  sectionItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: `${GOLD}10` },
  subItem: { paddingLeft: 40 },
  itemLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  itemIcon: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  itemLabel: { color: WHITE, fontSize: 14, fontWeight: "500" },
  subItemLabel: { fontSize: 13, fontWeight: "400" },
  itemSub: { color: MUTED, fontSize: 11, marginTop: 2 },
  itemRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  itemValue: { color: GOLD, fontSize: 12, fontWeight: "500" },
  subItemsContainer: { backgroundColor: `${SURFACE_3}50` },

  signOutBtn: { marginHorizontal: 20, marginBottom: 12 },
  signOutGradient: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: `${RED}25` },
  signOutText: { color: RED, fontSize: 15, fontWeight: "600" },
  deleteBtn: { alignItems: "center", marginBottom: 20 },
  deleteText: { color: `${RED}50`, fontSize: 13, textDecorationLine: "underline" },

  footer: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginHorizontal: 20, gap: 12 },
  footerLine: { flex: 1, height: 1, backgroundColor: `${GOLD}15` },
  footerText: { color: MUTED_2, fontSize: 11 },
});