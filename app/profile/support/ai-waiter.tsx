import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
  Clipboard,
  NativeScrollEvent,
  NativeSyntheticEvent
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/src/theme";
import { useApp } from "@/src/context/AppContext";
import { getDishImageSource } from "@/src/utils/dishImages";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_BASE_URL } from "@/src/config/api";

type ChatMessage = {
  id: string;
  text: string;
  sender: "user" | "tadka";
  time: string;
  isSpeaking?: boolean;
  dishes?: any[];
  offers?: any[];
  reservations?: any[];
  orders?: any[];
  navigation?: string | null;
};

const SUGGESTIONS = [
  "🔥 Spicy main course",
  "🌱 Pure veg under ₹300",
  "🥜 Gluten/Allergen check",
  "🎁 Active promo offers",
  "📅 Book a table",
];

const FormattedText = ({ text, isUser }: { text: string; isUser: boolean }) => {
  if (isUser) {
    return <Text style={styles.userMessageText}>{text}</Text>;
  }

  const lines = text.split("\n");
  return (
    <View style={{ gap: 6 }}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <View key={idx} style={{ height: 6 }} />;
        }

        const isBullet = trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("*");
        let cleanLine = trimmed;
        if (isBullet) {
          cleanLine = trimmed.replace(/^[•\-\*]\s*/, "");
        }

        // Split by markdown bold tags ** or *
        const parts = cleanLine.split(/(\*\*[^*]+\*\*)/g);
        
        return (
          <View key={idx} style={[styles.textLineRow, isBullet && styles.bulletLineRow]}>
            {isBullet && <Text style={styles.bulletPoint}>•</Text>}
            <Text style={styles.messageText}>
              {parts.map((part, pIdx) => {
                const isBold = part.startsWith("**") && part.endsWith("**");
                let cleanPart = part;
                if (isBold) {
                  cleanPart = part.slice(2, -2);
                }

                // Strip remaining rogue asterisks
                cleanPart = cleanPart.replace(/\*/g, "").trim();
                if (!cleanPart) return null;

                // Highlight price symbols
                if (cleanPart.includes("₹")) {
                  const priceParts = cleanPart.split(/(₹\d+)/g);
                  return priceParts.map((subPart, sIdx) => {
                    const isPrice = subPart.startsWith("₹");
                    return (
                      <Text
                        key={`${pIdx}-${sIdx}`}
                        style={[
                          isBold && styles.boldText,
                          isPrice && styles.priceHighlight
                        ]}
                      >
                        {subPart}
                      </Text>
                    );
                  });
                }

                return (
                  <Text key={pIdx} style={isBold ? styles.boldText : undefined}>
                    {cleanPart}
                  </Text>
                );
              })}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

export default function AIWaiterScreen() {
  const router = useRouter();
  const { dishes, offers, addToCart, user } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      text: "Namaste! I am Tadka, your personal AI Waiter. 🍲\n\nI can suggest the perfect meal matching your budget, spice tolerance, or dietary needs. Go ahead, ask me anything!",
      sender: "tadka",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(SUGGESTIONS);
  const [isDictating, setIsDictating] = useState(false);
  const [isVoicePlaybackEnabled, setIsVoicePlaybackEnabled] = useState(true);
  const [dictationText, setDictationText] = useState("Listening...");
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (text === "") return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      text,
      sender: "user",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText("");
    setIsTyping(true);

    try {
      const response = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: user?.email || "",
          messages: messages
            .concat(userMsg)
            .map(m => ({
              role: m.sender === "user" ? "user" : "assistant",
              content: m.text
            }))
        })
      });

      const data = await response.json();
      const replyText = data.text || "I apologize, but I am having trouble connecting to the kitchen. Can you repeat that?";
      
      if (data.quickReplies && data.quickReplies.length > 0) {
        setSuggestions(data.quickReplies);
      }

      // Add placeholder message with empty text, then stream the actual text character-by-character
      const placeholderId = (Date.now() + 1).toString();
      const tadkaMsg: ChatMessage = {
        id: placeholderId,
        text: "",
        sender: "tadka",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        dishes: data.dishes || [],
        offers: data.offers || [],
        reservations: data.reservations || [],
        orders: data.orders || [],
        navigation: data.navigation
      };

      setMessages((prev) => [...prev, tadkaMsg]);
      setIsTyping(false);

      // Stream text generation simulation
      let currentLength = 0;
      const interval = setInterval(() => {
        currentLength += Math.ceil(replyText.length / 25);
        if (currentLength >= replyText.length) {
          clearInterval(interval);
          setMessages(prev => prev.map(m => m.id === placeholderId ? { ...m, text: replyText } : m));
          
          if (data.navigation) {
            setTimeout(() => {
              router.push(data.navigation);
            }, 1800);
          }
        } else {
          setMessages(prev => prev.map(m => m.id === placeholderId ? { ...m, text: replyText.substring(0, currentLength) } : m));
        }
      }, 35);

    } catch (err) {
      console.error("AI chat request failed:", err);
      const fallbackReply = simulateFallbackReply(text);
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        text: fallbackReply,
        sender: "tadka",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
      setIsTyping(false);
    }
  };

  const simulateFallbackReply = (text: string): string => {
    const query = text.toLowerCase();
    const isVeg = /\b(veg|vegetarian|green|pure veg)\b/i.test(query);
    const budgetMatch = query.match(/\b(\d+)\b/);
    const maxBudget = budgetMatch ? parseInt(budgetMatch[1]) : null;
    const isSpicy = /\b(spicy|hot|masala|chilly|chili|schezwan|schezuan|gravy)\b/i.test(query);

    let filtered = [...dishes];
    if (isVeg) filtered = filtered.filter(d => d.veg === true);
    if (maxBudget) filtered = filtered.filter(d => d.price <= maxBudget);
    if (isSpicy) filtered = filtered.filter(d => d.description.toLowerCase().match(/(spicy|hot|chilly|chili|schezwan)/));

    filtered.sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5));
    const recs = filtered.slice(0, 2);

    if (recs.length === 0) {
      return "I couldn't find items matching that exactly. However, I highly recommend our specialty: Paneer Tikka Butter Masala (₹310) [DISH:Paneer_Tikka_Butter_Masala] or Dal Makhani (₹240) [DISH:Dal_Makhani]!";
    }

    let reply = "Here are a couple of dishes I recommend matching your request:\n\n";
    recs.forEach(r => {
      reply += `• **${r.name}** (₹${r.price}) [DISH:${r.id}]\n  ${r.description}\n\n`;
    });
    return reply;
  };

  const handleDictationStart = () => {
    setIsDictating(true);
    setDictationText("Listening...");
    
    setTimeout(() => {
      setDictationText("Transcribing...");
      setTimeout(() => {
        setIsDictating(false);
        const speechOptions = [
          "Suggest a spicy main course under 350",
          "What vegan options do you have?",
          "Are there any egg starters?",
        ];
        const randomSpeech = speechOptions[Math.floor(Math.random() * speechOptions.length)];
        setInputText(randomSpeech);
      }, 1500);
    }, 2000);
  };

  const speakMessage = (msg: ChatMessage) => {
    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isSpeaking: !m.isSpeaking } : { ...m, isSpeaking: false }));
    
    if (!msg.isSpeaking && isVoicePlaybackEnabled && Platform.OS === 'web') {
      try {
        const speech = new SpeechSynthesisUtterance(msg.text);
        speech.rate = 1.0;
        speech.pitch = 1.1;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(speech);
        speech.onend = () => {
          setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isSpeaking: false } : m));
        };
      } catch (e) {
        console.log("Speech synthesis failed", e);
      }
    }
  };

  const handleCopyText = (text: string) => {
    Clipboard.setString(text);
    showToast("Message copied to clipboard! 📋");
  };

  const handleCopyCode = (code: string) => {
    Clipboard.setString(code);
    showToast(`Coupon code "${code}" copied! 🎁`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const yOffset = event.nativeEvent.contentOffset.y;
    const contentHeight = event.nativeEvent.contentSize.height;
    const viewHeight = event.nativeEvent.layoutMeasurement.height;
    
    // Show button if user scrolled up significantly
    if (contentHeight - viewHeight - yOffset > 250) {
      setShowScrollBottom(true);
    } else {
      setShowScrollBottom(false);
    }
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
    setShowScrollBottom(false);
  };

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, isTyping]);

  const renderMessage = (msg: ChatMessage) => {
    const isUser = msg.sender === "user";

    return (
      <View key={msg.id} style={{ width: "100%", marginBottom: 12 }}>
        <View
          style={[
            styles.bubbleWrapper,
            isUser ? styles.userWrapper : styles.tadkaWrapper,
          ]}
        >
          {/* Avatar design for AI */}
          {!isUser && (
            <View style={styles.bubbleAvatar}>
              <Text style={styles.bubbleAvatarText}>🧑‍🍳</Text>
            </View>
          )}

          {/* Text bubble block */}
          <TouchableOpacity
            activeOpacity={0.8}
            onLongPress={() => handleCopyText(msg.text)}
            style={[
              styles.bubble,
              isUser ? styles.userBubble : styles.tadkaBubble,
            ]}
          >
            <FormattedText text={msg.text} isUser={isUser} />

            {/* Speaker icon for Tadka replies */}
            {!isUser && msg.text.length > 0 && (
              <View style={styles.bubbleFooter}>
                <TouchableOpacity style={styles.speakerBtn} onPress={() => speakMessage(msg)}>
                  <Ionicons 
                    name={msg.isSpeaking ? "radio-outline" : "volume-low-outline"} 
                    size={16} 
                    color={msg.isSpeaking ? colors.goldBright : colors.textSecondary} 
                  />
                  {msg.isSpeaking && <Text style={styles.speakingText}>Speaking...</Text>}
                </TouchableOpacity>
                <Text style={styles.bubbleTime}>{msg.time}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Structured Cards (Rendered outside bubble for full width visual aesthetics) */}
        {!isUser && (
          <View style={styles.outerCardsWrapper}>
            {/* Structured Navigation Action */}
            {msg.navigation && (
              <TouchableOpacity 
                style={styles.navCard}
                onPress={() => router.push(msg.navigation as any)}
              >
                <View style={styles.navCardHeader}>
                  <Ionicons name="compass-outline" size={16} color={colors.goldBright} />
                  <Text style={styles.navCardTitle}>Quick Navigation</Text>
                </View>
                <Text style={styles.navCardDesc}>Tap here to open the requested page automatically.</Text>
              </TouchableOpacity>
            )}

            {/* Structured Dish Cards */}
            {msg.dishes && msg.dishes.length > 0 && (
              <View style={styles.cardsContainer}>
                {msg.dishes.map((dish) => (
                  <View key={dish.id} style={styles.dishCard}>
                    <Image source={getDishImageSource(dish.id, dish.image)} style={styles.dishImg} />
                    <View style={styles.dishDetails}>
                      <View style={styles.dishRow}>
                        <Text style={styles.dishName} numberOfLines={1}>{dish.name}</Text>
                        <View style={[styles.badge, { borderColor: dish.veg ? colors.success : colors.error }]}>
                          <View style={[styles.badgeDot, { backgroundColor: dish.veg ? colors.success : colors.error }]} />
                        </View>
                      </View>
                      <Text style={styles.dishDesc} numberOfLines={2}>{dish.description}</Text>
                      <View style={styles.dishActionRow}>
                        <Text style={styles.dishPrice}>₹{dish.price}</Text>
                        <TouchableOpacity 
                          style={styles.addToCartBtn} 
                          onPress={() => {
                            addToCart(dish);
                            showToast(`Added ${dish.name} to cart! 🛒`);
                          }}
                        >
                          <Ionicons name="cart" size={12} color="#000" />
                          <Text style={styles.addToCartText}>Add to Cart</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Structured Offer Cards */}
            {msg.offers && msg.offers.length > 0 && (
              <View style={styles.cardsContainer}>
                {msg.offers.map((offer) => (
                  <TouchableOpacity 
                    key={offer.id} 
                    style={styles.offerCard}
                    onPress={() => handleCopyCode(offer.code)}
                  >
                    <View style={styles.offerHeader}>
                      <Ionicons name="gift-outline" size={16} color={colors.gold} />
                      <Text style={styles.offerCodeBadge}>{offer.code}</Text>
                    </View>
                    <Text style={styles.offerTitle}>{offer.title}</Text>
                    <Text style={styles.offerDesc}>{offer.desc}</Text>
                    <Text style={styles.offerTapToCopy}>Tap to copy promo code</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Structured Reservation Cards */}
            {msg.reservations && msg.reservations.length > 0 && (
              <View style={styles.cardsContainer}>
                {msg.reservations.map((r) => (
                  <View key={r.id} style={styles.resCard}>
                    <View style={styles.resHeader}>
                      <Ionicons name="calendar-outline" size={16} color={colors.gold} />
                      <Text style={styles.resTitle}>Active Table Booking</Text>
                    </View>
                    <View style={styles.resGrid}>
                      <View style={styles.resGridCol}>
                        <Text style={styles.resLabel}>DATE</Text>
                        <Text style={styles.resVal}>{r.reservationDate}</Text>
                      </View>
                      <View style={styles.resGridCol}>
                        <Text style={styles.resLabel}>SLOT</Text>
                        <Text style={styles.resVal}>{r.reservationSlot}</Text>
                      </View>
                      <View style={styles.resGridCol}>
                        <Text style={styles.resLabel}>GUESTS</Text>
                        <Text style={styles.resVal}>{r.guests}</Text>
                      </View>
                      <View style={styles.resGridCol}>
                        <Text style={styles.resLabel}>TABLE</Text>
                        <Text style={styles.resVal}>#{r.tableNumber}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Structured Order Cards */}
            {msg.orders && msg.orders.length > 0 && (
              <View style={styles.cardsContainer}>
                {msg.orders.map((o) => (
                  <View key={o.id} style={styles.orderCard}>
                    <View style={styles.orderHeader}>
                      <Ionicons name="receipt-outline" size={16} color={colors.gold} />
                      <Text style={styles.orderTitle}>Order ID: {o.id.slice(0, 8)}</Text>
                      <View style={styles.orderStatusBadge}>
                        <Text style={styles.orderStatusText}>{o.status}</Text>
                      </View>
                    </View>
                    <Text style={styles.orderTotal}>Total: ₹{o.total}</Text>
                    
                    <View style={styles.progressLine}>
                      <View style={[styles.progressSegment, { backgroundColor: colors.gold }]} />
                      <View style={[styles.progressSegment, { backgroundColor: ["Preparing", "Ready", "On the Way", "Delivered"].includes(o.status) ? colors.gold : "#262626" }]} />
                      <View style={[styles.progressSegment, { backgroundColor: ["Ready", "On the Way", "Delivered"].includes(o.status) ? colors.gold : "#262626" }]} />
                      <View style={[styles.progressSegment, { backgroundColor: o.status === "Delivered" ? colors.gold : "#262626" }]} />
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)/profile")}
          style={styles.iconBtn}
        >
          <Ionicons name="chevron-back" size={22} color={colors.gold} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tadka: AI Waiter</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        style={styles.keyboardContainer}
      >
        {/* Top Status */}
        <View style={styles.statusHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>🧑‍🍳</Text>
            <View style={styles.onlineBadge} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.assistantName}>Tadka (Smart Assistant)</Text>
            <Text style={styles.assistantStatus}>Virtual AI Waiter • Answers instantly</Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.playbackToggle, !isVoicePlaybackEnabled && styles.playbackDisabled]} 
            onPress={() => setIsVoicePlaybackEnabled(!isVoicePlaybackEnabled)}
          >
            <Ionicons name={isVoicePlaybackEnabled ? "volume-medium-outline" : "volume-mute-outline"} size={18} color={isVoicePlaybackEnabled ? colors.gold : colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Message Feed */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messageScroll}
          contentContainerStyle={styles.messageContent}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
        >
          {/* Welcome Screen Empty State */}
          {messages.length === 1 && (
            <View style={styles.welcomeContainer}>
              <View style={styles.welcomeIconContainer}>
                <Text style={styles.welcomeIcon}>🧑‍🍳</Text>
              </View>
              <Text style={styles.welcomeTitle}>Namaste! I'm Tadka</Text>
              <Text style={styles.welcomeDesc}>
                Your personalized AI Host for Punjabi Kitchen. I can suggest matching meals, check active coupon codes, reserve a dining table, or track orders.
              </Text>
              <View style={styles.suggestionGrid}>
                {SUGGESTIONS.map((item, idx) => (
                  <TouchableOpacity 
                    key={idx} 
                    style={styles.welcomeSuggestionChip}
                    onPress={() => handleSend(item.replace(/[🌱🔥🥜🍜🎁🛒👉]/g, '').trim())}
                  >
                    <Text style={styles.welcomeSuggestionText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {messages.length > 1 && messages.map(renderMessage)}

          {isTyping && (
            <View style={[styles.bubbleWrapper, styles.tadkaWrapper]}>
              <View style={styles.bubbleAvatar}>
                <Text style={styles.bubbleAvatarText}>🧑‍🍳</Text>
              </View>
              <View style={[styles.bubble, styles.tadkaBubble, styles.typingBubble]}>
                <ActivityIndicator size="small" color={colors.gold} />
                <Text style={styles.typingText}>Tadka is planning your meal...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Floating Scroll Bottom Button */}
        {showScrollBottom && (
          <TouchableOpacity style={styles.floatingScrollBtn} onPress={scrollToBottom}>
            <Ionicons name="chevron-down" size={18} color="#000" />
          </TouchableOpacity>
        )}

        {/* Suggested Queries */}
        {messages.length > 1 && (
          <View style={styles.suggestionsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsScroll}>
              {suggestions.map((sug, i) => (
                <TouchableOpacity key={i} style={styles.suggestionChip} onPress={() => handleSend(sug.replace(/[🌱🔥🥜🍜🎁🛒👉]/g, '').trim())}>
                  <Text style={styles.suggestionText}>{sug}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Ask: 'Any chicken starter under ₹200?'"
              placeholderTextColor={colors.textSecondary}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={() => handleSend()}
            />
            
            <TouchableOpacity style={styles.micBtn} onPress={handleDictationStart}>
              <Ionicons name="mic" size={20} color={colors.gold} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.sendBtn} onPress={() => handleSend()}>
            <Ionicons name="send" size={18} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Voice Dictation Simulation Sheet */}
        {isDictating && (
          <View style={styles.dictateOverlay}>
            <View style={styles.dictateSheet}>
              <View style={styles.glowingRing}>
                <Ionicons name="mic" size={40} color="#000" />
              </View>
              <Text style={styles.dictateTitle}>{dictationText}</Text>
              <Text style={styles.dictateSubtitle}>Speak now. Tap anywhere to cancel.</Text>
              <TouchableOpacity style={styles.closeDictate} onPress={() => setIsDictating(false)}>
                <Text style={styles.closeDictateText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Custom Toast Alert */}
        {toastMessage && (
          <View style={styles.toastContainer}>
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bg,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  headerTitle: {
    flex: 1,
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  keyboardContainer: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
  },
  onlineBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.success,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  assistantName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.goldBright,
  },
  assistantStatus: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  playbackToggle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  playbackDisabled: {
    opacity: 0.6,
  },
  messageScroll: {
    flex: 1,
  },
  messageContent: {
    padding: 16,
    paddingBottom: 24,
    gap: 16,
  },
  bubbleWrapper: {
    width: "100%",
    marginBottom: 8,
    flexDirection: "row",
    gap: 8,
  },
  userWrapper: {
    justifyContent: "flex-end",
  },
  tadkaWrapper: {
    justifyContent: "flex-start",
  },
  bubbleAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.borderGold,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
  },
  bubbleAvatarText: {
    fontSize: 14,
  },
  bubble: {
    maxWidth: "80%",
    borderRadius: 18,
    padding: 14,
  },
  userBubble: {
    backgroundColor: colors.gold,
    borderTopRightRadius: 2,
    alignSelf: "flex-end",
  },
  tadkaBubble: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 2,
    borderWidth: 1,
    borderColor: colors.border,
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  textLineRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    width: "100%",
  },
  bulletLineRow: {
    paddingLeft: 8,
  },
  bulletPoint: {
    fontSize: 16,
    color: colors.gold,
    marginRight: 6,
    lineHeight: 20,
  },
  boldText: {
    fontWeight: "700",
    color: colors.goldBright,
  },
  priceHighlight: {
    color: colors.goldBright,
    fontWeight: "800",
  },
  userMessageText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textInverse,
    fontWeight: "500",
  },
  bubbleFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 6,
    borderTopWidth: 0.5,
    borderColor: colors.border,
  },
  speakerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  speakingText: {
    fontSize: 10,
    color: colors.goldBright,
  },
  bubbleTime: {
    fontSize: 9,
    color: colors.textSecondary,
  },
  typingBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  typingText: {
    fontSize: 12,
    color: colors.gold,
    fontStyle: "italic",
  },
  welcomeContainer: {
    padding: 20,
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.borderGold,
    alignItems: "center",
    marginVertical: 40,
  },
  welcomeIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    borderWidth: 1,
    borderColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  welcomeIcon: {
    fontSize: 32,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  welcomeDesc: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 20,
  },
  suggestionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  welcomeSuggestionChip: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  welcomeSuggestionText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.goldBright,
  },
  floatingScrollBtn: {
    position: "absolute",
    bottom: 80,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 99,
  },
  suggestionsContainer: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
  },
  suggestionsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestionText: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    height: 48,
  },
  micBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    height: "100%",
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  outerCardsWrapper: {
    width: "100%",
    marginTop: 4,
    paddingLeft: 40, // Offsets the AI avatar space to align cards right under bubble
  },
  cardsContainer: {
    gap: 10,
    width: "100%",
    marginTop: 8,
  },
  dishCard: {
    flexDirection: "row",
    backgroundColor: colors.surface2,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    gap: 12,
  },
  dishImg: {
    width: 75,
    height: 75,
    borderRadius: 10,
  },
  dishDetails: {
    flex: 1,
    justifyContent: "space-between",
  },
  dishRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  dishName: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
    flex: 1,
  },
  dishDesc: {
    fontSize: 10,
    color: colors.textSecondary,
    marginVertical: 2,
  },
  dishActionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  dishPrice: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.gold,
  },
  addToCartBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.gold,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  addToCartText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#000",
  },
  badge: {
    width: 12,
    height: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 2,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  offerCard: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: colors.surface2,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.goldDim,
  },
  offerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  offerCodeBadge: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.goldBright,
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  offerTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  offerDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  offerTapToCopy: {
    fontSize: 9,
    fontWeight: "600",
    color: colors.gold,
    textAlign: "right",
  },
  resCard: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  resTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  resGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  resGridCol: {
    alignItems: "center",
  },
  resLabel: {
    fontSize: 8,
    fontWeight: "800",
    color: colors.textSecondary,
    marginBottom: 2,
  },
  resVal: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.gold,
  },
  orderCard: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  orderHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  orderTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textPrimary,
    flex: 1,
  },
  orderStatusBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  orderStatusText: {
    fontSize: 9,
    fontWeight: "800",
    color: colors.success,
  },
  orderTotal: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  progressLine: {
    flexDirection: "row",
    gap: 4,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressSegment: {
    flex: 1,
    height: "100%",
  },
  navCard: {
    backgroundColor: colors.surface2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
  },
  navCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  navCardTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.goldBright,
  },
  navCardDesc: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  dictateOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.85)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  dictateSheet: {
    width: Dimensions.get("window").width * 0.85,
    backgroundColor: colors.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.gold,
    padding: 30,
    alignItems: "center",
  },
  glowingRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 20,
  },
  dictateTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 6,
  },
  dictateSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  closeDictate: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.surface2,
  },
  closeDictateText: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  toastContainer: {
    position: "absolute",
    bottom: 120,
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
    zIndex: 9999,
  },
  toastText: {
    fontSize: 12,
    color: colors.goldBright,
    fontWeight: "600",
  },
});
