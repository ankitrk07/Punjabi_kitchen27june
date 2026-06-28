import { colors } from "@/src/theme";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import OrderStatusSummary from "./OrderStatusSummary";

type Props = {
  ordersLength: number;
};

export default function HomeHero({ ordersLength }: Props) {
  return (
    <View style={styles.hero}>
      <Image
        source={{ uri: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=900&q=80" }}
        style={styles.heroImg}
      />
      <LinearGradient colors={["transparent", "rgba(10,10,10,0.85)", "#0A0A0A"]} style={StyleSheet.absoluteFill} />
      <View style={styles.heroContent}>
        <Text style={styles.heroTag}>RANCHI · SINCE 2010</Text>
        <Text style={styles.heroTitle}>Royal Flavours{`\n`}of Punjab</Text>
        <Text style={styles.heroSub}>Authentic dishes crafted with love</Text>
        {ordersLength > 0 && <OrderStatusSummary />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { height: 240, position: "relative" },
  heroImg: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  heroContent: { position: "absolute", bottom: 20, left: 20, right: 20 },
  heroTag: { color: colors.gold, fontSize: 11, letterSpacing: 3, fontWeight: "600" },
  heroTitle: { color: "#FFF", fontSize: 32, fontWeight: "700", marginTop: 6, lineHeight: 38 },
  heroSub: { color: colors.textSecondary, fontSize: 13, marginTop: 4 },
});
