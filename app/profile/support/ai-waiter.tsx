import React, { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/src/theme";
import { useApp } from "@/src/context/AppContext";
import { getDishImageSource } from "@/src/utils/dishImages";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

type ChatMessage = {
  id: string;
  text: string;
  sender: "user" | "tadka";
  time: string;
  isSpeaking?: boolean;
};

const SUGGESTIONS = [
  "🔥 Spicy but not heavy?",
  "🌱 Pure veg under ₹300",
  "🥜 Gluten/Allergen check",
  "🍜 Recommended noodles",
  "🎁 Show active offers",
];

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
      // Call the backend endpoint
      const response = await fetch("https://punjabi-kitchen27june.onrender.com/api/ai/chat", {
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
      const replyText = data.choices?.[0]?.message?.content || "I apologize, but I am having trouble connecting to the kitchen. Can you repeat that?";
      if (offers.length > 0 && suggestions.length === SUGGESTIONS.length) {
        setSuggestions((prev) => [
          `Show active offers`,
          ...(offers.slice(0, 2).map((offer) => `${offer.title} (${offer.code})`)),
          ...prev.slice(0, 2),
        ]);
      }
      
      const tadkaMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: replyText,
        sender: "tadka",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, tadkaMsg]);
    } catch (err) {
      console.error("AI chat request failed:", err);
      // Failover to client-side rule engine directly in case of complete internet failure
      const fallbackReply = simulateFallbackReply(text);
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        text: fallbackReply,
        sender: "tadka",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    } finally {
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
    reply += "Tap add to cart on the cards below to add them directly!";
    return reply;
  };

  const handleDictationStart = () => {
    setIsDictating(true);
    setDictationText("Listening...");
    
    // Simulate speech detection
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
    // Toggle speaking visualizer state
    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isSpeaking: !m.isSpeaking } : { ...m, isSpeaking: false }));
    
    if (!msg.isSpeaking && isVoicePlaybackEnabled && Platform.OS === 'web') {
      // Use Web Speech API if in web browser
      try {
        const speech = new SpeechSynthesisUtterance(msg.text.replace(/\[DISH:[^\]]+\]/g, ''));
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

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, isTyping]);

  useEffect(() => {
    if (offers.length > 0) {
      setSuggestions((prev) => {
        const offerSuggestions = offers.slice(0, 2).map((offer) => `${offer.title} (${offer.code})`);
        const base = prev.filter((item) => !item.includes("Show active offers") && !offerSuggestions.includes(item));
        return ["🎁 Show active offers", ...offerSuggestions, ...base.slice(0, 2)];
      });
    }
  }, [offers]);

  const renderMessageContent = (text: string) => {
    // Regex to match [DISH:id] format
    const dishRegex = /\[DISH:([A-Za-z0-9_\-\(\)]+)\]/g;
    const offerRegex = /\[OFFER:([A-Za-z0-9_\-\(\)]+)\]/g;
    const cleanText = text.replace(dishRegex, "").replace(offerRegex, "");
    
    // Extract dish and offer recommendations
    const dishMatches: string[] = [];
    const offerMatches: string[] = [];
    let match;
    const searchDishRegex = /\[DISH:([A-Za-z0-9_\-\(\)]+)\]/g;
    while ((match = searchDishRegex.exec(text)) !== null) {
      dishMatches.push(match[1]);
    }
    const searchOfferRegex = /\[OFFER:([A-Za-z0-9_\-\(\)]+)\]/g;
    while ((match = searchOfferRegex.exec(text)) !== null) {
      offerMatches.push(match[1]);
    }

    return (
      <View style={{ width: "100%" }}>
        <Text style={styles.messageText}>{cleanText.trim()}</Text>
        
        {/* Render inline rich dish recommendation card if found */}
        {matches.map((dishId) => {
          const dish = dishes.find((d) => d.id === dishId);
          if (!dish) return null;

          return (
            <View key={dishId} style={styles.dishCard}>
              <Image source={getDishImageSource(dish.id, dish.image)} style={styles.dishImg} />
              <View style={styles.dishDetails}>
                <View style={styles.dishRow}>
                  <Text style={styles.dishName} numberOfLines={1}>{dish.name}</Text>
                  <View style={[styles.badge, { borderColor: dish.veg ? colors.success : colors.error }]}>
                    <View style={[styles.badgeDot, { backgroundColor: dish.veg ? colors.success : colors.error }]} />
                  </View>
                </View>
                <Text style={styles.dishPrice}>₹{dish.price}</Text>
                
                <TouchableOpacity style={styles.addToCartBtn} onPress={() => {
                  addToCart(dish);
                  alert(`Added ${dish.name} to cart!`);
                }}>
                  <Ionicons name="cart" size={14} color="#000" />
                  <Text style={styles.addToCartText}>Add to Cart</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
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
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 70}
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

        {offers.length > 0 && (
          <View style={styles.offerStrip}>
            <Text style={styles.offerStripLabel}>Active offers</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.offerScroll}>
              {offers.map((offer) => (
                <View key={offer.id} style={styles.offerCard}>
                  <Text style={styles.offerTitle}>{offer.title}</Text>
                  <Text style={styles.offerCode}>{offer.code}</Text>
                  <Text style={styles.offerDesc} numberOfLines={2}>{offer.desc}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Suggested Queries */}
        {messages.length === 1 && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Quick Suggestions:</Text>
            <View style={styles.suggestionsRow}>
              {suggestions.map((sug, i) => (
                <TouchableOpacity key={i} style={styles.suggestionChip} onPress={() => handleSend(sug.replace(/[🌱🔥🥜🍜]/g, '').trim())}>
                  <Text style={styles.suggestionText}>{sug}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Message Feed */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messageScroll}
          contentContainerStyle={styles.messageContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.bubbleWrapper,
                msg.sender === "user" ? styles.userWrapper : styles.tadkaWrapper,
              ]}
            >
              <View
                style={[
                  styles.bubble,
                  msg.sender === "user" ? styles.userBubble : styles.tadkaBubble,
                ]}
              >
                {renderMessageContent(msg.text)}
                
                {/* Speaker icon for Tadka replies */}
                {msg.sender === "tadka" && (
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
              </View>
            </View>
          ))}

          {isTyping && (
            <View style={[styles.bubbleWrapper, styles.tadkaWrapper]}>
              <View style={[styles.bubble, styles.tadkaBubble, styles.typingBubble]}>
                <ActivityIndicator size="small" color={colors.gold} />
                <Text style={styles.typingText}>Tadka is planning your meal...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.micBtn} onPress={handleDictationStart}>
            <Ionicons name="mic" size={20} color={colors.gold} />
          </TouchableOpacity>
          
          <TextInput
            style={styles.input}
            placeholder="Ask: 'Any chicken starter under ₹200?'"
            placeholderTextColor={colors.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => handleSend()}
          />
          
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
    backgroundColor: "#0A0806",
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#241B15",
    backgroundColor: "#130F0C",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#241B15",
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
    borderColor: "#130F0C",
  },
  assistantName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.gold,
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
    borderColor: "#241B15",
    alignItems: "center",
    justifyContent: "center",
  },
  playbackDisabled: {
    opacity: 0.6,
  },
  suggestionsContainer: {
    padding: 16,
    backgroundColor: "rgba(19, 15, 12, 0.5)",
  },
  suggestionsTitle: {
    fontSize: 12,
    color: colors.gold,
    fontWeight: "600",
    marginBottom: 8,
  },
  suggestionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: "#1C1713",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2A2017",
  },
  suggestionText: {
    fontSize: 12,
    color: colors.textPrimary,
  },
  offerStrip: {
    paddingVertical: 12,
    paddingLeft: 16,
    backgroundColor: "#110B08",
    borderBottomWidth: 1,
    borderColor: "#241B15",
  },
  offerStripLabel: {
    fontSize: 12,
    color: colors.gold,
    marginBottom: 10,
    fontWeight: "700",
  },
  offerScroll: {
    gap: 12,
    paddingRight: 16,
  },
  offerCard: {
    minWidth: 170,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#1F1711",
    borderWidth: 1,
    borderColor: "#2A2017",
  },
  offerTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 6,
  },
  offerCode: {
    fontSize: 12,
    color: colors.gold,
    fontWeight: "600",
    marginBottom: 6,
  },
  offerDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
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
    flexDirection: "row",
    width: "100%",
  },
  userWrapper: {
    justifyContent: "flex-end",
  },
  tadkaWrapper: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxLength: "85%",
    borderRadius: 18,
    padding: 14,
  },
  userBubble: {
    backgroundColor: colors.gold,
    borderTopRightRadius: 2,
    maxWidth: "85%",
  },
  tadkaBubble: {
    backgroundColor: "#130F0C",
    borderTopLeftRadius: 2,
    borderWidth: 1,
    borderColor: "#241B15",
    maxWidth: "85%",
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  bubbleFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 6,
    borderTopWidth: 0.5,
    borderColor: "#241B15",
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
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderTopWidth: 1,
    borderColor: "#241B15",
    backgroundColor: "#130F0C",
    gap: 10,
  },
  micBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "#2A2017",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    height: 42,
    backgroundColor: "#0A0806",
    borderRadius: 21,
    paddingHorizontal: 16,
    color: colors.textPrimary,
    fontSize: 13,
    borderWidth: 1,
    borderColor: "#241B15",
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  dishCard: {
    flexDirection: "row",
    backgroundColor: "#1C1713",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2A2017",
    padding: 10,
    marginTop: 12,
    gap: 10,
  },
  dishImg: {
    width: 64,
    height: 64,
    borderRadius: 8,
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
  dishPrice: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.gold,
    marginVertical: 2,
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
  addToCartBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gold,
    borderRadius: 6,
    paddingVertical: 5,
    gap: 4,
    marginTop: 4,
  },
  addToCartText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#000",
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
    backgroundColor: "#130F0C",
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
    backgroundColor: "#241B15",
  },
  closeDictateText: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: "600",
  },
});
