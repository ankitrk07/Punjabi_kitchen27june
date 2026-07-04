/**
 * CustomTabBar.tsx
 *
 * Production-grade floating tab bar for React Native / Expo.
 *
 * Design language:
 *   — Deep obsidian glass substrate with genuine blur
 *   — Warm gold (#D4AF37) accent system: borders, glows, particles
 *   — Active pill: crisp white porcelain with layered depth
 *   — All animations calibrated for "premium app" feel:
 *       • No cartoon bouncing
 *       • Positional transitions: spring with overshootClamping: true
 *       • Scale microinteractions: micro overshoot (≤ 4%) only
 *       • Timing curves: expo-out for entrance, standard for exit
 *   — Ambient glow follows active tab (no jump, smooth spring)
 *   — Periodic gold sweep-line glint across top rim
 *   — Subtle particle system: 5 drifting gold motes
 *   — Selection ring: expands and fades on new-tab press
 *   — Container entrance: single unified translate+opacity, no scale gimmick
 *
 * Architecture:
 *   CustomTabBar (main)
 *   ├─ AmbientGlow           — tracking radial glow under active tab
 *   ├─ SweepLine             — periodic gold glint across top rim
 *   ├─ FloatingDust          — 5 × DustMote particles
 *   │    └─ DustMote
 *   ├─ ActivePill            — sliding white pill indicator
 *   │    ├─ PillBloom        — diffuse shadow bloom below pill
 *   │    └─ PillSurface      — gradient + specular + shimmer + rim
 *   ├─ NotchDividers         — hairline dividers between tabs (4+ tabs)
 *   ├─ TopHighlight          — 1px gradient rim at very top of bar
 *   ├─ CornerFlares          — soft radial ambient at two corners
 *   └─ TabBarItem (× N)
 *        ├─ SelectionRing    — gold ring burst on tab selection
 *        ├─ IconCrossfade    — smooth inactive ↔ active icon swap
 *        └─ LabelReveal      — width + opacity + translate label
 *
 * Dependencies:
 *   expo-blur, expo-haptics, expo-linear-gradient,
 *   react-native-reanimated ≥ 3, react-native-safe-area-context
 */
import { colors } from "@/src/theme";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, {
    useCallback,
    useEffect,
    useRef,
    useState
} from "react";
import {
    Dimensions,
    LayoutChangeEvent,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import Animated, {
    cancelAnimation,
    Easing,
    interpolate,
    type SharedValue,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withSpring,
    withTiming
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LottieView from "lottie-react-native";

/* ================================================================
   §1  SCREEN METRICS
   ================================================================ */

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/* ================================================================
   §2  LAYOUT CONSTANTS
   Every spatial value lives here.
   ================================================================ */

/** Total visible height of the tab bar capsule */
export const TAB_BAR_HEIGHT = 68;

/** Horizontal inset from screen edge → bar edge */
const TAB_BAR_HORIZONTAL_MARGIN = 20;

/** Corner radius of bar + shadow casters — must match */
const TAB_BAR_BORDER_RADIUS = 34;

/** Height of the sliding white active-tab pill */
const ACTIVE_PILL_HEIGHT = 48;

/** Border radius of active pill (= half of height for capsule) */
const PILL_BORDER_RADIUS = 24;

/** Gap between pill edge and tab cell edge */
const PILL_INSET = 5;

/** Icon render size for both states */
const ICON_SIZE = 20;

/** Tab label font size */
const LABEL_FONT_SIZE = 10;

/** From where do I set the font size of the tabs, and how do I align the icon in the center of the white rectangular pill?  width the label can expand to */
const LABEL_MAX_WIDTH = 92;

/** Spacing between icon and label when active */
const LABEL_GAP = 8;

/* ================================================================
   §3  ANIMATION PRESETS
   ================================================================ */

/**
 * Pill translation / width — fluid deceleration, zero overshoot.
 * Overshoot on a physical pill sliding across a bar looks broken.
 */
const SPRING_PILL = {
    damping: 34,
    mass: 0.82,
    stiffness: 290,
    overshootClamping: true,
    restDisplacementThreshold: 0.001,
    restSpeedThreshold: 0.001,
};

/**
 * Icon scale — tiny controlled overshoot gives life without silliness.
 * Max overshoot: ~1.04× before settling to 1.0.
 */
const SPRING_ICON = {
    damping: 18,
    mass: 0.68,
    stiffness: 230,
    overshootClamping: false,
    restDisplacementThreshold: 0.001,
    restSpeedThreshold: 0.001,
};

/**
 * Press feedback — instant feel, minimal residue.
 */
const SPRING_PRESS = {
    damping: 24,
    mass: 0.6,
    stiffness: 340,
    overshootClamping: false,
};

/**
 * Label width reveal — crisp, no bounce.
 */
const SPRING_LABEL = {
    damping: 30,
    mass: 0.88,
    stiffness: 260,
    overshootClamping: true,
};

/**
 * Ambient glow tracking — soft, a few frames behind the pill.
 */
const SPRING_GLOW = {
    damping: 38,
    mass: 1.1,
    stiffness: 210,
    overshootClamping: true,
};

/**
 * Container entrance — single direction, damped.
 */
const SPRING_ENTRANCE = {
    damping: 36,
    mass: 1.0,
    stiffness: 240,
    overshootClamping: true,
};

/* ── Timing configs ── */
const EASE_OUT_EXPO = Easing.bezier(0.16, 1, 0.3, 1);
const EASE_IN_EXPO = Easing.bezier(0.7, 0, 0.84, 0);
const EASE_STANDARD = Easing.bezier(0.4, 0, 0.2, 1);
const EASE_DECEL = Easing.bezier(0.0, 0, 0.2, 1);

const T_INSTANT = { duration: 80, easing: EASE_STANDARD };
const T_FAST = { duration: 180, easing: EASE_OUT_EXPO };
const T_MEDIUM = { duration: 300, easing: EASE_OUT_EXPO };
const T_SLOW = { duration: 480, easing: EASE_OUT_EXPO };
const T_XSLOW = { duration: 640, easing: EASE_OUT_EXPO };

/* ================================================================
   §4  DESIGN TOKENS
   The entire visual identity lives here; nothing is hardcoded
   in components or StyleSheet.
   ================================================================ */

const C = {
    /* ── Background system ───────────────────────────────────── */
    bgDeep: "#080808",
    bgGlass: "#090909",
    bgFrost: "#0A0A0A",

    /* ── Border ring system ──────────────────────────────────── */
    borderOuter: "rgba(255, 255, 255, 0.07)",
    borderInner: "rgba(255, 255, 255, 0.12)",
    borderGold: "rgba(212, 175, 55, 0.32)",
    borderGoldBold: "rgba(212, 175, 55, 0.60)",
    borderSubtle: "rgba(255, 255, 255, 0.03)",

    /* ── Gold spectrum ───────────────────────────────────────── */
    gold: (colors.gold as string) ?? "#D4AF37",
    goldBright: "#F0C840",
    goldWarm: "#C8A227",
    goldDim: "rgba(212, 175, 55, 0.52)",
    goldGlow: "rgba(212, 175, 55, 0.20)",
    goldAmbient: "rgba(212, 175, 55, 0.10)",
    goldFaint: "rgba(212, 175, 55, 0.06)",
    goldTrace: "rgba(212, 175, 55, 0.03)",

    /* ── Active pill ─────────────────────────────────────────── */
    pillTop: "#FFFFFF",
    pillMid: "#F6F6F8",
    pillBot: "#ECECF0",
    pillSpecular: "rgba(255, 255, 255, 0.68)",
    pillShadowLo: "rgba(0,   0,   0,   0.16)",
    pillGlow: "rgba(255, 255, 255, 0.12)",

    /* ── Icons & text ────────────────────────────────────────── */
    iconActive: "#0B0B0D",
    iconInactive: "rgba(180, 165, 120, 0.65)",
    labelActive: "#0B0B0D",

    /* ── Shadows ─────────────────────────────────────────────── */
    shadowBase: "#000000",

    /* ── Surface lights ──────────────────────────────────────── */
    rimLight: "rgba(255, 255, 255, 0.15)",
    cornerLitL: "rgba(255, 255, 255, 0.04)",
    cornerLitR: "rgba(212, 175, 55, 0.05)",

    /* ── Particle ────────────────────────────────────────────── */
    dust: "#D4AF37",
} as const;

/* ================================================================
   §5  HAPTIC UTILITIES
   ================================================================ */

const IS_NATIVE = Platform.OS === "ios" || Platform.OS === "android";

function hapticSelect(): void {
    if (!IS_NATIVE) return;
    Haptics.selectionAsync().catch(() => { });
}

function hapticImpact(
    style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light
): void {
    if (!IS_NATIVE) return;
    Haptics.impactAsync(style).catch(() => { });
}

/* ================================================================
   §6  SHARED TYPES
   ================================================================ */

interface TabLayout {
    x: number;
    width: number;
}

/* ================================================================
   §7  AMBIENT GLOW
   A soft radial gold glow that tracks the active tab.
   Slow breathing pulse layered on top of positional spring.
   ================================================================ */

interface AmbientGlowProps {
    activeIndex: number;
    tabLayouts: TabLayout[];
    ready: boolean;
}

const AmbientGlow: React.FC<AmbientGlowProps> = ({
    activeIndex,
    tabLayouts,
    ready,
}) => {
    const translateX = useSharedValue(0);
    const opacity = useSharedValue(0.45);

    /* ── Track active tab ── */
    useEffect(() => {
        if (!ready || !tabLayouts[activeIndex]) return;
        const { x, width } = tabLayouts[activeIndex];
        translateX.value = withSpring(x + width / 2 - 88, SPRING_GLOW);
    }, [activeIndex, ready, tabLayouts]);

    const outerStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateX: translateX.value }],
    }));

    return (
        <Animated.View pointerEvents="none" style={[styles.glowRoot, outerStyle]}>
            {/* Outer halo — wide, faint */}
            <View style={styles.glowHaloOuter} />
            {/* Inner warm core — tighter, brighter */}
            <View style={styles.glowHaloInner} />
        </Animated.View>
    );
};

/* ================================================================
   §8  SWEEP LINE
   A thin gold-tinged gradient bar that periodicaly sweeps
   across the top edge of the tab bar.  Period: ~11 s.
   ================================================================ */

const SweepLine: React.FC = () => {
    const tx = useSharedValue(-SCREEN_WIDTH * 1.2);

    useEffect(() => {

        const PERIOD = 11_000;
        const DURATION = 5_400;
        const DELAY = PERIOD - DURATION;

        const kick = () => {
            tx.value = -SCREEN_WIDTH * 1.2;
            tx.value = withSequence(
                withTiming(SCREEN_WIDTH * 1.2, {
                    duration: DURATION,
                    easing: Easing.bezier(0.22, 1, 0.36, 1),
                }),
                withDelay(DELAY, withTiming(-SCREEN_WIDTH * 1.2, { duration: 0 }))
            );
        };

        kick();
        const id = setInterval(kick, PERIOD);
        return () => {
            clearInterval(id);
            cancelAnimation(tx);
        };
    }, []);

    const style = useAnimatedStyle(() => ({ transform: [{ translateX: tx.value }] }));

    return (
        <Animated.View pointerEvents="none" style={[styles.sweepLine, style]}>
            <LinearGradient
                colors={[
                    "rgba(255,255,255,0.00)",
                    "rgba(255,255,255,0.00)",
                    "rgba(212,175,55, 0.24)",
                    "rgba(255,255,255,0.10)",
                    "rgba(255,255,255,0.18)",
                    "rgba(212,175,55, 0.24)",
                    "rgba(255,255,255,0.00)",
                    "rgba(255,255,255,0.00)",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
            />
        </Animated.View>
    );
};

/* ================================================================
   §9  DUST MOTE (particle)
   A single 3×3 gold particle drifting upward slowly, looping.
   ================================================================ */

interface DustMoteProps {
    x: number;
    delay: number;
    amplitude?: number;
    speed?: number;
    size?: number;
    layer?: "front" | "mid" | "back";
}

const DustMote: React.FC<DustMoteProps> = ({
    x,
    delay,
    amplitude = 44,
    speed = 1,
    size = 2.5,
    layer = "mid",
}) => {
    const ty       = useSharedValue(0);
    const op       = useSharedValue(0);
    const driftX   = useSharedValue(0);

    const BASE_DURATION = (4800 + Math.random() * 1400) / speed;

    /* Layer-based opacity ceiling — back particles are dimmer */
    const opacityCeiling =
        layer === "front" ? 0.85 :
        layer === "mid"   ? 0.55 :
                            0.28;

    useEffect(() => {
        /* Vertical rise */
        ty.value = withDelay(
            delay,
            withRepeat(
                withTiming(-amplitude, {
                    duration: BASE_DURATION,
                    easing: Easing.inOut(Easing.ease),
                }),
                -1,
                true
            )
        );

        /* Opacity fade-in → hold → fade-out */
        op.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(opacityCeiling, {
                        duration: BASE_DURATION * 0.28,
                    }),
                    withTiming(opacityCeiling * 0.6, {
                        duration: BASE_DURATION * 0.44,
                    }),
                    withTiming(0.0, { duration: BASE_DURATION * 0.28 })
                ),
                -1,
                false
            )
        );

        /* Micro horizontal wobble */
        driftX.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(5,  {
                        duration: BASE_DURATION * 0.6,
                        easing: Easing.inOut(Easing.ease),
                    }),
                    withTiming(-5, {
                        duration: BASE_DURATION * 0.4,
                        easing: Easing.inOut(Easing.ease),
                    })
                ),
                -1,
                true
            )
        );

        return () => {
            cancelAnimation(ty);
            cancelAnimation(op);
            cancelAnimation(driftX);
        };
    }, [delay]);

    const style = useAnimatedStyle(() => ({
        opacity: op.value,
        transform: [
            { translateY: ty.value },
            { translateX: driftX.value },
        ],
    }));

    return (
        <Animated.View
            pointerEvents="none"
            style={[
                styles.dustMote,
                {
                    left: x,
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                },
                style,
            ]}
        />
    );
};

/* ================================================================
   §10  FLOATING DUST SYSTEM
   Five motes across three depth layers.
   ================================================================ */

const DUST_CONFIGS: Array<{
    xFraction: number;
    delay: number;
    amplitude: number;
    speed: number;
    size: number;
    layer: "front" | "mid" | "back";
}> = [
    /* Back layer */
    { xFraction: 0.20, delay: 1200, amplitude: 35, speed: 0.5, size: 1.2, layer: "back" },
    { xFraction: 0.74, delay: 600, amplitude: 30, speed: 0.5, size: 1.6, layer: "back" },

    /* Mid layer */
    { xFraction: 0.28, delay: 400, amplitude: 52, speed: 0.9, size: 2.2, layer: "mid" },
    { xFraction: 0.80, delay: 700,  amplitude: 40, speed: 0.9, size: 2.6, layer: "mid" },

    /* Front layer */
    { xFraction: 0.50, delay: 800, amplitude: 55, speed: 1.5, size: 3.8, layer: "front" },
];

const BAR_WIDTH = SCREEN_WIDTH - TAB_BAR_HORIZONTAL_MARGIN * 2;

const FloatingDust: React.FC = () => (
    <>
        {DUST_CONFIGS.map(({ xFraction, delay, amplitude, speed, size, layer }, i) => (
            <DustMote
                key={i}
                x={BAR_WIDTH * xFraction}
                delay={delay}
                amplitude={amplitude}
                speed={speed}
                size={size}
                layer={layer}
            />
        ))}
    </>
);

/* ================================================================
   §11  ACTIVE PILL — INNER COMPONENTS

   Broken into sub-layers so each concern is isolated:
     PillBloom    — diffuse white shadow beneath
     PillGradient — the actual gradient fill
     PillSpecular — top-edge specular reflection
     PillShimmer  — breathing overlay
     PillShadow   — bottom inner shadow
     PillRim      — outer gold hairline border
   ================================================================ */

const ActivePill: React.FC<{
    activeIndex: number;
    tabLayouts: TabLayout[];
    ready: boolean;
    prevIndexRef: React.MutableRefObject<number>;
}> = ({
    activeIndex,
    tabLayouts,
    ready,
    prevIndexRef,
}) => {
    const translateX = useSharedValue(0);
    const pillWidth = useSharedValue(100);
    const opacity = useSharedValue(0);

    /* ── Positional update ── */
    useEffect(() => {
        if (!ready || !tabLayouts[activeIndex]) return;

        const { x, width } = tabLayouts[activeIndex];
        const EXTRA_WIDTH = 0;
        const targetX = x - EXTRA_WIDTH / 2;
        const targetW = width + EXTRA_WIDTH;

        if (opacity.value < 0.05) {
            translateX.value = targetX;
            pillWidth.value = targetW;
            opacity.value = withTiming(1, { duration: 150 });
            prevIndexRef.current = activeIndex;
            return;
        }

        prevIndexRef.current = activeIndex;

        /* Translate & width — simple fast spring */
        translateX.value = withSpring(targetX, SPRING_PILL);
        pillWidth.value = withSpring(targetW, SPRING_PILL);
    }, [activeIndex, ready, tabLayouts]);

    const bloomStyle = useAnimatedStyle(() => ({
        width: pillWidth.value + 20,
        opacity: interpolate(opacity.value, [0, 1], [0, 0.42]),
        transform: [
            { translateX: translateX.value - 10 },
            { scaleY: 1 },
        ],
    }));

    const surfaceStyle = useAnimatedStyle(() => ({
        width: pillWidth.value,
        opacity: opacity.value,
        transform: [
            { translateX: translateX.value },
            { scaleX: 1 },
            { scaleY: 1 },
            { skewX: "0deg" },
        ],
    }));

    return (
        <>
            <Animated.View pointerEvents="none" style={[styles.pillBloom, bloomStyle]} />
            <Animated.View pointerEvents="none" style={[styles.pillSurface, surfaceStyle]}>
                <LinearGradient
                    colors={[C.pillTop, C.pillMid, C.pillBot]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />
                <View style={styles.pillSpecular} />
                <View style={styles.pillEdgeSpecularRight} />
                <View style={styles.pillGoldRim} />
            </Animated.View>
        </>
    );
};

/* ================================================================
   §13  TOP HIGHLIGHT
   1px gradient rim across the very top — simulates rim lighting
   from an overhead source.
   ================================================================ */

const TopHighlight: React.FC = () => (
    <View pointerEvents="none" style={styles.topHighlightRoot}>
        <LinearGradient
            colors={[
                "rgba(255,255,255,0.00)",
                "rgba(255,255,255,0.16)",
                "rgba(212,175,55,0.10)",
                "rgba(255,255,255,0.16)",
                "rgba(255,255,255,0.00)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
        />
    </View>
);

/* ================================================================
   §14  CORNER FLARES
   Soft ambient radials at the two top corners — simulates
   environmental lighting bouncing off the bar.
   ================================================================ */

const CornerFlares: React.FC = () => (
    <>
        <View
            pointerEvents="none"
            style={[styles.cornerFlare, styles.cornerFlareL]}
        />
        <View
            pointerEvents="none"
            style={[styles.cornerFlare, styles.cornerFlareR]}
        />
    </>
);

/* ================================================================
   §15  NOTCH DIVIDERS
   Hairline dividers between tab cells. Shown only on 4+ tab bars.
   Adjacent-to-active dividers are hidden.
   ================================================================ */

interface NotchDividersProps {
    count: number;
    tabLayouts: TabLayout[];
    activeIndex: number;
    ready: boolean;
}

const NotchDividers: React.FC<NotchDividersProps> = ({
    count,
    tabLayouts,
    activeIndex,
    ready,
}) => {
    if (count < 4 || !ready) return null;

    return (
        <>
            {Array.from({ length: count - 1 }, (_, i) => {
                /* Hide dividers immediately left and right of active tab */
                if (i === activeIndex || i === activeIndex - 1) return null;
                const layout = tabLayouts[i];
                if (!layout) return null;

                return (
                    <View
                        key={i}
                        pointerEvents="none"
                        style={[
                            styles.divider,
                            {
                                left: layout.x + layout.width,
                                top: (TAB_BAR_HEIGHT - 20) / 2,
                            },
                        ]}
                    />
                );
            })}
        </>
    );
};

/* ================================================================
   §16  SELECTION RING
   A gold ring that expands outward and fades when a new tab
   is selected. Triggered by `trigger` incrementing.
   ================================================================ */

interface SelectionRingProps {
    trigger: number;
}

const SelectionRing: React.FC<SelectionRingProps> = ({ trigger }) => {
    return null;
};

/* ================================================================
   §17  ICON CROSSFADE
   Smoothly transitions between inactive and active icon variants
   using opacity alone (no transform to keep it clean).
   ================================================================ */

interface IconCrossfadeProps {
    isFocused: boolean;
    icon: React.ReactNode;
    activeIcon: React.ReactNode;
    iconScaleSV: SharedValue<number>;
    iconTranslateYSV: SharedValue<number>;
}

const IconCrossfade: React.FC<IconCrossfadeProps> = ({
    isFocused,
    icon,
    activeIcon,
    iconScaleSV,
    iconTranslateYSV,
}) => {
    const progress = useSharedValue(isFocused ? 1 : 0);

    useEffect(() => {
        progress.value = withTiming(isFocused ? 1 : 0, T_MEDIUM);
    }, [isFocused]);

    const wrapperStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: iconScaleSV.value },
            { translateY: iconTranslateYSV.value },
        ],
    }));

    const inactiveStyle = useAnimatedStyle(() => ({
        opacity: 1 - progress.value,
    }));

    const activeStyle = useAnimatedStyle(() => ({
        opacity: progress.value,
    }));

    return (
        <Animated.View style={[styles.iconWrapper, wrapperStyle]}>
            <Animated.View style={[styles.iconLayer, inactiveStyle]}>
                {icon}
            </Animated.View>
            <Animated.View style={[styles.iconLayer, styles.iconLayerAbsolute, activeStyle]}>
                {activeIcon}
            </Animated.View>
        </Animated.View>
    );
};

/* ================================================================
   §18  LABEL REVEAL
   Width + opacity + translateX reveal.  No bounce.
   ================================================================ */

interface LabelRevealProps {
    isFocused: boolean;
    label: string;
}

const LabelReveal: React.FC<LabelRevealProps> = ({ isFocused, label }) => {
    const opacity = useSharedValue(isFocused ? 0 : 1);

    useEffect(() => {
        if (isFocused) {
            opacity.value = withTiming(0, { duration: 120 });
        } else {
            opacity.value = withTiming(1, { duration: 120 });
        }
    }, [isFocused]);

    const style = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <Animated.View style={style}>
            <Text style={styles.labelText} numberOfLines={1}>
                {label}
            </Text>
        </Animated.View>
    );
};

/* ================================================================
   §19  TAB BAR ITEM
   Composes: SelectionRing + IconCrossfade + LabelReveal
   Handles: press states, haptics, layout reporting
   ================================================================ */

interface TabBarItemProps {
    isFocused: boolean;
    onPress: () => void;
    onLongPress: () => void;
    onLayout: (x: number, width: number) => void;
    icon: React.ReactNode;
    activeIcon: React.ReactNode;
    label: string;
}

const TabBarItem: React.FC<TabBarItemProps> = ({
    isFocused,
    onPress,
    onLongPress,
    onLayout,
    icon,
    activeIcon,
    label,
}) => {
    const [ringTrigger, setRingTrigger] = useState(0);

    /* Shared values for icon animations — passed into IconCrossfade */
    const pressScale = useSharedValue(1);
    const iconScale = useSharedValue(1);
    const iconTranslateY = useSharedValue(0);
    const tabShiftX = useSharedValue(0);

    /* ── Press handlers ── */
    const onPressIn = useCallback(() => {
        pressScale.value = withSpring(0.90, SPRING_PRESS);
    }, []);

    const onPressOut = useCallback(() => {
        pressScale.value = withSpring(1, SPRING_PRESS);
    }, []);

    const handlePress = useCallback(() => {
        if (!isFocused) {
            hapticSelect();
            setRingTrigger((t) => t + 1);
        } else {
            hapticImpact(Haptics.ImpactFeedbackStyle.Light);
        }
        onPress();
    }, [isFocused, onPress]);

    const handleLongPress = useCallback(() => {
        hapticImpact(Haptics.ImpactFeedbackStyle.Medium);
        onLongPress();
    }, [onLongPress]);

    const handleLayout = useCallback(
        (e: LayoutChangeEvent) => {
            onLayout(e.nativeEvent.layout.x, e.nativeEvent.layout.width);
        },
        [onLayout]
    );

    /* ── Container press scale ── */
    const containerStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: tabShiftX.value },
            { scale: pressScale.value },
        ],
    }));

    return (
        <Pressable
            onPress={handlePress}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            onLongPress={handleLongPress}
            onLayout={handleLayout}
            style={styles.tabPressable}
            android_ripple={null}
            accessibilityRole="tab"
            accessibilityState={{ selected: isFocused }}
            accessibilityLabel={label}
        >
            <Animated.View style={[styles.tabInner, containerStyle]}>
                {/* Ring on new selection */}
                <SelectionRing trigger={ringTrigger} />

                {/* Icon + label row */}
                <View style={styles.tabContent}>
                    <IconCrossfade
                        isFocused={isFocused}
                        icon={icon}
                        activeIcon={activeIcon}
                        iconScaleSV={iconScale}
                        iconTranslateYSV={iconTranslateY}
                    />
                    <LabelReveal isFocused={isFocused} label={label} />
                </View>
            </Animated.View>
        </Pressable>
    );
};

/* ================================================================
   §20  CONTAINER ENTRANCE ANIMATION HOOK
   Single unified motion: translate up + fade in.
   No scale animation — scale on a solid bar looks cheap.
   ================================================================ */

function useContainerEntrance() {
    const ty = useSharedValue(30);
    const opacity = useSharedValue(0);

    useEffect(() => {
        ty.value = withDelay(160, withSpring(0, SPRING_ENTRANCE));
        opacity.value = withDelay(160, withTiming(1, { duration: 440, easing: EASE_OUT_EXPO }));
    }, []);

    return useAnimatedStyle(() => ({
        transform: [{ translateY: ty.value }],
        opacity: opacity.value,
    }));
}

/* ================================================================
   §20-B  FOOD TRANSITION OVERLAY
   Small, short-lived food animation shown before navigating to
   the Reserves screen.
   ================================================================ */

function FoodTransitionOverlay({ visible }: { visible: boolean }) {
    const backdropOpacity = useSharedValue(0);
    const cardScale = useSharedValue(0.88);
    const cardY = useSharedValue(14);
    
    // Load the Lottie JSON
    const animJson = require("../../assets/dinner-anim.json");

    useEffect(() => {
        if (visible) {
            backdropOpacity.value = withTiming(1, { duration: 160, easing: EASE_STANDARD });
            cardScale.value = withSequence(
                withTiming(1.06, { duration: 220, easing: EASE_OUT_EXPO }),
                withSpring(1, { damping: 18, stiffness: 240, overshootClamping: true })
            );
            cardY.value = withSequence(
                withTiming(0, { duration: 180, easing: EASE_OUT_EXPO }),
                withSpring(-3, { damping: 20, stiffness: 220, overshootClamping: true }),
                withSpring(0, { damping: 20, stiffness: 220, overshootClamping: true })
            );
        } else {
            backdropOpacity.value = withTiming(0, { duration: 180, easing: EASE_STANDARD });
        }

        return () => {
            cancelAnimation(backdropOpacity);
            cancelAnimation(cardScale);
            cancelAnimation(cardY);
        };
    }, [visible]);

    const backdropStyle = useAnimatedStyle(() => ({
        opacity: backdropOpacity.value,
    }));

    const cardStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: cardY.value }, { scale: cardScale.value }],
    }));

    return (
        <Modal transparent visible={visible} animationType="fade" statusBarTranslucent>
            <Animated.View pointerEvents="none" style={[styles.foodBackdrop, backdropStyle]}>
                <LinearGradient
                    colors={["#000000", "#000000"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />

                <Animated.View pointerEvents="none" style={[styles.foodCard, cardStyle, { width: 340, height: 340, padding: 0, overflow: 'hidden', backgroundColor: 'transparent', borderWidth: 0, shadowColor: 'transparent' }]}>
                    <LottieView
                        source={animJson}
                        autoPlay
                        loop
                        style={{ width: '100%', height: '100%' }}
                    />
                </Animated.View>
            </Animated.View>
        </Modal>
    );
}

/* ================================================================
   §21  MAIN CUSTOM TAB BAR
   ================================================================ */

type CustomTabBarProps = BottomTabBarProps & {
    animatedTranslateY: SharedValue<number>;
};

export default React.memo(function CustomTabBar({
    state,
    descriptors,
    navigation,
    animatedTranslateY,
}: CustomTabBarProps) {
    const insets = useSafeAreaInsets();

    /* ── Active index ── */
    const focusedIndex = state.index;

    /* ── Tab layout registry ── */
    const tabLayoutsRef = useRef<TabLayout[]>([]);
    const prevIndexRef = useRef<number>(focusedIndex);
    const [layoutsReady, setLayoutsReady] = useState(false);
    const [foodTransitionVisible, setFoodTransitionVisible] = useState(false);
    const pendingNavigationTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    /* ── Entrance animation ── */
    const entranceStyle = useContainerEntrance();

    const translateStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: animatedTranslateY.value }],
    }));

    useEffect(() => {
        animatedTranslateY.value = withTiming(0, { duration: 250 });
    }, [focusedIndex]);

    useEffect(() => {
        return () => {
            if (pendingNavigationTimeout.current) {
                clearTimeout(pendingNavigationTimeout.current);
            }
        };
    }, []);

    /* ── Layout collection ── */
    const handleTabLayout = useCallback(
        (index: number, x: number, width: number) => {
            tabLayoutsRef.current[index] = { x, width };
            const filled = tabLayoutsRef.current.filter(Boolean).length;
            if (filled === state.routes.length && !layoutsReady) {
                requestAnimationFrame(() => setLayoutsReady(true));
            }
        },
        [state.routes.length, layoutsReady]
    );

    /* ── Safe-area offset ── */
    const bottomOffset = Math.max(insets.bottom, 10) + 14;

    return (
        <View
            pointerEvents="box-none"
            style={[styles.absoluteRoot, { bottom: bottomOffset }]}
        >
            <Animated.View style={[styles.translateWrapper, translateStyle]}>
                <Animated.View style={[styles.entranceWrapper, entranceStyle]}>
                {/* ─────────────────────────────────────────────────
            Shadow caster stack
            Two layers compose into a richer drop shadow than
            a single shadowRadius can achieve.
            ───────────────────────────────────────────────── */}
                <View style={styles.shadowA}>
                    <View style={styles.shadowB}>

                        {/* ───────────────────────────────────────────
                Bar shell — clips all children to the capsule.
                ─────────────────────────────────────────── */}
                        <View style={styles.barShell}>

                            {/* Ambient glow tracking active tab */}
                            <AmbientGlow
                                activeIndex={focusedIndex}
                                tabLayouts={tabLayoutsRef.current}
                                ready={layoutsReady}
                            />

                            {/* ─────────────────────────────────────────
                  Glass blur substrate
                  ───────────────────────────────────────── */}
                            <View style={styles.blurLayer}>
                                {/* Dark tint overlay — stabilises blur on Android */}
                                <View style={styles.darkTint} pointerEvents="none" />

                                {/* Charcoal depth gradient — obsidian texture */}
                                <LinearGradient
                                    colors={[
                                        "#0D0B08",
                                        "#080808",
                                        "#0A0909",
                                    ]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={StyleSheet.absoluteFill}
                                    pointerEvents="none"
                                />

                                {/* Ultra-faint diagonal grain — matte micro-texture */}
                                <LinearGradient
                                    colors={["#FFFFFF", "#000000", "#FFFFFF"]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={[StyleSheet.absoluteFill, styles.matteGrainOverlay]}
                                    pointerEvents="none"
                                />

                                {/* Gold atmospheric gradient — top-to-bottom very faint */}
                                <LinearGradient
                                    colors={[C.goldFaint, "transparent", C.goldTrace]}
                                    start={{ x: 0.5, y: 0 }}
                                    end={{ x: 0.5, y: 1 }}
                                    style={StyleSheet.absoluteFill}
                                    pointerEvents="none"
                                />

                                {/* Periodic sweep glint */}
                                <SweepLine />

                                {/* Floating dust particles */}
                                <FloatingDust />

                                {/* Corner radial flares */}
                                <CornerFlares />



                                {/* Active pill — below tab content */}
                                <ActivePill
                                    activeIndex={focusedIndex}
                                    tabLayouts={tabLayoutsRef.current}
                                    ready={layoutsReady}
                                    prevIndexRef={prevIndexRef}
                                />

                                {/* Hairline dividers between cells (4+ tabs) */}
                                <NotchDividers
                                    count={state.routes.length}
                                    tabLayouts={tabLayoutsRef.current}
                                    activeIndex={focusedIndex}
                                    ready={layoutsReady}
                                />

                                {/* ─────────────────────────────────────────
                    Tab items
                    ───────────────────────────────────────── */}
                                <View style={styles.tabsRow}>
                                    {state.routes.map((route, index) => {
                                        const { options } = descriptors[route.key];

                                        const rawLabel =
                                            options.tabBarLabel !== undefined
                                                ? options.tabBarLabel
                                                : options.title !== undefined
                                                    ? options.title
                                                    : route.name;

                                        const label =
                                            typeof rawLabel === "string" ? rawLabel : route.name;

                                        const isFocused = focusedIndex === index;

                                        const onPress = () => {
                                            const event = navigation.emit({
                                                type: "tabPress",
                                                target: route.key,
                                                canPreventDefault: true,
                                            });
                                            if (!isFocused && !event.defaultPrevented) {
                                                if (route.name === "reserves") {
                                                    if (pendingNavigationTimeout.current) {
                                                        clearTimeout(pendingNavigationTimeout.current);
                                                    }
                                                    setFoodTransitionVisible(true);
                                                    
                                                    // Navigate after 200ms so the overlay is visible first
                                                    setTimeout(() => {
                                                        navigation.navigate(route.name, route.params);
                                                    }, 200);

                                                    // Keep overlay for 3.2 seconds total, then fade out
                                                    pendingNavigationTimeout.current = setTimeout(() => {
                                                        setFoodTransitionVisible(false);
                                                    }, 3200);
                                                    return;
                                                }
                                                navigation.navigate(route.name, route.params);
                                            }
                                        };

                                        const onLongPress = () => {
                                            navigation.emit({
                                                type: "tabLongPress",
                                                target: route.key,
                                            });
                                        };

                                        const inactiveIcon = options.tabBarIcon
                                            ? options.tabBarIcon({
                                                focused: false,
                                                color: C.iconInactive,
                                                size: ICON_SIZE,
                                            })
                                            : null;

                                        const activeIcon = options.tabBarIcon
                                            ? options.tabBarIcon({
                                                focused: true,
                                                color: C.iconActive,
                                                size: ICON_SIZE,
                                            })
                                            : null;

                                        return (
                                            <TabBarItem
                                                key={route.key}
                                                isFocused={isFocused}
                                                onPress={onPress}
                                                onLongPress={onLongPress}
                                                onLayout={(x, w) => handleTabLayout(index, x, w)}
                                                icon={inactiveIcon}
                                                activeIcon={activeIcon}
                                                label={label}
                                            />
                                        );
                                    })}
                                </View>

                                {/* Rim light at very top edge */}
                                <TopHighlight />
                                    <FoodTransitionOverlay visible={foodTransitionVisible} />

                                {/* Micro shadow at bottom edge — depth cue */}
                                <View
                                    pointerEvents="none"
                                    style={styles.bottomEdgeShadow}
                                />

                            </View>

                            {/* Outer crisp border */}
                            <View pointerEvents="none" style={styles.outerBorderRing} />

                            {/* Gold hairline accent border */}
                            <View pointerEvents="none" style={styles.goldBorderRing} />

                        </View>
                        {/* end barShell */}

                    </View>
                </View>
                {/* end shadow stack */}

                {/* Ambient ground glow beneath bar — very faint */}
                <View pointerEvents="none" style={styles.groundPool} />

                </Animated.View>
            </Animated.View>
        </View>
    );
});

/* ================================================================
   §22  STYLESHEET
   Grouped by layer, not by component.
   Every spatial value traces back to §2 constants.
   Every color traces back to §4 tokens.
   ================================================================ */

const styles = StyleSheet.create({

    /* ─── §22-A  Root positioning ─────────────────────────────── */

    absoluteRoot: {
        position: "absolute",
        left: 0,
        right: 0,
        alignItems: "center",
        paddingHorizontal: TAB_BAR_HORIZONTAL_MARGIN,
    },

    entranceWrapper: {
        width: "100%",
        alignItems: "center",
    },

    translateWrapper: {
        width: "100%",
        alignItems: "center",
    },

    /* ─── §22-B  Shadow caster stack ─────────────────────────── */

    shadowA: {
        width: "100%",
        borderRadius: TAB_BAR_BORDER_RADIUS,
        shadowColor: "#D4AF37",
        shadowOffset: { width: 0, height: 18 },
        shadowOpacity: 0.18,
        shadowRadius: 48,
        elevation: 30,
    },

    shadowB: {
        width: "100%",
        borderRadius: TAB_BAR_BORDER_RADIUS,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.90,
        shadowRadius: 20,
        elevation: 20,
    },

    /* ─── §22-C  Bar shell ────────────────────────────────────── */

    barShell: {
        width: "100%",
        height: TAB_BAR_HEIGHT,
        borderRadius: TAB_BAR_BORDER_RADIUS,
        overflow: "hidden",
        /* Fully opaque matte surface */
        backgroundColor: "#080808",
    },

    /* ─── §22-D  Blur substrate ───────────────────────────────── */

    blurLayer: {
        flex: 1,
        overflow: "hidden",
    },

    darkTint: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "#080808",
    },

    matteGrainOverlay: {
        opacity: 0.012,
    },

    /* ─── §22-E  Ambient glow ─────────────────────────────────── */

    glowRoot: {
        position: "absolute",
        top: -54,
        width: 176,
        height: 176,
        alignItems: "center",
        justifyContent: "center",
    },

    glowHaloOuter: {
        position: "absolute",
        width: 176,
        height: 176,
        borderRadius: 88,
        backgroundColor: "rgba(212, 175, 55, 0.28)",
        shadowColor: "#D4AF37",
        shadowOpacity: 0.55,
        shadowRadius: 72,
        shadowOffset: { width: 0, height: 0 },
    },

    glowHaloInner: {
        position: "absolute",
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: "rgba(212, 175, 55, 0.18)",
        shadowColor: "#F0C840",
        shadowOpacity: 0.70,
        shadowRadius: 32,
        shadowOffset: { width: 0, height: 0 },
    },

    /* ─── §22-F  Sweep line ───────────────────────────────────── */

    sweepLine: {
        position: "absolute",
        top: 0,
        left: 0,
        /* Wide enough to show gradient fully during sweep */
        width: 280,
        height: 1,
    },

    /* ─── §22-G  Dust motes ───────────────────────────────────── */

    dustMote: {
        position: "absolute",
        bottom: 8,
        width: 2.5,
        height: 2.5,
        borderRadius: 1.25,
        backgroundColor: "#F0C840",
        shadowColor: "#D4AF37",
        shadowOpacity: 1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 0 },
        elevation: 4,
    },

    energyStream: {
        position: "absolute",
        top: (TAB_BAR_HEIGHT - ACTIVE_PILL_HEIGHT) / 2,
        height: ACTIVE_PILL_HEIGHT,
        borderRadius: PILL_BORDER_RADIUS,
    },

    /* ─── §22-H  Corner flares ────────────────────────────────── */

    cornerFlare: {
        position: "absolute",
        width: 96,
        height: 96,
        borderRadius: 48,
    },

    cornerFlareL: {
        top: -48,
        left: -24,
        backgroundColor: C.cornerLitL,
    },

    cornerFlareR: {
        top: -48,
        right: -24,
        backgroundColor: C.cornerLitR,
    },

    /* ─── §22-I  Active pill ──────────────────────────────────── */

    pillBloom: {
        position: "absolute",
        height: ACTIVE_PILL_HEIGHT + 12,
        top: (TAB_BAR_HEIGHT - ACTIVE_PILL_HEIGHT - 12) / 2,
        left: 0,
        borderRadius: PILL_BORDER_RADIUS + 6,
        backgroundColor: C.pillGlow,
        shadowColor: "#FFFFFF",
        shadowOpacity: 0.32,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 0 },
        elevation: 0,
    },

    pillSurface: {
        position: "absolute",
        height: ACTIVE_PILL_HEIGHT,
        top: (TAB_BAR_HEIGHT - ACTIVE_PILL_HEIGHT) / 2,
        left: 0,
        borderRadius: PILL_BORDER_RADIUS,
        overflow: "hidden",
        shadowColor: "#FFFFFF",
        shadowOpacity: 0.22,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 3 },
        elevation: 8,
    },

    pillSpecular: {
        position: "absolute",
        top: 0,
        left: 8,
        right: 8,
        height: ACTIVE_PILL_HEIGHT * 0.40,
        borderTopLeftRadius: PILL_BORDER_RADIUS,
        borderTopRightRadius: PILL_BORDER_RADIUS,
        backgroundColor: C.pillSpecular,
        opacity: 0.36,
    },

    pillEdgeSpecularRight: {
        position: "absolute",
        top: 6,
        right: 4,
        width: 3,
        height: ACTIVE_PILL_HEIGHT - 12,
        borderRadius: 1.5,
        backgroundColor: "rgba(255, 255, 255, 0.28)",
        opacity: 0.5,
    },

    pillShimmer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(255, 255, 255, 0.08)",
    },

    pillInnerShadow: {
    position: "absolute",
    bottom: 0,
    left: 10,
    right: 10,
    height: 3,
    borderBottomLeftRadius: PILL_BORDER_RADIUS,
    borderBottomRightRadius: PILL_BORDER_RADIUS,
},

    pillGoldRim: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: PILL_BORDER_RADIUS,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: C.borderGold,
    },

    /* ─── §22-J  Tabs row ─────────────────────────────────────── */

    tabsRow: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 6,
    },

    tabPressable: {
        flex: 1,
        height: TAB_BAR_HEIGHT,
        alignItems: "center",
        justifyContent: "center",
    },

    tabInner: {
        height: ACTIVE_PILL_HEIGHT,
        minWidth: 44,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 10,
        borderRadius: PILL_BORDER_RADIUS,
        overflow: "visible",
        gap: 2,
    },

    tabContent: {
        alignItems: "center",
        justifyContent: "center",
    },

    /* ─── §22-K  Selection ring ───────────────────────────────── */

    selectionRing: {
        position: "absolute",
        width: 52,
        height: 52,
        borderRadius: 26,
        borderWidth: 1.5,
        borderColor: C.goldDim,
    },

    /* ─── §22-L  Icon ─────────────────────────────────────────── */

    iconWrapper: {
        width: ICON_SIZE + 6,
        height: ICON_SIZE + 6,
        alignItems: "center",
        justifyContent: "center",
    },

    iconLayer: {
        alignItems: "center",
        justifyContent: "center",
    },

    iconLayerAbsolute: {
        position: "absolute",
    },

    /* ─── §22-M  Label ────────────────────────────────────────── */

    labelText: {
        fontSize: LABEL_FONT_SIZE,
        fontWeight: "700",
        letterSpacing: 0.15,
        color: "rgba(220, 195, 130, 0.90)",
        includeFontPadding: false,
    },

    /* ─── §22-N  Dividers ─────────────────────────────────────── */

    divider: {
        position: "absolute",
        width: StyleSheet.hairlineWidth,
        height: 20,
        backgroundColor: C.borderOuter,
    },

    /* ─── §22-O  Top highlight ────────────────────────────────── */

    topHighlightRoot: {
        position: "absolute",
        top: 0,
        left: TAB_BAR_BORDER_RADIUS * 0.55,
        right: TAB_BAR_BORDER_RADIUS * 0.55,
        height: 1,
    },

    /* ─── §22-P  Bottom edge shadow ───────────────────────────── */

    bottomEdgeShadow: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: "rgba(0, 0, 0, 0.32)",
    },

    /* ─── §22-Q  Outer border rings ───────────────────────────── */

    outerBorderRing: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: TAB_BAR_BORDER_RADIUS,
        borderWidth: 1,
        borderColor: C.borderOuter,
    },

    goldBorderRing: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: TAB_BAR_BORDER_RADIUS,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: C.borderGold,
    },

    /* ─── §22-R  Ground ambient pool ──────────────────────────── */

    groundPool: {
        position: "absolute",
        bottom: -22,
        left: "12%",
        right: "12%",
        height: 40,
        borderRadius: 40,
        backgroundColor: "transparent",
        shadowColor: "#D4AF37",
        shadowOpacity: 0.28,
        shadowRadius: 40,
        shadowOffset: { width: 0, height: 0 },
    },

    /* ─── §22-S  Food transition overlay ─────────────────────── */

    foodBackdrop: {
        ...StyleSheet.absoluteFillObject,
        alignItems: "center",
        justifyContent: "center",
    },

    foodCard: {
        width: 220,
        paddingVertical: 22,
        paddingHorizontal: 18,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: "rgba(212,175,55,0.34)",
        backgroundColor: "rgba(16, 12, 8, 0.86)",
        alignItems: "center",
        overflow: "hidden",
    },

    foodGlow: {
        position: "absolute",
        top: -32,
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: "rgba(212,175,55,0.12)",
    },

    foodKicker: {
        color: "rgba(240, 220, 170, 0.72)",
        fontSize: 9,
        fontWeight: "800",
        letterSpacing: 2.4,
        marginBottom: 14,
    },

    foodMain: {
        fontSize: 38,
        marginBottom: 8,
    },

    foodSteamRow: {
        marginBottom: 12,
    },

    foodSteam: {
        fontSize: 18,
    },

    foodSideRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 10,
    },

    foodSideEmoji: {
        fontSize: 16,
    },

    foodSideDivider: {
        color: "rgba(212,175,55,0.55)",
        fontSize: 14,
        fontWeight: "800",
    },

    foodCaption: {
        color: "rgba(255,255,255,0.72)",
        fontSize: 12,
        fontWeight: "600",
        letterSpacing: 0.2,
        textAlign: "center",
    },
});