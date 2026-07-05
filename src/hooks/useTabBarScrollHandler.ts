import {
  useAnimatedScrollHandler,
  useSharedValue,
  withSpring,
  type SharedValue,
} from "react-native-reanimated";

const DELTA_THRESHOLD = 10;
const VELOCITY_THRESHOLD = 800;

const TAB_BAR_SPRING = {
  damping: 40,
  stiffness: 200,
  mass: 1.6,
};

export function useTabBarScrollHandler(
  animatedTranslateY: SharedValue<number>,
  hiddenOffset: SharedValue<number>,
  scrollY?: SharedValue<number>
) {
  const lastScrollY = useSharedValue(0);
  const direction = useSharedValue<1 | -1 | 0>(0);
  const directionalDelta = useSharedValue(0);
  const isTabBarVisible = useSharedValue(true);

  const hideTabBar = () => {
    "worklet";
    animatedTranslateY.value = withSpring(hiddenOffset.value, TAB_BAR_SPRING);
    isTabBarVisible.value = false;
    directionalDelta.value = 0;
  };

  const showTabBar = () => {
    "worklet";
    animatedTranslateY.value = withSpring(0, TAB_BAR_SPRING);
    isTabBarVisible.value = true;
    directionalDelta.value = 0;
  };

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      const y = Math.max(0, event.contentOffset.y);
      if (scrollY) {
        scrollY.value = y;
      }

      if (y <= 0) {
        if (!isTabBarVisible.value) {
          showTabBar();
        }
        lastScrollY.value = 0;
        direction.value = 0;
        directionalDelta.value = 0;
        return;
      }

      const delta = y - lastScrollY.value;
      lastScrollY.value = y;

      if (Math.abs(delta) < 0.1) {
        return;
      }

      const nextDirection: 1 | -1 = delta > 0 ? 1 : -1;
      if (direction.value !== nextDirection) {
        direction.value = nextDirection;
        directionalDelta.value = 0;
      }

      directionalDelta.value += Math.abs(delta);

      const velocityY = event.velocity?.y ?? 0;
      const shouldHideFast = nextDirection > 0 && velocityY > VELOCITY_THRESHOLD;
      const shouldShowFast = nextDirection < 0 && velocityY < -VELOCITY_THRESHOLD;
      const passedThreshold = directionalDelta.value >= DELTA_THRESHOLD;

      if (nextDirection > 0 && isTabBarVisible.value && (shouldHideFast || passedThreshold)) {
        hideTabBar();
        return;
      }

      if (nextDirection < 0 && !isTabBarVisible.value && (shouldShowFast || passedThreshold)) {
        showTabBar();
      }
    },
  });

  return { onScroll };
}
