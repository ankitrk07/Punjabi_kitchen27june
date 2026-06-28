import ScreenHeader from "@/src/components/ScreenHeader";
import { useApp } from "@/src/context/AppContext";
import { colors } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function AddressesScreen() {
  const { addresses, selectedAddressId, selectAddress, addAddress, removeAddress } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [label, setLabel] = useState("Home");
  const [line, setLine] = useState("");

  const { add } = useLocalSearchParams<{ add?: string }>();

  useEffect(() => {
    if (add === "true") {
      setShowAddModal(true);
    }
  }, [add]);

  const handleSave = () => {
    if (!line.trim()) {
      alert("Please enter address details");
      return;
    }
    addAddress({ label, line });
    setLine("");
    setShowAddModal(false);
  };

  return (
    <ScreenHeader title="Saved Addresses" backHref="/(tabs)/profile">
      <Text style={s.label}>{addresses.length} saved addresses · Tap any address to set as active</Text>
      
      {addresses.map((a) => {
        const isSelected = selectedAddressId === a.id;
        const iconName = a.label.toLowerCase().includes("home") 
          ? "home-outline" 
          : a.label.toLowerCase().includes("work") 
          ? "briefcase-outline" 
          : "location-outline";

        return (
          <TouchableOpacity 
            key={a.id} 
            style={[s.card, isSelected && s.selectedCard]}
            activeOpacity={0.9}
            onPress={() => selectAddress(a.id)}
          >
            <View style={s.topRow}>
              <View style={[s.iconCircle, isSelected && s.selectedIcon]}>
                <Ionicons name={iconName} size={20} color={isSelected ? "#000" : colors.gold} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={s.typeRow}>
                  <Text style={s.type}>{a.label}</Text>
                  {isSelected && (
                    <View style={s.selectedBadge}>
                      <Ionicons name="checkmark-circle" size={10} color="#000" />
                      <Text style={s.selectedText}>ACTIVE DELIVERY LOCATION</Text>
                    </View>
                  )}
                </View>
                <Text style={s.address}>{a.line}</Text>
              </View>
            </View>

            <View style={s.actions}>
              <TouchableOpacity style={[s.selectBtn, isSelected && s.selectBtnActive]} onPress={() => selectAddress(a.id)}>
                <Ionicons name={isSelected ? "checkmark-done-circle" : "radio-button-off"} size={14} color={isSelected ? "#000" : colors.gold} />
                <Text style={[s.selectBtnText, isSelected && s.selectBtnTextActive]}>
                  {isSelected ? "Selected Location" : "Select This Address"}
                </Text>
              </TouchableOpacity>

              {addresses.length > 1 && (
                <TouchableOpacity style={s.deleteBtn} onPress={() => removeAddress(a.id)}>
                  <Ionicons name="trash-outline" size={14} color={colors.error} />
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity style={s.addBtn} onPress={() => setShowAddModal(true)}>
        <Ionicons name="add-circle-outline" size={18} color="#000" />
        <Text style={s.addBtnText}>Add New Address</Text>
      </TouchableOpacity>

      {/* Add Address Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <Text style={s.modalTitle}>Add New Address</Text>
            
            <Text style={s.inputLabel}>ADDRESS LABEL</Text>
            <View style={s.labelSelector}>
              {["Home", "Work", "Other"].map((l) => (
                <TouchableOpacity 
                  key={l} 
                  style={[s.labelChip, label === l && s.labelChipActive]}
                  onPress={() => setLabel(l)}
                >
                  <Text style={[s.labelChipText, label === l && s.labelChipTextActive]}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.inputLabel}>ADDRESS DETAILS</Text>
            <TextInput
              style={s.textInput}
              placeholder="Flat / House No., Building Name, Area, City"
              placeholderTextColor={colors.textSecondary}
              value={line}
              onChangeText={setLine}
              multiline
              numberOfLines={3}
            />

            <View style={s.modalActions}>
              <TouchableOpacity style={s.cancelModalBtn} onPress={() => setShowAddModal(false)}>
                <Text style={s.cancelModalText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.saveModalBtn} onPress={handleSave}>
                <Text style={s.saveModalText}>Save Address</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenHeader>
  );
}

const s = StyleSheet.create({
  label: { color: colors.textSecondary, fontSize: 12, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 10 },
  card: { backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 12 },
  selectedCard: { borderColor: colors.gold, backgroundColor: "rgba(212,175,55,0.04)" },
  topRow: { flexDirection: "row", gap: 14, marginBottom: 12 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(212,175,55,0.1)", alignItems: "center", justifyContent: "center" },
  selectedIcon: { backgroundColor: colors.gold },
  typeRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" },
  type: { fontSize: 16, fontWeight: "800", color: colors.textPrimary },
  selectedBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: colors.gold, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  selectedText: { fontSize: 9, fontWeight: "900", color: "#000", letterSpacing: 0.5 },
  address: { fontSize: 13, color: colors.textSecondary, lineHeight: 18, marginTop: 2 },
  actions: { flexDirection: "row", gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border, alignItems: "center" },
  selectBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderWidth: 1, borderColor: colors.gold, paddingVertical: 8, borderRadius: 10, backgroundColor: "rgba(212,175,55,0.05)" },
  selectBtnActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  selectBtnText: { fontSize: 12, color: colors.gold, fontWeight: "700" },
  selectBtnTextActive: { color: "#000" },
  deleteBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(239,68,68,0.1)", alignItems: "center", justifyContent: "center" },
  addBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: colors.gold, paddingVertical: 14, borderRadius: 20, marginTop: 10 },
  addBtnText: { color: "#000", fontWeight: "800", fontSize: 14 },

  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center", padding: 20 },
  modalContent: { backgroundColor: "#141414", borderRadius: 20, borderWidth: 1, borderColor: colors.borderGold, padding: 20 },
  modalTitle: { color: "#FFF", fontSize: 18, fontWeight: "800", marginBottom: 16 },
  inputLabel: { color: colors.textSecondary, fontSize: 10, fontWeight: "800", letterSpacing: 1.5, marginBottom: 8 },
  labelSelector: { flexDirection: "row", gap: 8, marginBottom: 16 },
  labelChip: { flex: 1, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: colors.border, alignItems: "center" },
  labelChipActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  labelChipText: { color: colors.textSecondary, fontSize: 12, fontWeight: "600" },
  labelChipTextActive: { color: "#000", fontWeight: "800" },
  textInput: { backgroundColor: "rgba(255,255,255,0.03)", borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, color: "#FFF", fontSize: 13, textAlignVertical: "top", marginBottom: 20 },
  modalActions: { flexDirection: "row", gap: 10 },
  cancelModalBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border, alignItems: "center" },
  cancelModalText: { color: colors.textSecondary, fontWeight: "700" },
  saveModalBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: colors.gold, alignItems: "center" },
  saveModalText: { color: "#000", fontWeight: "800" },
});
