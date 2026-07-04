import { useApp } from "@/src/context/AppContext";
import { colors } from "@/src/theme";
import { storage } from "@/src/utils/storage";
import { apiClient, resolveImageUrl } from "@/src/utils/apiClient";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Modal, ScrollView, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import LottieView from "lottie-react-native";
import thankYouJson from "../assets/thank-you.json";


export default function Cart() {
  const router = useRouter();
  const { cart, updateQty, removeFromCart, placeOrder, user } = useApp();
  const fade = useRef(new Animated.Value(0)).current;
  const lottieRef = useRef<LottieView>(null);
  const tempOrderRef = useRef<any>(null);
  const [success, setSuccess] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState<any | null>(null);
  const [selectedMode, setSelectedMode] = useState<"Dine In" | "Takeaway" | "Delivery">("Dine In");

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        lottieRef.current?.play();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const taxes = Math.round(subtotal * 0.05);
  const delivery = selectedMode === "Delivery" ? (subtotal > 0 ? (subtotal > 499 ? 0 : 40) : 0) : 0;
  const total = subtotal + taxes + delivery;

  const saveReceipt = async (receipt: any) => {
    const all = (await storage.getItem<any[]>("pk_receipts", [])) || [];
    all.unshift(receipt);
    await storage.setItem("pk_receipts", all);
  };

  const onPlace = (mode: "Dine In" | "Takeaway" | "Delivery") => {
    if (cart.length === 0) return;
    const order = placeOrder(mode);
    tempOrderRef.current = order;
    setSuccess(true);
  };

  const handleDone = () => {
    if (!receiptOrder) return;
    const receipt = {
      orderId: receiptOrder.id,
      createdAt: Date.now(),
      items: receiptOrder.items,
      total: receiptOrder.total,
      mode: receiptOrder.mode,
      seatNumber: receiptOrder.seatNumber ?? null,
    };
    saveReceipt(receipt).catch(err => console.log("Failed to save receipt:", err));
    setReceiptOrder(null);
    router.replace("/(tabs)/orders");
  };

  const shareReceipt = async () => {
    if (!receiptOrder) return;
    const textLines = [
      `Order: ${receiptOrder.id}`,
      `Placed: ${new Date(receiptOrder.createdAt).toLocaleString()}`,
      `Mode: ${receiptOrder.mode}`,
      `Seat: ${receiptOrder.seatNumber ?? "-"}`,
      "--- Items ---",
      ...receiptOrder.items.map((it: any) => `${it.qty} x ${it.name} - ₹${it.price * it.qty}`),
      `Total: ₹${receiptOrder.total}`,
    ];
    const message = textLines.join("\n");
    try {
      await Share.share({ message, title: `Receipt ${receiptOrder.id}` });
    } catch (e) {
      // ignore
    }
  };

  if (cart.length === 0 && !success && !receiptOrder) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>Your Cart</Text>
            <Text style={styles.subTitleText}>0 item(s)</Text>
          </View>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtnWrap} testID="back-btn">
            <View style={styles.backCircle}>
              <Ionicons name="arrow-back" size={16} color={colors.gold} />
            </View>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.empty}>
          <Image
            source={require("../assets/images/empty_cart.png")}
            style={styles.emptyImage}
          />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>Browse menu and add your favorite dishes.</Text>
          <TouchableOpacity
            style={styles.exploreBtnWrap}
            onPress={() => router.replace("/(tabs)/menu")}
            activeOpacity={0.8}
            testID="go-menu-btn"
          >
            <LinearGradient
              colors={["#F0D488", "#C9A84C"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.exploreBtn}
            >
              <Ionicons name="restaurant-outline" size={16} color="#000" />
              <Text style={styles.exploreBtnText}>EXPLORE MENU</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>Your Cart</Text>
          <Text style={styles.subTitleText}>{cart.length} item(s)</Text>
        </View>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtnWrap} testID="back-btn">
          <View style={styles.backCircle}>
            <Ionicons name="arrow-back" size={16} color={colors.gold} />
          </View>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      <Animated.View style={{ flex: 1, opacity: fade }}>
        {cart.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.imageContainer}>
              <Image source={require("../assets/images/empty_cart.png")} style={styles.emptyImage} />
            </View>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySubtitle}>Browse menu and add your favorite dishes.</Text>
            <TouchableOpacity
              style={styles.exploreBtnWrap}
              onPress={() => router.replace("/(tabs)/menu")}
              activeOpacity={0.8}
              testID="go-menu-btn"
            >
              <LinearGradient
                colors={["#F0D488", "#C9A84C"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.exploreBtn}
              >
                <Ionicons name="restaurant-outline" size={16} color="#000" style={styles.exploreIcon} />
                <Text style={styles.exploreBtnText}>EXPLORE MENU</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }}>
              {cart.map((item) => (
                <View key={item.id} style={styles.row} testID={`cart-item-${item.id}`}>
                  <Image source={{ uri: resolveImageUrl(item.image) }} style={styles.img} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.price}>₹{item.price}</Text>
                    <View style={styles.qtyRow}>
                      <TouchableOpacity onPress={() => updateQty(item.id, item.qty - 1)} style={styles.qBtn} testID={`dec-${item.id}`}>
                        <Ionicons name="remove" size={14} color={colors.gold} />
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>{item.qty}</Text>
                      <TouchableOpacity onPress={() => updateQty(item.id, item.qty + 1)} style={styles.qBtn} testID={`inc-${item.id}`}>
                        <Ionicons name="add" size={14} color={colors.gold} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => removeFromCart(item.id)} style={[styles.qBtn, { marginLeft: 8 }]} testID={`del-${item.id}`}>
                        <Ionicons name="trash-outline" size={14} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={styles.lineTotal}>₹{item.price * item.qty}</Text>
                </View>
              ))}

              {/* Order Mode Selector Card (Moved Up) */}
              <View style={styles.modeContainer}>
                <Text style={styles.modeTitle}>Select Service Mode</Text>
                <View style={styles.modeRow}>
                  {[
                    { mode: "Dine In", icon: "restaurant-outline" },
                    { mode: "Takeaway", icon: "bag-handle-outline" },
                    { mode: "Delivery", icon: "bicycle-outline" },
                  ].map((m) => {
                    const isSelected = selectedMode === m.mode;
                    return (
                      <TouchableOpacity
                        key={m.mode}
                        style={[styles.modeBtn, isSelected && styles.modeBtnActive]}
                        onPress={() => setSelectedMode(m.mode as any)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name={m.icon as any} size={16} color={isSelected ? "#000" : colors.gold} />
                        <Text style={[styles.modeText, isSelected && styles.modeTextActive]}>
                          {m.mode}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.bill}>
                <View style={styles.billRow}><Text style={styles.billLabel}>Subtotal</Text><Text style={styles.billVal}>₹{subtotal}</Text></View>
                <View style={styles.billRow}><Text style={styles.billLabel}>Taxes (5%)</Text><Text style={styles.billVal}>₹{taxes}</Text></View>
                <View style={styles.billRow}><Text style={styles.billLabel}>Delivery</Text><Text style={styles.billVal}>{delivery === 0 ? "FREE" : `₹${delivery}`}</Text></View>
                <View style={[styles.billRow, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10, marginTop: 6 }]}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalVal}>₹{total}</Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.checkoutBtn}
                onPress={() => onPlace(selectedMode)}
                activeOpacity={0.8}
                testID="checkout-btn"
              >
                <LinearGradient
                  colors={["#F0D488", "#C9A84C"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.checkoutBtnGradient}
                >
                  <Text style={styles.checkoutText}>CONFIRM ORDER (₹{total})</Text>
                  <Ionicons name="arrow-forward-outline" size={16} color="#000" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </>
        )}
      </Animated.View>

      <Modal transparent visible={success} animationType="fade" statusBarTranslucent>
        <View style={styles.successOverlay}>
          <LottieView
            ref={lottieRef}
            source={thankYouJson}
            autoPlay
            loop={false}
            onAnimationFinish={() => {
              setSuccess(false);
              setReceiptOrder(tempOrderRef.current);
            }}
            style={{ width: 280, height: 280 }}
          />
        </View>
      </Modal>



      {/* Receipt Modal shown after placing order */}
      <Modal visible={!!receiptOrder} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Order Receipt</Text>
            {receiptOrder && (
              <ScrollView style={{ maxHeight: 260 }}>
                <Text style={styles.receiptLine}>Order ID: {receiptOrder.id}</Text>
                <Text style={styles.receiptLine}>Placed: {new Date(receiptOrder.createdAt).toLocaleString()}</Text>
                <Text style={styles.receiptLine}>Mode: {receiptOrder.mode}</Text>
                <Text style={styles.receiptLine}>Seat: {receiptOrder.seatNumber ?? "-"}</Text>
                <View style={{ height: 8 }} />
                {receiptOrder.items.map((it: any) => (
                  <View key={it.id} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 }}>
                    <Text style={{ color: "#FFF" }}>{it.qty} x {it.name}</Text>
                    <Text style={{ color: colors.gold }}>₹{it.price * it.qty}</Text>
                  </View>
                ))}
                <View style={{ height: 8 }} />
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ color: colors.textSecondary }}>Total</Text>
                  <Text style={{ color: colors.gold, fontWeight: "800" }}>₹{receiptOrder.total}</Text>
                </View>
              </ScrollView>
            )}

            <View style={{ height: 16 }} />

            <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
              <TouchableOpacity style={[styles.modalBtn, { flex: 1.3, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: colors.gold }]} onPress={shareReceipt} testID="share-receipt-btn">
                <Ionicons name="share-social-outline" size={16} color="#0A0A0A" />
                <Text style={styles.modalBtnText}>Share Receipt</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { flex: 1, backgroundColor: "#333", borderColor: colors.border }]} onPress={handleDone} testID="close-receipt-btn">
                <Text style={[styles.modalBtnText, { color: "#FFF" }]}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { height: 70, flexDirection: "row", alignItems: "center", paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: "rgba(212, 175, 55, 0.15)", backgroundColor: "#0A0A0A" },
  titleContainer: { position: "absolute", left: 0, right: 0, alignItems: "center", justifyContent: "center", zIndex: 1 },
  titleText: { color: "#FFF", fontSize: 18, fontWeight: "800", letterSpacing: 0.5 },
  subTitleText: { color: colors.gold, fontSize: 11, fontWeight: "600", marginTop: 2 },
  backBtnWrap: { flexDirection: "row", alignItems: "center", gap: 8, zIndex: 2 },
  backCircle: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: "rgba(212, 175, 55, 0.4)", alignItems: "center", justifyContent: "center" },
  backText: { color: colors.gold, fontSize: 14, fontWeight: "600" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 30, backgroundColor: "#0A0A0A" },
  imageContainer: { alignItems: "center", justifyContent: "center", marginVertical: 20, position: "relative" },
  emptyImage: { width: 240, height: 240, resizeMode: "contain" },
  emptyTitle: { color: "#FFF", fontSize: 24, fontWeight: "800", textAlign: "center", marginTop: 10 },
  emptySubtitle: { color: "rgba(255, 255, 255, 0.5)", fontSize: 14, textAlign: "center", marginTop: 8, fontWeight: "400" },
  exploreBtnWrap: { marginTop: 32, shadowColor: "#C9A84C", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 6 },
  exploreBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 36, paddingVertical: 14, borderRadius: 30 },
  exploreIcon: { marginRight: 2 },
  exploreBtnText: { color: "#000", fontSize: 14, fontWeight: "800", letterSpacing: 1 },
  row: { flexDirection: "row", padding: 12, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginBottom: 10, gap: 12, alignItems: "center" },
  img: { width: 70, height: 70, borderRadius: 10 },
  name: { color: "#FFF", fontWeight: "700", fontSize: 14 },
  price: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8 },
  qBtn: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.borderGold },
  qtyText: { color: "#FFF", fontWeight: "700", minWidth: 16, textAlign: "center" },
  lineTotal: { color: colors.gold, fontWeight: "800" },
  bill: { padding: 16, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderGold, marginTop: 12 },
  billRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  billLabel: { color: colors.textSecondary },
  billVal: { color: "#FFF" },
  totalLabel: { color: "#FFF", fontWeight: "700", fontSize: 16 },
  totalVal: { color: colors.gold, fontWeight: "800", fontSize: 20 },
  footer: { paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bg },
  modeContainer: { padding: 16, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: "rgba(212, 175, 55, 0.15)", marginTop: 16 },
  modeTitle: { color: "#FFF", fontSize: 13, fontWeight: "800", marginBottom: 12, letterSpacing: 0.5, textTransform: "uppercase" },
  modeRow: { flexDirection: "row", gap: 8 },
  modeBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: "rgba(212, 175, 55, 0.35)", backgroundColor: "transparent" },
  modeBtnActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  modeText: { color: colors.gold, fontWeight: "800", fontSize: 12 },
  modeTextActive: { color: "#000" },
  checkoutBtn: { shadowColor: "#C9A84C", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 6 },
  checkoutBtnGradient: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 28 },
  checkoutText: { color: "#000", fontSize: 14, fontWeight: "900", letterSpacing: 0.8 },
  successOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", alignItems: "center", justifyContent: "center" },
  successCard: { backgroundColor: colors.surface, padding: 30, borderRadius: 20, alignItems: "center", borderWidth: 1, borderColor: colors.gold, gap: 8 },
  successTitle: { color: "#FFF", fontSize: 20, fontWeight: "700", marginTop: 10 },
  successSub: { color: colors.textSecondary, fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center", padding: 20 },
  modalCard: { width: "100%", maxWidth: 720, backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.borderGold },
  modalTitle: { color: "#FFF", fontSize: 18, fontWeight: "900", marginBottom: 8 },
  modalSub: { color: colors.textSecondary, fontSize: 13 },
  receiptLine: { color: colors.textSecondary, fontSize: 12, marginBottom: 4 },
  starBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.02)" },
  starBtnActive: { backgroundColor: "rgba(201,168,76,0.12)" },
  feedbackInput: { marginTop: 8, backgroundColor: "rgba(255,255,255,0.02)", color: "#FFF", minHeight: 60, borderRadius: 10, padding: 8, borderWidth: 1, borderColor: colors.border },
  modalBtn: { backgroundColor: colors.gold, paddingVertical: 12, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.borderGold },
  modalBtnText: { color: "#0A0A0A", fontWeight: "900" },
});