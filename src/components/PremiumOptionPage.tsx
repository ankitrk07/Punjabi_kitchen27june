import { colors } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import ScreenHeader from "./ScreenHeader";

type Props = {
  title: string;
};

export default function PremiumOptionPage({ title }: Props) {
  const router = useRouter();
  const lowerTitle = title.toLowerCase();

  // Settings State
  const [name, setName] = useState("Sudip");
  const [email, setEmail] = useState("sudip@dineout.com");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [darkMode, setDarkMode] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);

  // FAQ Collapsible State
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Render Functions based on sections
  const renderContent = () => {
    // -------------------------------------------------------------
    // FAVORITES
    // -------------------------------------------------------------
    if (lowerTitle.includes("dish") || lowerTitle.includes("wishlist")) {
      const dishes = [
        { id: "1", name: "Dal Makhani Special", price: "₹280", rating: "4.8", image: "🍛", desc: "Slow-cooked black lentils with white butter & fresh cream." },
        { id: "2", name: "Butter Chicken Combo", price: "₹520", rating: "4.9", image: "🍗", desc: "Tender chicken cooked in rich buttery tomato gravy with 2 Naans." },
        { id: "3", name: "Paneer Tikka Wrap", price: "₹248", rating: "4.7", image: "🌯", desc: "Spiced paneer cubes with mint chutney rolled in flatbread." }
      ];
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saved Dishes</Text>
          {dishes.map((dish) => (
            <View key={dish.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardEmoji}>{dish.image}</Text>
                <View style={styles.cardMeta}>
                  <Text style={styles.cardTitle}>{dish.name}</Text>
                  <Text style={styles.cardDesc}>{dish.desc}</Text>
                </View>
              </View>
              <View style={styles.cardFooter}>
                <Text style={styles.cardPrice}>{dish.price}</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={14} color={colors.gold} />
                  <Text style={styles.ratingText}>{dish.rating}</Text>
                </View>
                <TouchableOpacity style={styles.smallButton} onPress={() => router.push("/(tabs)/menu")}>
                  <Text style={styles.smallButtonText}>Order Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      );
    }

    if (lowerTitle.includes("restaurant")) {
      const restaurants = [
        { id: "1", name: "Punjabi Kitchen (Connaught Place)", dist: "2.4 km", rating: "4.9", cuisine: "North Indian, Tandoori", offer: "20% OFF on Dining" },
        { id: "2", name: "The Grill Lounge", dist: "3.8 km", rating: "4.6", cuisine: "Mughlai, Kebabs", offer: "Free Mocktail on check-in" }
      ];
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Favorite Restaurants</Text>
          {restaurants.map((res) => (
            <View key={res.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.restaurantIcon}>
                  <Ionicons name="restaurant-outline" size={24} color={colors.gold} />
                </View>
                <View style={styles.cardMeta}>
                  <Text style={styles.cardTitle}>{res.name}</Text>
                  <Text style={styles.cardDesc}>{res.cuisine} • {res.dist}</Text>
                  <View style={styles.tagRow}>
                    <Ionicons name="pricetag-outline" size={12} color={colors.success} />
                    <Text style={[styles.tagText, { color: colors.success }]}>{res.offer}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.cardFooter}>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={14} color={colors.gold} />
                  <Text style={styles.ratingText}>{res.rating}</Text>
                </View>
                <TouchableOpacity style={styles.smallButton} onPress={() => router.push("/(tabs)/menu")}>
                  <Text style={styles.smallButtonText}>View Menu</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      );
    }

    // -------------------------------------------------------------
    // REWARDS
    // -------------------------------------------------------------
    if (lowerTitle.includes("loyalty") || lowerTitle.includes("reward") || lowerTitle.includes("cashback")) {
      return (
        <View style={styles.section}>
          <View style={styles.goldPassCard}>
            <Ionicons name="trophy-outline" size={32} color="#000" />
            <Text style={styles.goldPassTitle}>GOLD REWARDS CARD</Text>
            <Text style={styles.goldPassBalance}>2,450 Points</Text>
            <Text style={styles.goldPassSub}>Equivalent to ₹245.00 cashback balance</Text>
          </View>

          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          {[
            { title: "Cashback Earned (Order ORD-1045)", date: "Today, 4:30 PM", amt: "+₹18.00" },
            { title: "Points Redeemed (Combo Order)", date: "18 Jun, 8:15 PM", amt: "-200 pts" },
            { title: "Welcome Reward Points", date: "01 Jun, 12:00 PM", amt: "+500 pts" }
          ].map((t, idx) => (
            <View key={idx} style={styles.listRow}>
              <View>
                <Text style={styles.listRowTitle}>{t.title}</Text>
                <Text style={styles.listRowSub}>{t.date}</Text>
              </View>
              <Text style={[styles.listRowValue, t.amt.startsWith("+") ? { color: colors.success } : { color: colors.error }]}>
                {t.amt}
              </Text>
            </View>
          ))}
        </View>
      );
    }

    if (lowerTitle.includes("coupon") || lowerTitle.includes("offer")) {
      const coupons = [
        { code: "PUNJABI50", disc: "50% OFF up to ₹150", min: "Min. Order: ₹299", desc: "Applicable on all main course dishes." },
        { code: "FREEBIE", disc: "Free Butter Naan", min: "Min. Order: ₹399", desc: "Add a butter naan to cart & apply code." },
        { code: "DIWALIFEST", disc: "Flat ₹100 Cashback", min: "Min. Order: ₹590", desc: "Valid only on digital UPI transactions." }
      ];
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Coupons</Text>
          {coupons.map((coupon, idx) => (
            <View key={idx} style={styles.couponCard}>
              <View style={styles.couponDashed}>
                <Text style={styles.couponCode}>{coupon.code}</Text>
                <Text style={styles.couponDisc}>{coupon.disc}</Text>
                <Text style={styles.couponMin}>{coupon.min} • {coupon.desc}</Text>
                <TouchableOpacity style={styles.couponCopy} onPress={() => alert("Coupon Copied!")}>
                  <Text style={styles.couponCopyText}>COPY CODE</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      );
    }

    if (lowerTitle.includes("referral")) {
      return (
        <View style={styles.section}>
          <View style={[styles.card, { alignItems: "center", paddingVertical: 30 }]}>
            <Ionicons name="gift-outline" size={48} color={colors.gold} />
            <Text style={[styles.cardTitle, { marginTop: 16, fontSize: 18 }]}>Invite & Earn Cashback</Text>
            <Text style={[styles.cardDesc, { textAlign: "center", marginHorizontal: 20, marginTop: 8 }]}>
              Share your invite link with your friends. Get ₹100 flat cashback when they place their first order.
            </Text>
            <View style={styles.referralCodeBox}>
              <Text style={styles.referralCodeText}>KITCHEN100</Text>
            </View>
            <TouchableOpacity style={styles.button} onPress={() => alert("Referral Link Shared!")}>
              <Text style={styles.buttonText}>Invite Friends</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // -------------------------------------------------------------
    // ADDRESSES
    // -------------------------------------------------------------
    if (lowerTitle.includes("address") || lowerTitle.includes("addr")) {
      const addresses = [
        { label: "Home", text: "Flat 402, Royal Residency, Sector 62, Noida, 201301", icon: "home-outline" },
        { label: "Work", text: "Signature Towers, Floor 8, Sector 15, Gurugram, 122001", icon: "briefcase-outline" },
        { label: "Other", text: "Club House, Ivy Apartments, Golf Course Road, Gurugram", icon: "location-outline" }
      ];
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saved Addresses</Text>
          {addresses.map((addr, idx) => (
            <View key={idx} style={styles.addressCard}>
              <View style={styles.addressHeader}>
                <Ionicons name={addr.icon as any} size={20} color={colors.gold} />
                <Text style={styles.addressLabel}>{addr.label}</Text>
              </View>
              <Text style={styles.addressText}>{addr.text}</Text>
              <View style={styles.addressActions}>
                <TouchableOpacity onPress={() => alert("Edit Address")} style={styles.addressActionBtn}>
                  <Text style={styles.addressActionText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => alert("Delete Address")} style={styles.addressActionBtn}>
                  <Text style={[styles.addressActionText, { color: colors.error }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <TouchableOpacity style={styles.button} onPress={() => alert("Add New Address")}>
            <Text style={styles.buttonText}>+ Add New Address</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // -------------------------------------------------------------
    // PAYMENTS
    // -------------------------------------------------------------
    if (lowerTitle.includes("card")) {
      const cards = [
        { provider: "HDFC Bank Credit Card", num: "**** **** **** 4321", exp: "12/29", name: "SUDIP SEN", color: ["#0F2027", "#203A43", "#2C5364"] },
        { provider: "ICICI Debit Card", num: "**** **** **** 9876", exp: "05/28", name: "SUDIP SEN", color: ["#141E30", "#243B55"] }
      ];
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saved Cards</Text>
          {cards.map((card, idx) => (
            <View key={idx} style={[styles.creditCard, { backgroundColor: card.color[0] }]}>
              <View style={styles.ccHeader}>
                <Text style={styles.ccProvider}>{card.provider}</Text>
                <Ionicons name="card" size={24} color={colors.gold} />
              </View>
              <Text style={styles.ccNumber}>{card.num}</Text>
              <View style={styles.ccFooter}>
                <View>
                  <Text style={styles.ccLabel}>CARDHOLDER</Text>
                  <Text style={styles.ccValue}>{card.name}</Text>
                </View>
                <View>
                  <Text style={styles.ccLabel}>EXPIRES</Text>
                  <Text style={styles.ccValue}>{card.exp}</Text>
                </View>
              </View>
            </View>
          ))}
          <TouchableOpacity style={styles.button} onPress={() => alert("Add New Card")}>
            <Text style={styles.buttonText}>+ Add New Card</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (lowerTitle.includes("upi")) {
      const upis = ["sudip@okaxis", "sudipsen@paytm", "9876543210@ybl"];
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saved UPI Handles</Text>
          {upis.map((upi, idx) => (
            <View key={idx} style={styles.listRow}>
              <View style={styles.upiRow}>
                <Ionicons name="phone-portrait-outline" size={20} color={colors.gold} />
                <Text style={[styles.listRowTitle, { marginLeft: 12 }]}>{upi}</Text>
              </View>
              <TouchableOpacity onPress={() => alert("Verify Handle")} style={styles.verifyLink}>
                <Text style={styles.verifyLinkText}>Verified</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={styles.button} onPress={() => alert("Add UPI ID")}>
            <Text style={styles.buttonText}>+ Add UPI ID</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (lowerTitle.includes("payment") || lowerTitle.includes("transaction") || lowerTitle.includes("refund")) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction History</Text>
          {[
            { id: "TXN-7649", item: "Paneer Tikka Wrap Combo", date: "Today, 4:28 PM", amount: "₹248", method: "Paid via UPI", status: "Success" },
            { id: "TXN-7621", item: "Dal Makhani & Naan", date: "15 Jun, 1:15 PM", amount: "₹310", method: "Paid via Card", status: "Success" },
            { id: "TXN-7510", item: "Butter Chicken Plate", date: "09 Jun, 8:40 PM", amount: "₹520", method: "UPI Refund", status: "Refunded" }
          ].map((txn) => (
            <View key={txn.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardTitle}>{txn.item}</Text>
                  <Text style={styles.cardDesc}>{txn.date} • {txn.method}</Text>
                  <Text style={styles.txnId}>ID: {txn.id}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.cardPrice}>{txn.amount}</Text>
                  <View style={[styles.statusPill, txn.status === "Success" ? styles.successPill : styles.refundPill]}>
                    <Text style={styles.statusText}>{txn.status}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      );
    }

    // -------------------------------------------------------------
    // MEMBERSHIP
    // -------------------------------------------------------------
    if (lowerTitle.includes("membership") || lowerTitle.includes("premium") || lowerTitle.includes("tier")) {
      return (
        <View style={styles.section}>
          <View style={styles.membershipCard}>
            <View style={styles.crownCircle}>
              <Ionicons name="trophy" size={36} color={colors.gold} />
            </View>
            <Text style={styles.membershipTier}>GOLD MEMBER</Text>
            <Text style={styles.membershipSub}>Active subscription since Feb 2026</Text>
          </View>

          <Text style={styles.sectionTitle}>Your Premium Benefits</Text>
          {[
            { title: "Free Delivery", desc: "No delivery charges on orders above ₹199.", icon: "bicycle-outline" },
            { title: "2x Loyalty Points", desc: "Earn double rewards points on every diner check.", icon: "gift-outline" },
            { title: "Priority Support", desc: "Direct route to customer representatives in live chat.", icon: "headset-outline" }
          ].map((benefit, idx) => (
            <View key={idx} style={styles.benefitRow}>
              <Ionicons name={benefit.icon as any} size={24} color={colors.gold} style={styles.benefitIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.benefitTitle}>{benefit.title}</Text>
                <Text style={styles.benefitDesc}>{benefit.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      );
    }

    // -------------------------------------------------------------
    // SUPPORT
    // -------------------------------------------------------------
    if (lowerTitle.includes("support") || lowerTitle.includes("help") || lowerTitle.includes("ticket")) {
      const faqs = [
        { q: "How long does order delivery take?", a: "Most orders are prepared fresh and delivered within 30-45 minutes depending on distance." },
        { q: "Can I schedule my meal orders?", a: "Yes, you can select 'Schedule' during checkout to select a custom day and hour slot." },
        { q: "How do I split payments for group order?", a: "Open 'Group Orders', add contacts, share order cart, and invite them to split payment." }
      ];
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FAQs & Help Guides</Text>
          {faqs.map((faq, idx) => (
            <TouchableOpacity key={idx} style={styles.faqCard} onPress={() => setExpandedFaq(expandedFaq === idx ? null : idx)}>
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{faq.q}</Text>
                <Ionicons name={expandedFaq === idx ? "chevron-up" : "chevron-down"} size={16} color={colors.gold} />
              </View>
              {expandedFaq === idx && <Text style={styles.faqAnswer}>{faq.a}</Text>}
            </TouchableOpacity>
          ))}

          <Text style={styles.sectionTitle}>Support Tickets</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Open Ticket #TKT-049</Text>
            <Text style={styles.cardDesc}>Issue: Order refund missing</Text>
            <View style={[styles.statusPill, styles.successPill, { alignSelf: "flex-start", marginTop: 8 }]}>
              <Text style={styles.statusText}>Under Investigation</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={() => alert("Opening Live Chat...")}>
            <Text style={styles.buttonText}>Start Live Chat</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // -------------------------------------------------------------
    // SETTINGS / PERSONAL
    // -------------------------------------------------------------
    if (lowerTitle.includes("settings") || lowerTitle.includes("personal") || lowerTitle.includes("profile")) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Details</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Enter your name" placeholderTextColor="#555" />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Enter your email" placeholderTextColor="#555" />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Mobile Phone</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Enter phone" placeholderTextColor="#555" />
          </View>

          <Text style={styles.sectionTitle}>App Settings</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Dark Mode Theme</Text>
            <Switch value={darkMode} onValueChange={setDarkMode} thumbColor={colors.gold} trackColor={{ false: "#262626", true: "rgba(212, 175, 55, 0.4)" }} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Push Notifications</Text>
            <Switch value={pushNotifs} onValueChange={setPushNotifs} thumbColor={colors.gold} trackColor={{ false: "#262626", true: "rgba(212, 175, 55, 0.4)" }} />
          </View>

          <TouchableOpacity style={styles.button} onPress={() => alert("Settings Saved!")}>
            <Text style={styles.buttonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // -------------------------------------------------------------
    // RESERVATIONS
    // -------------------------------------------------------------
    if (lowerTitle.includes("reservation")) {
      return (
        <View style={[styles.section, styles.reservationSection]}>
          <View style={styles.reservationCard}>
            <Ionicons name="calendar-outline" size={48} color={colors.gold} />
            <Text style={styles.reservationTitle}>Book a Table</Text>
            <Text style={styles.reservationDesc}>
              Reserve your table at Punjabi Kitchen for a memorable dining experience.
            </Text>
            <TouchableOpacity style={styles.button} onPress={() => alert("Opening Reservation Form...")}>
              <Text style={styles.buttonText}>Book Now</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Upcoming Reservations</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>No upcoming reservations</Text>
            <Text style={styles.cardDesc}>You haven't booked any tables yet.</Text>
          </View>
        </View>
      );
    }

    // -------------------------------------------------------------
    // TERMS & CONDITIONS
    // -------------------------------------------------------------
    if (lowerTitle.includes("terms")) {
      const terms = [
        { section: "1. Acceptance of Terms", text: "By downloading, installing, or using the Punjabi Kitchen Mobile Application, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the application." },
        { section: "2. Account Registration", text: "You must create an account to place orders or make reservations. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account." },
        { section: "3. Ordering & Payments", text: "All orders placed are subject to acceptance by Punjabi Kitchen. Prices listed are in Indian Rupees (INR) and include applicable taxes unless stated otherwise. Payments must be made via approved online methods (UPI, Cards, Wallets) or Cash on Delivery where supported." },
        { section: "4. Table Reservations", text: "Reservations are held for a maximum of 15 minutes past the scheduled time. Punjabi Kitchen reserves the right to release the table if guests do not arrive within this period." },
        { section: "5. Cancellation & Refunds", text: "Orders can be cancelled before preparation starts. Refunds for prepaid orders will be processed to the original payment method within 5-7 business days." }
      ];
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Terms & Conditions</Text>
          <View style={styles.card}>
            <Text style={[styles.cardTitle, { color: colors.gold, marginBottom: 8 }]}>Punjabi Kitchen User Agreement</Text>
            <Text style={[styles.cardDesc, { marginBottom: 16, fontSize: 11 }]}>Last Updated: June 2026</Text>
            {terms.map((t, index) => (
              <View key={index} style={{ marginBottom: 16 }}>
                <Text style={{ color: "#FFF", fontSize: 13, fontWeight: "bold", marginBottom: 4 }}>{t.section}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12, lineHeight: 18 }}>{t.text}</Text>
              </View>
            ))}
          </View>
        </View>
      );
    }

    // -------------------------------------------------------------
    // PRIVACY POLICY
    // -------------------------------------------------------------
    if (lowerTitle.includes("privacy") || lowerTitle.includes("policy")) {
      const policies = [
        { section: "1. Information We Collect", text: "We collect your name, email address, phone number, and location coordinates to process orders, facilitate reservations, and deliver food items directly to your address." },
        { section: "2. How We Use Information", text: "Your data is used to customize your dining experience, notify you about order updates, award loyalty benefits, and coordinate with the delivery personnel." },
        { section: "3. Location Tracking", text: "Our application requests background/foreground location access to track active delivery drivers and map your address coordinates using OpenStreetMap Leaflet services." },
        { section: "4. Data Sharing & Security", text: "We do not sell your personal data. We only share information with partners (like payment gateways and delivery couriers) necessary to execute order transactions securely." }
      ];
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy Policy</Text>
          <View style={styles.card}>
            <Text style={[styles.cardTitle, { color: colors.gold, marginBottom: 8 }]}>Data Security & Privacy Guidelines</Text>
            <Text style={[styles.cardDesc, { marginBottom: 16, fontSize: 11 }]}>Last Updated: June 2026</Text>
            {policies.map((p, index) => (
              <View key={index} style={{ marginBottom: 16 }}>
                <Text style={{ color: "#FFF", fontSize: 13, fontWeight: "bold", marginBottom: 4 }}>{p.section}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12, lineHeight: 18 }}>{p.text}</Text>
              </View>
            ))}
          </View>
        </View>
      );
    }

    // -------------------------------------------------------------
    // RATE APP
    // -------------------------------------------------------------
    if (lowerTitle.includes("rate")) {
      const [rating, setRating] = useState(5);
      const [comment, setComment] = useState("");
      const [rated, setRated] = useState(false);

      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rate Our App</Text>
          <View style={[styles.card, { alignItems: "center", paddingVertical: 24 }]}>
            <Ionicons name="sparkles" size={40} color={colors.gold} style={{ marginBottom: 12 }} />
            <Text style={[styles.cardTitle, { fontSize: 18, textAlign: "center" }]}>Enjoying Punjabi Kitchen?</Text>
            <Text style={[styles.cardDesc, { textAlign: "center", marginHorizontal: 16, marginTop: 4, marginBottom: 20 }]}>
              Your feedback helps us curate the best royal flavours and dining experience!
            </Text>

            {rated ? (
              <View style={{ alignItems: "center", marginVertical: 10 }}>
                <Ionicons name="checkmark-circle-outline" size={48} color={colors.success} />
                <Text style={{ color: "#FFF", fontWeight: "bold", fontSize: 15, marginTop: 10 }}>Thank you for your rating!</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>We appreciate your valuable feedback.</Text>
              </View>
            ) : (
              <View style={{ width: "100%", alignItems: "center" }}>
                <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity key={star} onPress={() => setRating(star)}>
                      <Ionicons
                        name={star <= rating ? "star" : "star-outline"}
                        size={36}
                        color={colors.gold}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput
                  style={[styles.input, { width: "100%", height: 80, textAlignVertical: "top", marginBottom: 16 }]}
                  placeholder="Tell us what you love or how we can improve..."
                  placeholderTextColor="#666"
                  multiline
                  value={comment}
                  onChangeText={setComment}
                />

                <TouchableOpacity style={[styles.button, { width: "100%", marginTop: 0 }]} onPress={() => setRated(true)}>
                  <Text style={styles.buttonText}>Submit Feedback</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      );
    }

    // -------------------------------------------------------------
    // SHARE APP
    // -------------------------------------------------------------
    if (lowerTitle.includes("share")) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Share App</Text>
          <View style={[styles.card, { alignItems: "center", paddingVertical: 32 }]}>
            <Ionicons name="share-social-outline" size={48} color={colors.gold} style={{ marginBottom: 16 }} />
            <Text style={[styles.cardTitle, { fontSize: 18, textAlign: "center" }]}>Spread the Royal Taste</Text>
            <Text style={[styles.cardDesc, { textAlign: "center", marginHorizontal: 24, marginTop: 6, marginBottom: 24, lineHeight: 18 }]}>
              Invite friends and family to join Punjabi Kitchen and experience royal Punjabi culinary feasts!
            </Text>

            <View style={{
              width: "100%",
              backgroundColor: "rgba(255,255,255,0.02)",
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 12,
              padding: 14,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20
            }}>
              <Text style={{ color: "#FFF", fontSize: 12, flex: 1, marginRight: 12 }} numberOfLines={1}>
                https://punjabikitchen.page.link/download
              </Text>
              <TouchableOpacity onPress={() => alert("App Link Copied!")}>
                <Text style={{ color: colors.gold, fontWeight: "bold", fontSize: 11 }}>COPY LINK</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={[styles.button, { width: "100%", marginTop: 0 }]} onPress={() => alert("Open system share dialog...")}>
              <Text style={styles.buttonText}>Share Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // -------------------------------------------------------------
    // DEFAULT / ABOUT
    // -------------------------------------------------------------
    return (
      <View style={styles.section}>
        <View style={styles.aboutCard}>
          <Text style={styles.aboutHeader}>Punjabi Kitchen</Text>
          <Text style={styles.aboutVersion}>Version 2.5.0 (Build 9042)</Text>
          <Text style={styles.aboutBody}>
            Serving authentic North-Indian recipes prepared by master chefs using premium ingredients and direct farm produce.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Legal & Info</Text>
        {["Terms & Conditions", "Privacy Policy", "License Agreement", "Credits"].map((item, idx) => (
          <TouchableOpacity key={idx} style={styles.listRow} onPress={() => alert(`View ${item}`)}>
            <Text style={styles.listRowTitle}>{item}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.gold} />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <ScreenHeader title={title} backHref="/(tabs)/profile">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {renderContent()}
      </ScrollView>
    </ScreenHeader>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 40,
    backgroundColor: colors.bg,
  },
  section: {
    paddingTop: 10,
    backgroundColor: colors.bg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.gold,
    marginTop: 20,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  restaurantIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  cardMeta: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  txnId: {
    fontSize: 10,
    color: colors.gold,
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 12,
    paddingTop: 12,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.gold,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: "bold",
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "600",
  },
  smallButton: {
    backgroundColor: colors.gold,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  smallButtonText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#000",
  },
  goldPassCard: {
    backgroundColor: colors.gold,
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
  },
  goldPassTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "rgba(0,0,0,0.6)",
    letterSpacing: 1,
    marginBottom: 4,
  },
  goldPassBalance: {
    fontSize: 28,
    fontWeight: "800",
    color: "#000",
    marginBottom: 4,
  },
  goldPassSub: {
    fontSize: 11,
    color: "rgba(0,0,0,0.8)",
  },
  listRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listRowTitle: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  listRowSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  listRowValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
  couponCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
    borderStyle: "dashed",
  },
  couponDashed: {
    alignItems: "flex-start",
  },
  couponCode: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.gold,
    backgroundColor: "rgba(212, 175, 55, 0.12)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  couponDisc: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  couponMin: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
    marginBottom: 12,
  },
  couponCopy: {
    borderColor: colors.gold,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  couponCopyText: {
    fontSize: 10,
    fontWeight: "bold",
    color: colors.gold,
  },
  referralCodeBox: {
    borderColor: colors.gold,
    borderWidth: 1,
    borderStyle: "dashed",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 20,
    backgroundColor: "rgba(212, 175, 55, 0.05)",
  },
  referralCodeText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.gold,
    letterSpacing: 1,
  },
  button: {
    backgroundColor: colors.gold,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "bold",
  },
  addressCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
  },
  addressHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  addressText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  addressActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
    marginTop: 12,
  },
  addressActionBtn: {
    padding: 4,
  },
  addressActionText: {
    fontSize: 12,
    color: colors.gold,
    fontWeight: "600",
  },
  creditCard: {
    borderRadius: 18,
    padding: 20,
    height: 170,
    justifyContent: "space-between",
    marginBottom: 14,
  },
  ccHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ccProvider: {
    fontSize: 14,
    color: "#FFF",
    fontWeight: "600",
  },
  ccNumber: {
    fontSize: 20,
    color: "#FFF",
    letterSpacing: 2,
    fontWeight: "700",
    marginVertical: 14,
  },
  ccFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  ccLabel: {
    fontSize: 8,
    color: "rgba(255,255,255,0.4)",
    marginBottom: 2,
  },
  ccValue: {
    fontSize: 11,
    color: "#FFF",
    fontWeight: "600",
  },
  upiRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  verifyLink: {
    backgroundColor: "rgba(16,185,129,0.12)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  verifyLinkText: {
    fontSize: 11,
    color: colors.success,
    fontWeight: "700",
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  successPill: {
    backgroundColor: "rgba(16,185,129,0.15)",
  },
  refundPill: {
    backgroundColor: "rgba(239,68,68,0.15)",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "bold",
    color: colors.gold,
  },
  membershipCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderGold,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
  },
  crownCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(212, 175, 55, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  membershipTier: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.gold,
    letterSpacing: 1,
    marginBottom: 4,
  },
  membershipSub: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  benefitIcon: {
    marginRight: 16,
    marginTop: 2,
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  benefitDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  faqCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
  },
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  faqQuestion: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
    flex: 1,
    paddingRight: 16,
  },
  faqAnswer: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6,
    fontWeight: "600",
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 13,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  switchLabel: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  aboutCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    marginBottom: 14,
  },
  aboutHeader: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.gold,
    marginBottom: 4,
  },
  aboutVersion: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  aboutBody: {
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  reservationCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderGold,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
    marginTop: -20,
    zIndex: 10,
  },
  reservationTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.gold,
    marginTop: 16,
    marginBottom: 8,
  },
  reservationDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 18,
  },
  reservationSection: {
    paddingTop: 100,
  },
});
