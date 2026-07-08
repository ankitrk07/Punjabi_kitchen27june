import { useApp } from "@/src/context/AppContext";
import { useTabBarAnimation } from "@/src/context/TabBarAnimationContext";
import { useTabBarScrollHandler } from "@/src/hooks/useTabBarScrollHandler";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Reanimated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

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
          <View style={{ flex: 1 }}>
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
          <View style={styles.sectionIconCircle}>
            <Ionicons name={section.icon as any} size={18} color={GOLD} />
          </View>
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
// Avatar Glow Particles Component
// ─────────────────────────────────────────────────────────────────────────────
function SingleParticle({ index, total }: { index: number; total: number }) {
  const progress = useSharedValue(0);

  // Generate unique random parameters for this particle once on mount
  const params = useRef({
    angle: Math.random() * 2 * Math.PI,
    maxDistance: 45 + Math.random() * 45,
    duration: 2000 + Math.random() * 2000,
    delay: Math.random() * 3000,
    size: 3 + Math.random() * 4, // random diameter between 3 and 7 pixels
    spawnX: (Math.random() - 0.5) * 30, // random offset near the avatar center
    spawnY: (Math.random() - 0.5) * 30,
  }).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      progress.value = withRepeat(
        withTiming(1, { duration: params.duration, easing: Easing.linear }),
        -1,
        false
      );
    }, params.delay);
    return () => clearTimeout(timeout);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const distance = progress.value * params.maxDistance;

    const translateX = params.spawnX + Math.cos(params.angle) * distance;
    const translateY = params.spawnY + Math.sin(params.angle) * distance;

    const scale = interpolate(progress.value, [0, 0.2, 0.8, 1], [0.1, 1.2, 0.8, 0.0]);
    const opacity = interpolate(progress.value, [0, 0.1, 0.8, 1], [0, 0.8, 0.6, 0]);

    return {
      transform: [
        { translateX },
        { translateY },
        { scale },
      ],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: params.size,
          height: params.size,
          borderRadius: params.size / 2,
          backgroundColor: "#C9A84C",
          shadowColor: "#C9A84C",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: params.size / 2,
          alignSelf: "center",
        },
        animatedStyle,
      ]}
    />
  );
}

function AvatarGlowParticles() {
  const total = 45;
  return (
    <View style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: "center",
      justifyContent: "center",
      zIndex: -1,
    }}>
      {Array.from({ length: total }).map((_, i) => (
        <SingleParticle key={i} index={i} total={total} />
      ))}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Premium Header Component — Full-bleed PBG.png hero
// ─────────────────────────────────────────────────────────────────────────────
const PremiumHeader = React.memo(function PremiumHeader({
  user,
  onEdit,
  onChangePhoto,
  isGold,
  onNotifications,
  onSettings,
}: {
  user: any;
  onEdit: () => void;
  onChangePhoto: () => void;
  isGold: boolean;
  onNotifications: () => void;
  onSettings: () => void;
}) {
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(30);

  useEffect(() => {
    fadeAnim.value = withTiming(1, { duration: 500 });
    slideAnim.value = withSpring(0, { damping: 18, stiffness: 120 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: slideAnim.value }],
  }));

  const defaultAvatar = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80";
  const avatarUri = user?.avatar || defaultAvatar;

  return (
    <Reanimated.View style={animatedStyle}>
      <ImageBackground
        source={require("../../assets/images/PBG.png")}
        style={styles.heroBg}
        resizeMode="contain"
        imageStyle={{ transform: [{ translateY: -10 }] }}
      >
        <LinearGradient
          colors={["rgba(8,8,8,0.0)", "rgba(8,8,8,0.3)", "rgba(8,8,8,0.7)"]}
          locations={[0, 0.55, 1]}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Top bar: Gold Badge + Bell + Gear */}
        <View style={styles.heroTopBar}>
          {isGold ? (
            <LinearGradient
              colors={[GOLD_LIGHT, GOLD]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.goldMemberBadge}
            >
              <Ionicons name="diamond" size={12} color="#000" />
              <Text style={styles.goldMemberText}>GOLD MEMBER</Text>
            </LinearGradient>
          ) : (
            <View style={styles.classicMemberBadge}>
              <Ionicons name="diamond-outline" size={12} color={GOLD} />
              <Text style={styles.classicMemberText}>MEMBER</Text>
            </View>
          )}
          <View style={styles.heroTopRight}>
            <TouchableOpacity style={styles.heroTopIcon} onPress={onNotifications} activeOpacity={0.7}>
              <Ionicons name="notifications-outline" size={20} color={GOLD} />
              {MOCK_DATA.unreadNotifications > 0 && (
                <View style={styles.notifDot} />
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.heroTopIcon} onPress={onSettings} activeOpacity={0.7}>
              <Ionicons name="settings-outline" size={20} color={GOLD} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Avatar — Centered */}
        <View style={styles.heroAvatarWrap}>
          <TouchableOpacity onPress={onChangePhoto} activeOpacity={0.9} style={{ position: "relative" }}>
            <AvatarGlowParticles />
            <LinearGradient colors={[GOLD, GOLD_LIGHT, GOLD]} style={styles.heroAvatarRing}>
              <Image source={{ uri: avatarUri }} style={styles.heroAvatar} />
            </LinearGradient>
            <View style={styles.heroCameraBadge}>
              <Ionicons name="camera" size={13} color="#FFF" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Name + Email */}
        <View style={styles.heroInfo}>
          <View style={styles.heroNameRow}>
            <Text style={styles.heroName}>{user?.name || "Sudip"}</Text>
            <Ionicons name="checkmark-circle" size={18} color={GREEN} style={{ marginLeft: 6 }} />
          </View>
          <Text style={styles.heroEmail}>{user?.email || "sudip@dineout.com"}</Text>
        </View>
      </ImageBackground>
    </Reanimated.View>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Stats Card
// ─────────────────────────────────────────────────────────────────────────────
const StatsCard = React.memo(function StatsCard() {
  const scaleAnim = useSharedValue(0.95);
  useEffect(() => {
    scaleAnim.value = withSpring(1, { damping: 14, stiffness: 100 });
  }, []);
  const scaleStyle = useAnimatedStyle(() => ({ transform: [{ scale: scaleAnim.value }] }));

  const stats = [
    { icon: "bag-handle-outline" as const, value: `${MOCK_DATA.pastOrders}`, label: "Orders Placed", sub: "All Time" },
    { icon: "diamond-outline" as const, value: "₹12.4K", label: "Total Saved", sub: "Across Orders" },
    { icon: "star-outline" as const, value: `${MOCK_DATA.loyaltyPoints}`, label: "Points Balance", sub: "Redeem & Save" },
  ];

  return (
    <Reanimated.View style={scaleStyle}>
      <ImageBackground
        source={require("../../assets/images/profileStatsBG.png")}
        style={styles.statsCard}
        imageStyle={{ borderRadius: 20 }}
        resizeMode="cover"
      >
        {/* Dark overlay to adjust stats card background image darkness */}
        <View
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor: "rgba(0, 0, 0, 0.70)", borderRadius: 20 },
          ]}
        />
        {stats.map((stat, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <View style={styles.statDivider} />}
            <View style={styles.statBlock}>
              <View style={styles.statIconCircle}>
                <Ionicons name={stat.icon} size={16} color={GOLD} />
              </View>
              <Text style={styles.statNumber}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statSub}>{stat.sub}</Text>
            </View>
          </React.Fragment>
        ))}
      </ImageBackground>
    </Reanimated.View>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Quick Action Buttons
// ─────────────────────────────────────────────────────────────────────────────
function QuickActions() {
  const router = useRouter();
  const actions = [
    { icon: "refresh-circle" as const, label: "Reorder", sub: "Buy Again", color: ORANGE, route: "/profile/favorites/favorite-orders" },
    { icon: "navigate-circle" as const, label: "Track", sub: "Order Status", color: GREEN, route: "/orders/track" },
    { icon: "pricetag" as const, label: "Offers", sub: "Best Deals", color: GOLD, route: "/profile/offers" },
    { icon: "headset" as const, label: "Support", sub: "We're Here", color: BLUE, route: "/profile/support/help" },
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
          <View style={styles.actionIconCircle}>
            <Ionicons name={action.icon as any} size={26} color={GOLD} />
          </View>
          <Text style={styles.actionLabel}>{action.label}</Text>
          <Text style={styles.actionSub}>{action.sub}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Membership Progress Card
// ─────────────────────────────────────────────────────────────────────────────
const MembershipCard = React.memo(function MembershipCard() {
  const { user } = useApp();
  const router = useRouter();
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
      <View style={styles.membershipCard}>
        {/* Diamond Icon */}
        <View style={styles.membershipDiamondWrap}>
          <Ionicons name="diamond" size={28} color={GOLD} />
        </View>

        {/* Content */}
        <View style={styles.membershipContent}>
          <View style={styles.membershipTopRow}>
            <Text style={styles.membershipTitle}>You're enjoying premium benefits!</Text>
            <TouchableOpacity
              style={styles.viewBenefitsBtn}
              onPress={() => router.push("/profile/membership/benefits" as any)}
              activeOpacity={0.7}
            >
              <Text style={styles.viewBenefitsText}>View Benefits</Text>
              <Ionicons name="chevron-forward" size={12} color={GOLD} />
            </TouchableOpacity>
          </View>
          <View style={styles.membershipProgressBar}>
            <LinearGradient colors={[GOLD, GOLD_LIGHT]} style={[styles.membershipProgressFill, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={styles.membershipProgressText}>
            {pointsToGold > 0
              ? `Spend ₹${(pointsToGold * 11.7).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} more to reach Platinum`
              : "You've reached Platinum!"}
          </Text>
        </View>
      </View>
    </Reanimated.View>
  );
});

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
    <View style={styles.safe}>
      <Reanimated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Hero Section with PBG.png */}
        <PremiumHeader
          user={user}
          onEdit={() => handleItemPress("edit-profile")}
          onChangePhoto={handlePickImage}
          isGold={isGold}
          onNotifications={() => router.push("/profile/notifications/order-updates" as any)}
          onSettings={() => router.push("/profile/settings")}
        />

        {/* Stats Card */}
        <StatsCard />



        {/* Membership Card */}
        {!isGold && <MembershipCard />}

        {/* Sections List */}
        <View style={styles.sectionsContainer}>
          {SECTIONS.map((section) => (
            <SettingsSection key={section.id} section={section} onPress={handleItemPress} />
          ))}
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.7}>
          <LinearGradient colors={[`${RED}15`, `${RED}05`]} style={styles.signOutGradient}>
            <Ionicons name="log-out-outline" size={20} color={RED} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Delete Account */}
        <TouchableOpacity style={styles.deleteBtn} activeOpacity={0.7}>
          <Text style={styles.deleteText}>Delete Account</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerLine} />
          <Text style={styles.footerText}>v2.5.0</Text>
          <View style={styles.footerLine} />
        </View>
      </Reanimated.ScrollView>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DARK_BG },

  // Floating header (appears on scroll)
  floatingHeader: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 1000 },
  floatingHeaderContent: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    paddingHorizontal: 20, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: `${GOLD}15`,
  },
  floatingTitle: { color: WHITE, fontSize: 18, fontWeight: "700", letterSpacing: 0.3 },

  // ── Hero Section ──────────────────────────────────────────────────────────
  heroBg: {
    width: "100%",
    paddingTop: 40,
    paddingBottom: 28,
  },
  heroTopBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    marginBottom: 18,
  },
  goldMemberBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  goldMemberText: {
    color: "#000",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
  },
  classicMemberBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: `${GOLD}20`,
    borderWidth: 1,
    borderColor: `${GOLD}40`,
  },
  classicMemberText: {
    color: GOLD,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  heroTopRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  heroTopIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(30,30,30,0.75)",
    borderWidth: 1,
    borderColor: `${GOLD}30`,
    alignItems: "center",
    justifyContent: "center",
  },
  notifDot: {
    position: "absolute",
    top: 9,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: RED,
    borderWidth: 1.5,
    borderColor: DARK_BG,
  },

  // Avatar
  heroAvatarWrap: {
    alignItems: "center",
    marginBottom: 14,
  },
  heroAvatarRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    padding: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  heroAvatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: SURFACE,
  },
  heroCameraBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(50,50,50,0.9)",
    borderWidth: 2,
    borderColor: DARK_BG,
    alignItems: "center",
    justifyContent: "center",
  },

  // Name/Email
  heroInfo: {
    alignItems: "center",
  },
  heroNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  heroName: {
    color: WHITE,
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  heroEmail: {
    color: MUTED,
    fontSize: 13,
    letterSpacing: 0.2,
  },

  // ── Stats Card ────────────────────────────────────────────────────────────
  statsCard: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: -4,
    marginBottom: 20,
    backgroundColor: SURFACE_2,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `${GOLD}18`,
    paddingVertical: 14,
    paddingHorizontal: 8,
    position: "relative",
    overflow: "hidden",
  },
  statBlock: {
    flex: 1,
    alignItems: "center",
  },
  statIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.2,
    borderColor: `${GOLD}50`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
    backgroundColor: `${GOLD}08`,
  },
  statNumber: {
    color: WHITE,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  statLabel: {
    color: "#AAAAAA",
    fontSize: 9.5,
    fontWeight: "600",
    marginTop: 3,
    letterSpacing: 0.2,
  },
  statSub: {
    color: GOLD,
    fontSize: 8.5,
    fontWeight: "600",
    marginTop: 2,
    letterSpacing: 0.3,
  },
  statDivider: {
    width: 1,
    height: 45,
    backgroundColor: `${GOLD}18`,
    alignSelf: "center",
  },

  // ── Quick Actions ─────────────────────────────────────────────────────────
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: SURFACE_2,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `${GOLD}18`,
    paddingVertical: 20,
    paddingHorizontal: 4,
  },
  actionBtn: {
    alignItems: "center",
    flex: 1,
  },
  actionIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1.5,
    borderColor: `${GOLD}50`,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${GOLD}08`,
    marginBottom: 8,
  },
  actionLabel: {
    color: WHITE,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  actionSub: {
    color: GOLD,
    fontSize: 9,
    fontWeight: "600",
    marginTop: 2,
    letterSpacing: 0.3,
  },

  // ── Membership Card ───────────────────────────────────────────────────────
  membershipWrapper: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  membershipCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: SURFACE_2,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `${GOLD}18`,
    padding: 18,
    gap: 14,
  },
  membershipDiamondWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: `${GOLD}12`,
    borderWidth: 1,
    borderColor: `${GOLD}30`,
    alignItems: "center",
    justifyContent: "center",
  },
  membershipContent: {
    flex: 1,
  },
  membershipTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    flexWrap: "wrap",
    gap: 6,
  },
  membershipTitle: {
    color: WHITE,
    fontSize: 13,
    fontWeight: "700",
    flex: 1,
  },
  viewBenefitsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderWidth: 1,
    borderColor: `${GOLD}50`,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  viewBenefitsText: {
    color: GOLD,
    fontSize: 11,
    fontWeight: "700",
  },
  membershipProgressBar: {
    height: 5,
    backgroundColor: `${GOLD}20`,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 6,
  },
  membershipProgressFill: {
    height: "100%",
    borderRadius: 3,
  },
  membershipProgressText: {
    color: MUTED,
    fontSize: 11,
  },

  // ── Sections ──────────────────────────────────────────────────────────────
  sectionsContainer: {
    marginHorizontal: 16,
    gap: 2,
    marginBottom: 24,
    backgroundColor: SURFACE_2,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `${GOLD}12`,
    overflow: "hidden",
  },
  section: {
    borderBottomWidth: 1,
    borderBottomColor: `${GOLD}08`,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  sectionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sectionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${GOLD}10`,
    borderWidth: 1,
    borderColor: `${GOLD}20`,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    color: WHITE,
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  sectionItems: {
    borderTopWidth: 1,
    borderTopColor: `${GOLD}08`,
    backgroundColor: `${SURFACE}80`,
  },
  sectionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: `${GOLD}06`,
  },
  subItem: { paddingLeft: 40 },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  itemIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  itemLabel: {
    color: WHITE,
    fontSize: 14,
    fontWeight: "500",
  },
  subItemLabel: { fontSize: 13, fontWeight: "400" },
  itemSub: { color: MUTED, fontSize: 11, marginTop: 2 },
  itemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  itemValue: {
    color: GOLD,
    fontSize: 12,
    fontWeight: "500",
  },
  subItemsContainer: {
    backgroundColor: `${SURFACE_3}50`,
  },

  // ── Sign Out / Delete / Footer ────────────────────────────────────────────
  signOutBtn: { marginHorizontal: 16, marginBottom: 12 },
  signOutGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: `${RED}25`,
  },
  signOutText: { color: RED, fontSize: 15, fontWeight: "600" },
  deleteBtn: { alignItems: "center", marginBottom: 20 },
  deleteText: { color: `${RED}50`, fontSize: 13, textDecorationLine: "underline" },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    gap: 12,
  },
  footerLine: { flex: 1, height: 1, backgroundColor: `${GOLD}15` },
  footerText: { color: MUTED_2, fontSize: 11 },
});