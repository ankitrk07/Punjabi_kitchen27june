import ScreenHeader from "@/src/components/ScreenHeader";
import { useApp } from "@/src/context/AppContext";
import { colors } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function AddressesScreen() {
  const { addresses, selectedAddressId, selectAddress, addAddress, removeAddress } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);

  // Modal states
  const [label, setLabel] = useState("Home");
  const [line, setLine] = useState("");
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [isFixedLabel, setIsFixedLabel] = useState(false); // Locked labels for Home and Work slots

  // Filter addresses
  const homeAddress = addresses.find((a) => a.label.toLowerCase() === "home");
  const workAddress = addresses.find((a) => a.label.toLowerCase() === "work");
  const otherAddresses = addresses.filter(
    (a) => a.label.toLowerCase() !== "home" && a.label.toLowerCase() !== "work"
  );

  const handleOpenAddEdit = (slotType: "Home" | "Work" | "Other", addressId?: string, currentLine?: string, currentLabel?: string) => {
    if (slotType === "Home") {
      setLabel("Home");
      setIsFixedLabel(true);
      setLine(currentLine || "");
      setEditingAddressId(addressId || null);
    } else if (slotType === "Work") {
      setLabel("Work");
      setIsFixedLabel(true);
      setLine(currentLine || "");
      setEditingAddressId(addressId || null);
    } else {
      setLabel(currentLabel || "Other");
      setIsFixedLabel(false);
      setLine(currentLine || "");
      setEditingAddressId(addressId || null);
    }
    setShowAddModal(true);
  };

  const handleSave = () => {
    if (!line.trim()) {
      alert("Please enter address details");
      return;
    }

    // If editing, remove the old one first
    if (editingAddressId) {
      removeAddress(editingAddressId);
    }

    addAddress({ label, line });
    setLine("");
    setEditingAddressId(null);
    setShowAddModal(false);
  };

  return (
    <ScreenHeader title="Saved Addresses" backHref="/(tabs)/profile">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.container}>

        {/* Hero Banner */}
        <LinearGradient
          colors={["rgba(16, 185, 129, 0.12)", "rgba(20, 20, 20, 0)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.heroCard}
        >
          <View style={s.heroLeft}>
            <LinearGradient
              colors={["#10B981", "#34D399"]}
              style={s.heroIconContainer}
            >
              <Ionicons name="location" size={18} color="#080808" />
            </LinearGradient>
          </View>
          <View style={s.heroContent}>
            <Text style={s.heroTitle}>Manage Locations</Text>
            <Text style={s.heroSubtitle}>Set active delivery location or customize your home, work, and other custom addresses.</Text>
          </View>
        </LinearGradient>

        <Text style={s.sectionHeader}>Primary Locations</Text>

        {/* Home Address Slot */}
        <View style={s.slotWrapper}>
          <Text style={s.slotTitle}>Home Address (Default Signup)</Text>
          {homeAddress ? (
            <TouchableOpacity
              style={[s.card, selectedAddressId === homeAddress.id && s.selectedCard]}
              activeOpacity={0.9}
              onPress={() => selectAddress(homeAddress.id)}
            >
              <View style={s.cardBody}>
                <View style={[s.iconCircle, selectedAddressId === homeAddress.id && s.selectedIcon]}>
                  <Ionicons name="home-outline" size={18} color={selectedAddressId === homeAddress.id ? "#000" : colors.gold} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={s.titleRow}>
                    <Text style={s.cardLabel}>Home</Text>
                    {selectedAddressId === homeAddress.id && (
                      <View style={s.activeBadge}>
                        <Text style={s.activeText}>ACTIVE</Text>
                      </View>
                    )}
                  </View>
                  <Text style={s.addressText}>{homeAddress.line}</Text>
                </View>
              </View>
              <View style={s.cardActions}>
                <TouchableOpacity
                  style={[s.actionBtn, s.editBtn]}
                  onPress={() => handleOpenAddEdit("Home", homeAddress.id, homeAddress.line)}
                >
                  <Ionicons name="pencil" size={12} color={colors.gold} />
                  <Text style={s.editBtnText}>Edit</Text>
                </TouchableOpacity>
                {selectedAddressId !== homeAddress.id && (
                  <TouchableOpacity style={s.selectBtn} onPress={() => selectAddress(homeAddress.id)}>
                    <Text style={s.selectBtnText}>Set Active</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={s.emptySlotCard}
              onPress={() => handleOpenAddEdit("Home")}
            >
              <Ionicons name="home-outline" size={20} color={colors.textSecondary} />
              <Text style={s.emptySlotText}>Set Home Address</Text>
              <Ionicons name="add-circle" size={20} color={colors.gold} style={s.slotAddIcon} />
            </TouchableOpacity>
          )}
        </View>

        {/* Work Address Slot */}
        <View style={s.slotWrapper}>
          <Text style={s.slotTitle}>Work Address</Text>
          {workAddress ? (
            <TouchableOpacity
              style={[s.card, selectedAddressId === workAddress.id && s.selectedCard]}
              activeOpacity={0.9}
              onPress={() => selectAddress(workAddress.id)}
            >
              <View style={s.cardBody}>
                <View style={[s.iconCircle, selectedAddressId === workAddress.id && s.selectedIcon]}>
                  <Ionicons name="briefcase-outline" size={18} color={selectedAddressId === workAddress.id ? "#000" : colors.gold} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={s.titleRow}>
                    <Text style={s.cardLabel}>Work</Text>
                    {selectedAddressId === workAddress.id && (
                      <View style={s.activeBadge}>
                        <Text style={s.activeText}>ACTIVE</Text>
                      </View>
                    )}
                  </View>
                  <Text style={s.addressText}>{workAddress.line}</Text>
                </View>
              </View>
              <View style={s.cardActions}>
                <TouchableOpacity
                  style={[s.actionBtn, s.editBtn]}
                  onPress={() => handleOpenAddEdit("Work", workAddress.id, workAddress.line)}
                >
                  <Ionicons name="pencil" size={12} color={colors.gold} />
                  <Text style={s.editBtnText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.actionBtn, s.deleteBtn]}
                  onPress={() => removeAddress(workAddress.id)}
                >
                  <Ionicons name="trash-outline" size={12} color={colors.error} />
                  <Text style={s.deleteBtnText}>Remove</Text>
                </TouchableOpacity>
                {selectedAddressId !== workAddress.id && (
                  <TouchableOpacity style={s.selectBtn} onPress={() => selectAddress(workAddress.id)}>
                    <Text style={s.selectBtnText}>Set Active</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={s.emptySlotCard}
              onPress={() => handleOpenAddEdit("Work")}
            >
              <Ionicons name="briefcase-outline" size={20} color={colors.textSecondary} />
              <Text style={s.emptySlotText}>Add Work Address</Text>
              <Ionicons name="add-circle" size={20} color={colors.gold} style={s.slotAddIcon} />
            </TouchableOpacity>
          )}
        </View>

        <Text style={[s.sectionHeader, { marginTop: 12 }]}>Other Saved Locations</Text>

        {/* Other Addresses List */}
        {otherAddresses.length === 0 ? (
          <View style={s.noOtherCard}>
            <Ionicons name="location-outline" size={24} color={colors.textSecondary} />
            <Text style={s.noOtherText}>No other addresses saved.</Text>
          </View>
        ) : (
          otherAddresses.map((a) => (
            <TouchableOpacity
              key={a.id}
              style={[s.card, selectedAddressId === a.id && s.selectedCard]}
              activeOpacity={0.9}
              onPress={() => selectAddress(a.id)}
            >
              <View style={s.cardBody}>
                <View style={[s.iconCircle, selectedAddressId === a.id && s.selectedIcon]}>
                  <Ionicons name="location-outline" size={18} color={selectedAddressId === a.id ? "#000" : colors.gold} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={s.titleRow}>
                    <Text style={s.cardLabel}>{a.label}</Text>
                    {selectedAddressId === a.id && (
                      <View style={s.activeBadge}>
                        <Text style={s.activeText}>ACTIVE</Text>
                      </View>
                    )}
                  </View>
                  <Text style={s.addressText}>{a.line}</Text>
                </View>
              </View>
              <View style={s.cardActions}>
                <TouchableOpacity
                  style={[s.actionBtn, s.editBtn]}
                  onPress={() => handleOpenAddEdit("Other", a.id, a.line, a.label)}
                >
                  <Ionicons name="pencil" size={12} color={colors.gold} />
                  <Text style={s.editBtnText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.actionBtn, s.deleteBtn]}
                  onPress={() => removeAddress(a.id)}
                >
                  <Ionicons name="trash-outline" size={12} color={colors.error} />
                  <Text style={s.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
                {selectedAddressId !== a.id && (
                  <TouchableOpacity style={s.selectBtn} onPress={() => selectAddress(a.id)}>
                    <Text style={s.selectBtnText}>Set Active</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}

        <TouchableOpacity
          style={s.addNewBtn}
          onPress={() => handleOpenAddEdit("Other")}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[colors.goldBright, colors.gold]}
            style={s.addNewBtnGradient}
          >
            <Ionicons name="add-circle-outline" size={18} color={colors.textInverse} />
            <Text style={s.addNewBtnText}>Add New Location</Text>
          </LinearGradient>
        </TouchableOpacity>

      </ScrollView>

      {/* Add / Edit Address Modal */}
      <Modal visible={showAddModal} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>
                {editingAddressId ? `Edit ${label} Address` : `Add ${label} Address`}
              </Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>

            {/* Custom Label Input for "Other" type addresses */}
            {!isFixedLabel && (
              <View style={s.labelInputGroup}>
                <Text style={s.inputLabel}>ADDRESS LABEL</Text>
                <View style={s.presetSelector}>
                  {["Friends", "Family", "Office", "Other"].map((preset) => (
                    <TouchableOpacity
                      key={preset}
                      style={[s.presetChip, label === preset && s.presetChipActive]}
                      onPress={() => setLabel(preset)}
                    >
                      <Text style={[s.presetChipText, label === preset && s.presetChipTextActive]}>
                        {preset}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {label !== "Friends" && label !== "Family" && label !== "Office" && (
                  <TextInput
                    style={s.textInputSingle}
                    placeholder="Enter custom label (e.g. Gym, Hotel)"
                    placeholderTextColor={colors.textSecondary}
                    value={label}
                    onChangeText={setLabel}
                  />
                )}
              </View>
            )}

            <Text style={s.inputLabel}>ADDRESS DETAILS</Text>
            <TextInput
              style={s.textInput}
              placeholder="Flat / House No., Area, Landmark, City"
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
              <TouchableOpacity style={s.saveBtnContainer} onPress={handleSave}>
                <LinearGradient
                  colors={[colors.goldBright, colors.gold]}
                  style={s.saveModalBtn}
                >
                  <Text style={s.saveModalText}>Save Address</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenHeader>
  );
}

const s = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  heroCard: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.2)",
    padding: 16,
    marginBottom: 20,
    alignItems: "center",
  },
  heroLeft: {
    marginRight: 14,
  },
  heroIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  heroContent: {
    flex: 1,
  },
  heroTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 3,
  },
  heroSubtitle: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 15,
  },
  sectionHeader: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 6,
  },
  slotWrapper: {
    marginBottom: 16,
  },
  slotTitle: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
    opacity: 0.9,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  selectedCard: {
    borderColor: colors.gold,
    backgroundColor: "rgba(212, 175, 55, 0.03)",
  },
  cardBody: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(212, 175, 55, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  selectedIcon: {
    backgroundColor: colors.gold,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  activeBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.25)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activeText: {
    fontSize: 8,
    fontWeight: "800",
    color: colors.success,
  },
  addressText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
    marginTop: 4,
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: "center",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  editBtn: {
    backgroundColor: "rgba(212, 175, 55, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.15)",
  },
  editBtnText: {
    fontSize: 11,
    color: colors.gold,
    fontWeight: "700",
  },
  deleteBtn: {
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.15)",
  },
  deleteBtnText: {
    fontSize: 11,
    color: colors.error,
    fontWeight: "700",
  },
  selectBtn: {
    marginLeft: "auto",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.gold,
  },
  selectBtnText: {
    fontSize: 11,
    color: colors.textInverse,
    fontWeight: "800",
  },
  emptySlotCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    height: 52,
    gap: 10,
  },
  emptySlotText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  slotAddIcon: {
    marginLeft: "auto",
  },
  noOtherCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
  },
  noOtherText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  addNewBtn: {
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 16,
  },
  addNewBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
  },
  addNewBtnText: {
    color: colors.textInverse,
    fontWeight: "800",
    fontSize: 13,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#141414",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)",
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  modalTitle: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "800",
  },
  inputLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  labelInputGroup: {
    marginBottom: 16,
  },
  presetSelector: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  presetChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255, 255, 255, 0.02)",
  },
  presetChipActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  presetChipText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "600",
  },
  presetChipTextActive: {
    color: "#000",
    fontWeight: "800",
  },
  textInputSingle: {
    backgroundColor: "rgba(255,255,255,0.02)",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 10,
    color: "#FFF",
    fontSize: 12,
  },
  textInput: {
    backgroundColor: "rgba(255,255,255,0.02)",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    color: "#FFF",
    fontSize: 13,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
  },
  cancelModalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  cancelModalText: {
    color: colors.textSecondary,
    fontWeight: "700",
    fontSize: 13,
  },
  saveBtnContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  saveModalBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  saveModalText: {
    color: "#000",
    fontWeight: "800",
    fontSize: 13,
  },
});
