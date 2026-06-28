import React, { useEffect, useRef } from "react";
import { View, StyleSheet, ScrollView, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from "react-native";

const { width: SCREEN_W } = Dimensions.get("window");

type Props = {
  children: React.ReactNode;
  speed?: number; // pixels per second
  itemWidth: number;
  itemCount: number;
};

export default function Marquee({ children, speed = 30, itemWidth, itemCount }: Props) {
  const scrollViewRef = useRef<ScrollView>(null);
  const totalWidth = itemWidth * itemCount;
  
  const currentX = useRef(0);
  const isDragging = useRef(false);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    let lastTime = Date.now();

    const tick = () => {
      const now = Date.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      if (!isDragging.current && scrollViewRef.current) {
        currentX.current += speed * delta;

        if (currentX.current >= totalWidth) {
          currentX.current -= totalWidth;
        }

        scrollViewRef.current.scrollTo({
          x: currentX.current,
          animated: false,
        });
      }

      animationFrameId.current = requestAnimationFrame(tick);
    };

    animationFrameId.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [totalWidth, speed]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    let x = event.nativeEvent.contentOffset.x;
    
    // Infinite loop snap checks
    if (x >= totalWidth) {
      x -= totalWidth;
      scrollViewRef.current?.scrollTo({ x, animated: false });
    } else if (x < 0) {
      x += totalWidth;
      scrollViewRef.current?.scrollTo({ x, animated: false });
    }

    if (isDragging.current) {
      currentX.current = x;
    }
  };

  const handleScrollBeginDrag = () => {
    isDragging.current = true;
  };

  const handleScrollEndDrag = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    currentX.current = event.nativeEvent.contentOffset.x;
    isDragging.current = false;
  };

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    currentX.current = event.nativeEvent.contentOffset.x;
    isDragging.current = false;
  };

  return (
    <View style={styles.wrap}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        decelerationRate="fast"
      >
        <View style={styles.row}>
          {children}
          {children}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: "hidden", width: SCREEN_W },
  row: { flexDirection: "row" },
});