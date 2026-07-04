import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Mode {
  id: string;
  label: string;
  icon: string;
  desc: string;
  bgImage?: any;
}

interface Props {
  modes: Mode[];
}

export default function HomeModes({ modes }: Props) {
  const router = useRouter();
  return (
    <View style={styles.modes}>
      {modes.map((m) => (
        <TouchableOpacity key={m.id} style={styles.modeCard} onPress={() => router.push("/(tabs)/menu")}>
          <LinearGradient
            colors={
              m.id === "takeaway"
                ? ["#2B1C11", "#15110D", "#090909"]
                : ["#06211D", "#071312", "#020303"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modeGrad}
          >
            {m.bgImage && (
              <Image
                source={m.bgImage}
                style={[
                  styles.bgImage,
                  { opacity: 0.22 }
                ]}
                contentFit="cover"
              />
            )}
            <LinearGradient
              colors={["rgba(5, 5, 5, 0.55)", "rgba(5, 5, 5, 0.96)"]}
              style={styles.overlay}
            />

            <View style={styles.iconWrap}>
              <Ionicons
                name={m.icon as any}
                size={21}
                color={
                  m.id === "takeaway"
                    ? "#E7B45E"
                    : "#E8EFE9"
                }
              />
            </View>
            <Text style={styles.modeLabel}>{m.label}</Text>
            <Text style={styles.modeDesc}>{m.desc}</Text>
            <View style={styles.arrowBtn}>
              <Ionicons name="arrow-forward" size={12} color="#d4af37e2" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  modes: { flexDirection: "row", paddingHorizontal: 12, marginTop: -10, gap: 8 },
  modeCard: {
    flex: 1,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "#081010",
  },

  modeGrad: {
    minHeight: 140,
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.17)",
  },
  modeLabel: {
    marginTop: 0,
    color: "#F5F1E8",
    fontWeight: "400",
    fontSize: 18,
    fontFamily: "cursive",
  },

  modeDesc: {
    marginTop: -5,
    color: "rgba(255,255,255,0.65)",
    fontSize: 10,
    textAlign: "center",
    lineHeight: 18,
  },
  arrowBtn: {
    marginTop: 2,
    width: 25,
    height: 25,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.27)",
    justifyContent: "center",
    alignItems: "center",
  },
  bgImage: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
