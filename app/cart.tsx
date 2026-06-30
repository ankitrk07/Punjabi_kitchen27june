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

export default function Cart() {
  const router = useRouter();
  const { cart, updateQty, removeFromCart, placeOrder, user } = useApp();
  const fade = useRef(new Animated.Value(0)).current;
  const [success, setSuccess] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState<any | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [feedback, setFeedback] = useState<string>("");

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const taxes = Math.round(subtotal * 0.05);
  const delivery = subtotal > 0 ? (subtotal > 499 ? 0 : 40) : 0;
  const total = subtotal + taxes + delivery;

  const saveReceipt = async (receipt: any) => {
    const all = (await storage.getItem<any[]>("pk_receipts", [])) || [];
    all.unshift(receipt);
    await storage.setItem("pk_receipts", all);
  };

  const saveReview = async (review: any) => {
    const all = (await storage.getItem<any[]>("pk_reviews", [])) || [];
    all.unshift(review);
    await storage.setItem("pk_reviews", all);

    // Sync to backend PostgreSQL database
    try {
      await apiClient.submitReview({
        name: user?.name || "Guest User",
        avatar: user?.avatar || undefined,
        rating: review.rating,
        text: review.feedback,
      });
    } catch (e) {
      console.log("Failed to submit review to backend:", e);
    }
  };

  const onPlace = (mode: "Dine In" | "Takeaway" | "Delivery") => {
    if (cart.length === 0) return;
    const order = placeOrder(mode);
    setSuccess(true);
    setReceiptOrder(order);
    // keep success overlay briefly while modal appears
    setTimeout(() => setSuccess(false), 800);
  };

  const submitFeedback = async () => {
    if (!receiptOrder) return;
    const receipt = {
      orderId: receiptOrder.id,
      createdAt: Date.now(),
      items: receiptOrder.items,
      total: receiptOrder.total,
      mode: receiptOrder.mode,
      seatNumber: receiptOrder.seatNumber ?? null,
    };
    await saveReceipt(receipt);
    await saveReview({ orderId: receiptOrder.id, rating, feedback, createdAt: Date.now() });
    setReceiptOrder(null);
    setFeedback("");
    setRating(5);
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

  if (cart.length === 0) {
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
    <SafeAreaView style={styles.safe} edges={["top"]}>
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
              <View style={styles.modeRow}>
                {(["Dine In", "Takeaway", "Delivery"] as const).map((m) => (
                  <TouchableOpacity key={m} style={styles.modeBtn} onPress={() => onPlace(m)} testID={`place-${m}`}>
                    <Text style={styles.modeText}>{m}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}
      </Animated.View>

      {success && (
        <View style={styles.successOverlay} pointerEvents="none">
          <View style={styles.successCard}>
            <Ionicons name="checkmark-circle" size={64} color={colors.gold} />
            <Text style={styles.successTitle}>Order Placed!</Text>
            <Text style={styles.successSub}>Your royal feast is on the way 🙏</Text>
          </View>
        </View>
      )}

      {/* Receipt & Feedback Modal shown after placing order */}
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

            <View style={{ height: 12 }} />
            <Text style={styles.modalSub}>Rate your experience</Text>
            <View style={{ flexDirection: "row", gap: 8, marginVertical: 8 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <TouchableOpacity key={s} onPress={() => setRating(s)} style={[styles.starBtn, rating === s && styles.starBtnActive]}>
                  <Ionicons name={rating >= s ? "star" : "star-outline"} size={18} color={rating >= s ? colors.gold : colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              placeholder="Leave a feedback (optional)"
              placeholderTextColor={colors.textSecondary}
              value={feedback}
              onChangeText={setFeedback}
              style={styles.feedbackInput}
              multiline
            />

            <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
              <TouchableOpacity style={[styles.modalBtn, { flex: 1 }]} onPress={submitFeedback} testID="submit-feedback-btn">
                <Text style={styles.modalBtnText}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: "#333", borderColor: colors.border }]} onPress={shareReceipt} testID="share-receipt-btn">
                <Text style={styles.modalBtnText}>Share</Text>
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
  footer: { padding: 12, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bg },
  modeRow: { flexDirection: "row", gap: 8 },
  modeBtn: { flex: 1, paddingVertical: 14, borderRadius: 24, backgroundColor: colors.gold, alignItems: "center" },
  modeText: { color: "#000", fontWeight: "800", fontSize: 12 },
  successOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.85)", alignItems: "center", justifyContent: "center" },
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